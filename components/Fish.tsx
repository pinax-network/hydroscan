'use client';

import React, {useMemo, useState} from "react";
import { Transfer } from "@/models/transfer.model";

const ENTRANCE_DELAY_DIVISOR = 5;
const SPRITE_ANIMATION_DURATION = 0.5; // 4 frames at ~200ms each
const SPRITE_FRAME_COUNT = 4;

type Tier = "bottomFeeder" | "tiny" | "small" | "medium" | "large" | "huge" | "whale";

const getTier = (value: number, supply: number): Tier => {
    const pct = value / supply;

    if (pct < 0.00000001) return "bottomFeeder";
    if (pct < 0.0000001)  return "tiny";
    if (pct < 0.000001)   return "small";
    if (pct < 0.00001)    return "medium";
    if (pct < 0.0001)     return "large";
    if (pct < 0.001)      return "huge";
    return "whale";
};

const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    if (num >= 1) return num.toFixed(2);
    return num.toPrecision(3);
};

const getTierSpriteSheet = (tier: Tier) => {
    return `/sprites/${tier}/spritesheet.png`;
};

const tierFrameDimensions: Record<Tier, { width: number; height: number }> = {
    bottomFeeder: { width: 324, height: 134 },
    tiny: { width: 360, height: 148 },
    small: { width: 502, height: 304 },
    medium: { width: 528, height: 310 },
    large: { width: 726, height: 332 },
    huge: { width: 1192, height: 450 },
    whale: { width: 1750, height: 728 },
};

const tierFactors: Record<Tier, number> = {
    bottomFeeder: 0.8,
    tiny: 0.6,
    small: 0.6,
    medium: 0.6,
    large: 1.1,
    huge: 1.3,
    whale: 1.5,
};

const baseScales: Record<Tier, number> = {
    bottomFeeder: 0.3,
    tiny: 0.3,
    small: 0.5,
    medium: 0.5,
    large: 0.6,
    huge: 1.1,
    whale: 1.8,
};

interface Props {
    fish: Transfer;
    supply: number;
    maxSwimTime: number;
    minSwimTime: number;
    isPaused: boolean;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    onDone?: (id: string) => void;
}

const bannerOffsets: Record<Tier, number> = {
    bottomFeeder: 0,
    tiny: 23,
    small: 32,
    medium: 30,
    large: 36,
    huge: 60,
    whale: 120,
};

export default React.memo(function Fish({ fish, supply, maxSwimTime, minSwimTime, isPaused, onHoverStart, onHoverEnd, onDone }: Props) {

    const [hovering, setHovering] = useState(false);
    const tier = getTier(parseFloat(fish.value), supply);

    const y = tier === "bottomFeeder" ? "95%" : `${fish.randomY + 5}%`;

    const minTime = minSwimTime;
    const maxTime = maxSwimTime;
    const tierFactor = tierFactors[tier];

    const swimTime = (minTime + fish.randomSwimFactor * (maxTime - minTime)) * tierFactor;

    const entranceDelay = fish.randomEntranceDelay * (maxSwimTime / ENTRANCE_DELAY_DIVISOR);

    const scale = useMemo(() => {
        const numericValue = parseFloat(fish.value);
        let pctOfSupply = Math.min(numericValue / supply, 0.001);
        if(isNaN(pctOfSupply) || !isFinite(pctOfSupply)) {
            pctOfSupply = 0.000001;
        }
        const valueBoost = (pctOfSupply / 0.001) * 0.2;
        const baseScale = baseScales[tier];
        return baseScale * (1 + valueBoost);
    }, [fish.value, supply, tier]);

    const spriteSheetSrc = getTierSpriteSheet(tier);
    const frameDims = tierFrameDimensions[tier];

    const baseSize = 80;
    const aspectRatio = frameDims.width / frameDims.height;
    const imageHeight = Math.round(baseSize * scale);
    const imageWidth = Math.round(imageHeight * aspectRatio);

    const containerStyle = useMemo(() => {
        const isRightToLeft = fish.randomDirection === 'rightToLeft';
        
        return {
            position: "absolute" as const,
            top: y,
            left: isRightToLeft ? undefined : `-${imageWidth}px`,
            right: isRightToLeft ? `-${imageWidth}px` : undefined,
            animationName: isRightToLeft ? "swim-reverse" : "swim",
            animationDuration: `${swimTime}s`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
            animationDelay: `${entranceDelay}s`,
            animationPlayState: isPaused ? "paused" as const : "running" as const,
            willChange: "transform" as const,
            pointerEvents: "auto" as const,
            cursor: "pointer" as const,
        };
    }, [y, swimTime, entranceDelay, isPaused, imageWidth, fish.randomDirection]);

    const spriteStyle = useMemo(() => {
        const isRightToLeft = fish.randomDirection === 'rightToLeft';
        const rotation = tier === "bottomFeeder" ? isRightToLeft ? 15 : -15 : 0;
        const transform = isRightToLeft
            ? `scaleX(-1) rotate(${-rotation}deg)` 
            : `rotate(${rotation}deg)`;
        
        return {
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            backgroundImage: `url(${spriteSheetSrc})`,
            backgroundSize: `${imageWidth * SPRITE_FRAME_COUNT}px ${imageHeight}px`,
            animationName: "sprite-animate",
            animationDuration: `${SPRITE_ANIMATION_DURATION * (swimTime/minTime)}s`,
            animationTimingFunction: `steps(${SPRITE_FRAME_COUNT})`,
            animationIterationCount: "infinite" as const,
            animationPlayState: isPaused ? "paused" as const : "running" as const,
            animationDelay: `${(fish.randomFrameOffset / SPRITE_FRAME_COUNT) * SPRITE_ANIMATION_DURATION}s`,
            transform,
            filter: `hue-rotate(${fish.randomColor}deg)`,
        };
    }, [imageWidth, imageHeight, spriteSheetSrc, isPaused, fish.randomFrameOffset, fish.randomColor, fish.randomDirection, minTime, swimTime, tier]);

    const bannerStyle = useMemo(() => {
        const isRightToLeft = fish.randomDirection === 'rightToLeft';
        
        return {
            position: "absolute" as const,
            right: isRightToLeft ? undefined : `${imageWidth + 5}px`,
            left: isRightToLeft ? `${imageWidth + 5}px` : undefined,
            top: `${imageHeight - bannerOffsets[tier]}px`,
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: `11px`,
            fontWeight: 500,
            whiteSpace: "nowrap" as const,
            pointerEvents: "none" as const,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            opacity: hovering ? 1 : 0.2,
        };
    }, [imageHeight, tier, imageWidth, hovering, fish.randomDirection]);

    const handleHoverStart = () => {
        setHovering(true);
        onHoverStart();
    };

    const handleHoverEnd = () => {
        setHovering(false);
        onHoverEnd();
    };


    return (
        <div
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
            style={containerStyle}
            onAnimationEnd={() => onDone?.(fish.id)}
        >
            <div style={{ position: "relative" }}>
                <div
                    style={spriteStyle}
                    aria-label="fish"
                />
                { tier !== "bottomFeeder" && <div style={bannerStyle}>
                    {formatValue(fish.value)}
                </div>}
            </div>
        </div>
    );
});
