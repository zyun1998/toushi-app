const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("商品一覧の取得に失敗しました。");
  }
  return res.json();
}

export async function simulate(payload: {
  monthly_amount: number;
  years: number;
  product_code: string;
  scenario_mode: "fixed" | "market_auto";
  scenario: "bull" | "base" | "bear";
  language: "ja" | "ko";
}) {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "シミュレーションの実行に失敗しました。");
  }

  return res.json();
}

export async function askFollowup(payload: {
  result: any;
  question: string;
  language: "ja" | "ko";
}) {
  const res = await fetch(`${API_BASE}/followup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("追加質問の送信に失敗しました。");
  }

  return res.json();
}