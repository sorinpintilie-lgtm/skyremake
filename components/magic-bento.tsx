"use client";

import MagicBento from "./MagicBento";

type MagicBentoProps = {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  disableAnimations?: boolean;
};

export default function MagicBentoWrapper(props: MagicBentoProps) {
  return <MagicBento {...props} />;
}

