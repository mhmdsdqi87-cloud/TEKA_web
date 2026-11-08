"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter, type RouteId } from "@/lib/teka/router";
import { usePresence } from "@/lib/teka/hooks";
import { Menu, X, Radar } from "lucide-react";

const NAV_ITEMS: Array<{ id: RouteId; label: string }> = [
  { id: "about", label: "About" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "technology", label: "Technology" },
  { id: "token", label: "Token" },
  { id: "command", label: "Command Center" },
];

function PresenceIndicator() {
  const { data } = usePresence();
  if (!data) return null;
  return (
    <span
      className="hidden md:inline-flex items-center gap-2 mono-label text-muted-foreground"
      title="Real, anonymous presence — no inflation"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 pulse-dot" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {data.active} online
    </span>
  );
}

export function TekaNavigation() {
  const route = useRouter((s) => s.route);
  const navigate = useRouter((s) => s.navigate);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu as part of the navigation action itself (no effect needed).
  const go = (id: RouteId) => () => {
    setOpen(false);
    navigate(id);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent border-b border-transparent"
      )}
    >
      <nav aria-label="Primary" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <button onClick={go("home")} className="group flex items-center gap-2.5" aria-label="TEKA home">
            <span className="relative grid h-10 w-12 place-items-center">
              <span className="absolute inset-0 rounded-lg bg-gold/[0.06] blur-[6px] transition-opacity duration-500 group-hover:opacity-100 opacity-60" aria-hidden />
              <Image
                src="/teka-mark.png"
                alt=""
                width={44}
                height={25}
                priority
                className="relative h-auto w-11 transition-transform duration-500 group-hover:scale-110"
                style={{ filter: "drop-shadow(0 0 10px rgba(227,184,85,0.35))" }}
              />
            </span>
            <span className="font-display text-lg font-bold tracking-[0.28em] text-foreground group-hover:text-gold-bright transition-colors">
              TEKA
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1" role="list">
            {NAV_ITEMS.map((item) => {
              const active = route === item.id;
              return (
                <button
                  key={item.id}
                  onClick={go(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                    active ? "text-gold-bright" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-gold/25 bg-gold/[0.08]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <PresenceIndicator />
            <button
              onClick={go("explore")}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-bright transition-all hover:bg-gold/20 hover:border-gold/60"
            >
              <Radar className="h-3.5 w-3.5" aria-hidden />
              Explore
            </button>
            <button
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-foreground"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:hidden overflow-hidden border-b border-white/[0.06] bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 grid gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={go(item.id)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-left text-sm",
                    route === item.id ? "bg-gold/10 text-gold-bright" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={go("explore")}
                className="mt-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-left text-sm text-gold-bright"
              >
                Explore TEKA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
