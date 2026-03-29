export default function ScenarioGuide() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl">シナリオ説明</h2>

      <div className="p-4 border rounded">
        <strong>上昇相場 (Bull)</strong>
        <p>成長が期待される市場環境を想定</p>
      </div>

      <div className="p-4 border rounded">
        <strong>平均 (Base)</strong>
        <p>標準的な成長を前提</p>
      </div>

      <div className="p-4 border rounded">
        <strong>下落相場 (Bear)</strong>
        <p>途中の下落を考慮した保守的シナリオ</p>
      </div>
    </div>
  );
}