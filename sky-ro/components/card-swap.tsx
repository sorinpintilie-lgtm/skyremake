"use client";

import React, { Children, forwardRef, isValidElement, useCallback, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  customClass?: string;
};

type CardSwapProps = {
  width?: number;
  height?: number;
  containerWidth?: number;
  containerHeight?: number;
  cardDistance?: number;
  verticalDistance?: number;
  baseYOffset?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (index: number) => void;
  onFrontCardChange?: (index: number) => void;
  skewAmount?: number;
  easing?: "elastic" | "smooth";
  anchorX?: string;
  anchorY?: string;
  children: React.ReactNode;
};

type ChildCardProps = {
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ""} ${rest.className ?? ""}`.trim()} />
));
Card.displayName = "Card";

type CardSlot = {
  x: number;
  y: number;
  z: number;
  zIndex: number;
};

const placeNow = (el: HTMLDivElement, slot: CardSlot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });

export default function CardSwap({
  width = 500,
  height = 400,
  containerWidth,
  containerHeight,
  cardDistance = 60,
  verticalDistance = 70,
  baseYOffset = 0,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  onFrontCardChange,
  skewAmount = 6,
  easing = "elastic",
  anchorX = "50%",
  anchorY = "50%",
  children,
}: CardSwapProps) {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const container = useRef<HTMLDivElement | null>(null);
  const lockSelectionRef = useRef(false);

  const getSlot = useCallback(
    (i: number, total: number) => {
      // Keep all cards visible while preserving enough offset so deeper cards remain clickable.
      const spread = total > 3 ? Math.min(1, 5 / (total - 1)) : 1;
      return {
        x: i * cardDistance * spread,
        y: baseYOffset - i * verticalDistance * spread,
        z: -i * cardDistance * 1.5 * spread,
        zIndex: total - i,
      };
    },
    [cardDistance, verticalDistance, baseYOffset]
  );

  const bringCardToFront = useCallback(
    (originalIndex: number) => {
      if (!order.current.includes(originalIndex)) return;

      lockSelectionRef.current = true;
      tlRef.current?.kill();
      clearInterval(intervalRef.current);

      const currentOrder = order.current;
      const clickedPos = currentOrder.indexOf(originalIndex);
      if (clickedPos === -1) return;

      const nextOrder = [...currentOrder.slice(clickedPos), ...currentOrder.slice(0, clickedPos)];
      order.current = nextOrder;
      onFrontCardChange?.(nextOrder[0]);

      const total = refs.length;
      nextOrder.forEach((idx, slotIndex) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = getSlot(slotIndex, total);
        gsap.to(el, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          zIndex: slot.zIndex,
          skewY: skewAmount,
          duration: 0.72,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
    },
    [getSlot, skewAmount, refs, onFrontCardChange]
  );

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) placeNow(r.current, getSlot(i, total), skewAmount);
    });

    const animateOrder = (duration: number) => {
      order.current.forEach((idx, slotIndex) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = getSlot(slotIndex, refs.length);
        gsap.to(el, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          zIndex: slot.zIndex,
          skewY: skewAmount,
          duration,
          ease: config.ease,
          overwrite: "auto",
        });
      });
    };

    const swap = () => {
      if (lockSelectionRef.current) return;
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      order.current = [...rest, front];
      onFrontCardChange?.(order.current[0]);
      animateOrder(config.durMove);
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover) {
      const node = container.current;
      if (!node) return;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearInterval(intervalRef.current);
      };
    }

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSlot, delay, pauseOnHover, skewAmount, easing, onFrontCardChange]);

  const rendered = childArr.map((child, i) => {
    if (!isValidElement<ChildCardProps>(child)) return child;

    return (
      <Card
        key={i}
        ref={refs[i]}
        style={{ width, height, ...(child.props.style ?? {}) }}
        onClick={(e) => {
          child.props.onClick?.(e);
          bringCardToFront(i);
          onCardClick?.(i);
        }}
      >
        {child.props.children}
      </Card>
    );
  });

  return (
    <div
      ref={container}
      className="card-swap-container"
      style={{
        width: containerWidth ?? width,
        height: containerHeight ?? height,
        ["--card-anchor-x" as string]: anchorX,
        ["--card-anchor-y" as string]: anchorY,
      }}
    >
      {rendered}
    </div>
  );
}

