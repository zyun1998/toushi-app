from __future__ import annotations

import json
from openai import OpenAI

from app.core.config import settings
from app.services.prompts import (
    build_followup_question_prompt,
    build_result_explanation_prompt,
)

client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


def _extract_simple_result(result: dict) -> dict:
    summary = result["summary"]
    nisa_check = result["nisa_check"]
    input_data = result["input"]

    return {
        "product_label": input_data.get("product_label"),
        "scenario_mode": input_data.get("scenario_mode"),
        "benchmark_ticker": input_data.get("benchmark_ticker"),
        "period_years": input_data.get("period_years"),
        "calculation_method": input_data.get("calculation_method"),
        "warning_note": input_data.get("warning_note"),
        "scenario": input_data.get("scenario"),
        "annual_return": input_data.get("annual_return"),
        "total_principal": summary["total_principal"],
        "final_balance": summary["final_balance"],
        "total_profit": summary["total_profit"],
        "annual_amount": nisa_check["annual_amount"],
        "annual_limit": nisa_check["annual_limit"],
        "within_limit": nisa_check["within_limit"],
        "excess_amount": nisa_check["excess_amount"],
    }


def generate_result_explanation(result: dict, language: str = "ja") -> str:
    if client is None:
        return "OPENAI_API_KEYが設定されておりません。"

    simple_result = _extract_simple_result(result)
    prompt = build_result_explanation_prompt(simple_result, language)

    response = client.responses.create(
        model="gpt-5.4-mini",
        input=prompt,
    )
    return response.output_text


def answer_followup_question(result: dict, question: str, language: str = "ja") -> str:
    if client is None:
        return "OPENAI_API_KEYが設定されておりません。"

    simple_result = _extract_simple_result(result)
    prompt = build_followup_question_prompt(simple_result, question, language)

    response = client.responses.create(
        model="gpt-5.4-mini",
        input=prompt,
    )
    return response.output_text