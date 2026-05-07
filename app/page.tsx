import Link from "next/link";
import HomeContent from "./components/HomeContent";
import Logo from "./components/Logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <header className="bg-[#1a7a35] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/games/new"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1a7a35] shadow-sm"
          >
            ＋ 新規
          </Link>
        </div>
      </header>
      <HomeContent />
    </div>
  );
}
