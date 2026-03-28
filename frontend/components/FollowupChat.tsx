"use client";

import Image from "next/image";
import { useState } from "react";
import { askFollowup } from "@/app/api-client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function FollowupChat({
  result,
  language,
}: {
  result: any;
  language: "ja" | "ko";
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    const userMessage: Message = { role: "user", content: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await askFollowup({
        result,
        question,
        language,
      });

      setMessages([
        ...nextMessages,
        { role: "assistant", content: res.answer },
      ]);
      setQuestion("");
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "回答の生成に失敗しました。しばらくしてからもう一度お試しください。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-card p-6">
      <div className="mb-4 flex items-start gap-3">
        <Image
          src="/qa.png"
          alt="ワンコサポート"
          width={86}
          height={86}
          className="h-auto w-[78px] drop-shadow-md transition duration-200 hover:scale-105"
        />
        <div className="flex-1">
          <div className="title-font text-[1.15rem] text-[#654a37] md:text-[1.25rem]">
            ワンコサポートチャット
          </div>
          <div className="soft-panel mt-2 p-4 text-sm leading-7 text-[#7d6654]">
            シミュレーション結果の意味、利益の見方、NISA枠の確認、基準商品の意味などを続けて質問できます。
            やさしく、わかりやすく答えます。
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 ${
              message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
            }`}
          >
            <div className="mb-1 text-xs font-bold text-[#8b7663]">
              {message.role === "user" ? "あなた" : "AI"}
            </div>
            <div className="whitespace-pre-wrap leading-7 text-[#5c4b3f]">
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-ai p-4 text-[#7d6654]">
            回答を作成中です...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="たとえば「SPYとは何ですか？」のように入力してください"
          className="pretty-input flex-1"
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={loading}
          className="pretty-button"
        >
          送信
        </button>
      </div>
    </section>
  );
}