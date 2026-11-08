"use client";

import Image from "next/image";
import { useRouter, type RouteId } from "@/lib/teka/router";
import { SOCIALS, TEAM, TEKA, NEXUS } from "@/lib/teka/config";
import { Github, Send, Twitter, Mail, ArrowUpRight } from "lucide-react";

const FOOTER_NAV: Array<{ id: RouteId; label: string }> = [
  { id: "about", label: "About" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "technology", label: "Technology" },
  { id: "token", label: "Token" },
  { id: "command", label: "Command Center" },
  { id: "explore", label: "Explore" },
  { id: "performance", label: "Performance" },
  { id: "security", label: "Security" },
  { id: "premium", label: "Experience" },
  { id: "global-vision", label: "Global Vision" },
  { id: "contact", label: "Contact" },
];

export function TekaFooter() {
  const navigate = useRouter((s) => s.navigate);

  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#070708]" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 md:pt-16 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="relative grid h-12 w-14 place-items-center rounded-lg border border-gold/20 bg-gold/[0.05]">
                <Image
                  src="/teka-mark.png"
                  alt=""
                  width={48}
                  height={27}
                  className="h-auto w-12"
                  style={{ filter: "drop-shadow(0 0 12px rgba(227,184,85,0.3))" }}
                />
              </span>
              <span className="font-display text-lg font-bold tracking-[0.28em]">TEKA</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {TEKA.description}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { href: SOCIALS.telegram, label: "Telegram", icon: Send },
                { href: SOCIALS.x, label: "X (Twitter)", icon: Twitter },
                { href: SOCIALS.github, label: "GitHub", icon: Github },
                { href: `mailto:${SOCIALS.email}`, label: "Email", icon: Mail },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted-foreground transition-all hover:border-gold/40 hover:text-gold-bright"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Footer">
            <h3 className="mono-label text-gold/70 mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.id)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* More */}
          <div>
            <h3 className="mono-label text-gold/70 mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV.slice(6).map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.id)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href={NEXUS.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold-bright"
                >
                  TEKA NEXUS <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/mhmdsdqi87-cloud/TEKA_web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold-bright"
                >
                  Whitepaper v1.0 <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Team */}
          <div>
            <h3 className="mono-label text-gold/70 mb-4">Team</h3>
            <ul className="space-y-3">
              {TEAM.map((member) => (
                <li key={member.name}>
                  {member.link ? (
                    <a
                      href={member.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <p className="text-sm text-foreground group-hover:text-gold-bright transition-colors">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </a>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hairline my-8" aria-hidden />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TEKA. All rights reserved. Building the future of digital innovation.
          </p>
          <p className="mono-label text-muted-foreground/70">
            Early-stage project — token is testnet-only
          </p>
        </div>
      </div>
    </footer>
  );
}
