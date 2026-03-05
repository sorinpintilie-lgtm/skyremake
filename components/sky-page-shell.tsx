"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Particles } from "@/components/particles";
import LightRays from "@/components/light-rays";
import siteText from "@/content/site-text.json";

const ease = [0.22, 1, 0.36, 1] as const;

type PageCta = {
  href: string;
  label: string;
};

type SkyPageShellProps = {
  pageLabel: string;
  title: string;
  description: string;
  primaryCta: PageCta;
  secondaryCta?: PageCta;
  heroImage?: string;
  heroLayout?: "split" | "editorial" | "architecture" | "immersive" | "concierge" | "minimal";
  heroTone?: "default" | "identity" | "capabilities" | "showcase" | "contact";
  heroBadge?: string;
  heroStats?: { value: string; label: string }[];
  heroPoints?: string[];
  heroNote?: string;
  raysOrigin?: React.ComponentProps<typeof LightRays>["raysOrigin"];
  children: React.ReactNode;
};

const navLinks = siteText.shared.navLinks;

export function useMotionPreset() {
  const reduced = useReducedMotion();
  return {
    t: (delay = 0, duration = 0.8) => (reduced ? { duration: 0 } : { duration, delay, ease }),
  };
}

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10">{children}</div>;
}

export function SkyButton({ href, children, ghost = false }: { href: string; children: React.ReactNode; ghost?: boolean }) {
  const classes = [
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium tracking-[-0.01em] transition focus:outline-none focus:ring-2 focus:ring-white/25 active:scale-[0.99]",
    "px-4 py-2.5 text-[13px] sm:px-5 sm:py-3 sm:text-sm",
    ghost
      ? "border border-white/24 bg-white/[0.025] text-white hover:border-white/32 hover:bg-white/[0.08]"
      : "bg-white text-black shadow-[0_10px_26px_rgba(255,255,255,0.18)] hover:bg-white/92",
  ].join(" ");

  const isExternalLike =
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://");

  if (isExternalLike) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  const m = useMotionPreset();
  const hasEyebrow = Boolean(eyebrow?.trim()) && eyebrow?.trim().toLowerCase() !== title.trim().toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={m.t(0.03, 0.8)}
      className={["reveal-blur", center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"].join(" ")}
    >
      {hasEyebrow ? <div className="text-xs uppercase tracking-[0.28em] text-white/60">{eyebrow}</div> : null}
      <h2
        className={[
          "text-balance text-[clamp(1.9rem,8.4vw,3.7rem)] font-semibold tracking-[-0.03em] text-white sm:text-6xl",
          hasEyebrow ? "mt-3 sm:mt-4" : "mt-0",
        ].join(" ")}
      >
        {title}
      </h2>
      {description && (
        <p className={["mt-3 max-w-2xl text-sm text-white/70 sm:mt-4 sm:text-base", center ? "mx-auto text-center" : ""].join(" ")}>
          {description}
        </p>
      )}
    </motion.div>
  );
}

export default function SkyPageShell({
  pageLabel,
  title,
  description,
  primaryCta,
  secondaryCta,
  heroImage = "/sky/hero.jpg",
  heroLayout = "split",
  heroTone = "default",
  heroBadge,
  heroStats = [],
  heroPoints = [],
  heroNote,
  raysOrigin = "top-center",
  children,
}: SkyPageShellProps) {
  const m = useMotionPreset();
  const pathname = usePathname();
  const shared = siteText.shared;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const toneGlowClass =
    heroTone === "identity"
      ? "bg-[radial-gradient(72%_68%_at_20%_0%,rgba(200,220,255,0.2),rgba(255,255,255,0.04)_35%,rgba(0,0,0,0)_70%)]"
      : heroTone === "capabilities"
        ? "bg-[radial-gradient(72%_68%_at_80%_0%,rgba(210,255,240,0.18),rgba(255,255,255,0.04)_34%,rgba(0,0,0,0)_70%)]"
        : heroTone === "showcase"
          ? "bg-[radial-gradient(78%_70%_at_50%_0%,rgba(255,220,190,0.18),rgba(255,255,255,0.03)_34%,rgba(0,0,0,0)_72%)]"
          : heroTone === "contact"
            ? "bg-[radial-gradient(72%_68%_at_50%_0%,rgba(180,225,255,0.18),rgba(255,255,255,0.04)_34%,rgba(0,0,0,0)_70%)]"
            : "bg-[radial-gradient(72%_62%_at_50%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_26%,rgba(0,0,0,0)_62%)]";

  const tonePanelLabel =
    heroBadge ??
    (heroTone === "identity"
      ? "Studio profile"
      : heroTone === "capabilities"
        ? "Delivery architecture"
        : heroTone === "showcase"
          ? "Live curation"
          : heroTone === "contact"
            ? "Concierge intake"
            : "Sky signature");

  const trimmedStats = heroStats.slice(0, 3);
  const trimmedPoints = heroPoints.slice(0, 4);

  return (
    <div className="relative min-h-screen bg-[#010101] text-white selection:bg-white selection:text-black">
      <Particles quantity={120} staticity={52} ease={74} size={0.62} color="#ffffff" className="z-0 opacity-[0.62] blur-[0.6px]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/36 backdrop-blur-xl supports-[backdrop-filter]:bg-black/28">
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
                <SkyButton href="/contact" ghost>
                  {shared.headerStartLabel}
                </SkyButton>
              </div>

              <button
                type="button"
                aria-label={mobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
                aria-expanded={mobileMenuOpen}
                aria-controls="sky-ro-mobile-drawer-shell"
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

          <div
            className={[
              "fixed inset-0 z-[70] md:hidden",
              mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
          >
            <button
              type="button"
              aria-label="Închide meniul"
              onClick={() => setMobileMenuOpen(false)}
              className={[
                "absolute inset-0 z-[70] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
                mobileMenuOpen ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />

            <aside
              id="sky-ro-mobile-drawer-shell"
              className={[
                "absolute right-0 top-0 z-[80] flex h-full w-[min(88vw,360px)] flex-col overflow-hidden border-l border-white/30 bg-white/[0.10] p-4 ring-1 ring-white/20 shadow-[-16px_0_48px_rgba(0,0,0,0.35)] backdrop-blur-[22px] supports-[backdrop-filter]:bg-white/[0.08] transition-transform duration-300",
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
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  {shared.headerStartLabel}
                </Link>
              </div>
            </aside>
          </div>
        </header>

        <main>
          <section className={["section-divider relative pt-16", heroLayout === "immersive" ? "min-h-[92svh]" : "min-h-[84svh]"].join(" ")}>
            <LightRays
              raysOrigin={raysOrigin}
              raysColor="#ffffff"
              raysSpeed={0.42}
              lightSpread={0.65}
              rayLength={2.5}
              followMouse={true}
              mouseInfluence={0.08}
              noiseAmount={0}
              distortion={0}
              className="hero-rays"
              pulsating={false}
              fadeDistance={0.95}
              saturation={1}
            />

            <div className={["pointer-events-none absolute inset-x-0 top-0 h-[78vh]", toneGlowClass].join(" ")} />

            {heroLayout === "editorial" && (
              <Container>
                <div className="relative z-10 pb-12 pt-10 sm:pb-16 sm:pt-18">
                  <div className="grid grid-cols-6 items-start gap-3 sm:grid-cols-12 sm:items-end sm:gap-6 lg:gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.04, 1)}
                      className="col-span-6 sm:col-span-8 lg:col-span-8"
                    >
                      <div className="text-xs uppercase tracking-[0.3em] text-white/58">{pageLabel}</div>
                      <h1 className="mt-5 max-w-[14ch] text-balance text-[clamp(2rem,10.8vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-white sm:mt-6 sm:text-7xl lg:text-8xl">
                        {title}
                      </h1>
                      <p className="mt-4 max-w-2xl text-pretty text-sm text-white/80 sm:mt-6 sm:text-lg">{description}</p>

                      <div className="mt-9 flex flex-wrap gap-3">
                        <SkyButton href={primaryCta.href}>{primaryCta.label}</SkyButton>
                        {secondaryCta && (
                          <SkyButton href={secondaryCta.href} ghost>
                            {secondaryCta.label}
                          </SkyButton>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.12, 0.95)}
                      className="reveal-blur col-span-6 sm:col-span-4 lg:col-span-4"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] sm:aspect-[4/5] sm:rounded-[24px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={heroImage} alt="Sky page visual" className="mono-ui-media h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.84),rgba(0,0,0,0.16))]" />
                      </div>
                    </motion.div>
                  </div>

                  {(trimmedStats.length > 0 || trimmedPoints.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.14, 0.9)}
                      className="mobile-snap-row -mx-1 mt-6 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-12 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0"
                    >
                      {trimmedStats.length > 0 && (
                        <div className="mobile-snap-card min-w-[90%] shrink-0 sm:col-span-7 sm:min-w-0 sm:grid sm:grid-cols-3 sm:gap-3 lg:col-span-6">
                          {trimmedStats.map((stat) => (
                            <div
                              key={`${stat.value}-${stat.label}`}
                              className="sky-surface-soft mb-2 rounded-2xl px-3 py-3 last:mb-0 sm:mb-0 sm:px-4 sm:py-4"
                            >
                              <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{stat.value}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/58">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {trimmedPoints.length > 0 && (
                        <div className="mobile-snap-card min-w-[84%] shrink-0 sm:col-span-5 sm:min-w-0 sm:grid sm:gap-2.5 lg:col-span-6">
                          {trimmedPoints.slice(0, 3).map((point) => (
                            <div key={point} className="rounded-xl border border-white/12 bg-black/35 px-2.5 py-2 text-xs text-white/78 sm:px-3 sm:text-sm">
                              {point}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </Container>
            )}

            {heroLayout === "architecture" && (
              <Container>
                <div className="relative z-10 pb-12 pt-10 sm:pb-16 sm:pt-18">
                  <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-12 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-6">
                    <motion.aside
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.03, 0.95)}
                      className="reveal-blur mobile-snap-card min-w-[86%] shrink-0 sm:col-span-4 sm:min-w-0 lg:col-span-3"
                    >
                      <div className="sky-surface rounded-[26px] p-5">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">{pageLabel}</p>
                        {trimmedStats.length > 0 && (
                          <div className="mt-4 space-y-2.5">
                            {trimmedStats.map((stat) => (
                              <div key={stat.label} className="rounded-xl border border-white/10 bg-black/35 px-3 py-3">
                                <p className="text-xl font-semibold tracking-tight text-white">{stat.value}</p>
                                <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/55">{stat.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.aside>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.08, 1)}
                      className="mobile-snap-card min-w-[92%] shrink-0 sm:col-span-8 sm:min-w-0 lg:col-span-6"
                    >
                      <div className="text-xs uppercase tracking-[0.28em] text-white/60">{tonePanelLabel}</div>
                      <h1 className="mt-4 text-balance text-[clamp(2rem,10.2vw,4.7rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:mt-5 sm:text-7xl">
                        {title}
                      </h1>
                      <p className="mt-4 max-w-2xl text-pretty text-sm text-white/78 sm:mt-5 sm:text-lg">{description}</p>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <SkyButton href={primaryCta.href}>{primaryCta.label}</SkyButton>
                        {secondaryCta && (
                          <SkyButton href={secondaryCta.href} ghost>
                            {secondaryCta.label}
                          </SkyButton>
                        )}
                      </div>

                      {trimmedPoints.length > 0 && (
                        <div className="mt-9 space-y-2.5">
                          {trimmedPoints.map((point) => (
                            <div key={point} className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3">
                              <span className="text-sm text-white/78">{point}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.12, 0.95)}
                      className="reveal-blur mobile-snap-card min-w-[82%] shrink-0 sm:col-span-12 sm:min-w-0 lg:col-span-3"
                    >
                      <div className="overflow-hidden rounded-[22px]">
                        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[3/4]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={heroImage} alt="Sky page visual" className="mono-ui-media h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82),rgba(0,0,0,0.18))]" />
                        </div>
                        {heroNote && <p className="px-2 pb-1 pt-3 text-[11px] uppercase tracking-[0.22em] text-white/55">{heroNote}</p>}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Container>
            )}

            {heroLayout === "immersive" && (
              <Container>
                <div className="relative z-10 pb-12 pt-8 sm:pb-16 sm:pt-12">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={m.t(0.04, 1)}
                    className="relative overflow-hidden rounded-[24px] sm:rounded-[34px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="Sky page visual" className="mono-ui-media absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[radial-gradient(58%_70%_at_75%_20%,rgba(255,255,255,0.12),rgba(255,255,255,0)),linear-gradient(to_top,rgba(0,0,0,0.93),rgba(0,0,0,0.34))]" />

                    <div className="relative grid min-h-[62svh] grid-cols-6 items-end gap-3 px-3 pb-4 pt-4 sm:min-h-[72svh] sm:grid-cols-12 sm:gap-8 sm:px-10 sm:pb-10 sm:pt-7">
                      <div className="col-span-6 lg:col-span-8">
                        <h1 className="mt-4 max-w-[16ch] text-balance text-[clamp(2rem,10.2vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.035em] text-white sm:mt-6 sm:text-7xl lg:text-8xl">
                          {title}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-white/80 sm:mt-5 sm:text-lg">{description}</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                          <SkyButton href={primaryCta.href}>{primaryCta.label}</SkyButton>
                          {secondaryCta && (
                            <SkyButton href={secondaryCta.href} ghost>
                              {secondaryCta.label}
                            </SkyButton>
                          )}
                        </div>
                      </div>

                      <div className="col-span-6 pb-0.5 sm:col-span-5 lg:col-span-4 lg:pb-1">
                        {trimmedStats.length > 0 && (
                          <div className="mobile-snap-row -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1 sm:mx-0 sm:grid sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0">
                            {trimmedStats.map((stat) => (
                              <div key={stat.label} className="mobile-snap-card min-w-[78%] shrink-0 rounded-2xl border border-white/16 bg-black/48 px-3 py-2.5 backdrop-blur sm:min-w-0 sm:px-4 sm:py-3">
                                <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{stat.value}</p>
                                <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-white/58">{stat.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {trimmedPoints.length > 0 && (
                        <div className="col-span-6 sm:col-span-12 lg:col-span-12">
                          <div className="mobile-snap-row -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0">
                            {trimmedPoints.slice(0, 3).map((point) => (
                              <div key={point} className="mobile-snap-card min-w-[84%] shrink-0 rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm text-white/82 backdrop-blur sm:min-w-0">
                                {point}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </Container>
            )}

            {heroLayout === "concierge" && (
              <Container>
                <div className="relative z-10 pb-12 pt-10 sm:pb-16 sm:pt-18">
                  <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-12 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:items-stretch">
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.04, 1)}
                      className="mobile-snap-card min-w-[92%] shrink-0 sm:col-span-7 sm:min-w-0 lg:col-span-7"
                    >
                      <div className="text-xs uppercase tracking-[0.3em] text-white/58">{pageLabel}</div>
                      <h1 className="mt-5 max-w-[14ch] text-balance text-[clamp(2rem,10.2vw,4.4rem)] font-semibold leading-[0.97] tracking-[-0.04em] text-white sm:mt-6 sm:text-7xl">
                        {title}
                      </h1>
                      <p className="mt-4 max-w-2xl text-sm text-white/80 sm:mt-6 sm:text-lg">{description}</p>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <SkyButton href={primaryCta.href}>{primaryCta.label}</SkyButton>
                        {secondaryCta && (
                          <SkyButton href={secondaryCta.href} ghost>
                            {secondaryCta.label}
                          </SkyButton>
                        )}
                      </div>

                      {trimmedStats.length > 0 && (
                        <div className="mobile-snap-row -mx-1 mt-7 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:mt-auto sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-8">
                          {trimmedStats.map((stat) => (
                            <div key={stat.label} className="mobile-snap-card min-w-[78%] shrink-0 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-4 sm:min-w-0">
                              <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/58">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={m.t(0.12, 0.95)}
                      className="reveal-blur mobile-snap-card min-w-[84%] shrink-0 sm:col-span-5 sm:min-w-0 lg:col-span-5"
                    >
                      <div className="flex h-full flex-col overflow-hidden">
                        <div className="relative overflow-hidden rounded-[22px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={heroImage} alt="Sky page visual" className="mono-ui-media h-[190px] w-full object-cover sm:h-[230px]" />
                          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.88),rgba(0,0,0,0.2))]" />
                        </div>

                        {trimmedPoints.length > 0 ? (
                          <div className="mt-4 flex-1 rounded-[18px] border border-white/10 bg-black/35 p-4">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-white/56">{heroNote ?? "First contact flow"}</p>
                            <div className="mt-3 space-y-2.5">
                              {trimmedPoints.slice(0, 3).map((point) => (
                                <div
                                  key={point}
                                  className="rounded-2xl border border-white/12 bg-white/[0.03] px-3 py-3 text-sm leading-relaxed text-white/82"
                                >
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Container>
            )}

            {heroLayout === "minimal" && (
              <Container>
                <div className="relative z-10 pb-16 pt-16 sm:pb-24 sm:pt-28">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={m.t(0.04, 1)}
                    className="mx-auto max-w-3xl text-center"
                  >
                    <div className="text-xs uppercase tracking-[0.3em] text-white/56">{pageLabel}</div>
                    <h1 className="mt-6 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
                      {title}
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-white/78 sm:text-lg">{description}</p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                      <SkyButton href={primaryCta.href}>{primaryCta.label}</SkyButton>
                      {secondaryCta && (
                        <SkyButton href={secondaryCta.href} ghost>
                          {secondaryCta.label}
                        </SkyButton>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={m.t(0.12, 0.95)}
                    className="mobile-snap-row -mx-1 mt-8 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-auto sm:mt-12 sm:grid sm:max-w-5xl sm:grid-cols-12 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0"
                  >
                    <div className="sky-surface reveal-blur mobile-snap-card min-w-[90%] shrink-0 overflow-hidden rounded-[24px] p-4 sm:col-span-7 sm:min-w-0 sm:rounded-[28px] sm:p-6 lg:col-span-8">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/54">{heroNote ?? tonePanelLabel}</div>
                      {trimmedPoints.length > 0 && (
                        <div className="mt-4 space-y-2.5">
                          {trimmedPoints.slice(0, 3).map((point) => (
                            <div key={point} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/78">
                              {point}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-5 overflow-hidden rounded-[18px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={heroImage} alt="Sky page visual" className="mono-ui-media h-28 w-full object-cover opacity-72 sm:h-32" />
                      </div>
                    </div>

                    {trimmedStats.length > 0 && (
                      <div className="mobile-snap-card min-w-[82%] shrink-0 sm:col-span-5 sm:min-w-0 sm:grid sm:gap-3 lg:col-span-4">
                        {trimmedStats.map((stat) => (
                          <div key={stat.label} className="sky-surface-soft mb-2 rounded-2xl px-4 py-4 last:mb-0 sm:mb-0">
                            <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/58">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </Container>
            )}

            {heroLayout === "split" && (
              <Container>
                <div className="relative z-10 grid grid-cols-6 items-end gap-3 pb-10 pt-8 sm:grid-cols-12 sm:gap-10 sm:pb-14 sm:pt-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={m.t(0.04, 1)}
                    className="col-span-6 lg:col-span-7"
                  >
                    <div className="text-xs uppercase tracking-[0.28em] text-white/60">{pageLabel}</div>
                    <h1 className="mt-4 text-balance text-[clamp(2rem,10.2vw,4.9rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:mt-6 sm:text-7xl lg:text-8xl">
                      {title}
                    </h1>
                    <p className="mt-4 max-w-xl text-pretty text-sm text-white sm:mt-5 sm:text-lg">{description}</p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <SkyButton href={primaryCta.href}>{primaryCta.label}</SkyButton>
                      {secondaryCta && (
                        <SkyButton href={secondaryCta.href} ghost>
                          {secondaryCta.label}
                        </SkyButton>
                      )}
                    </div>

                    {trimmedStats.length > 0 && (
                      <div className="mobile-snap-row -mx-1 mt-7 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
                        {trimmedStats.map((stat) => (
                          <div
                            key={`${stat.value}-${stat.label}`}
                            className="mobile-snap-card min-w-[78%] shrink-0 rounded-2xl border border-white/12 bg-white/[0.035] px-4 py-3 sm:min-w-0"
                          >
                            <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/58">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={m.t(0.12, 1)}
                    className="reveal-blur col-span-6 lg:col-span-5"
                  >
                    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px]">
                      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={heroImage} alt="Sky page visual" className="mono-ui-media h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82),rgba(0,0,0,0.08))]" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Container>
            )}
          </section>

          {children}
        </main>

        <footer className="relative mt-10">
          <Container>
            <div className="relative flex flex-col items-center justify-center gap-4 border-t border-white/10 py-14 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-white/65">{shared.footer.kicker}</p>
              <Link href="/" className="relative h-14 w-[220px] opacity-95 transition hover:opacity-100">
                <Image src="/sky/logo.png" alt="sky.ro" fill className="object-contain" sizes="220px" />
              </Link>
              <p className="text-[11px] tracking-[0.16em] text-white/35">{shared.footer.copyright}</p>
            </div>
          </Container>
        </footer>
      </div>
    </div>
  );
}

