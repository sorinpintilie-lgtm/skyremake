"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
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
  <div className="mx-auto w-full max-w-[1240px] px-3 sm:px-6 lg:px-10">{children}</div>
);

function Button({ href, children, ghost = false }: { href: string; children: React.ReactNode; ghost?: boolean }) {
  return (
    <a
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-medium tracking-[-0.01em] transition focus:outline-none focus:ring-2 focus:ring-white/25 active:scale-[0.99]",
        "px-3.5 py-2 text-[12px] sm:px-5 sm:py-3 sm:text-sm",
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
    <section id="home" className="relative min-h-[94svh] pt-12 sm:min-h-[100svh] sm:pt-16">
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
        <div className="relative z-10 grid grid-cols-1 items-end gap-4 pb-8 pt-6 sm:grid-cols-6 sm:gap-8 sm:pb-14 sm:pt-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.t(0.04, 1)}
            className="rounded-[20px] border border-white/10 bg-black/34 p-3.5 backdrop-blur sm:col-span-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none lg:col-span-7"
          >
            {hasHeroEyebrow ? <div className="text-xs uppercase tracking-[0.28em] text-white/60">{hero.eyebrow}</div> : null}
            <h1
              className={[
                "text-balance text-[clamp(1.65rem,7.2vw,3rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl",
                hasHeroEyebrow ? "mt-4 sm:mt-6" : "mt-0",
              ].join(" ")}
            >
              {hero.title}
            </h1>
            <p className="mt-2.5 max-w-2xl text-pretty text-[14px] font-medium text-white/88 sm:mt-4 sm:text-xl">
              {hero.subhead}
            </p>

            <div className="mt-4 text-[9px] font-medium uppercase tracking-[0.14em] text-white/62 sm:mt-7 sm:text-xs">
              {hero.meta}
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 text-[10px] sm:hidden">
              {hero.mobilePills.map((pill) => (
                <div key={pill} className="rounded-lg border border-white/16 bg-black/34 px-2.5 py-2 text-white/76">
                  {pill}
                </div>
              ))}
            </div>

            <div className="mt-3.5 flex flex-wrap gap-2.5 sm:mt-4 sm:gap-3">
              <Button href="#work">{hero.primaryCta}</Button>
              <Button href="#contact" ghost>
                {hero.secondaryCta}
              </Button>
            </div>

            <p className="mt-2.5 text-[13px] text-white/64 sm:text-sm">{hero.note}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.t(0.12, 1)}
            className="reveal-blur sm:col-span-2 lg:col-span-5"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] sm:aspect-[4/5] sm:rounded-[24px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ochi.png" alt="Sky showcase" className="mono-ui-media h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82),rgba(0,0,0,0.06))]" />
              <div className="absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-black/38 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-white/72 backdrop-blur sm:hidden">
                {hero.imageTag}
              </div>
              <div className="absolute bottom-2.5 right-2.5 max-w-[74%] rounded-xl border border-white/16 bg-black/48 px-2.5 py-2 text-[10px] leading-relaxed text-white/75 backdrop-blur sm:hidden">
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
  const workedWith = bento.workedWith;

  return (
    <section id="work" className="section-divider relative py-10 sm:py-14">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={m.t(0.03, 0.8)}
          className="mb-4 text-center reveal-blur sm:mb-6"
        >
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">{bento.eyebrow}</div>
          <h2 className="mt-2.5 text-balance text-[clamp(1.8rem,7.6vw,2.7rem)] font-semibold tracking-[-0.03em] text-white sm:mt-3 sm:text-5xl">
            {bento.title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={m.t(0.07, 0.8)}
          className="mobile-snap-row reveal-blur -mx-1 mb-4 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:mb-6 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {workedWith.map((client) => (
            <div
              key={client.name}
              className="mobile-snap-card shrink-0 rounded-full border border-white/14 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.01em] text-white/82"
            >
              {client.name}
            </div>
          ))}
        </motion.div>

        <div className="reveal-blur mt-2 sm:mt-0">
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

