import React, { Children, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { useGetIndices } from "../customhooks/useGetIndices";
import { useLocation } from "react-router-dom";
import {
  GetIndicesFailed,
  GetIndicesStart,
  GetIndicesSuccess,
} from "../redux/StockDetailsSlice";
import { publicRequest } from "../apiRequest";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "axios";

const Container = styled.div`
  min-width: 70%;
  display: flex;
  flex-direction: column;
  border-radius: 1em;
  overflow: hidden;
  border: 1px solid #e7e3e3;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  height: 3.5em;
  background-color: #e7e3e3;
  padding: 0.5em;
  gap: 3px;
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  height: 3.5em;
  border-bottom: 1px solid #e7e3e3;
  padding: 0.5em;
  gap: 5px;
`;

const ColumnHeader = styled.div`
  min-width: 11.66%;
  display: flex;
  align-items: center;

  font-weight: 500;
`;
const Column = styled.div`
  min-width: 11.66%;
  display: flex;
  align-items: center;
`;

const RowDescription = styled.div`
  min-width: 30%;
  display: flex;
  align-items: center;
  font-weight: 500;
  gap: 1em;
`;
const Description = styled.div`
  min-width: 30%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const IndexImage = styled.img`
  width: 2em;
  height: 2em;
  border-radius: 50%;
`;

const Portfolio = () => {
  const [portfolioList, setPortFolioList] = useState([]);

  const { userid } = useSelector((state) => state.users);

  const { pathname } = useLocation();

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/stocks/getAllstocks`,
          { userid: userid }
        );

        setPortFolioList(res.data);
      } catch (e) {
        console.log(e);
      }
    };

    if (portfolioList.length === 0) {
      getData();
    }

    // let intervalId = setInterval(getData, 60000);

    return () => {
      // clearInterval(intervalId);
    };
  }, [pathname]);

  console.log(portfolioList);

  return (
    <Container>
      <TableHeader>
        <Description>Stock Name</Description>
        <ColumnHeader>Quantity</ColumnHeader>
        <ColumnHeader>Market Price</ColumnHeader>
        <ColumnHeader>Invested Price</ColumnHeader>
        <ColumnHeader>Investment</ColumnHeader>
        <ColumnHeader>Current Value</ColumnHeader>
        <ColumnHeader>Gain/Loss</ColumnHeader>
      </TableHeader>

      {portfolioList?.map((stock, id) => (
        <TableRow key={id}>
          <RowDescription>{stock.stockname}</RowDescription>
          <Column>{stock.totalQuantity}</Column>
          <Column>{stock.marketPrice.toFixed(3)}</Column>
          <Column>{stock.averagePrice}</Column>
          <Column>{stock.averagePrice * stock.totalQuantity}</Column>
          <Column>
            {(stock.marketPrice * stock.totalQuantity).toFixed(3)}
          </Column>
          <Column
            style={{
              color:
                stock.marketPrice * stock.totalQuantity -
                  stock.averagePrice * stock.totalQuantity >
                0
                  ? "green"
                  : "red",
            }}
          >
            {(
              stock.marketPrice * stock.totalQuantity -
              stock.averagePrice * stock.totalQuantity
            ).toFixed(2)}{" "}
            %
          </Column>
        </TableRow>
      ))}
    </Container>
  );
};

export default Portfolio;
