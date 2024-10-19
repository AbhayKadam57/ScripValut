import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Kolkata");

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

const MutualFundPortfolio = () => {
  const [mutualFundList, setMutualFundList] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userid } = useSelector((state) => state.users);
  const { pathname } = useLocation();

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/mutualfund/getAllMF`,
        { userid }
      );
      setMutualFundList(res.data);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching mutual funds:", e);
    }
  }, [userid]);

  useEffect(() => {
    if (mutualFundList.length === 0) {
      fetchData();
    }

    let intervalId;
    const isWithinMarketLimit = () => {
      const now = moment();
      const start = moment().set({ hour: 9, minute: 15, second: 0 });
      const end = moment().set({ hour: 15, minute: 30, second: 0 });
      return now.isBetween(start, end);
    };

    if (isWithinMarketLimit()) {
      intervalId = setInterval(fetchData, 60000);
    }

    return () => clearInterval(intervalId);
  }, [fetchData, mutualFundList.length]);

  const renderRows = useMemo(() => {
    return mutualFundList.map((fund, i) => (
      <TableRow key={i}>
        <RowDescription to={`/mutualFund/${fund.link}/${fund.code}`}>
          {fund.fundName}
        </RowDescription>
        <Column>{fund.units.toFixed(2)}</Column>
        <Column>{fund.marketPrice}</Column>
        <Column>{fund.nav}</Column>
        <Column>{(fund.units * fund.nav).toFixed(2)}</Column>
        <Column>{(fund.units * fund.marketPrice).toFixed(2)}</Column>
        <Column
          style={{
            color:
              fund.marketPrice * fund.units - fund.nav * fund.units >= 0
                ? "green"
                : "red",
          }}
        >
          {(
            ((fund.units * fund.marketPrice - fund.units * fund.nav) /
              (fund.units * fund.nav)) *
            100
          ).toFixed(2)}
          %
        </Column>
      </TableRow>
    ));
  }, [mutualFundList]);

  return (
    <Container>
      <TableHeader>
        <Description>Fund name</Description>
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

export default React.memo(MutualFundPortfolio);
