export const dynamic = "force-dynamic";
import Image from "next/image";
import SimulationForm from "@/components/SimulationForm";
import { fetchProducts } from "./api-client";

export default async function HomePage() {
  let products: any[] = [];
  let loadError = "";

  try {
    const data = await fetchProducts();
    products = data?.products ?? [];
  } catch (error) {
    console.error("商品一覧の取得に失敗しました:", error);
    loadError = "商品一覧を取得できませんでした。バックエンドAPIをご確認ください。";
  }

  return (
    <main className="app-shell">
      <div className="page-container space-y-6">
        <div className="flex items-center gap-3 px-1">
          <Image
            src="/logo.png"
            alt="ロゴ"
            width={110}
            height={110}
            className="h-auto w-[100px] drop-shadow-md transition duration-200 hover:scale-105"
          />
          <div className="title-font text-[1.25rem] leading-relaxed text-[#7a5a43] md:text-[1.5rem]">
            やさしく続ける、わんこ投資サポート
          </div>
        </div>

        <section className="hero-card">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-3 inline-block rounded-full border border-[#e9d2bf] bg-[#fff4e5] px-4 py-2 text-sm font-bold text-[#9a6f47] shadow-sm">
              やさしく見える、未来のお金
            </div>

            <h1 className="title-font text-[2rem] leading-[1.45] text-[#604735] md:text-[2.45rem]">
              NISA投資シミュレーター
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-[0.98rem] leading-8 text-[#7d6654] md:text-[1.03rem]">
              毎月の積立金額・投資期間・商品・市場シナリオをもとに、
              将来の資産推移をわかりやすく確認できます。
              固定前提だけでなく、商品の過去データをもとにした自動シナリオも選べます。
            </p>
          </div>
        </section>

        {loadError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
            {loadError}
          </div>
        )}

        <SimulationForm products={products} />

        <div className="footer-note">
          あなたのペースで、やさしく続ける積立をサポートするシミュレーターです。
        </div>
      </div>
    </main>
  );
}