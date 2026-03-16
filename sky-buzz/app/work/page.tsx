"use client";

import { motion } from "framer-motion";
import snapshotManifest from "@/public/snapshots/index.json";
import InfiniteMenu from "@/components/infinite-menu";
import siteText from "@/content/site-text.json";
import SkyPageShell, {
  Container,
  SectionIntro,
  SkyButton,
  useMotionPreset,
} from "@/components/sky-page-shell";

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

const snapshotPathFromLink = (link: string, fallbackIndex = 1) => {
  const manifest = snapshotManifest as Record<string, string>;
  const path = manifest[link];
  if (path && path.startsWith("/")) return path;
  return localFallbackImages[fallbackIndex % localFallbackImages.length];
};

const workText = siteText.work;
const featuredWork = workText.featuredWork;
const outcomes = workText.outcomes.cases;

export default function WorkPage() {
  const m = useMotionPreset();

  return (
    <SkyPageShell
      pageLabel={workText.hero.pageLabel}
      title={workText.hero.title}
      description={workText.hero.description}
      primaryCta={{ href: "/contact", label: workText.hero.primaryCta }}
      secondaryCta={{ href: "/what-we-do", label: workText.hero.secondaryCta }}
      heroImage="/envato-labs-image-edit-7.png"
      heroLayout="immersive"
      heroTone="showcase"
      heroBadge={workText.hero.heroBadge}
      heroStats={workText.hero.heroStats}
      heroPoints={workText.hero.heroPoints}
      heroNote={workText.hero.heroNote}
      raysOrigin="top-center"
    >
      <section className="section-divider relative py-12 sm:py-18">
        <Container>
          <SectionIntro
            eyebrow={workText.showcase.eyebrow}
            title={workText.showcase.title}
            description={workText.showcase.description}
            center
          />

          <div className="reveal-blur relative mt-8 h-[420px] overflow-hidden rounded-[24px] sm:h-[560px] sm:rounded-[28px]">
            <InfiniteMenu
              items={featuredWork.map((item, index) => ({
                ...item,
                image: snapshotPathFromLink(item.link, index),
              }))}
              scale={0.74}
            />
          </div>
        </Container>
      </section>

      <section className="section-divider relative py-8 sm:py-14">
        <Container>
          <SectionIntro
            eyebrow={workText.outcomes.eyebrow}
            title={workText.outcomes.title}
            description={workText.outcomes.description}
          />

          <div className="mobile-snap-row -mx-1 mt-8 flex gap-4 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3">
            {outcomes.map((item, i) => (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={m.t(i * 0.06, 0.75)}
                className="sky-surface-soft reveal-blur mobile-snap-card min-w-[86%] shrink-0 rounded-[24px] p-5 md:min-w-0 md:p-6"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">{item.vertical}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{item.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/72">
                  <span className="text-white/86">{workText.outcomes.shippedLabel}:</span> {item.shipped}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/72">
                  <span className="text-white/86">{workText.outcomes.resultLabel}:</span> {item.result}
                </p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center text-sm font-medium text-[#9bc6ff] transition hover:text-[#c2ddff]"
                >
                  {workText.outcomes.linkLabel}
                </a>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={m.t(0.06, 0.75)}
            className="reveal-blur mt-8 rounded-[24px] border border-white/10 bg-black/34 p-5 sm:p-6"
          >
            <p className="text-sm leading-relaxed text-white/74">{workText.positioning.body}</p>
            <div className="mobile-snap-row -mx-1 mt-5 flex gap-3 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
              {workText.threeBlocks.map((block) => (
                <article
                  key={block.title}
                  className="mobile-snap-card min-w-[84%] shrink-0 rounded-2xl border border-white/12 bg-black/30 p-4 md:min-w-0"
                >
                  <h4 className="text-lg font-semibold tracking-tight text-white">{block.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/72">{block.body}</p>
                </article>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 flex justify-center">
            <SkyButton href="/contact">{workText.cta}</SkyButton>
          </div>
        </Container>
      </section>
    </SkyPageShell>
  );
}