function StoryPanels() {
  const m = useMotion();
  const panels = siteText.home.fourSteps.steps;

  return (
    <section className="section-divider relative py-8 sm:py-14">
      <Container>
        <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:gap-3.5 sm:overflow-visible sm:px-0 sm:pb-0">
          {panels.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(i * 0.05, 0.75)}
              className="sky-surface-soft reveal-blur mobile-snap-card grid min-w-[88%] shrink-0 grid-cols-6 overflow-hidden rounded-[20px] sm:min-w-0 sm:grid-cols-12 sm:rounded-[28px]"
            >
              <div className="relative col-span-3 min-h-[190px] sm:col-span-7 sm:min-h-[260px] lg:min-h-[360px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt="" className="mono-ui-media absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15),rgba(0,0,0,0.58))] lg:bg-[linear-gradient(to_top,rgba(0,0,0,0.2),rgba(0,0,0,0.55))]" />
              </div>
              <div className="col-span-3 flex items-center p-3.5 sm:col-span-5 sm:p-10">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/55">0{i + 1}</div>
                  <h3 className="mt-1.5 text-[1.15rem] font-semibold tracking-tight text-white sm:mt-3 sm:text-4xl">{p.title}</h3>
                  <p className="mt-1.5 max-w-sm text-[13px] text-white/72 sm:mt-4 sm:text-base">{p.summary}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                    {p.chips.map((step) => (
                      <span
                        key={step}
                        className="rounded-full border border-white/16 bg-white/[0.04] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-white/76 sm:px-2.5 sm:py-1 sm:text-[11px] sm:tracking-[0.08em]"
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
  const listedWork = selectedWork.slice(0, 3);

  return (
    <section className="section-divider relative py-10 sm:py-14">
      <Container>
        <div className="reveal-blur mb-4 text-center sm:mb-6">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">{showcase.eyebrow}</div>
          <h3 className="mt-2.5 text-[1.7rem] font-semibold tracking-[-0.02em] text-white sm:mt-3 sm:text-4xl">{showcase.title}</h3>
        </div>

        <div className="reveal-blur relative h-[320px] overflow-hidden rounded-[20px] sm:h-[520px] sm:rounded-[28px]">
          <InfiniteMenu
            items={items.map((item, index) => ({
              ...item,
              image: snapshotPathFromLink(item.link, index),
            }))}
            scale={0.7}
          />
        </div>

        <div className="mobile-snap-row reveal-blur -mx-1 mt-4 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:mt-5 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {listedWork.map((work) => (
            <article key={work.project} className="mobile-snap-card min-w-[78%] shrink-0 rounded-xl border border-white/12 bg-black/36 p-3.5 sm:min-w-0 sm:rounded-2xl sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/58">{work.type}</p>
              <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:mt-2 sm:text-xl">{work.project}</h4>
              <a
                href={work.href}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center text-[13px] font-medium text-[#9bc6ff] transition hover:text-[#c2ddff] sm:mt-3 sm:text-sm"
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
    <section className="section-divider relative py-8 sm:py-14">
      <Container>
        <div className="reveal-blur overflow-hidden rounded-[18px] border border-white/16 bg-white/[0.06] px-3 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.04] sm:rounded-[22px] sm:px-8 sm:py-6">
          <LogoLoop
            logos={logos}
            speed={86}
            direction="left"
            logoHeight={36}
            gap={44}
            hoverSpeed={0}
            className="logo-rail-uniform"
            ariaLabel="Parteneri și tehnologii folosite"
          />
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

    const subject = encodeURIComponent(`Cerere proiect | ${quickName.trim() || "Brief website"}`);
    const body = encodeURIComponent(
      `Nume: ${quickName.trim() || "Necompletat"}\nEmail: ${quickEmail.trim()}\n\nSpune-ne ce construiești și ce înseamnă succes pentru tine.`,
    );

    window.location.href = `mailto:hello@sky.ro?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="section-divider relative py-12 sm:py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={m.t(0.02, 0.8)}
          className="sky-surface reveal-blur overflow-hidden rounded-[24px] sm:rounded-[30px]"
        >
          <div className="relative min-h-[340px] p-4 sm:min-h-[380px] sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={placeholderImages[5]} alt="" className="mono-ui-media absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),rgba(0,0,0,0.35))]" />
            <div className="relative z-10 max-w-2xl">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">{footerCta.label}</div>
              <h3 className="mt-3 text-balance text-[1.85rem] font-semibold leading-[1.02] tracking-[-0.02em] text-white sm:mt-4 sm:text-6xl">
                {footerCta.title}
              </h3>
              <p className="mt-3 max-w-2xl text-[13px] text-white/74 sm:mt-4 sm:text-base">{footerCta.body}</p>
              <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
                <Button href={footerCta.buttons[0].href}>{footerCta.buttons[0].label}</Button>
                <Button href={footerCta.buttons[1].href} ghost>
                  {footerCta.buttons[1].label}
                </Button>
                <Button href={footerCta.buttons[2].href} ghost>
                  {footerCta.buttons[2].label}
                </Button>
              </div>

              <form onSubmit={handleQuickSubmit} className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-row">
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={quickName}
                  onChange={(event) => setQuickName(event.target.value)}
                  placeholder={footerCta.quickForm.namePlaceholder}
                  className="h-10 min-w-0 rounded-full border border-white/18 bg-black/38 px-3.5 text-sm text-white placeholder:text-white/48 focus:border-white/30 focus:outline-none sm:h-11 sm:flex-1 sm:px-4"
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={quickEmail}
                  onChange={(event) => setQuickEmail(event.target.value)}
                  required
                  placeholder={footerCta.quickForm.emailPlaceholder}
                  className="h-10 min-w-0 rounded-full border border-white/18 bg-black/38 px-3.5 text-sm text-white placeholder:text-white/48 focus:border-white/30 focus:outline-none sm:h-11 sm:flex-1 sm:px-4"
                />
                <button
                  type="submit"
                  className="col-span-2 inline-flex h-10 items-center justify-center rounded-full border border-white/18 bg-white/[0.08] px-4 text-[13px] font-medium text-white transition hover:border-white/28 hover:bg-white/[0.15] sm:col-span-1 sm:h-11 sm:px-5 sm:text-sm"
                >
                  {footerCta.quickForm.submitLabel}
                </button>
              </form>
              <p className="mt-2.5 text-[11px] text-white/62 sm:mt-3 sm:text-xs">{footerCta.quickForm.note}</p>
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

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#010101] text-white selection:bg-white selection:text-black">
      <Particles quantity={120} staticity={52} ease={74} size={0.62} color="#ffffff" className="z-0 opacity-[0.62] blur-[0.6px]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/36 backdrop-blur-xl supports-[backdrop-filter]:bg-black/28">
          <Container>
            <div className="flex h-12 items-center justify-between sm:h-14">
              <Link href="/" className="relative h-7 w-[118px] opacity-95 sm:h-8 sm:w-[142px]">
                <Image src="/sky/logo.png" alt="Sky" fill className="object-contain" sizes="(max-width: 640px) 118px, 142px" />
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

              <Button href="#contact" ghost>
                {shared.headerStartLabel}
              </Button>
            </div>

            <div className="mobile-snap-row -mx-0.5 flex gap-1.5 overflow-x-auto pb-1.5 pl-0.5 pr-0.5 md:hidden">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    className={[
                      "mobile-snap-card shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.01em]",
                      isActive
                        ? "border-white/34 bg-white/[0.12] text-white"
                        : "border-white/16 bg-white/[0.04] text-white/78",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </Container>
        </header>

        <main>
          <Hero />
          <BentoStory />
          <OrbitShowcase />
          <PartnerLogoRail />
          <StoryPanels />
          <Contact />
        </main>

        <footer className="relative mt-8 sm:mt-10">
          <Container>
            <div className="relative flex flex-col items-center justify-center gap-3 border-t border-white/10 py-10 text-center sm:gap-4 sm:py-14">
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

