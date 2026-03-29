"use client";

import { useState } from "react";
import ResultSummary from "./ResultSummary";
import AssetChart from "./AssetChart";
import FollowupChat from "./FollowupChat";
import { simulate } from "@/app/api-client";

type Product = {
  code: string;
  label_ja: string;
  label_ko: string;
  ticker: string;
  description_ja: string;
  description_ko: string;
};

type HistoryItem = {
  id: string;
  date: string;
  product_code: string;
  product_label: string;
  scenario_mode: "fixed" | "market_auto";
  scenario: "bull" | "base" | "bear";
  monthly_amount: number;
  years: number;
  annual_return: number;
  benchmark_ticker: string;
  summary: {
    total_principal: number;
    final_balance: number;
    total_profit: number;
  };
};

export default function SimulationForm({ products = [] }: { products?: Product[] }) {
  const [monthlyAmount, setMonthlyAmount] = useState(100000);
  const [years, setYears] = useState(15);
  const [productCode, setProductCode] = useState(products[0]?.code ?? "sp500");
  const [scenarioMode, setScenarioMode] = useState<"fixed" | "market_auto">("fixed");
  const [scenario, setScenario] = useState<"bull" | "base" | "bear">("base");
  const [language, setLanguage] = useState<"ja" | "ko">("ja");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  const selectedProduct = products.find((p) => p.code === productCode);

  function saveHistory(result: any) {
    try {
      const input = result?.result?.input;
      const summary = result?.result?.summary;

      if (!input || !summary) return;

      const item: HistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        product_code: input.product_code,
        product_label: input.product_label,
        scenario_mode: input.scenario_mode,
        scenario: input.scenario,
        monthly_amount: input.monthly_amount,
        years: input.years,
        annual_return: input.annual_return,
        benchmark_ticker: input.benchmark_ticker,
        summary: {
          total_principal: summary.total_principal,
          final_balance: summary.final_balance,
          total_profit: summary.total_profit,
        },
      };

      const current = JSON.parse(localStorage.getItem("simulation_history") || "[]");
      const next = Array.isArray(current) ? [item, ...current].slice(0, 30) : [item];

      localStorage.setItem("simulation_history", JSON.stringify(next));
    } catch (e) {
      console.error("履歴保存に失敗しました:", e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await simulate({
        monthly_amount: monthlyAmount,
        years,
        product_code: productCode,
        scenario_mode: scenarioMode,
        scenario,
        language,
      });

      setData(result);
      saveHistory(result);
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-7">
        <div className="title-font mb-4 text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
          シミュレーション条件
        </div>

        {products.length === 0 && (
          <div className="mb-5 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-700">
            商品一覧を取得できませんでした。バックエンドAPIをご確認ください。
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d6654]">毎月の投資額（円）</span>
            <input
              type="number"
              min={1000}
              step={1000}
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="pretty-input"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d6654]">投資期間（年）</span>
            <div className="soft-panel p-4">
              <input
                type="range"
                min={1}
                max={40}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-orange-400"
              />
              <div className="mt-2 text-sm text-[#7d6654]">{years} 年</div>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d6654]">商品選択</span>
            <select
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              className="pretty-select"
              disabled={products.length === 0}
            >
              {products.length === 0 ? (
                <option value="">商品なし</option>
              ) : (
                products.map((product) => (
                  <option key={product.code} value={product.code}>
                    {language === "ko" ? product.label_ko : product.label_ja}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d6654]">シナリオ生成方式</span>
            <select
              value={scenarioMode}
              onChange={(e) => setScenarioMode(e.target.value as "fixed" | "market_auto")}
              className="pretty-select"
            >
              <option value="fixed">基本値を使用</option>
              <option value="market_auto">商品の過去データから自動計算</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d6654]">市場シナリオ</span>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as "bull" | "base" | "bear")}
              className="pretty-select"
            >
              <option value="bull">上昇相場</option>
              <option value="base">平均</option>
              <option value="bear">下落相場</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d6654]">言語選択</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "ja" | "ko")}
              className="pretty-select"
            >
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </label>
        </div>

        {selectedProduct && (
          <div className="soft-panel mt-6 p-4 text-sm text-[#6f5a49]">
            <div className="font-bold">
              選択中の商品：
              {language === "ko" ? selectedProduct.label_ko : selectedProduct.label_ja}
            </div>
            <div className="mt-1 leading-7">
              {language === "ko"
                ? selectedProduct.description_ko
                : selectedProduct.description_ja}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || products.length === 0}
            className="pretty-button"
          >
            {loading ? "シミュレーション実行中..." : "シミュレーション実行"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
      </form>

      {data && (
        <>
          <ResultSummary data={data} />
          <AssetChart rows={data.result.yearly_rows} />

          <section className="glass-card p-6">
            <div className="title-font mb-4 text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
              AIによる解説
            </div>
            <div className="soft-panel whitespace-pre-wrap p-4 leading-8 text-[#6d5746]">
              {data.explanation}
            </div>
          </section>

          <FollowupChat result={data.result} language={language} />
        </>
      )}
    </div>
  );
}