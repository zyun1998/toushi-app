"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("history") || "[]");
    setHistory(data);
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-4">履歴</h2>

      {history.map((item, i) => (
        <div key={i} className="border p-3 mb-2 rounded">
          <div>{new Date(item.date).toLocaleString()}</div>
          <div>商品: {item.product}</div>
          <div>最終資産: {item.result.final_balance.toLocaleString()}円</div>
        </div>
      ))}
    </div>
  );
}