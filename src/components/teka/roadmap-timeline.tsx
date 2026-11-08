"use client";

import { motion } from "framer-motion";
import type { RoadmapPhase } from "@/lib/teka/hooks";
import { useRoadmap } from "@/lib/teka/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, LoaderCircle, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META = {
  COMPLETED: { icon: CheckCircle2, label: "Completed", cls: "text-emerald-300", ring: "border-emerald-400/30 bg-emerald-400/10" },
  IN_PROGRESS: { icon: LoaderCircle, label: "In Progress", cls: "text-gold-bright", ring: "border-gold/40 bg-gold/10" },
  PLANNED: { icon: CircleDashed, label: "Planned", cls: "text-muted-foreground", ring: "border-white/10 bg-white/[0.03]" },
} as const;

export function RoadmapTimeline() {
  const { data, isLoading } = useRoadmap();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 md:space-y-5 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-gold/40 before:via-white/10 before:to-transparent md:before:left-1/2" aria-label="TEKA roadmap">
      {(data?.phases ?? []).map((phase, i) => (
        <RoadmapRow key={phase.id} phase={phase} index={i} />
      ))}
    </ol>
  );
}

function RoadmapRow({ phase, index }: { phase: RoadmapPhase; index: number }) {
  const meta = STATUS_META[phase.status] ?? STATUS_META.PLANNED;
  const Icon = meta.icon;
  const left = index % 2 === 0;

  return (
    <li className="relative md:grid md:grid-cols-2 md:gap-10">
      {/* Node */}
      <span
        className={cn(
          "absolute left-0 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border md:left-1/2 md:-translate-x-1/2",
          meta.ring
        )}
        aria-hidden
      >
        <Icon className={cn("h-4.5 w-4.5 h-5 w-5", meta.cls, phase.status === "IN_PROGRESS" && "animate-spin [animation-duration:3s]")} />
      </span>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "ml-14 md:ml-0 card-hover glass rounded-2xl p-5",
          left ? "md:col-start-1 md:text-right" : "md:col-start-2"
        )}
      >
        <div className={cn("flex items-center gap-3", left && "md:flex-row-reverse")}>
          <span className="mono-label text-gold/70">{phase.phase}</span>
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] mono-label", meta.ring, meta.cls)}>
            {phase.period}
          </span>
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold">{phase.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.description}</p>
      </motion.div>
    </li>
  );
}
