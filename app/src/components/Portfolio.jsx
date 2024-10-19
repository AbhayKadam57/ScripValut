import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Container = styled.div`
  min-width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 1em;
  overflow: hidden;
  border: 1px solid #e7e3e3;
  flex-shrink: 0;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  height: 3.5em;
  background-color: #e7e3e3;
  padding: 0.5em;
  gap: 0.5em;
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  height: 3.5em;
  border-bottom: 1px solid #e7e3e3;
  padding: 0.5em;
  gap: 0.5em;
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

const RowDescription = styled(Link)`
  min-width: 30%;
  display: flex;
  align-items: center;
  font-weight: 500;
  gap: 1em;
  text-decoration: none;
  color: #000;
`;

const Description = styled.div`
  min-width: 30%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const Portfolio = () => {
  const [portfolioList, setPortfolioList] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userid } = useSelector((state) => state.users);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/stocks/getAllstocks/${userid}`,
        {
          userid: userid,
        }
      );
      setPortfolioList(res.data);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching portfolio:", e);
    }
  }, [userid]);

  useEffect(() => {
    if (portfolioList.length === 0) {
      fetchData();
    }

    const intervalId = setInterval(fetchData, 60000); // Fetch data every 60 seconds
    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [fetchData, portfolioList.length]);

  const renderRows = useMemo(() => {
    return portfolioList.map((stock, id) => (
      <TableRow key={id}>
        <RowDescription to={`/stock/${stock.stockname.replace(/[-()]/g, "")}`}>
          {stock.stockname}
        </RowDescription>
        <Column>{stock.totalQuantity}</Column>
        <Column>{stock.marketPrice.toFixed(3)}</Column>
        <Column>{stock.averagePrice.toFixed(2)}</Column>
        <Column>{(stock.averagePrice * stock.totalQuantity).toFixed(2)}</Column>
        <Column>{(stock.marketPrice * stock.totalQuantity).toFixed(3)}</Column>
        <Column
          style={{
            color:
              stock.marketPrice * stock.totalQuantity -
                stock.averagePrice * stock.totalQuantity >=
              0
                ? "green"
                : "red",
          }}
        >
          {(
            ((
              stock.marketPrice * stock.totalQuantity -
              stock.averagePrice * stock.totalQuantity
            ).toFixed(2) /
              (stock.averagePrice * stock.totalQuantity)) *
            100
          ).toFixed(2)}{" "}
          %
        </Column>
      </TableRow>
    ));
  }, [portfolioList]);

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
      {loading ? <Skeleton count={5} height={40} /> : renderRows}
    </Container>
  );
};

export default React.memo(Portfolio);
