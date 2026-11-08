"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { useContactSubmit } from "@/lib/teka/hooks";
import { SOCIALS } from "@/lib/teka/config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mail, Github, Loader2, CheckCircle2 } from "lucide-react";
import { Twitter } from "lucide-react";

const TOPICS = [
  { value: "GENERAL", label: "General" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "PRODUCT", label: "Product" },
  { value: "MEDIA", label: "Media" },
  { value: "SUPPORT", label: "Support" },
] as const;

export function ContactView() {
  const { toast } = useToast();
  const submit = useContactSubmit();
  const [form, setForm] = useState({ name: "", email: "", topic: "GENERAL", message: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    submit.mutate(
      { ...form },
      {
        onSuccess: () => {
          toast({ title: "Message received", description: "Stored securely — the team reads every submission." });
          setForm({ name: "", email: "", topic: "GENERAL", message: "" });
        },
        onError: (err) => {
          toast({ title: "Could not send", description: err.message });
          setErrors({});
        },
      }
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact TEKA"
        title={<>Let&apos;s Build <span className="gold-text">The Future.</span></>}
        description="Have an idea, partnership or question? Send a message — it goes straight into the TEKA inbox system."
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1.2fr_1fr]" aria-label="Contact">
        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          onSubmit={onSubmit}
          className="glass rounded-3xl p-6 md:p-8"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="contact-topic">Topic</Label>
            <Select value={form.topic} onValueChange={(v) => setForm((f) => ({ ...f, topic: v }))}>
              <SelectTrigger id="contact-topic" aria-label="Message topic">
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Tell us what you're building, asking or proposing…"
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              className="resize-none"
            />
            <p className="text-right text-[11px] text-muted-foreground tabular-nums">{form.message.length}/4000</p>
          </div>

          {submit.isError && (
            <p role="alert" className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
              {submit.error.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={submit.isPending || form.name.length < 2 || form.email.length < 5 || form.message.length < 10}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-sm font-semibold text-black transition-transform hover:scale-[1.01] disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {submit.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
              </>
            ) : submit.isSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Sent
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden /> Send Message
              </>
            )}
          </Button>
          {errors && Object.keys(errors).length > 0 && (
            <p className="mt-3 text-xs text-red-300">{Object.values(errors).flat()[0]}</p>
          )}
        </motion.form>

        {/* Channels */}
        <motion.aside
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="space-y-4"
          aria-label="Direct channels"
        >
          {[
            {
              icon: Mail,
              label: "Email",
              value: SOCIALS.email,
              href: `mailto:${SOCIALS.email}`,
              note: "For formal inquiries and partnerships",
            },
            {
              icon: Send,
              label: "Telegram",
              value: "@TEKAOfficial",
              href: SOCIALS.telegram,
              note: "Community and announcements",
            },
            {
              icon: Twitter,
              label: "X (Twitter)",
              value: "@TEKAweb3",
              href: SOCIALS.x,
              note: "Public updates and discussion",
            },
            {
              icon: Github,
              label: "GitHub",
              value: "mhmdsdqi87-cloud",
              href: SOCIALS.github,
              note: "Source code and whitepaper",
            },
          ].map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="card-hover group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#0b0b0d] p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/[0.08]">
                <channel.icon className="h-5 w-5 text-gold-bright" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="mono-label block text-muted-foreground">{channel.label}</span>
                <span className="mt-0.5 block truncate text-sm font-medium group-hover:text-gold-bright transition-colors">
                  {channel.value}
                </span>
                <span className="block text-[11px] text-muted-foreground">{channel.note}</span>
              </span>
            </a>
          ))}

          <div className="rounded-2xl border border-gold/15 bg-gold/[0.04] p-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Response policy:</span> messages are stored and reviewed by
              the founding team. TEKA will never ask for funds, seed phrases or private keys — treat anyone who does as
              an impersonator.
            </p>
          </div>
        </motion.aside>
      </section>
    </>
  );
}
