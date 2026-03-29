"use client";

import { useState } from "react";
import SimulationForm from "./SimulationForm";
import HistoryPage from "./HistoryPage";
import ScenarioGuide from "./ScenarioGuide";

export default function MainLayout({ products }: any) {
  const [page, setPage] = useState<"home" | "history" | "guide">("home");

  return (
    <div className="flex">
      {/* 사이드 메뉴 */}
      <div className="w-[200px] bg-[#f5efe6] p-4">
        <div className="font-bold mb-4">Myu</div>

        <button onClick={() => setPage("home")}>🏠 ホーム</button>
        <br />
        <button onClick={() => setPage("history")}>📊 履歴</button>
        <br />
        <button onClick={() => setPage("guide")}>📘 シナリオ説明</button>
      </div>

      {/* 메인 */}
      <div className="flex-1 p-6">
        {page === "home" && <SimulationForm products={products} />}
        {page === "history" && <HistoryPage />}
        {page === "guide" && <ScenarioGuide />}
      </div>
    </div>
  );
}