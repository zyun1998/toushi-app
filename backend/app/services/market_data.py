from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

import pandas as pd
import requests

from app.core.config import settings


@dataclass
class MarketDataResult:
    ticker: str
    period_years: int
    monthly_prices: pd.DataFrame
    source: str


@lru_cache(maxsize=32)
def fetch_monthly_market_data(ticker: str, period_years: int = 10) -> MarketDataResult:
    ticker = ticker.strip().upper()

    api_key = settings.alpha_vantage_api_key
    if not api_key:
        raise RuntimeError("ALPHA_VANTAGE_API_KEYが設定されておりません。")

    url = "https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_MONTHLY_ADJUSTED",
        "symbol": ticker,
        "apikey": api_key,
    }

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    if "Error Message" in data:
        raise ValueError(f"Alpha Vantage error: {data['Error Message']}")
    if "Note" in data:
        raise ValueError("Alpha Vantage 呼び出し失敗")

    time_series = data.get("Monthly Adjusted Time Series")
    if not time_series:
        raise ValueError(f"{ticker} データロードに失敗しました。")

    rows = []
    for date_str, values in time_series.items():
        rows.append(
            {
                "date": pd.to_datetime(date_str),
                "close": float(values["5. adjusted close"]),
            }
        )

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
    cutoff_date = df["date"].max() - pd.DateOffset(years=period_years)
    df = df[df["date"] >= cutoff_date].reset_index(drop=True)

    return MarketDataResult(
        ticker=ticker,
        period_years=period_years,
        monthly_prices=df,
        source="Alpha Vantage",
    )