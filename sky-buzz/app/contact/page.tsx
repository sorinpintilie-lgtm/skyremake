"use client";

import { motion } from "framer-motion";
import React from "react";
import siteText from "@/content/site-text.json";
import SkyPageShell, {
  Container,
  SectionIntro,
  SkyButton,
  useMotionPreset,
} from "@/components/sky-page-shell";

const contactText = siteText.contact;
const contactChannels = contactText.contactChannels;
const processSteps = contactText.brief.steps;

export default function ContactPage() {
  const m = useMotionPreset();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [brief, setBrief] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !brief.trim()) return;

    const subject = encodeURIComponent(`Project inquiry | ${name.trim() || "New brief"}`);
    const body = encodeURIComponent(
      `Name: ${name.trim() || "Not provided"}\nEmail: ${email.trim()}\n\nBrief:\n${brief.trim()}\n\nI would like to discuss this project with the Sky team.`,
    );

    window.location.href = `mailto:hello@sky.ro?subject=${subject}&body=${body}`;
  };

  return (
    <SkyPageShell
      pageLabel={contactText.hero.pageLabel}
      title={contactText.hero.title}
      description={contactText.hero.description}
      primaryCta={{ href: "mailto:hello@sky.ro", label: contactText.hero.primaryCta }}
      secondaryCta={{ href: "/who-we-are", label: contactText.hero.secondaryCta }}
      heroImage="/IMG_2424.jpg"
      heroLayout="concierge"
      heroTone="contact"
      heroBadge={contactText.hero.heroBadge}
      heroStats={contactText.hero.heroStats}
      heroPoints={contactText.hero.heroPoints}
      heroNote={contactText.hero.heroNote}
      raysOrigin="bottom-center"
    >
      <section className="section-divider relative py-14 sm:py-18">
        <Container>
          <SectionIntro
            eyebrow={contactText.directChannels.eyebrow}
            title={contactText.directChannels.title}
            description={contactText.directChannels.description}
          />

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={m.t(0.04, 0.78)}
            className="sky-surface reveal-blur mt-8 grid grid-cols-2 gap-2.5 rounded-[20px] p-3 sm:grid-cols-12 sm:gap-3 sm:rounded-[24px] sm:p-5"
          >
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={contactText.form.namePlaceholder}
              className="h-11 rounded-full border border-white/18 bg-black/38 px-4 text-sm text-white placeholder:text-white/48 focus:border-white/30 focus:outline-none sm:col-span-3"
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={contactText.form.emailPlaceholder}
              className="h-11 rounded-full border border-white/18 bg-black/38 px-4 text-sm text-white placeholder:text-white/48 focus:border-white/30 focus:outline-none sm:col-span-3"
            />
            <input
              type="text"
              name="brief"
              required
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder={contactText.form.briefPlaceholder}
              className="col-span-2 h-11 rounded-full border border-white/18 bg-black/38 px-4 text-sm text-white placeholder:text-white/48 focus:border-white/30 focus:outline-none sm:col-span-4"
            />
            <button
              type="submit"
              className="col-span-2 inline-flex h-11 items-center justify-center rounded-full border border-white/18 bg-white/[0.08] px-5 text-sm font-medium text-white transition hover:border-white/28 hover:bg-white/[0.15] sm:col-span-2"
            >
              {contactText.form.submitLabel}
            </button>
          </motion.form>

          <div className="mobile-snap-row -mx-1 mt-8 flex gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
            {contactChannels.map((channel, i) => (
              <motion.a
                key={channel.title}
                href={channel.href}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={m.t(i * 0.06, 0.78)}
                className="sky-surface-soft reveal-blur mobile-snap-card group min-w-[84%] shrink-0 rounded-[24px] p-5 transition hover:bg-white/[0.06] lg:min-w-0 lg:p-6"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">{channel.title}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white group-hover:text-white">{channel.value}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/72">{channel.detail}</p>
              </motion.a>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-divider relative py-8 sm:py-14">
        <Container>
          <div className="mobile-snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-12 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.04, 0.8)}
              className="sky-surface reveal-blur mobile-snap-card min-w-[92%] shrink-0 flex h-full flex-col overflow-hidden rounded-[24px] p-5 sm:col-span-7 sm:min-w-0 sm:rounded-[28px] sm:p-8 lg:col-span-7"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-5xl">
                {contactText.brief.title}
              </h3>
              <p className="mt-4 max-w-[58ch] text-xs leading-relaxed text-white/72 sm:text-sm">
                {contactText.brief.body}
              </p>
              <div className="mt-7 space-y-3.5">
                {processSteps.map((step, i) => (
                    <div key={step} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-3 sm:px-4">
                      <div className="flex items-start gap-3">
                        <span className="pt-0.5 text-[11px] uppercase tracking-[0.2em] text-white/50">0{i + 1}</span>
                        <p className="text-xs leading-relaxed text-white/75 sm:text-sm">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={m.t(0.1, 0.8)}
              className="sky-surface reveal-blur mobile-snap-card min-w-[84%] shrink-0 flex h-full flex-col overflow-hidden rounded-[24px] p-4 sm:col-span-5 sm:min-w-0 sm:rounded-[28px] sm:p-8 lg:col-span-5"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">{contactText.response.label}</p>
              <div className="mt-7 flex flex-1 flex-col gap-3.5">
                <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">{contactText.response.label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-white">{contactText.response.value}</p>
                  <p className="mt-1 text-sm text-white/72">{contactText.response.body}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Direct email</p>
                  <a href="mailto:hello@sky.ro" className="mt-1 block text-sm font-medium text-white/86 transition hover:text-white">
                    {contactText.response.directEmail}
                  </a>
                </div>
                <div className="mt-auto rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <SkyButton href="/what-we-do" ghost>
                    {contactText.cta}
                  </SkyButton>
                </div>
              </div>
            </motion.aside>
          </div>
        </Container>
      </section>
    </SkyPageShell>
  );
}

