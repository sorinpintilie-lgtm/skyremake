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
      <section className="section-divider relative py-14 sm:py-18">
        <Container>
          <SectionIntro
            eyebrow={whatWeDoText.capabilities.eyebrow}
            title={whatWeDoText.capabilities.title}
            description={whatWeDoText.capabilities.description}
          />

          <div className="mobile-snap-row -mx-1 mt-8 flex gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
            {serviceColumns.map((service, i) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={m.t(i * 0.06, 0.78)}
                className="sky-surface-soft reveal-blur mobile-snap-card min-w-[84%] shrink-0 rounded-[24px] p-5 lg:min-w-0 lg:p-6"
              >
                <h3 className="text-2xl font-semibold tracking-tight text-white">{service.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-white/72">
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

          <div className="mobile-snap-row -mx-1 mt-6 flex gap-3 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
            {whatWeDoText.statsCards.map((card, index) => (
              <article
                key={card.label}
                className={[
                  "sky-surface-soft mobile-snap-card min-w-[84%] shrink-0 rounded-2xl p-4 md:min-w-0",
                  index === 2 ? "md:col-span-1" : "",
                ].join(" ")}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">{card.text}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{card.label}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-divider relative py-8 sm:py-14">
        <Container>
          <div className="mobile-snap-row reveal-blur -mx-1 mt-8 flex gap-4 overflow-x-auto px-1 pb-1 sm:mt-10 sm:grid sm:grid-cols-12 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:items-end">
            <div className="mobile-snap-card min-w-[90%] shrink-0 sm:col-span-5 sm:min-w-0 lg:col-span-5">
              <div className="rounded-2xl bg-black/45 p-6 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/55">{whatWeDoText.deliveryArchitecture.eyebrow}</div>
                <h4 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{whatWeDoText.deliveryArchitecture.title}</h4>
                <p className="mt-4 text-xs leading-relaxed text-white/72 sm:text-sm">
                  {whatWeDoText.deliveryArchitecture.body}
                </p>
              </div>
            </div>

            <div className="mobile-snap-card min-w-[94%] shrink-0 sm:col-span-7 sm:min-w-0 lg:col-span-7">
              <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:hidden">
                {deliveryLayers.map((layer) => (
                  <article
                    key={`mobile-${layer.id}`}
                    className="mobile-snap-card min-w-[88%] shrink-0 rounded-[22px] border border-white/12 bg-black/42 p-5"
                  >
                    <div className="text-xs uppercase tracking-[0.24em] text-white/55">
                      {layer.id} / {whatWeDoText.deliveryArchitecture.layerLabel}
                    </div>
                    <h4 className="mt-3 text-2xl font-semibold tracking-tight text-white">{layer.title}</h4>
                    <p className="mt-3 text-sm text-white/74">{layer.body}</p>
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

      <section className="section-divider relative py-10 sm:py-16">
        <Container>
          <SectionIntro
            eyebrow={whatWeDoText.engagement.eyebrow}
            title={whatWeDoText.engagement.title}
            description={whatWeDoText.engagement.description}
            center
          />

          <div className="mobile-snap-row -mx-1 mt-8 flex gap-4 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.03, 0.75)}
              className="sky-surface-soft reveal-blur mobile-snap-card min-w-[88%] shrink-0 rounded-[26px] p-6 sm:min-w-0 sm:p-8"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">{whatWeDoText.engagement.projectMode.label}</p>
              <h4 className="mt-3 text-3xl font-semibold tracking-tight text-white">{whatWeDoText.engagement.projectMode.title}</h4>
              <p className="mt-4 text-sm text-white/72">{whatWeDoText.engagement.projectMode.body}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.08, 0.75)}
              className="sky-surface-soft reveal-blur mobile-snap-card min-w-[88%] shrink-0 rounded-[26px] p-6 sm:min-w-0 sm:p-8"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">{whatWeDoText.engagement.partnershipMode.label}</p>
              <h4 className="mt-3 text-3xl font-semibold tracking-tight text-white">{whatWeDoText.engagement.partnershipMode.title}</h4>
              <p className="mt-4 text-sm text-white/72">{whatWeDoText.engagement.partnershipMode.body}</p>
            </motion.div>
          </div>

          <div className="mt-8 flex justify-center">
            <SkyButton href="/contact">{whatWeDoText.engagement.cta}</SkyButton>
          </div>
        </Container>
      </section>
    </SkyPageShell>
  );
}

