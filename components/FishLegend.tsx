'use client';

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Tier, TierRange } from "@/lib/token-config";

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

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
    tierRanges: TierRange[];
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

export default React.memo(function FishLegend({ tierRanges }: Props) {
    const { isDarkMode } = useTheme();

    return (
        <div className={cx(
            "text-xs absolute top-30 right-4 z-40 p-4 rounded",
            isDarkMode
                ? "black-glass"
                : "white-glass text-white",
        )}>
            <div className="space-y-2">
                {tierRanges.map(({ tier, minValue, maxValue }) => {
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
                                    {formatValue(minValue)} - {maxValue === null ? '∞' : formatValue(maxValue)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
