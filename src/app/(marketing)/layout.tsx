import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";

const NAV = [
  { href: "/agents", label: "Agents" },
  { href: "/industries", label: "Industries" },
  { href: "/compare", label: "Why Boterra" },
  { href: "/pricing", label: "Pricing" },
];

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo dark />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Start free
            </Link>
          </div>
          <details className="relative md:hidden">
            <summary className="list-none rounded-lg p-2 text-slate-200 [&::-webkit-details-marker]:hidden" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-ink-900 p-2 shadow-xl">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                  {item.label}
                </Link>
              ))}
              <Link href="/login" className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary mt-1 w-full">
                Start free
              </Link>
            </div>
          </details>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-ink-950 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm">
              The AI workforce for small and medium businesses. A coordinated swarm of agents for every department — so you can run, operate and scale with confidence.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Product</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/agents" className="hover:text-white">Agent directory</Link></li>
              <li><Link href="/industries" className="hover:text-white">Industry packs</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/compare" className="hover:text-white">Boterra vs alternatives</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Get started</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white">Create a free account</Link></li>
              <li><Link href="/login" className="hover:text-white">Log in</Link></li>
              <li><a href="mailto:hello@boterra.ai" className="hover:text-white">Contact sales</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs">
          © {new Date().getFullYear()} Boterra AI. AI agents provide guidance and drafts; regulated decisions should be confirmed by qualified professionals.
        </div>
      </footer>
    </>
  );
}
