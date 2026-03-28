export default function ResultSummary({ data }: { data: any }) {
  const summary = data.result.summary;
  const input = data.result.input;
  const nisaCheck = data.result.nisa_check;
  const rows = data.result.yearly_rows;

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="title-font mb-4 text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
          シミュレーション結果
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="metric-card">
            <div className="text-sm font-semibold text-[#96785f]">総投資額</div>
            <div className="mt-2 text-2xl font-bold text-[#4f3f33]">
              {summary.total_principal.toLocaleString()} 円
            </div>
          </div>

          <div className="metric-card">
            <div className="text-sm font-semibold text-[#96785f]">最終資産額</div>
            <div className="mt-2 text-2xl font-bold text-[#4f3f33]">
              {summary.final_balance.toLocaleString()} 円
            </div>
          </div>

          <div className="metric-card">
            <div className="text-sm font-semibold text-[#96785f]">予想利益</div>
            <div className="mt-2 text-2xl font-bold text-[#4f3f33]">
              {summary.total_profit.toLocaleString()} 円
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="title-font mb-4 text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
          年別データ
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[rgba(194,165,139,0.12)] bg-white/70">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-[#fff8f1] text-left text-[#7d6654]">
                <th className="px-4 py-3">年数</th>
                <th className="px-4 py-3">元本累計</th>
                <th className="px-4 py-3">資産額</th>
                <th className="px-4 py-3">利益</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.year} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{row.year}</td>
                  <td className="px-4 py-3">{Number(row.principal).toLocaleString()}円</td>
                  <td className="px-4 py-3">{Number(row.balance).toLocaleString()}円</td>
                  <td className="px-4 py-3">{Number(row.profit).toLocaleString()}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="title-font mb-4 text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
          NISA枠チェック
        </div>

        {nisaCheck.within_limit ? (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-green-700">
            年間投資額 {nisaCheck.annual_amount.toLocaleString()}円：NISA枠内
          </div>
        ) : (
          <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-700">
            年間投資額 {nisaCheck.annual_amount.toLocaleString()}円：
            NISA枠超過（{nisaCheck.excess_amount.toLocaleString()}円オーバー）
          </div>
        )}
      </section>

      <section className="glass-card p-6">
        <div className="title-font mb-4 text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
          計算基準
        </div>

        <div className="space-y-2 text-[#6d5746]">
          <div><strong>商品:</strong> {input.product_label}</div>
          <div><strong>基準商品:</strong> {input.benchmark_ticker}</div>
          <div><strong>データ期間:</strong> 直近 {input.period_years} 年</div>
          <div><strong>計算方式:</strong> {input.calculation_method}</div>
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
            {input.warning_note}
          </div>
        </div>
      </section>
    </div>
  );
}