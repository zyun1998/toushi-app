"use client";

import { useEffect, useMemo, useState } from "react";
import SimulationForm from "@/components/SimulationForm";
import { fetchProducts } from "./api-client";

type Product = {
  code: string;
  label_ja: string;
  label_ko: string;
  ticker: string;
  description_ja: string;
  description_ko: string;
};

type PageType = "home" | "history" | "guide";

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

function SplashScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      onClick={onEnter}
      className="flex min-h-screen cursor-pointer items-center justify-center bg-[radial-gradient(circle_at_top,_#fff9f2,_#f4eadf)]"
    >
      <div className="flex flex-col items-center gap-5">
        <img
          src="/logo.png"
          alt="ワンコサポート"
          className="h-[220px] w-[220px] drop-shadow-lg transition duration-300 hover:scale-105"
        />
        <div className="menu-cute text-xl text-[#7a5a43]">
          タップしてはじめる
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("simulation_history");
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  function handleDelete(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem("simulation_history", JSON.stringify(next));
  }

  function handleClear() {
    localStorage.removeItem("simulation_history");
    setItems([]);
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="menu-cute mb-3 text-2xl text-[#654a37]">
          シミュレーション履歴
        </div>
        <p className="text-sm leading-7 text-[#7d6654]">
          実行したシミュレーション結果をブラウザに保存して、あとから見返せます。
        </p>

        {items.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              履歴をすべて削除
            </button>
          </div>
        )}
      </section>

      {items.length === 0 ? (
        <section className="glass-card p-6">
          <div className="text-[#7d6654]">
            まだ履歴がありません。ホーム画面でシミュレーションを実行すると、ここに保存されます。
          </div>
        </section>
      ) : (
        items.map((item) => (
          <section key={item.id} className="glass-card p-6">
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-2 text-[#6d5746]">
                <div className="menu-cute text-xl text-[#654a37]">
                  {item.product_label}
                </div>
                <div className="text-sm">
                  実行日時: {new Date(item.date).toLocaleString("ja-JP")}
                </div>
                <div className="text-sm">
                  毎月投資額: {item.monthly_amount.toLocaleString()}円
                </div>
                <div className="text-sm">投資期間: {item.years}年</div>
                <div className="text-sm">
                  シナリオ: {item.scenario} / 方式: {item.scenario_mode}
                </div>
                <div className="text-sm">
                  基準商品: {item.benchmark_ticker}
                </div>
                <div className="text-sm">
                  年率前提: {(item.annual_return * 100).toFixed(2)}%
                </div>
              </div>

              <div className="grid gap-3">
                <div className="metric-card">
                  <div className="text-sm font-semibold text-[#96785f]">総投資額</div>
                  <div className="mt-2 text-xl font-bold text-[#4f3f33]">
                    {item.summary.total_principal.toLocaleString()}円
                  </div>
                </div>
                <div className="metric-card">
                  <div className="text-sm font-semibold text-[#96785f]">最終資産額</div>
                  <div className="mt-2 text-xl font-bold text-[#4f3f33]">
                    {item.summary.final_balance.toLocaleString()}円
                  </div>
                </div>
                <div className="metric-card">
                  <div className="text-sm font-semibold text-[#96785f]">予想利益</div>
                  <div className="mt-2 text-xl font-bold text-[#4f3f33]">
                    {item.summary.total_profit.toLocaleString()}円
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="rounded-full border border-[rgba(194,165,139,0.22)] bg-white px-4 py-2 text-sm text-[#7d6654]"
              >
                この履歴を削除
              </button>
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function ScenarioGuide() {
  const scenarios = useMemo(
    () => [
      {
        key: "bull",
        title: "上昇相場",
        desc: "前向きな成長を想定したシナリオです。市場環境が比較的良いケースをイメージし、将来の資産がどのくらい増えるかを見たいときに使います。",
      },
      {
        key: "base",
        title: "平均",
        desc: "標準的な前提で試算するシナリオです。まず最初に確認する基準として使いやすく、楽観と悲観の中間のイメージで見られます。",
      },
      {
        key: "bear",
        title: "下落相場",
        desc: "途中の下落も考慮した慎重なシナリオです。相場が弱いケースや、一時的な下落があった場合でも積立を続けたらどう見えるかを確認できます。",
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="menu-cute mb-3 text-2xl text-[#654a37]">
          投資シナリオ説明
        </div>
        <p className="text-sm leading-7 text-[#7d6654]">
          このアプリでは、固定シナリオと過去データ自動計算の2つの方法で、
          上昇相場・平均・下落相場を比較できます。
        </p>
      </section>

      <section className="glass-card p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {scenarios.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-[rgba(194,165,139,0.14)] bg-white/70 p-5"
            >
              <div className="menu-cute text-xl text-[#654a37]">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-[#6d5746]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="menu-cute mb-3 text-xl text-[#654a37]">
          シナリオ生成方式
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="soft-panel p-5">
            <div className="font-bold text-[#654a37]">基本値を使用</div>
            <p className="mt-2 text-sm leading-7 text-[#6d5746]">
              アプリ内の固定前提値を使ってシンプルに試算します。
              商品が変わっても、同じシナリオなら年率前提は共通です。
            </p>
          </div>

          <div className="soft-panel p-5">
            <div className="font-bold text-[#654a37]">
              商品の過去データから自動計算
            </div>
            <p className="mt-2 text-sm leading-7 text-[#6d5746]">
              商品ごとの過去データから月次リターン傾向を見て、自動でシナリオを作ります。
              商品による違いが出やすいのはこちらです。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MainLayout({ products }: { products: Product[] }) {
  const [page, setPage] = useState<PageType>("home");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf4,_#f4eadf)]">
      <header className="sticky top-0 z-30 border-b border-[rgba(194,165,139,0.16)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-xl border border-[rgba(194,165,139,0.22)] bg-white px-3 py-2 text-[#654a37]"
            >
              ☰
            </button>
            <img
              src="/logo.png"
              alt="やさしい投資アプリ"
              className="h-10 w-10 rounded-xl shadow-sm"
            />
            <div>
              <div className="menu-cute text-xl text-[#654a37]">やさしい投資サポートアプリ</div>
              <div className="text-xs text-[#8b7663]">NISA投資シミュレーター</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside
          className={`fixed left-0 top-[65px] z-20 h-[calc(100vh-65px)] w-[250px] border-r border-[rgba(194,165,139,0.16)] bg-[#fbf6ef] p-5 shadow-lg transition-transform duration-300 md:static md:h-auto md:translate-x-0 md:shadow-none ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="menu-cute mb-5 text-lg text-[#9b826b]">Menu</div>

          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setPage("home");
                setMenuOpen(false);
              }}
              className={`menu-cute w-full rounded-2xl px-4 py-3 text-left text-lg transition ${
                page === "home"
                  ? "bg-white text-[#654a37] shadow-sm"
                  : "text-[#7d6654] hover:bg-white/70"
              }`}
            >
              ホーム
            </button>

            <button
              type="button"
              onClick={() => {
                setPage("history");
                setMenuOpen(false);
              }}
              className={`menu-cute w-full rounded-2xl px-4 py-3 text-left text-lg transition ${
                page === "history"
                  ? "bg-white text-[#654a37] shadow-sm"
                  : "text-[#7d6654] hover:bg-white/70"
              }`}
            >
              履歴 <span className="ml-1 inline-block text-[1.1em] animate-bounce">🐾</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPage("guide");
                setMenuOpen(false);
              }}
              className={`menu-cute w-full rounded-2xl px-4 py-3 text-left text-lg transition ${
                page === "guide"
                  ? "bg-white text-[#654a37] shadow-sm"
                  : "text-[#7d6654] hover:bg-white/70"
              }`}
            >
              説明
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">

            {page === "home" && (
                <div className="space-y-6">
                   <SimulationForm products={products} />
                    <AppInfoCard />
                 </div>
             )}

            {page === "history" && (
                <div className="space-y-6">
                   <HistoryPage />
                   <AppInfoCard />
                </div>
              )}

            {page === "guide" && (
               <div className="space-y-6">
                  <ScenarioGuide />
                  <AppInfoCard />
                </div>
             )}
          </main>
      </div>
    </div>
  );

}

export default function Page() {
  const [entered, setEntered] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!entered) return;

    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data?.products ?? []);
        setLoadError("");
      } catch (error) {
        console.error("商品一覧の取得に失敗しました:", error);
        setLoadError("商品一覧を取得できませんでした。バックエンドAPIをご確認ください。");
      }
    }

    loadProducts();
  }, [entered]);

  if (!entered) {
    return <SplashScreen onEnter={() => setEntered(true)} />;
  }

  return (
    <>
      {loadError && (
        <div className="mx-6 mt-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}
      <MainLayout products={products} />
    </>
  );
}

function AppInfoCard() {
  return (
    <div className="mt-10 border-t border-[rgba(194,165,139,0.2)] pt-4 text-xs text-[#8b7663]">
      
      <div className="menu-cute text-sm text-[#654a37]">
        Myu Project
      </div>

      <div className="mt-1">
        NISA Investment Simulator · Version 1.0.0
      </div>

      <div className="mt-1">
        Author: Junghwan Choi
      </div>

      <div className="mt-1">
        Contact: 
      <a href="mailto:zyun1998@naver.com" className="underline ml-1">
        zyun1998@naver.com
      </a>
      </div>

      <div className="mt-2 leading-5">
        This simulation is for reference only and does not guarantee future investment performance.
      </div>

    </div>
  );
}