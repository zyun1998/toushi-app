from pydantic import BaseModel, Field
from typing import Literal, Optional


class SimulationRequest(BaseModel):
    monthly_amount: int = Field(ge=1000)
    years: int = Field(ge=1, le=40)
    product_code: str
    scenario_mode: Literal["fixed", "market_auto"]
    scenario: Literal["bull", "base", "bear"]
    language: Literal["ja", "ko"] = "ja"


class FollowupRequest(BaseModel):
    result: dict
    question: str
    language: Literal["ja", "ko"] = "ja"