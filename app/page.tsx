"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import snapshotManifest from "@/public/snapshots/index.json";
import { Particles } from "@/components/particles";
import LightRays from "@/components/light-rays";
import InfiniteMenu from "@/components/infinite-menu";
import LogoLoop from "@/components/logo-loop";
import MagicBento from "@/components/magic-bento";
import siteText from "@/content/site-text.json";

const ease = [0.22, 1, 0.36, 1] as const;
const placeholderImages = [
  "https://img.freepik.com/free-vector/vector-3d-abstract-human-head-made-black-white-stripes-monochrome-ripple-surface-illustration-head-profile-sliced-minimalistic-design-layout-business-presentations-flyers-posters_1217-6441.jpg?t=st=1770838359~exp=1770841959~hmac=9b5e6b0e2ae698b38f5131ca15f7211d431728222a41ed1b2fa51ae465fcdcd5",
  "https://picsum.photos/1200/900?grayscale&random=401",
  "https://picsum.photos/1200/900?grayscale&random=402",
  "https://picsum.photos/1200/900?grayscale&random=403",
  "https://picsum.photos/1200/900?grayscale&random=404",
  "https://picsum.photos/1200/900?grayscale&random=405",
  "https://picsum.photos/1200/900?grayscale&random=406",
  "https://picsum.photos/1200/900?grayscale&random=407",
  "https://picsum.photos/1200/900?grayscale&random=408",
] as const;

const localFallbackImages = [
  "/sky/card-1.jpg",
  "/sky/card-2.jpg",
  "/sky/card-3.jpg",
  "/sky/card-4.jpg",
  "/sky/card-5.jpg",
  "/sky/card-6.jpg",
  "/sky/bento-1.jpg",
  "/sky/bento-2.jpg",
  "/sky/bento-3.jpg",
  "/sky/bento-4.jpg",
] as const;

const navLinks = siteText.shared.navLinks;

const snapshotPathFromLink = (link: string, fallbackIndex = 1) => {
  const manifest = snapshotManifest as Record<string, string>;
  const path = manifest[link];
  if (path && path.startsWith("/")) return path;
  return localFallbackImages[fallbackIndex % localFallbackImages.length];
};

function useMotion() {
  const reduced = useReducedMotion();
  return {
    t: (d = 0, duration = 0.8) => (reduced ? { duration: 0 } : { duration, delay: d, ease }),
  };
}

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10">{children}</div>
);

