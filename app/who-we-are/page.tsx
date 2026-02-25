"use client";

import { motion } from "framer-motion";
import siteText from "@/content/site-text.json";
import SkyPageShell, {
  Container,
  SectionIntro,
  SkyButton,
  useMotionPreset,
} from "@/components/sky-page-shell";

const whoText = siteText.whoWeAre;
const principles = whoText.principles;
const crewFlow = whoText.operations.flow;
const teamShape = whoText.operations.teamShape;
const proof = whoText.proof;

export default function WhoWeArePage() {
  const m = useMotionPreset();

  return (
    <SkyPageShell
      pageLabel={whoText.hero.pageLabel}
      title={whoText.hero.title}
      description={whoText.hero.description}
      primaryCta={{ href: "/contact", label: whoText.hero.primaryCta }}
      secondaryCta={{ href: "/what-we-do", label: whoText.hero.secondaryCta }}
      heroImage="/IMG_2426.jpg"
      heroLayout="editorial"
      heroTone="identity"
      heroBadge={whoText.hero.heroBadge}
      heroStats={whoText.hero.heroStats}
      heroPoints={whoText.hero.heroPoints}
      heroNote={whoText.hero.heroNote}
      raysOrigin="top-left"
    >
      <section id="identity" className="section-divider relative py-14 sm:py-18">
        <Container>
          <SectionIntro
            eyebrow={whoText.identity.eyebrow}
            title={whoText.identity.title}
            description={whoText.identity.description}
          />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {principles.map((item, i) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={m.t(i * 0.05, 0.78)}
                className="sky-surface-soft reveal-blur rounded-[24px] p-4 sm:p-6"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">0{i + 1}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:mt-3 sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70 sm:mt-3 sm:text-sm">{item.body}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/60 sm:mt-6 sm:text-xs">{item.stat}</p>
              </motion.article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-divider relative py-10 sm:py-14">
        <Container>
          <div className="grid grid-cols-12 gap-4 sm:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.02, 0.8)}
              className="sky-surface reveal-blur col-span-7 overflow-hidden rounded-[24px] p-5 sm:rounded-[28px] sm:p-8 lg:col-span-7"
            >
              <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
                {whoText.operations.teamShapeTitle}
              </h3>

              <div className="mt-7 space-y-4">
                {teamShape.map((member, i) => (
                  <div key={member.role} className="sky-surface-soft rounded-2xl p-3.5 sm:p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/52">
                      0{i + 1} | {member.role}
                    </div>
                    <p className="mt-2 text-sm text-white/72">{member.focus}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.08, 0.8)}
              className="sky-surface reveal-blur relative col-span-5 overflow-hidden rounded-[24px] p-4 sm:rounded-[28px] sm:p-8 lg:col-span-5"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(62%_70%_at_80%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.26em] text-white/55">{whoText.operations.howWeWorkLabel}</p>
                <h4 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{whoText.operations.howWeWorkTitle}</h4>
                <p className="mt-3 text-xs leading-relaxed text-white/72 sm:mt-4 sm:text-sm">{whoText.operations.howWeWorkBody}</p>
                <div className="mt-7 grid gap-2.5">
                  {crewFlow.map((step, i) => (
                    <div key={step.label} className="rounded-2xl border border-white/14 bg-white/[0.03] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/52">
                        0{i + 1} | {step.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">{step.copy}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-7">
                  <SkyButton href="/work">{whoText.operations.cta}</SkyButton>
                </div>
              </div>
            </motion.aside>
          </div>
        </Container>
      </section>

      <section className="section-divider relative py-10 sm:py-16">
        <Container>
          <SectionIntro
            eyebrow={proof.eyebrow}
            title={proof.title}
            description={proof.description}
            center
          />

          <div className="reveal-blur mx-auto mt-8 grid max-w-5xl grid-cols-12 gap-3 sm:gap-4">
            <article className="sky-surface-soft col-span-7 rounded-[24px] p-4 sm:rounded-[26px] sm:p-6 lg:col-span-8">
              <p className="text-sm leading-relaxed text-white/78">“{proof.quote}”</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-white/56">{proof.author}</p>
            </article>
            <div className="col-span-5 grid gap-3 lg:col-span-4">
              {proof.stats.map((item) => (
                <div key={item} className="sky-surface-soft rounded-2xl px-3 py-3 text-xs text-white/78 sm:px-4 sm:py-4 sm:text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </SkyPageShell>
  );
}

