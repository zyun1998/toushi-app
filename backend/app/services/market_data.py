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
    def __init__(self, user_message: str, internal_message: str | None = None):
        super().__init__(internal_message or user_message)
        self.user_message = user_message
        self.internal_message = internal_message or user_message


@lru_cache(maxsize=32)
def fetch_monthly_market_data(ticker: str, period_years: int = 10) -> MarketDataResult:
    ticker = ticker.strip().upper()

    api_key = settings.alpha_vantage_api_key
    if not api_key:
        logger.error("Market data API key is missing. ticker=%s", ticker)
        raise MarketDataError(
            user_message="過去の市場データを現在取得できません。",
            internal_message="ALPHA_VANTAGE_API_KEYが設定されておりません。",
        )

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
        logger.exception("Market data HTTP request failed. ticker=%s", ticker)
        raise MarketDataError(
            user_message="過去の市場データの取得に失敗しました。時間をおいて再度お試しください。",
            internal_message=f"HTTP request failed: {repr(e)}",
        )

    try:
        data = response.json()
    except ValueError as e:
        logger.exception("Market data JSON parse failed. ticker=%s", ticker)
        raise MarketDataError(
            user_message="過去の市場データの取得に失敗しました。時間をおいて再度お試しください。",
            internal_message=f"JSON parse failed: {repr(e)}",
        )

    logger.info("Market data response keys. ticker=%s keys=%s", ticker, list(data.keys())[:10])

    if "Error Message" in data:
        msg = data["Error Message"]
        logger.error("Provider error. ticker=%s error=%s", ticker, msg)
        raise MarketDataError(
            user_message="過去の市場データを取得できませんでした。",
            internal_message=f"Provider error: {msg}",
        )

    if "Information" in data:
        info = data["Information"]
        logger.error("Provider information. ticker=%s information=%s", ticker, info)

        if "rate limit" in info.lower():
            raise MarketDataError(
                user_message="過去の市場データの取得が一時的に集中しているため、自動シナリオを作成できませんでした。しばらく時間をおいて再度お試しください。",
                internal_message=f"Provider rate limit: {info}",
            )

        raise MarketDataError(
            user_message="過去の市場データを現在取得できません。",
            internal_message=f"Provider information: {info}",
        )

    if "Note" in data:
        note = data["Note"]
        logger.error("Provider note. ticker=%s note=%s", ticker, note)
        raise MarketDataError(
            user_message="過去の市場データの取得に失敗しました。時間をおいて再度お試しください。",
            internal_message=f"Provider note: {note}",
        )

    time_series = data.get("Monthly Adjusted Time Series")
    if not time_series:
        logger.error("Monthly Adjusted Time Series missing. ticker=%s data=%s", ticker, data)
        raise MarketDataError(
            user_message="過去の市場データを取得できませんでした。",
            internal_message=f"{ticker} データロードに失敗しました。Monthly Adjusted Time Series がありません。",
        )

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
            logger.exception(
                "Monthly row parse failed. ticker=%s date=%s values=%s",
                ticker,
                date_str,
                values,
            )
            raise MarketDataError(
                user_message="過去の市場データの解析に失敗しました。時間をおいて再度お試しください。",
                internal_message=f"Monthly row parse failed: {repr(e)}",
            )

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)

    if df.empty:
        raise MarketDataError(
            user_message="過去の市場データが不足しているため、自動シナリオを作成できませんでした。",
            internal_message=f"{ticker} monthly dataframe is empty.",
        )

    cutoff_date = df["date"].max() - pd.DateOffset(years=period_years)
    df = df[df["date"] >= cutoff_date].reset_index(drop=True)

    if df.empty:
        raise MarketDataError(
            user_message="過去の市場データが不足しているため、自動シナリオを作成できませんでした。",
            internal_message=f"{ticker} filtered dataframe is empty for period_years={period_years}.",
        )

    return MarketDataResult(
        ticker=ticker,
        period_years=period_years,
        monthly_prices=df,
        source="market_data_provider",
    )