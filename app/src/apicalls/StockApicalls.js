import axios from "axios";
import { publicRequest } from "../apiRequest";
import {
  GetFiftyTwoWeekHighStart,
  GetFiftyTwoWeekHighSuccess,
  GetFiftyTwoWeekLowStart,
  GetFiftyTwoWeekLowSuccess,
  GetTopGainersFailure,
  GetTopGainersSuccess,
  GetTopGainnersStart,
  GetTopLosersFailure,
  GetTopLosersStart,
  GetTopLosersSuccess,
  GetFiftyTwoWeeLowFailed,
  GetFiftyTwoweekHighFailed,
} from "../redux/StockDetailsSlice";

export const GetTopGainers = async (dispatch, link, signal) => {
  dispatch(GetTopGainnersStart());

  try {
    const result = await axios.get(`${link}`);

    dispatch(GetTopGainersSuccess(result.data));
  } catch (e) {
    dispatch(GetTopGainersFailure());
  }
};

export const GetTopLosers = async (dispatch, link, signal) => {
  dispatch(GetTopLosersStart());

  try {
    const result = await axios.get(`${link}`);

    dispatch(GetTopLosersSuccess(result.data));
  } catch (e) {
    dispatch(GetTopLosersFailure());
  }
};

export const GetFiftyTwoWeekHigh = async (dispatch, link, signal) => {
  dispatch(GetFiftyTwoWeekHighStart());

  try {
    const result = await axios.get(`${link}`);

    dispatch(GetFiftyTwoWeekHighSuccess(result.data));
  } catch (e) {
    dispatch(GetFiftyTwoweekHighFailed());
  }
};

export const GetFiftyTwoWeekLow = async (dispatch, link, signal) => {
  dispatch(GetFiftyTwoWeekLowStart());

  try {
    const result = await axios.get(`${link}`);

    dispatch(GetFiftyTwoWeekLowSuccess(result.data));
  } catch (e) {
    dispatch(GetFiftyTwoWeeLowFailed());
  }
};