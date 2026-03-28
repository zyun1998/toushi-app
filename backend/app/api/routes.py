from fastapi import APIRouter, HTTPException

from app.schemas import SimulationRequest, FollowupRequest
from app.services.calculator import SimulationInput, simulate_monthly_investment
from app.services.scenario_builder import build_scenarios
from app.services.product_config import get_product_description, get_product_label
from app.services.ai_service import (
    generate_result_explanation,
    answer_followup_question,
)

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/products")
def get_products():
    from app.services.product_config import PRODUCT_CONFIG

    items = []
    for code, value in PRODUCT_CONFIG.items():
        items.append(
            {
                "code": code,
                "label_ja": value["label_ja"],
                "label_ko": value["label_ko"],
                "ticker": value["ticker"],
                "description_ja": value["description_ja"],
                "description_ko": value["description_ko"],
            }
        )
    return {"products": items}


@router.post("/simulate")
def simulate(req: SimulationRequest):
    try:
        scenario_build = build_scenarios(
            product_code=req.product_code,
            scenario_mode=req.scenario_mode,
            period_years=10,
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "シナリオ生成に失敗しました。",
                "requested_product_code": req.product_code,
                "requested_scenario_mode": req.scenario_mode,
                "error": str(e),
            },
        )

    try:
        config = scenario_build.scenarios[req.scenario]
    except KeyError:
        raise HTTPException(
            status_code=400,
            detail=f"サポートされていないシナリオです: {req.scenario}",
        )

    benchmark_info = scenario_build.benchmark_info
    product_label = get_product_label(req.product_code, req.language)
    product_desc = get_product_description(req.product_code, req.language)

    sim_input = SimulationInput(
        monthly_amount=req.monthly_amount,
        years=req.years,
        annual_return=config["annual_return"],
        scenario=req.scenario,
        crash_year=config["crash_year"],
        crash_rate=config["crash_rate"],
        product_code=req.product_code,
        product_label=product_label,
        scenario_mode=req.scenario_mode,
        benchmark_ticker=benchmark_info["benchmark_ticker"],
        period_years=benchmark_info["period_years"],
        calculation_method=benchmark_info["calculation_method"],
        warning_note=benchmark_info["warning_note"],
    )

    result = simulate_monthly_investment(sim_input)

    try:
        explanation = generate_result_explanation(result, req.language)
    except Exception as e:
        explanation = f"説明生成に失敗しました: {str(e)}"

    return {
        "result": result,
        "explanation": explanation,
        "product_description": product_desc,
        "scenario_error": None,
        "debug": {
            "requested_product_code": req.product_code,
            "requested_scenario_mode": req.scenario_mode,
            "applied_scenario_mode": sim_input.scenario_mode,
            "benchmark_ticker": sim_input.benchmark_ticker,
            "annual_return": sim_input.annual_return,
            "scenario": sim_input.scenario,
        },
    }


@router.post("/followup")
def followup(req: FollowupRequest):
    try:
        answer = answer_followup_question(req.result, req.question, req.language)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"追加説明の生成に失敗しました: {str(e)}",
        )

    return {"answer": answer}