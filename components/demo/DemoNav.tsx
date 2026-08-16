import Link from "next/link";

export default function DemoNav() {
  return (
    <nav className="px-4 py-3 sticky top-0 z-50 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#EDE6D9] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading font-bold text-base tracking-tight text-[#1C1E21]">
            Omnilink
          </span>
          <span className="font-mono text-[9px] tracking-wider uppercase bg-[#F5EFE6] px-2 py-0.5 rounded-full text-[#7E7C77]">
            AI INFRA
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-medium">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-full text-[#7E7C77] hover:text-[#1C1E21] hover:bg-[#F5EFE6] transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-full text-[#7E7C77] hover:text-[#1C1E21] hover:bg-[#F5EFE6] transition-all"
          >
            Dashboard
          </Link>
          <Link
            href="/agent/demo"
            className="px-3.5 py-1.5 rounded-full text-[#7E7C77] hover:text-[#1C1E21] hover:bg-[#F5EFE6] transition-all"
          >
            Agent Demo
          </Link>
          <Link
            href="/store/demo-store"
            className="bg-[#1C1E21] text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-all font-semibold shadow-sm"
          >
            Public Store
          </Link>
        </div>
      </div>
    </nav>
  );
}

