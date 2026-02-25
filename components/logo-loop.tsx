"use client";

import React from "react";
import "./LogoLoop.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LogoLoopRaw from "./LogoLoop.jsx";

type LogoNodeItem = {
  node: React.ReactNode;
  title?: string;
  href?: string;
  ariaLabel?: string;
};

type LogoImageItem = {
  src: string;
  alt?: string;
  href?: string;
  title?: string;
};

type LogoItem = LogoNodeItem | LogoImageItem;

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
  className?: string;
}

export default function LogoLoop(props: LogoLoopProps) {
  return <LogoLoopRaw {...props} />;
}

