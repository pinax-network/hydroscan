'use client';

import React, {useMemo, useState} from "react";
import { Transfer } from "@/models/transfer.model";
import { Tier, TierRange } from "@/lib/token-config";

const ENTRANCE_DELAY_DIVISOR = 5;
const SPRITE_ANIMATION_DURATION = 0.5; // 4 frames at ~200ms each
const SPRITE_FRAME_COUNT = 4;

const getTier = (value: number, tierRanges: TierRange[]): Tier => {
    const tier = tierRanges.find(({ maxValue }) => maxValue === null || value < maxValue);
    return tier?.tier || "whale";
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
    tierRanges: TierRange[];
    maxSwimTime: number;
    minSwimTime: number;
    onSelect: (fish: Transfer) => void;
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

export default React.memo(function Fish({ fish, tierRanges, maxSwimTime, minSwimTime, onSelect, onDone }: Props) {

    const [hovering, setHovering] = useState(false);
    const numericValue = parseFloat(fish.value);
    const tier = getTier(numericValue, tierRanges);

    const y = tier === "bottomFeeder" ? "95%" : `${fish.randomY + 5}%`;

    const minTime = minSwimTime;
    const maxTime = maxSwimTime;
    const tierFactor = tierFactors[tier];

    const swimTime = (minTime + fish.randomSwimFactor * (maxTime - minTime)) * tierFactor;

    const entranceDelay = fish.randomEntranceDelay * (maxSwimTime / ENTRANCE_DELAY_DIVISOR);

    const scale = useMemo(() => {
        const currentTier = tierRanges.find(({ tier: currentTier }) => currentTier === tier);
        const tierMin = currentTier?.minValue ?? 0;
        const tierMax = currentTier?.maxValue ?? Math.max(numericValue, tierMin + 1);
        const normalizedTierMax = Math.max(tierMax, tierMin + 1);
        const tierSpan = Math.max(normalizedTierMax - tierMin, Math.max(tierMin, 1));
        const clampedValue = Math.min(Math.max(numericValue, tierMin), normalizedTierMax);
        const valueBoost = ((clampedValue - tierMin) / tierSpan) * 0.2;
        const baseScale = baseScales[tier];
        return baseScale * (1 + valueBoost);
    }, [numericValue, tier, tierRanges]);

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
            animationPlayState: "running" as const,
            willChange: "transform" as const,
            pointerEvents: "auto" as const,
            cursor: "pointer" as const,
        };
    }, [y, swimTime, entranceDelay, imageWidth, fish.randomDirection]);

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
            animationPlayState: "running" as const,
            animationDelay: `${(fish.randomFrameOffset / SPRITE_FRAME_COUNT) * SPRITE_ANIMATION_DURATION}s`,
            transform,
            filter: `hue-rotate(${fish.randomColor}deg)`,
        };
    }, [imageWidth, imageHeight, spriteSheetSrc, fish.randomFrameOffset, fish.randomColor, fish.randomDirection, minTime, swimTime, tier]);

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

    const handlePointerEnter = () => {
        setHovering(true);
    };

    const handlePointerLeave = () => {
        setHovering(false);
    };


    return (
        <div
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onClick={() => onSelect(fish)}
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
