import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const generateAccesToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "30m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1D" }
  );
};

export const RefreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(401).json("Token is missing");
    }

    const user = await User.findOne({ refreshToken: req.body.refreshToken });

    if (!user) {
      return res.status(401).json("Token is not valid");
    }

    const NewAccessToken = generateAccesToken(user);
    const NewRefreshToken = generateRefreshToken(user);

    user.refreshToken = NewRefreshToken;

    await user.save();

    res.status(200).json({ NewAccessToken, NewRefreshToken });
  } catch (e) {
    res.status(500).json("Something is went wrong..");
  }
};

export const RegisterUser = async (req, res) => {
  const { name, username, email, password, isAdmin } = req.body;

  const Existusername = await User.find({ username: req.body.username });

  const ExistEmail = await User.find({ email: req.body.email });

  if (ExistEmail.length > 0 && Existusername.length > 0) {
    return res.status(403).send({
      error: [
        { path: "username", msg: "Username is already exists" },
        { path: "email", msg: "Email is already exists" },
      ],
    });
  } else if (ExistEmail.length > 0) {
    return res.status(403).send({
      error: [{ path: "username", msg: "Username is already exists" }],
    });
  } else if (Existusername.length > 0) {
    return res
      .status(403)
      .send({ error: [{ path: "email", msg: "Email id is already exists" }] });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const NewUser = new User({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
      isAdmin: isAdmin,
    });

    await NewUser.save();

    res.status(200).json("User register successfull");
  } catch (e) {
    res
      .status(500)
      .json({ error: [{ path: "serverError", msg: "Something went wrong" }] });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatched) {
      return res
        .status(401)
        .json("You are not authorized, Password is invalid");
    }

    const accessToken = generateAccesToken(user);

    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    const { password, ...others } = user._doc;

    res.status(200).json({ ...others, accessToken, refreshToken });
  } catch (e) {
    res
      .status(500)
      .json({ error: [{ path: "serverError", msg: "Something went wrong" }] });
  }
};

export const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    const config = {
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD,
      },
    };

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Mailgen",
        link: "https://mailgen.js/",
      },
    });

    let response = {
      body: {
        name: "ScripValut",
        intro:
          "You have received this email because a password reset request for your account was received",
        action: {
          instructions: "Click the button below to reset your password:",
          button: {
            color: "#DC4D2F",
            text: "Reset your password",
            link: "https://mailgen.js/reset?s=b350163a1a010d9729feb74992c1a010",
          },
        },
        outro:
          "If you did not request a password reset, no further action is required on your part.",
      },
    };

    let mail = MailGenerator.generate(response);

    let message = {
      from: process.env.GMAIL_ID,
      to: email,
      subject: "ScripValut Account:Password recovery",
      html: mail,
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        return res.status(500).json({ err });
      }

      return res.status(201).json({
        msg: "Rest email sent on register mail id",
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: [{ path: "serverError", msg: "Something went wrong" }] });
  }
};
