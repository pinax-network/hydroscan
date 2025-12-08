'use client';

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

type Tier = "bottomFeeder" | "tiny" | "small" | "medium" | "large" | "huge" | "whale";

const tierThresholds: Array<{ tier: Tier; minPct: number; maxPct: number }> = [
    { tier: "bottomFeeder", minPct: 0, maxPct: 0.00000001 },
    { tier: "tiny", minPct: 0.00000001, maxPct: 0.0000001 },
    { tier: "small", minPct: 0.0000001, maxPct: 0.000001 },
    { tier: "medium", minPct: 0.000001, maxPct: 0.00001 },
    { tier: "large", minPct: 0.00001, maxPct: 0.0001 },
    { tier: "huge", minPct: 0.0001, maxPct: 0.001 },
    { tier: "whale", minPct: 0.001, maxPct: Infinity },
];

const tierLabels: Record<Tier, string> = {
    bottomFeeder: "Shrimp",
    tiny: "Chili Rasbora",
    small: "Guppy",
    medium: "Clownfish",
    large: "Koi Carp",
    huge: "Great White",
    whale: "Blue Whale",
};

const NORMALIZED_WIDTH = 50; // pixels

interface Props {
    supply: number;
}

const formatValue = (value: number): string => {
    if (!isFinite(value)) return "∞";
    if (value === 0) return "0";
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    if (value >= 1) return value.toFixed(2);
    if (value >= 0.01) return value.toFixed(4);
    return value.toExponential(2);
};

export default React.memo(function FishLegend({ supply }: Props) {
    const { isDarkMode } = useTheme();

    return (
        <div className={cx(
            "text-xs absolute top-30 right-4 z-40 p-4 rounded",
            isDarkMode
                ? "black-glass"
                : "white-glass text-white",
        )}>
            <div className="space-y-2">
                {tierThresholds.map(({ tier, minPct, maxPct }) => {
                    const minValue = minPct * supply;
                    const maxValue = maxPct === Infinity ? Infinity : maxPct * supply;
                    
                    return (
                        <div key={tier} className="flex items-center gap-2 py-1">
                            <div 
                                className="flex-shrink-0"
                                style={{
                                    width: `${NORMALIZED_WIDTH}px`,
                                    height: '28px',
                                    backgroundImage: `url(/sprites/${tier}/spritesheet.png)`,
                                    backgroundSize: `${NORMALIZED_WIDTH * 4}px auto`,
                                    backgroundPosition: '0 0',
                                    backgroundRepeat: 'no-repeat',
                                    aspectRatio: 'auto',
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold">{tierLabels[tier]}</div>
                                <div className="text-xs opacity-50">
                                    {formatValue(minValue)} - {maxValue === Infinity ? '∞' : formatValue(maxValue)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
