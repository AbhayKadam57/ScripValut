import express from "express";
import {
  ForgotPassword,
  LoginUser,
  RefreshToken,
  RegisterUser,
} from "../controllers/UserAuth.js";
import {
  UserLoginValidator,
  UserRegisterValidator,
} from "../util/validation.js";
import { verifyTokenandUser } from "../util/verifyToken.js";

const router = express.Router();

//User Regisiter

router.post("/user_register", UserRegisterValidator, RegisterUser);

//User Login

router.post("/user_login", UserLoginValidator, LoginUser);

//Refresh Token

router.post("/refreshToken", verifyTokenandUser, RefreshToken);

//Forgotpassword

router.post("/forgotpassword", ForgotPassword);

export default router;
