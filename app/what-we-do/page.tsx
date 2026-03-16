"use client";

import { motion } from "framer-motion";
import CardSwap, { Card } from "@/components/card-swap";
import siteText from "@/content/site-text.json";
import SkyPageShell, {
  Container,
  SectionIntro,
  SkyButton,
  useMotionPreset,
} from "@/components/sky-page-shell";

const whatWeDoText = siteText.whatWeDo;
const serviceColumns = whatWeDoText.serviceColumns;
const deliveryLayers = whatWeDoText.deliveryArchitecture.layers;

export default function WhatWeDoPage() {
  const m = useMotionPreset();

  return (
    <SkyPageShell
      pageLabel={whatWeDoText.hero.pageLabel}
      title={whatWeDoText.hero.title}
      description={whatWeDoText.hero.description}
      primaryCta={{ href: "/contact", label: whatWeDoText.hero.primaryCta }}
      secondaryCta={{ href: "/work", label: whatWeDoText.hero.secondaryCta }}
      heroImage="/IMG_2427.jpg"
      heroLayout="minimal"
      heroTone="capabilities"
      heroBadge={whatWeDoText.hero.heroBadge}
      heroStats={whatWeDoText.hero.heroStats}
      heroPoints={whatWeDoText.hero.heroPoints}
      heroNote={whatWeDoText.hero.heroNote}
      raysOrigin="top-right"
    >
      <section className="section-divider relative py-12 sm:py-18">
        <Container>
          <SectionIntro
            eyebrow={whatWeDoText.capabilities.eyebrow}
            title={whatWeDoText.capabilities.title}
            description={whatWeDoText.capabilities.description}
          />

          <div className="mobile-snap-row -mx-1 mt-6 flex gap-2.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:mt-8 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
            {serviceColumns.map((service, i) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={m.t(i * 0.06, 0.78)}
                className="sky-surface-soft reveal-blur mobile-snap-card min-w-[80%] shrink-0 rounded-[20px] p-4 lg:min-w-0 lg:rounded-[24px] lg:p-6"
              >
                <h3 className="text-xl font-semibold tracking-tight text-white lg:text-2xl">{service.title}</h3>
                <ul className="mt-3 space-y-2 text-[13px] text-white/72 lg:mt-4 lg:space-y-2.5 lg:text-sm">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>

          <div className="mobile-snap-row -mx-1 mt-5 flex gap-2.5 overflow-x-auto px-1 pb-1 md:mx-0 md:mt-6 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
            {whatWeDoText.statsCards.map((card, index) => (
              <article
                key={card.label}
                className={[
                  "sky-surface-soft mobile-snap-card min-w-[80%] shrink-0 rounded-xl p-3.5 md:min-w-0 md:rounded-2xl md:p-4",
                  index === 2 ? "md:col-span-1" : "",
                ].join(" ")}
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 md:text-[11px] md:tracking-[0.2em]">{card.text}</p>
                <p className="mt-1.5 text-xl font-semibold tracking-tight text-white md:mt-2 md:text-2xl">{card.label}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-divider relative py-7 sm:py-14">
        <Container>
          <div className="mobile-snap-row reveal-blur -mx-1 mt-6 flex gap-3 overflow-x-auto px-1 pb-1 sm:mt-10 sm:grid sm:grid-cols-12 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:items-end">
            <div className="mobile-snap-card min-w-[86%] shrink-0 sm:col-span-5 sm:min-w-0 lg:col-span-5">
              <div className="rounded-xl bg-black/45 p-4 backdrop-blur-xl sm:rounded-2xl sm:p-6">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 sm:text-[11px] sm:tracking-[0.24em]">{whatWeDoText.deliveryArchitecture.eyebrow}</div>
                <h4 className="mt-2.5 text-xl font-semibold tracking-tight text-white sm:mt-3 sm:text-3xl">{whatWeDoText.deliveryArchitecture.title}</h4>
                <p className="mt-3 text-[11px] leading-relaxed text-white/72 sm:mt-4 sm:text-sm">
                  {whatWeDoText.deliveryArchitecture.body}
                </p>
              </div>
            </div>

            <div className="mobile-snap-card min-w-[90%] shrink-0 sm:col-span-7 sm:min-w-0 lg:col-span-7">
              <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:hidden">
                {deliveryLayers.map((layer) => (
                  <article
                    key={`mobile-${layer.id}`}
                    className="mobile-snap-card min-w-[84%] shrink-0 rounded-[18px] border border-white/12 bg-black/42 p-4"
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                      {layer.id} / {whatWeDoText.deliveryArchitecture.layerLabel}
                    </div>
                    <h4 className="mt-2.5 text-xl font-semibold tracking-tight text-white">{layer.title}</h4>
                    <p className="mt-2.5 text-[13px] text-white/74">{layer.body}</p>
                  </article>
                ))}
              </div>

              <div className="relative hidden h-[500px] overflow-hidden sm:block">
                <CardSwap
                  cardDistance={44}
                  verticalDistance={54}
                  delay={5000}
                  pauseOnHover={false}
                  containerWidth={420}
                  containerHeight={500}
                  width={350}
                  height={248}
                  easing="elastic"
                  anchorX="70%"
                  anchorY="80%"
                  baseYOffset={68}
                >
                  {deliveryLayers.map((layer) => (
                    <Card key={layer.id} className="p-6 sm:p-10">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/55">
                        {layer.id} / {whatWeDoText.deliveryArchitecture.layerLabel}
                      </div>
                      <h4 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl">{layer.title}</h4>
                      <p className="mt-3 max-w-[36ch] text-sm text-white/70 sm:mt-4 sm:text-base">{layer.body}</p>
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-divider relative py-8 sm:py-16">
        <Container>
          <SectionIntro
            eyebrow={whatWeDoText.engagement.eyebrow}
            title={whatWeDoText.engagement.title}
            description={whatWeDoText.engagement.description}
            center
          />

          <div className="mobile-snap-row -mx-1 mt-6 flex gap-3 overflow-x-auto px-1 pb-1 md:mx-0 md:mt-8 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.03, 0.75)}
              className="sky-surface-soft reveal-blur mobile-snap-card min-w-[84%] shrink-0 rounded-[22px] p-4 sm:min-w-0 sm:rounded-[26px] sm:p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/55 sm:text-xs sm:tracking-[0.24em]">{whatWeDoText.engagement.projectMode.label}</p>
              <h4 className="mt-2.5 text-2xl font-semibold tracking-tight text-white sm:mt-3 sm:text-3xl">{whatWeDoText.engagement.projectMode.title}</h4>
              <p className="mt-3 text-[13px] text-white/72 sm:mt-4 sm:text-sm">{whatWeDoText.engagement.projectMode.body}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.08, 0.75)}
              className="sky-surface-soft reveal-blur mobile-snap-card min-w-[84%] shrink-0 rounded-[22px] p-4 sm:min-w-0 sm:rounded-[26px] sm:p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/55 sm:text-xs sm:tracking-[0.24em]">{whatWeDoText.engagement.partnershipMode.label}</p>
              <h4 className="mt-2.5 text-2xl font-semibold tracking-tight text-white sm:mt-3 sm:text-3xl">{whatWeDoText.engagement.partnershipMode.title}</h4>
              <p className="mt-3 text-[13px] text-white/72 sm:mt-4 sm:text-sm">{whatWeDoText.engagement.partnershipMode.body}</p>
            </motion.div>
          </div>

          <div className="mt-6 flex justify-center sm:mt-8">
            <SkyButton href="/contact">{whatWeDoText.engagement.cta}</SkyButton>
          </div>
        </Container>
      </section>
    </SkyPageShell>
  );
}

