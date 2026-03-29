from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import logging

import pandas as pd
import requests

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class MarketDataResult:
    ticker: str
    period_years: int
    monthly_prices: pd.DataFrame
    source: str


class MarketDataError(Exception):
    pass


@lru_cache(maxsize=32)
def fetch_monthly_market_data(ticker: str, period_years: int = 10) -> MarketDataResult:
    ticker = ticker.strip().upper()

    api_key = settings.alpha_vantage_api_key
    if not api_key:
        raise MarketDataError("ALPHA_VANTAGE_API_KEYが設定されておりません。")

    url = "https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_MONTHLY_ADJUSTED",
        "symbol": ticker,
        "apikey": api_key,
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.exception("Alpha Vantage request failed. ticker=%s", ticker)
        raise MarketDataError(f"{ticker} データ取得のHTTP通信に失敗しました: {repr(e)}")

    try:
        data = response.json()
    except ValueError as e:
        logger.exception("Alpha Vantage response was not valid JSON. ticker=%s", ticker)
        raise MarketDataError(f"{ticker} API応答のJSON解析に失敗しました: {repr(e)}")

    logger.info("Alpha Vantage response keys for %s: %s", ticker, list(data.keys())[:10])

    if "Error Message" in data:
        msg = data["Error Message"]
        logger.error("Alpha Vantage error for %s: %s", ticker, msg)
        raise MarketDataError(f"Alpha Vantage error: {msg}")

    if "Information" in data:
        msg = data["Information"]
        logger.error("Alpha Vantage information for %s: %s", ticker, msg)
        raise MarketDataError(f"Alpha Vantage information: {msg}")

    if "Note" in data:
        msg = data["Note"]
        logger.error("Alpha Vantage note for %s: %s", ticker, msg)
        raise MarketDataError(f"Alpha Vantage note: {msg}")

    time_series = data.get("Monthly Adjusted Time Series")
    if not time_series:
        logger.error("Monthly Adjusted Time Series missing for %s. data=%s", ticker, data)
        raise MarketDataError(f"{ticker} データロードに失敗しました。Monthly Adjusted Time Series がありません。")

    rows = []
    for date_str, values in time_series.items():
        try:
            rows.append(
                {
                    "date": pd.to_datetime(date_str),
                    "close": float(values["5. adjusted close"]),
                }
            )
        except Exception as e:
            logger.exception("Failed parsing monthly row. ticker=%s date=%s values=%s", ticker, date_str, values)
            raise MarketDataError(f"{ticker} 月次データ解析に失敗しました: {repr(e)}")

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)

    if df.empty:
        raise MarketDataError(f"{ticker} の月次データが空です。")

    cutoff_date = df["date"].max() - pd.DateOffset(years=period_years)
    df = df[df["date"] >= cutoff_date].reset_index(drop=True)

    if df.empty:
        raise MarketDataError(f"{ticker} の直近{period_years}年データが取得できませんでした。")

    logger.info(
        "Loaded market data. ticker=%s rows=%s min_date=%s max_date=%s",
        ticker,
        len(df),
        df["date"].min(),
        df["date"].max(),
    )

    return MarketDataResult(
        ticker=ticker,
        period_years=period_years,
        monthly_prices=df,
        source="Alpha Vantage",
    )