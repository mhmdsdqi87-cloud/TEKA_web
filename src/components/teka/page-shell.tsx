"use client";

import { motion } from "framer-motion";
import { useRouter, ROUTE_TITLES } from "@/lib/teka/router";
import { TekaMark } from "@/components/teka/primitives";

/**
 * View shell — every routed section renders inside this wrapper,
 * which provides cinematic entry transitions + a consistent top bar.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  const route = useRouter((s) => s.route);
  const title = ROUTE_TITLES[route];

  return (
    <motion.main
      key={route}
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 pt-16"
      aria-label={title}
    >
      {children}
    </motion.main>
  );
}

/** Standard top block for secondary pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-backdrop absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 pt-14 md:pb-16 md:pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mb-5 h-[52px] w-[92px]"
        >
          <div className="emblem-halo absolute inset-[-45%]" aria-hidden="true" />
          <TekaMark className="relative h-full w-full" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mono-label text-gold/80 mb-4"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-display text-4xl md:text-6xl font-semibold text-balance"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed"
          >
            {description}
          </motion.p>
        )}
        {children}
      </div>
    </section>
  );
}
