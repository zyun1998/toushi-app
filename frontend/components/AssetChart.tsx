"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AssetChart({ rows }: { rows: any[] }) {
  return (
    <section className="glass-card p-6">
      <div className="title-font mb-2 text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
        資産の推移グラフ
      </div>
      <p className="mb-4 text-sm text-[#8b7663]">
        元本と資産額の推移を確認できます。
      </p>

      <div className="h-[360px] rounded-2xl border border-[rgba(194,165,139,0.12)] bg-white/70 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="principal" name="元本累計" stroke="#d99c68" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="balance" name="資産額" stroke="#7a5a43" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}