"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = { href: string | null; label: string; icon: string };

const NAV: NavItem[] = [
  { href: "/", label: "Today", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/inbox", label: "Inbox", icon: "M4 4h16v12h-5l-3 3-3-3H4z" },
  { href: null, label: "Create", icon: "M4 20l4-1 11-11-3-3L5 16z" },
  { href: null, label: "Insights", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { href: null, label: "Deals", icon: "M3 8h18v12H3zM9 8V5h6v3" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Shell({ title, badge, username, children }: { title: string; badge?: string; username?: string; children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="shell">
      <nav className="nav" aria-label="Main">
        <Link href="/" className="logo"><i /> GrowKit</Link>
        {NAV.map((n) =>
          n.href ? (
            <Link key={n.label} href={n.href} aria-current={path === n.href ? "page" : undefined}>
              <Icon d={n.icon} /><span>{n.label}</span>
            </Link>
          ) : (
            <span key={n.label} className="soon" title="Coming soon">
              <Icon d={n.icon} /><span>{n.label}</span>
            </span>
          )
        )}
        <div className="side">{username ?? ""}</div>
      </nav>
      <main className="main">
        <div className="top">
          <h2>{title}</h2>
          {badge ? <span className="chip hot">{badge}</span> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
