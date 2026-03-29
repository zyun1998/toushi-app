const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE が設定されていません。");
}

async function parseError(res: Response, fallbackMessage: string) {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    if (typeof data?.message === "string") {
      return data.message;
    }
    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "商品一覧の取得に失敗しました。"));
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
    throw new Error(await parseError(res, "シミュレーションの実行に失敗しました。"));
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
    throw new Error(await parseError(res, "追加質問の送信に失敗しました。"));
  }

  return res.json();
}