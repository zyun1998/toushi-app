"use client";

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      onClick={onEnter}
      className="flex h-screen items-center justify-center bg-white cursor-pointer"
    >
      <img
        src="/icon-192.png"
        className="w-[220px] transition-all duration-500 hover:scale-110"
      />
    </div>
  );
}