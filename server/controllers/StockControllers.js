// import StockList from "../data/stocks.json" assert { type: "json" };
import mongoose from "mongoose";
import axios from "axios";
import Stock from "../models/StockModel.js";
import User from "../models/UserModel.js";

export const AddtoWatchList = async (req, res) => {
  const { userid, stockname, status } = req.body;

  const isPresent = await Stock.findOne({
    userid: userid,
    stockname: stockname,
    status: status,
  });

  if (isPresent) {
    return res.status(401).send("Already added in watchlist");
  }

  try {
    const NewStock = new Stock({
      userid: userid,
      stockname: stockname,
      status: status,
    });

    await NewStock.save();

    res.status(200).send("stock added to watchlist");
  } catch (e) {
    res.status(500).send("Something went wrong...");
  }
};

export const BuyStock = async (req, res) => {
  const {
    userid,
    symbol,
    stockname,
    status,
    investedPrice,
    marketPrice,
    quantity,
    sector,
    industry,
  } = req.body;

  try {
    const NewPruchaseStock = new Stock({
      userid,
      symbol,
      stockname,
      status,
      investedPrice,
      quantity,
      sector,
      industry,
    });

    await NewPruchaseStock.save();

    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const totalInvestment = quantity * investedPrice;
    if (user.walletbalance < totalInvestment) {
      return res.status(400).send("Insufficient funds");
    }

    user.walletbalance -= totalInvestment;
    await user.save();

    res
      .status(200)
      .send(`${quantity} shares of ${stockname} are brought successfully`);
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
};

export const soldStock = async (req, res) => {
  const {
    userid,
    symbol,
    stockname,
    status,
    marketPrice,
    quantity,
    sector,
    industry,
  } = req.body;

  try {
    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const stocks = await Stock.find(
      { userid, stockname, status: "Active" },
      {},
      { sort: { quantity: -1 } }
    );

    if (stocks.length === 0) {
      return res.status(404).send("Stock not found");
    }

    const totalQuantity = stocks.reduce((total, s) => total + s.quantity, 0);

    if (totalQuantity < quantity) {
      return res.status(400).send(`You have only ${totalQuantity} quantity`);
    }

    let remainingQuantity = quantity;

    for (const stock of stocks) {
      if (stock.quantity > 0 && remainingQuantity > 0) {
        const soldQuantity = Math.min(remainingQuantity, stock.quantity);
        stock.quantity -= soldQuantity;
        remainingQuantity -= soldQuantity;

        if (stock.quantity === 0) {
          await Stock.findByIdAndDelete(stock._id);
        } else {
          await stock.save();
        }
      }
    }

    const addBalance = quantity * marketPrice;

    user.walletbalance += addBalance;

    await user.save();

    const SoldStock = new Stock({
      userid,
      symbol,
      stockname,
      status,
      marketPrice,
      quantity,
      sector,
      industry,
    });

    await SoldStock.save();

    return res
      .status(200)
      .send(quantity + " shares of " + stockname + " sold successfully");
  } catch (error) {
    console.error("Error selling stock:", error);
    res.status(500).send("Something went wrong");
  }
};

export const GetUserAllStocks = async (req, res) => {
  const userid = req.body.userid;

  console.log(userid);

  try {
    const result = await Stock.aggregate([
      { $match: { userid: userid, status: "Active" } },
      {
        $group: {
          _id: "$symbol",
          stockname: { $first: "$stockname" },
          averagePrice: { $avg: "$investedPrice" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    let MarketPrices = [];

    for (let stock of result) {
      const response = await axios.get(
        `https://my-stock-api.onrender.com/one-day-hist/${stock._id}`
      );

      let lastPair = Object.entries(response.data)[
        Object.entries(response.data).length - 1
      ];

      MarketPrices.push(lastPair[1]);
    }

    console.log(MarketPrices);

    const FinalData = result.map((stock, i) => {
      return { ...stock, marketPrice: MarketPrices[i] };
    });

    res.status(200).send(FinalData);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

export const GetWatchList = async (req, res) => {
  const userid = req.body.userid;
  try {
    const WatchList = await Stock.find({ userid: userid, status: "Watchlist" });

    res.status(200).send(WatchList);
  } catch (e) {
    res.status(500).send("Sonething went wrong...");
  }
};

export const GetBalance = async (req, res) => {
  const userid = req.body.userid;

  try {
    const WatchList = await User.findOne({ _id: userid });

    res.status(200).send(WatchList);
  } catch (e) {
    res.status(500).send("Sonething went wrong...");
  }
};

export const SearchStock = async (req, res) => {
  const searchTerm = req.query.stockname;

  try {
    const stock = mongoose.connection.collection("stocksdetails");

    const result = await stock
      .aggregate([
        {
          $search: {
            index: "default",
            text: {
              query: `${searchTerm}`,
              path: {
                wildcard: "*",
              },
            },
          },
        },
        {
          $limit: 5,
        },
      ])
      .toArray();

    res.status(200).send(result);
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
};

export const deleteFromWatchList = async (req, res) => {
  const { userid, stockname, status } = req.body;

  try {
    const isPresent = await Stock.findOne({
      userid: userid,
      stockname: stockname,
      status: status,
    });

    if (isPresent) {
      await Stock.findByIdAndDelete(isPresent._id);
    }

    res.status(200).send("removed successfully...");
  } catch (e) {
    res.status(500).send("Something went wrong...");
  }
};
