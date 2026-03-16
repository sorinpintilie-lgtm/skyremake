'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Check, CircleDot, Gauge, Layers3,
  MousePointerClick, Phone, Send, Sparkles,
} from "lucide-react";

/**
 * SKY.RO — immersive lead landing page
 * Location: app/lead/page.tsx
 *
 * Install:
 * npm i three @react-three/fiber @react-three/drei framer-motion lucide-react
 */

type GoalId    = "leads" | "sales" | "brand" | "website" | "launch";
type StageId   = "zero" | "existing" | "rebuild" | "grow";
type ServiceId = "web" | "shop" | "ads" | "social" | "system";

type Goal    = { id: GoalId;    label: string; hint: string;  accent: string };
type Stage   = { id: StageId;  label: string };
type Service = { id: ServiceId; label: string; base: number; monthly?: boolean };

const goals: Goal[] = [
  { id: "leads",   label: "Mai multe cereri",  hint: "Mai mult contact, mai puțin trafic gol",   accent: "from-cyan-400/30 to-sky-500/30"      },
  { id: "sales",   label: "Mai multe vânzări", hint: "Structură clară pentru ofertă și conversie", accent: "from-violet-400/30 to-fuchsia-500/30" },
  { id: "brand",   label: "Imagine mai bună",  hint: "Prezență coerentă și memorabilă",           accent: "from-amber-300/30 to-orange-500/30"   },
  { id: "website", label: "Un site nou",        hint: "Rapid, clar, adaptat pentru mobil",         accent: "from-emerald-300/30 to-teal-500/30"   },
  { id: "launch",  label: "Totul cap-coadă",   hint: "Website, comunicare și promovare",          accent: "from-white/20 to-white/5"             },
];

const stages: Stage[] = [
  { id: "zero",     label: "Pornesc de la zero"       },
  { id: "existing", label: "Am deja ceva"             },
  { id: "rebuild",  label: "Vreau să refac"           },
  { id: "grow",     label: "Vreau să cresc mai repede"},
];

const services: Service[] = [
  { id: "web",    label: "Website",         base: 1400             },
  { id: "shop",   label: "Magazin online",  base: 2500             },
  { id: "ads",    label: "Reclame",         base: 550,  monthly: true },
  { id: "social", label: "Social media",   base: 450,  monthly: true },
  { id: "system", label: "Sistem complet",  base: 1800             },
];

const levelNames = ["Start", "Solid", "Avansat", "Complet"] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function currency(value: number, monthly?: boolean) {
  return (
    new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value) + (monthly ? "/lună" : "")
  );
}

function getRecommendation(
  goal: GoalId, stage: StageId, service: ServiceId, budget: number
) {
  const selectedService = services.find((s) => s.id === service)!;
  const intensity   = clamp(Math.round((budget / 5000) * 3), 0, 3);
  const level       = levelNames[intensity];

  const includeWebsite = ["web","shop","system"].includes(service) || goal === "website";
  const includeAds     = ["ads","system"].includes(service)        || ["leads","sales"].includes(goal);
  const includeSocial  = ["social","system"].includes(service)     || ["brand","launch"].includes(goal);

  const modules = [
    includeWebsite ? "Structură de pagină clară"           : null,
    includeWebsite ? "Mesaj și ofertă ordonate"             : null,
    includeWebsite ? "Experiență bună pe mobil"             : null,
    includeAds     ? "Setup campanii și traseu de conversie": null,
    includeAds     ? "Landing orientat pe contact"          : null,
    includeSocial  ? "Direcție vizuală și conținut"         : null,
    includeSocial  ? "Mesaj coerent în social media"        : null,
    stage === "zero"    ? "Pornire rapidă, fără blocaje inutile"    : null,
    stage === "rebuild" ? "Refacere de structură și claritate"      : null,
    stage === "grow"    ? "Optimizare pentru ritm de creștere"      : null,
  ].filter(Boolean) as string[];

  const titleMap: Record<GoalId, string> = {
    leads:   "Sistem pentru mai multe cereri",
    sales:   "Sistem pentru conversii mai bune",
    brand:   "Sistem pentru imagine coerentă",
    website: "Sistem pentru un website nou",
    launch:  "Sistem digital cap-coadă",
  };

  const fitMap: Record<StageId, string> = {
    zero:     "Potrivit pentru business-uri care pornesc și au nevoie de claritate rapidă.",
    existing: "Potrivit pentru afaceri care au deja prezență online, dar vor o structură mai bună.",
    rebuild:  "Potrivit pentru proiecte care au nevoie de refacere și repoziționare clară.",
    grow:     "Potrivit pentru business-uri care vor să crească mai ordonat și mai eficient.",
  };

  const timeline   = budget < 1200 ? "Lansare rapidă" : budget < 2500 ? "Lansare în ritm clar" : "Setup extins și scalabil";
  const complexity = budget < 1000 ? "Esențial"       : budget < 2200 ? "Solid"                : budget < 3500 ? "Avansat" : "Complet";

  return {
    title:       titleMap[goal],
    fit:         fitMap[stage],
    budgetLabel: currency(budget, selectedService.monthly),
    complexity,
    level,
    timeline,
    modules:     modules.slice(0, 6),
  };
}