function Button({ href, children, ghost = false }: { href: string; children: React.ReactNode; ghost?: boolean }) {
  return (
    <a
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium tracking-[-0.01em] transition focus:outline-none focus:ring-2 focus:ring-white/25 active:scale-[0.99]",
        "px-4 py-2.5 text-[13px] sm:px-5 sm:py-3 sm:text-sm",
        ghost
          ? "border border-white/24 bg-white/[0.025] text-white hover:border-white/32 hover:bg-white/[0.08]"
          : "bg-white text-black shadow-[0_10px_26px_rgba(255,255,255,0.18)] hover:bg-white/92",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

function Hero() {
  const m = useMotion();
  const hero = siteText.home.hero;
  const hasHeroEyebrow = Boolean(hero.eyebrow?.trim());
  return (
    <section id="home" className="relative min-h-[100svh] pt-14 sm:pt-16">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={0.45}
        lightSpread={0.65}
        rayLength={2.6}
        followMouse={true}
        mouseInfluence={0.08}
        noiseAmount={0}
        distortion={0}
        className="hero-rays"
        pulsating={false}
        fadeDistance={0.95}
        saturation={1}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[78vh] bg-[radial-gradient(72%_62%_at_50%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_26%,rgba(0,0,0,0)_62%)]" />
      <Container>
        <div className="relative z-10 grid grid-cols-1 items-end gap-6 pb-10 pt-8 sm:grid-cols-6 sm:gap-8 sm:pb-14 sm:pt-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.t(0.04, 1)}
            className="rounded-[24px] border border-white/10 bg-black/34 p-4 backdrop-blur sm:col-span-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none lg:col-span-7"
          >
            {hasHeroEyebrow ? <div className="text-xs uppercase tracking-[0.28em] text-white/60">{hero.eyebrow}</div> : null}
            <h1
              className={[
                "text-balance text-[clamp(1.9rem,8.2vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl",
                hasHeroEyebrow ? "mt-5 sm:mt-6" : "mt-0",
              ].join(" ")}
            >
              {hero.title}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-[15px] font-medium text-white/88 sm:mt-4 sm:text-xl">
              {hero.subhead}
            </p>

            <div className="mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/62 sm:mt-7 sm:text-xs">
              {hero.meta}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-[11px] sm:hidden">
              {hero.mobilePills.map((pill) => (
                <div key={pill} className="rounded-xl border border-white/16 bg-black/34 px-3 py-2.5 text-white/76">
                  {pill}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button href="#work">{hero.primaryCta}</Button>
              <Button href="#contact" ghost>
                {hero.secondaryCta}
              </Button>
            </div>

            <p className="mt-3 text-sm text-white/64">{hero.note}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.t(0.12, 1)}
            className="reveal-blur sm:col-span-2 lg:col-span-5"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] sm:aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ochi.png" alt="Sky showcase" className="mono-ui-media h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82),rgba(0,0,0,0.06))]" />
              <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/38 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/72 backdrop-blur sm:hidden">
                {hero.imageTag}
              </div>
              <div className="absolute bottom-3 right-3 max-w-[74%] rounded-2xl border border-white/16 bg-black/48 px-3 py-2.5 text-[11px] leading-relaxed text-white/75 backdrop-blur sm:hidden">
                {hero.imageNote}
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function BentoStory() {
  const m = useMotion();
  const bento = siteText.home.bentoNarrative;
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [brief, setBrief] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    const subject = encodeURIComponent(`Proiect nou | ${name.trim() || "Brief"}`);
    const body = encodeURIComponent(`Nume: ${name.trim() || "—"}\nEmail: ${email.trim()}\n\n${brief.trim() || "—"}`);
    window.location.href = `mailto:hello@sky.ro?subject=${subject}&body=${body}`;
  };

  return (
    <section id="work" className="section-divider relative py-14 sm:py-20">
      <Container>
        <div className="grid gap-8 sm:grid-cols-12 sm:gap-12 lg:items-center">

          {/* Left: testimonial + metrics */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={m.t(0.03, 0.8)}
            className="reveal-blur sm:col-span-5"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">{bento.eyebrow}</div>
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              {bento.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">{bento.body}</p>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {bento.metrics.map((metric) => (
                <div key={metric.value}>
                  <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{metric.value}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/56">{metric.label}</p>
                </div>
              ))}
            </div>

            <blockquote className="mt-8 border-l-2 border-white/20 pl-4">
              <p className="text-sm italic leading-relaxed text-white/74 sm:text-base">"{bento.quote}"</p>
              <cite className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-white/50 not-italic">{bento.quoteAuthor}</cite>
            </blockquote>
          </motion.div>

          {/* Right: inline contact form */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={m.t(0.1, 0.8)}
            className="reveal-blur sm:col-span-7"
          >
            <div className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">Spune-ne ce vrei să construiești</div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Trimite un brief scurt. Revenim în aceeași zi.
              </h3>
              <p className="mt-2 text-sm text-white/62">
                Nu trebuie să fie elaborat. Câteva rânduri despre proiect sunt suficiente pentru a începe.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Numele tău"
                  className="w-full rounded-2xl border border-white/14 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/38 focus:border-white/28 focus:outline-none"
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresa de e-mail *"
                  className="w-full rounded-2xl border border-white/14 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/38 focus:border-white/28 focus:outline-none"
                />
                <textarea
                  name="brief"
                  rows={4}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Descrie pe scurt ce vrei să construiești — tip site, industrie, obiectiv principal"
                  className="w-full rounded-2xl border border-white/14 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/38 focus:border-white/28 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/92 active:scale-[0.99]"
                >
                  Trimite brieful
                </button>
              </form>
              <p className="mt-3 text-[11px] text-white/42">hello@sky.ro · Răspuns în aceeași zi lucrătoare</p>
            </div>
          </motion.div>

        </div>

        <div className="reveal-blur mt-10 sm:mt-14">
          <MagicBento
            textAutoHide={true}
            enableStars
            enableSpotlight
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect
            spotlightRadius={400}
            particleCount={12}
            glowColor="255,255,255"
            disableAnimations={false}
          />
        </div>
      </Container>
    </section>
  );
}

function TrustStrip() {
  const m = useMotion();
  const ts = siteText.home.trustStrip;

  return (
    <section className="section-divider relative border-b border-white/10 py-8 sm:py-12">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
          <div className="flex-1">
            <p className="text-base font-medium leading-relaxed text-white/82 sm:text-lg">
              {ts.body}
            </p>
            <div className="mt-5">
              <Button href="#work">{ts.cta}</Button>
            </div>
          </div>
          <div className="mobile-snap-row -mx-1 flex gap-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-none sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
            {ts.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={m.t(i * 0.06, 0.6)}
                className="mobile-snap-card min-w-[110px] shrink-0 text-center sm:min-w-0"
              >
                <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/56 sm:text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProblemSolution() {
  const m = useMotion();
  const ps = siteText.home.problemSolution;

  return (
    <section className="section-divider relative py-14 sm:py-18">
      <Container>
        <div className="reveal-blur mb-8 sm:mb-10">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">{ps.eyebrow}</div>
          <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            {ps.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72 sm:text-base">{ps.body}</p>
        </div>

        <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {ps.problems.map((problem, i) => (
            <motion.article
              key={problem.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(i * 0.06, 0.75)}
              className="mobile-snap-card min-w-[84%] shrink-0 rounded-[22px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(0,0,0,0.45))] p-5 sm:min-w-0"
            >
              <div className="text-xl text-white/50">{problem.icon}</div>
              <h4 className="mt-3 text-base font-semibold tracking-tight text-white">{problem.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/68">{problem.body}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={m.t(0.1, 0.75)}
          className="reveal-blur mt-6 rounded-[24px] border border-white/14 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_40%,rgba(0,0,0,0.5))] p-5 sm:mt-8 sm:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">{ps.solutionLabel}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ps.solutions.map((solution) => (
                  <div
                    key={solution}
                    className="rounded-xl border border-white/14 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/86"
                  >
                    {solution}
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <Button href="#work">{ps.cta}</Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function StoryPanels() {
  const m = useMotion();
  const panels = siteText.home.fourSteps.steps;

  return (
    <section className="section-divider relative py-10 sm:py-14">
      <Container>
        <div className="mobile-snap-row -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:gap-3.5 sm:overflow-visible sm:px-0 sm:pb-0">
          {panels.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(i * 0.05, 0.75)}
              className="sky-surface-soft reveal-blur mobile-snap-card grid min-w-[92%] shrink-0 grid-cols-6 overflow-hidden rounded-[24px] sm:min-w-0 sm:grid-cols-12 sm:rounded-[28px]"
            >
              <div className="relative col-span-3 min-h-[220px] sm:col-span-7 sm:min-h-[260px] lg:min-h-[360px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt="" className="mono-ui-media absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15),rgba(0,0,0,0.58))] lg:bg-[linear-gradient(to_top,rgba(0,0,0,0.2),rgba(0,0,0,0.55))]" />
              </div>
              <div className="col-span-3 flex items-center p-4 sm:col-span-5 sm:p-10">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/55">0{i + 1}</div>
                  <h3 className="mt-2 text-[1.3rem] font-semibold tracking-tight text-white sm:mt-3 sm:text-4xl">{p.title}</h3>
                  <p className="mt-2 max-w-sm text-sm text-white/72 sm:mt-4 sm:text-base">{p.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                    {p.chips.map((step) => (
                      <span
                        key={step}
                        className="rounded-full border border-white/16 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/76"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function OrbitShowcase() {
  const showcase = siteText.home.interactiveShowcase;
  const selectedWork = showcase.items.map((item, index) => ({
    ...item,
    image: placeholderImages[(index + 1) % placeholderImages.length],
  }));

  const items = selectedWork.map((work) => ({
    image: work.image,
    link: work.href,
    title: work.project,
    description: `${work.type} · ${work.outcome}`,
  }));
  const listedWork = selectedWork.slice(0, 4);

  return (
    <section className="section-divider relative py-14 sm:py-18">
      <Container>
        <div className="reveal-blur mb-6 text-center sm:mb-8">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">{showcase.eyebrow}</div>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">{showcase.title}</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">{showcase.body}</p>
        </div>

        <div className="reveal-blur relative h-[360px] overflow-hidden rounded-[24px] sm:h-[560px] sm:rounded-[28px]">
          <InfiniteMenu
            items={items.map((item, index) => ({
              ...item,
              image: snapshotPathFromLink(item.link, index),
            }))}
            scale={0.7}
          />
        </div>

        <div className="mobile-snap-row reveal-blur -mx-1 mt-5 flex gap-3 overflow-x-auto px-1 pb-1 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
          {listedWork.map((work) => (
            <article key={work.project} className="mobile-snap-card min-w-[82%] shrink-0 rounded-2xl border border-white/12 bg-black/36 p-4 sm:min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/58">{work.type}</p>
              <h4 className="mt-2 text-xl font-semibold tracking-tight text-white">{work.project}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/72">{work.outcome}</p>
              <a
                href={work.href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center text-sm font-medium text-[#9bc6ff] transition hover:text-[#c2ddff]"
              >
                {showcase.linkLabel}
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function StrategyCards() {
  const m = useMotion();
  const layers = siteText.home.deliveryLayers;
  const cardMeta = layers.cards;

  const [showAllCapabilities, setShowAllCapabilities] = React.useState(false);
  const visibleCards = showAllCapabilities ? cardMeta : cardMeta.slice(0, 6);
  const hasExpandableCards = cardMeta.length > 6;

  return (
    <section className="section-divider relative py-14 sm:py-18">
      <Container>
        <div className="reveal-blur mb-6 text-center sm:mb-8">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">{layers.eyebrow}</div>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">{layers.title}</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">{layers.body}</p>
        </div>

        <div className="reveal-blur mt-10">
          <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-2">
            {visibleCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={m.t(index * 0.04, 0.7)}
                className="mobile-snap-card min-w-[88%] shrink-0 rounded-2xl border border-white/12 bg-black/42 p-6 backdrop-blur-xl sm:min-w-0 sm:p-7"
              >
                <h4 className="text-[1.35rem] font-semibold tracking-tight text-white sm:text-[1.55rem]">{card.title}</h4>
                <p className="mt-3 text-[15px] leading-relaxed text-white/80 sm:text-base">{card.benefit}</p>
                <p className="mt-4 text-[13px] leading-relaxed text-white/62 sm:text-sm">
                  <span className="font-medium text-white/76">Dovadă:</span> {card.proof}
                </p>
              </motion.article>
            ))}
          </div>

          {hasExpandableCards ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllCapabilities((prev) => !prev)}
                aria-expanded={showAllCapabilities}
                className="inline-flex items-center rounded-full border border-white/18 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.1]"
              >
                {showAllCapabilities ? layers.toggleLess : layers.toggleMore}
              </button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function WhySky() {
  const m = useMotion();
  const signature = siteText.home.signatureDirection;
  const whySky = siteText.home.whySky;

  return (
    <section className="section-divider relative py-14 sm:py-18">
      <Container>
        <div className="reveal-blur grid gap-6 sm:grid-cols-12 sm:gap-8">
          <div className="sm:col-span-5">
            <div className="rounded-[28px] border border-white/12 bg-white/[0.03] p-5 sm:p-8">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">{signature.eyebrow}</div>
              <h3 className="mt-3 text-balance text-2xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                {signature.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/74 sm:text-base">{signature.body}</p>
            </div>
          </div>
          <div className="sm:col-span-7">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60 sm:mb-5">{whySky.eyebrow}</div>
            <div className="mt-4 grid gap-3 sm:mt-0 sm:grid-cols-2 sm:gap-4">
              {whySky.reasons.map((reason, i) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={m.t(i * 0.05, 0.7)}
                  className="rounded-[20px] border border-white/12 bg-white/[0.04] p-4 sm:p-5"
                >
                  <h4 className="text-sm font-semibold tracking-tight text-white sm:text-base">{reason.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-white/68 sm:text-sm">{reason.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PartnerLogoRail() {
  const logos = [
    { src: "/logos/artisdenta logo.png", alt: "Logo partener 01", href: "#work" },
    { src: "/logos/eNumismatica.ro_logo.png", alt: "Logo partener 02", href: "#work" },
    { src: "/logos/favicon.png", alt: "Logo partener 03", href: "#work" },
    { src: "/logos/file_0000000004c461fdaddf55c47348a021.png", alt: "Logo partener 04", href: "#work" },
    { src: "/logos/fulllogo_transparent.avif", alt: "Logo partener 05", href: "#work" },
    { src: "/logos/IMG_2868 (2).PNG", alt: "Logo partener 06", href: "#work" },
    { src: "/logos/IMG_9812.png", alt: "Logo partener 07", href: "#work" },
    { src: "/logos/loglogo.png", alt: "Logo partener 08", href: "#work" },
    { src: "/logos/logo (1).png", alt: "Logo partener 09", href: "#work" },
    { src: "/logos/logo (2).png", alt: "Logo partener 10", href: "#work" },
    { src: "/logos/logo (3).png", alt: "Logo partener 11", href: "#work" },
    { src: "/logos/logo (5).png", alt: "Logo partener 12", href: "#work" },
    { src: "/logos/logo_2.png", alt: "Logo partener 13", href: "#work" },
    { src: "/logos/logo_bakery-removebg-preview.png", alt: "Logo partener 14", href: "#work" },
    { src: "/logos/logo_pink.png", alt: "Logo partener 15", href: "#work" },
    { src: "/logos/logo_v1_Școala de Beauty.png", alt: "Logo partener 16", href: "#work" },
    { src: "/logos/logo-color (1).svg", alt: "Logo partener 17", href: "#work" },
    { src: "/logos/logohr (1).png", alt: "Logo partener 18", href: "#work" },
    { src: "/logos/logooac.png", alt: "Logo partener 19", href: "#work" },
    { src: "/logos/profilo_metal_logo.png", alt: "Logo partener 20", href: "#work" },
    { src: "/logos/sba_logo.PNG", alt: "Logo partener 21", href: "#work" },
    { src: "/logos/Sdental.png", alt: "Logo partener 22", href: "#work" },
  ];

  return (
    <section className="section-divider relative py-10 sm:py-14">
      <Container>
        <div className="reveal-blur overflow-hidden rounded-[22px] border border-white/16 bg-white/[0.06] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.04] sm:px-8">
          <LogoLoop
            logos={logos}
            speed={86}
            direction="left"
            logoHeight={42}
            gap={56}
            hoverSpeed={0}
            className="logo-rail-uniform"
            ariaLabel="Parteneri și tehnologii folosite"
          />
        </div>
      </Container>
    </section>
  );
}

function ExplorePages() {
  const m = useMotion();
  const explore = siteText.home.exploreSky;
  const pages = explore.pages;

  return (
    <section className="section-divider relative py-10 sm:py-14">
      <Container>
        <div className="reveal-blur mb-6 text-center sm:mb-8">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">{explore.eyebrow}</div>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            {explore.title}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">{explore.subhead}</p>
        </div>

        <div className="mobile-snap-row -mx-1 flex gap-4 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
          {pages.map((page, i) => (
            <motion.article
              key={page.href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(i * 0.05, 0.75)}
              className="sky-surface-soft reveal-blur mobile-snap-card group min-w-[90%] shrink-0 rounded-[26px] border border-white/12 bg-[radial-gradient(90%_120%_at_10%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_44%,rgba(0,0,0,0.52))] md:min-w-0"
            >
              <div className="p-6 sm:p-8">
                {page.label.trim().toLowerCase() !== page.title.trim().toLowerCase() ? (
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/58">{page.label}</div>
                ) : null}
                <h4
                  className={[
                    "text-3xl font-semibold tracking-tight text-white",
                    page.label.trim().toLowerCase() !== page.title.trim().toLowerCase() ? "mt-3" : "mt-0",
                  ].join(" ")}
                >
                  {page.title}
                </h4>
                <p className="mt-3 max-w-[45ch] text-sm text-white/72">{page.text}</p>
                <div className="mt-6">
                  <Link
                    href={page.href}
                    className="inline-flex items-center rounded-full border border-white/18 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:bg-white/[0.12]"
                  >
                    {explore.openLabel}
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Contact() {
  const m = useMotion();
  const footerCta = siteText.home.footerCta;
  const [quickName, setQuickName] = React.useState("");
  const [quickEmail, setQuickEmail] = React.useState("");

  const handleQuickSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quickEmail.trim()) return;

    const subject = encodeURIComponent(`Solicitare proiect | ${quickName.trim() || "Brief nou"}`);
    const body = encodeURIComponent(
      `Nume: ${quickName.trim() || "Necompletat"}\nEmail: ${quickEmail.trim()}\n\nDescrie pe scurt ce vrei să construiești și ce rezultat urmărești.`,
    );

    window.location.href = `mailto:hello@sky.ro?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="section-divider relative py-14 sm:py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={m.t(0.02, 0.8)}
          className="sky-surface reveal-blur overflow-hidden rounded-[30px]"
        >
          <div className="relative min-h-[380px] p-5 sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={placeholderImages[5]} alt="" className="mono-ui-media absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),rgba(0,0,0,0.35))]" />
            <div className="relative z-10 max-w-2xl">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">{footerCta.label}</div>
              <h3 className="mt-4 text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.02em] text-white sm:text-6xl">
                {footerCta.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm text-white/74 sm:text-base">{footerCta.body}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={footerCta.buttons[0].href}>{footerCta.buttons[0].label}</Button>
                <Button href={footerCta.buttons[1].href} ghost>
                  {footerCta.buttons[1].label}
                </Button>
                <Button href={footerCta.buttons[2].href} ghost>
                  {footerCta.buttons[2].label}
                </Button>
              </div>

              <form onSubmit={handleQuickSubmit} className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={quickName}
                  onChange={(event) => setQuickName(event.target.value)}
                  placeholder={footerCta.quickForm.namePlaceholder}
                  className="h-11 min-w-0 rounded-full border border-white/18 bg-black/38 px-4 text-sm text-white placeholder:text-white/48 focus:border-white/30 focus:outline-none sm:flex-1"
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={quickEmail}
                  onChange={(event) => setQuickEmail(event.target.value)}
                  required
                  placeholder={footerCta.quickForm.emailPlaceholder}
                  className="h-11 min-w-0 rounded-full border border-white/18 bg-black/38 px-4 text-sm text-white placeholder:text-white/48 focus:border-white/30 focus:outline-none sm:flex-1"
                />
                <button
                  type="submit"
                  className="col-span-2 inline-flex h-11 items-center justify-center rounded-full border border-white/18 bg-white/[0.08] px-5 text-sm font-medium text-white transition hover:border-white/28 hover:bg-white/[0.15] sm:col-span-1"
                >
                  {footerCta.quickForm.submitLabel}
                </button>
              </form>
              <p className="mt-3 text-xs text-white/62">{footerCta.quickForm.note}</p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export default function Page() {
  const pathname = usePathname();
  const shared = siteText.shared;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileMenuOpen || typeof window === "undefined") return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    if (mobileMenuOpen) body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#010101] text-white selection:bg-white selection:text-black">
      <Particles quantity={120} staticity={52} ease={74} size={0.62} color="#ffffff" className="z-0 opacity-[0.62] blur-[0.6px]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-[60] border-b border-white/10 bg-black/36 backdrop-blur-xl supports-[backdrop-filter]:bg-black/28">
          <Container>
            <div className="flex h-14 items-center justify-between sm:h-16">
              <Link href="/" className="relative h-8 w-[132px] opacity-95 sm:h-9 sm:w-[152px]">
                <Image src="/sky/logo.png" alt="Sky" fill className="object-contain" sizes="(max-width: 640px) 132px, 152px" />
              </Link>

              <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={[
                        "group relative py-1 transition-colors duration-300 ease-out",
                        isActive ? "text-white" : "text-white/72 hover:text-white",
                      ].join(" ")}
                    >
                      <span>{link.label}</span>
                      <span
                        className={[
                          "pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left bg-white/85 transition-transform duration-300 ease-out",
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                        ].join(" ")}
                      />
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden md:block">
                <Button href="#contact" ghost>
                  {shared.headerStartLabel}
                </Button>
              </div>

              <button
                type="button"
                aria-label={mobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
                aria-expanded={mobileMenuOpen}
                aria-controls="sky-ro-mobile-drawer-home"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/[0.04] text-white transition hover:border-white/26 hover:bg-white/[0.1] md:hidden"
              >
                <span className="relative block h-4 w-4">
                  <span
                    className={[
                      "absolute left-0 top-0.5 h-[1.5px] w-4 bg-white transition-transform duration-300",
                      mobileMenuOpen ? "translate-y-[5px] rotate-45" : "",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-[7px] h-[1.5px] w-4 bg-white transition-opacity duration-200",
                      mobileMenuOpen ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-[13px] h-[1.5px] w-4 bg-white transition-transform duration-300",
                      mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : "",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>
          </Container>
        </header>

        {hasMounted
          ? createPortal(
              <div
                className={[
                  "fixed inset-0 z-[120] md:hidden",
                  mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
                ].join(" ")}
              >
                <button
                  type="button"
                  aria-label="Închide meniul"
                  onClick={() => setMobileMenuOpen(false)}
                  className={[
                    "absolute inset-0 z-[120] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
                    mobileMenuOpen ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />

                <aside
                  id="sky-ro-mobile-drawer-home"
                  className={[
                    "absolute right-0 top-0 z-[130] flex h-full w-[min(88vw,360px)] flex-col overflow-hidden border-l border-white/30 bg-white/[0.10] p-4 ring-1 ring-white/20 shadow-[-16px_0_48px_rgba(0,0,0,0.35)] backdrop-blur-[22px] supports-[backdrop-filter]:bg-white/[0.08] transition-transform duration-300",
                    mobileMenuOpen ? "translate-x-0" : "translate-x-full",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/58">Navigație</p>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/16 bg-white/[0.04] text-lg leading-none text-white/86 transition hover:border-white/28 hover:bg-white/[0.1]"
                      aria-label="Închide"
                    >
                      ×
                    </button>
                  </div>

                  <nav className="mt-4 grid gap-2.5">
                    {navLinks.map((link, index) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={`drawer-${link.href}`}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={[
                            "rounded-2xl border px-4 py-3 transition",
                            isActive
                              ? "border-white/34 bg-white/[0.12]"
                              : "border-white/12 bg-white/[0.03] hover:border-white/26 hover:bg-white/[0.08]",
                          ].join(" ")}
                        >
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/46">0{index + 1}</p>
                          <p className="mt-1 text-sm font-medium text-white/90">{link.label}</p>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-auto grid gap-2.5 pt-5">
                    <a
                      href="#contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90"
                    >
                      {shared.headerStartLabel}
                    </a>
                    <a
                      href="#work"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-5 text-sm font-medium text-white transition hover:border-white/32 hover:bg-white/[0.1]"
                    >
                      {siteText.home.hero.primaryCta}
                    </a>
                  </div>
                </aside>
              </div>,
              document.body,
            )
          : null}

        <main>
          <Hero />
          <TrustStrip />
          <ProblemSolution />
          <BentoStory />
          <OrbitShowcase />
          <StrategyCards />
          <WhySky />
          <PartnerLogoRail />
          <ExplorePages />
          <StoryPanels />
          <Contact />
        </main>

        <footer className="relative mt-10">
          <Container>
            <div className="relative flex flex-col items-center justify-center gap-4 border-t border-white/10 py-14 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-white/65">{shared.footer.kicker}</p>
              <Link href="#home" className="relative h-12 w-[180px] opacity-95 transition hover:opacity-100 sm:h-14 sm:w-[220px]">
                <Image src="/sky/logo.png" alt="sky.ro" fill className="object-contain" sizes="(max-width: 640px) 180px, 220px" />
              </Link>
              <p className="text-[11px] tracking-[0.16em] text-white/35">{shared.footer.copyright}</p>
            </div>
          </Container>
        </footer>
      </div>
    </div>
  );
}