function defaultBudgetFor(service: ServiceId) {
  const base = services.find((s) => s.id === service)?.base ?? 1500;
  return clamp(base, 350, 5000);
}

// ─── 3-D SCENE (moved into its own component so it lives inside <Canvas>) ────

const PALETTE = ["#67e8f9", "#a78bfa", "#f59e0b", "#34d399", "#ffffff"];

function BackgroundScene({ accentIndex }: { accentIndex: number }) {
  const groupRef  = useRef<THREE.Group>(null!);
  const ringsRef  = useRef<THREE.Mesh[]>([]);
  const activeCol = new THREE.Color(PALETTE[accentIndex] ?? PALETTE[0]);

  // Build geometry once
  const { coreGeo, coreMat, ringGeos, ringMat, particleGeo, particleMat } = useMemo(() => {
    const cg = new THREE.IcosahedronGeometry(1.12, 1);
    const cm = new THREE.MeshPhysicalMaterial({
      color:              activeCol,
      roughness:          0.16,
      metalness:          0.12,
      transmission:       0.55,
      transparent:        true,
      opacity:            0.92,
      thickness:          1.1,
      clearcoat:          1,
      clearcoatRoughness: 0.08,
    });

    const rg = [1.8, 2.55, 3.3].map((r) => new THREE.TorusGeometry(r, 0.022, 16, 140));
    const rm = new THREE.MeshBasicMaterial({ color: activeCol, transparent: true, opacity: 0.28 });

    // Particles
    const count    = 280;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 4 + Math.random() * 3.5;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pm = new THREE.PointsMaterial({ color: activeCol, size: 0.045, transparent: true, opacity: 0.55 });

    return { coreGeo: cg, coreMat: cm, ringGeos: rg, ringMat: rm, particleGeo: pg, particleMat: pm };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accentIndex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.11) * 0.22;
    }
    ringsRef.current.forEach((ring, i) => {
      if (ring) ring.rotation.z = t * (0.08 + i * 0.04);
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.7} />
      <directionalLight color={activeCol} intensity={1.2} position={[4, 4, 5]} />
      <pointLight color={activeCol} intensity={1.1} distance={20} position={[-4, -2, 4]} />

      {/* core icosahedron */}
      <mesh geometry={coreGeo} material={coreMat} />

      {/* rings */}
      {ringGeos.map((geo, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
          geometry={geo}
          material={ringMat}
          rotation={[Math.PI / (2.8 + i * 0.6), i * 0.5, i * 1.1]}
        />
      ))}

      {/* particles */}
      <points geometry={particleGeo} material={particleMat} />
    </group>
  );
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

function OptionPill({
  active, label, hint, onClick,
}: {
  active: boolean; label: string; hint?: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300",
        active
          ? "border-white/30 bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(0,0,0,0.28)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          {hint && <div className="mt-1 text-xs leading-relaxed text-white/55">{hint}</div>}
        </div>
        <CircleDot
          className={[
            "h-4 w-4 shrink-0",
            active ? "text-cyan-300" : "text-white/25 group-hover:text-white/45",
          ].join(" ")}
        />
      </div>
    </button>
  );
}

function RangeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = ((value - 350) / (5000 - 350)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/40">
        <span>Buget orientativ</span>
        <span>{currency(value)}</span>
      </div>
      <div className="relative h-14 rounded-full border border-white/10 bg-white/[0.03] px-5">
        <div className="absolute inset-y-0 left-5 right-5 flex items-center">
          <div className="h-[2px] w-full bg-white/10">
            <div
              className="h-[2px] rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <input
          aria-label="Buget orientativ"
          type="range"
          min={350}
          max={5000}
          step={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-5 text-[11px] text-white/25">
          <span>350€</span>
          <span>5000€+</span>
        </div>
      </div>
    </div>
  );
}

async function submitLead(payload: Record<string, string | number>) {
  console.log("Lead ready to send", payload);
  return new Promise((resolve) => setTimeout(resolve, 900));
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function SkyLeadPage() {
  const [goal,    setGoal]    = useState<GoalId>("leads");
  const [stage,   setStage]   = useState<StageId>("existing");
  const [service, setService] = useState<ServiceId>("system");
  const [budget,  setBudget]  = useState<number>(defaultBudgetFor("system"));
  const [name,    setName]    = useState("");
  const [company, setCompany] = useState("");
  const [phone,   setPhone]   = useState("");
  const [email,   setEmail]   = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  useEffect(() => { setBudget(defaultBudgetFor(service)); }, [service]);

  const recommendation  = useMemo(
    () => getRecommendation(goal, stage, service, budget),
    [goal, stage, service, budget]
  );
  const activeGoalIndex = goals.findIndex((g) => g.id === goal);
  const activeService   = services.find((s) => s.id === service)!;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await submitLead({ name, company, phone, email, goal, stage, service, budget, recommendation: recommendation.title });
    setSending(false);
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#060816] text-white">
      {/* ambient gradients */}
      <div className="pointer-events-none fixed inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(80,160,255,0.15),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_20%,transparent_80%,rgba(255,255,255,0.02))]" />
      </div>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-10 px-6 pb-10 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-8 lg:pt-8 xl:px-14">

          {/* ── LEFT COLUMN ── */}
          <div className="relative z-10 flex min-h-[58vh] flex-col justify-between gap-8 lg:min-h-[calc(100vh-4rem)]">
            <header className="flex items-center justify-between">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>SKY.RO / direcție clară pentru creștere</span>
              </div>
              <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/55 backdrop-blur-xl md:block">
                experiență interactivă pentru lead-uri
              </div>
            </header>

            <div className="max-w-[780px]">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.26em] text-white/45 backdrop-blur-lg"
              >
                <Layers3 className="h-3.5 w-3.5" />
                configurator imersiv
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-[12ch] text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.95] tracking-[-0.06em]"
              >
                Prezență online care face oamenii să acționeze.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 max-w-[60ch] text-base leading-7 text-white/62 md:text-lg"
              >
                Alegi obiectivul, etapa și nivelul de investiție. În câteva secunde vezi direcția
                potrivită, iar noi primim exact contextul de care avem nevoie ca să răspundem clar.
              </motion.p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {([
                ["Clar",         "fără formulare lungi"],
                ["Rapid",        "gândit pentru trafic din ads"],
                ["Profesional",  "ușor de înțeles pentru orice client"],
              ] as const).map(([title, text]) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
                >
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">{title}</div>
                  <div className="mt-2 text-sm text-white/70">{text}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="relative z-10 flex min-h-[720px] items-stretch lg:min-h-[calc(100vh-4rem)]">
            <div className="grid w-full grid-rows-[360px_auto] gap-5 xl:grid-rows-[400px_auto]">

              {/* 3-D canvas card */}
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#090d1f]/90 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_30%)]" />
                <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.6]} style={{ width: "100%", height: "100%" }}>
                  <Suspense fallback={null}>
                    <BackgroundScene accentIndex={activeGoalIndex} />
                  </Suspense>
                </Canvas>
                <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">Configurație live</div>
                    <div className="mt-1 text-sm text-white/80">{recommendation.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">Investiție</div>
                    <div className="mt-1 text-sm text-cyan-300">{recommendation.budgetLabel}</div>
                  </div>
                </div>
              </div>

              {/* configurator + recommendation */}
              <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">

                {/* configurator */}
                <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-white/38">1. Ce vrei să obții?</div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {goals.map((item) => (
                          <OptionPill key={item.id} active={goal === item.id} label={item.label} hint={item.hint} onClick={() => setGoal(item.id)} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-white/38">2. Unde ești acum?</div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {stages.map((item) => (
                          <OptionPill key={item.id} active={stage === item.id} label={item.label} onClick={() => setStage(item.id)} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-white/38">3. Ce tip de sistem vrei?</div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {services.map((item) => (
                          <OptionPill
                            key={item.id}
                            active={service === item.id}
                            label={item.label}
                            hint={item.monthly ? "investiție lunară" : "investiție de proiect"}
                            onClick={() => setService(item.id)}
                          />
                        ))}
                      </div>
                    </div>

                    <RangeSlider value={budget} onChange={setBudget} />
                  </div>
                </div>

                {/* recommendation + form */}
                <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:p-6">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-white/38">Recomandare live</div>
                        <AnimatePresence mode="wait">
                          <motion.h2
                            key={recommendation.title}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.28 }}
                            className="mt-2 text-2xl font-medium leading-tight tracking-[-0.03em]"
                          >
                            {recommendation.title}
                          </motion.h2>
                        </AnimatePresence>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">nivel</div>
                        <div className="mt-1 text-sm text-cyan-300">{recommendation.level}</div>
                      </div>
                    </div>

                    <p className="mt-4 max-w-[42ch] text-sm leading-6 text-white/65">{recommendation.fit}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {([
                        [Gauge,             "Investiție",  recommendation.budgetLabel],
                        [MousePointerClick, "Complexitate",recommendation.complexity],
                        [Sparkles,          "Ritm",        recommendation.timeline],
                      ] as [React.ElementType, string, string][]).map(([Icon, title, value]) => (
                        <div key={title} className="rounded-2xl border border-white/10 bg-black/15 p-3">
                          <Icon className="h-4 w-4 text-cyan-300" />
                          <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/35">{title}</div>
                          <div className="mt-1 text-sm text-white/84">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-black/15 p-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Ce include</div>
                      <div className="mt-4 grid gap-3">
                        {recommendation.modules.map((item) => (
                          <div key={item} className="flex items-start gap-3 text-sm text-white/76">
                            <div className="mt-0.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 p-1 text-cyan-300">
                              <Check className="h-3 w-3" />
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={onSubmit} className="mt-5 space-y-3 border-t border-white/10 pt-5">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/38">Trimite contextul</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {([
                          { value: name,    set: setName,    placeholder: "Nume",           type: "text",  required: true  },
                          { value: company, set: setCompany, placeholder: "Afacere / brand",type: "text",  required: false },
                          { value: phone,   set: setPhone,   placeholder: "Telefon",        type: "tel",   required: true  },
                          { value: email,   set: setEmail,   placeholder: "Email",          type: "email", required: true  },
                        ] as const).map(({ value, set, placeholder, type, required }) => (
                          <input
                            key={placeholder}
                            value={value}
                            onChange={(e) => (set as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                            placeholder={placeholder}
                            type={type}
                            required={required}
                            className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/28 outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.06]"
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={sending || sent}
                        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/20 via-blue-400/20 to-violet-400/20 px-5 text-sm font-medium text-white transition hover:from-cyan-300/30 hover:via-blue-400/30 hover:to-violet-400/30 disabled:opacity-60"
                      >
                        {sending ? (
                          <>
                            <span>Se trimite</span>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          </>
                        ) : sent ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Trimis</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Primește direcția potrivită</span>
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>

                      <div className="grid gap-2 text-xs text-white/38">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          Se trimit automat și selecțiile tale:{" "}
                          {goals.find((g) => g.id === goal)?.label},{" "}
                          {stages.find((s) => s.id === stage)?.label.toLowerCase()},{" "}
                          {activeService.label.toLowerCase()} și{" "}
                          {currency(budget, activeService.monthly)}.
                        </div>
                        <div className="inline-flex items-center gap-2 px-1 text-white/32">
                          <Phone className="h-3.5 w-3.5" />
                          răspuns rapid, fără pași inutili
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
