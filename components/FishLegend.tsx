'use client';

import React from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { Tier, TierRange, TokenOption } from "@/lib/token-config";

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
    token: TokenOption;
    hoveredTier: Tier | null;
    selectedTiers: Tier[];
    onTierHoverChange: (tier: Tier | null) => void;
    onTierToggle: (tier: Tier) => void;
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

export default React.memo(function FishLegend({
    tierRanges,
    token,
    hoveredTier,
    selectedTiers,
    onTierHoverChange,
    onTierToggle,
}: Props) {
    const { isDarkMode } = useTheme();

    return (
        <div className={cx(
            "text-xs absolute top-30 right-4 z-40 p-4 rounded w-[300px] max-w-[calc(100vw-2rem)]",
            isDarkMode
                ? "black-glass"
                : "white-glass text-white",
        )}>
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/10">
                    {token.logoPath ? (
                        <Image
                            src={token.logoPath}
                            alt={`${token.symbol} logo`}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain"
                        />
                    ) : (
                        <div className="text-lg font-semibold">{token.symbol}</div>
                    )}
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.24em] opacity-50">School Sizes</div>
                    <div className="text-2xl font-semibold leading-none mt-1">{token.symbol}</div>
                </div>
            </div>
            <div className="space-y-2">
                {tierRanges.map(({ tier, minValue, maxValue }) => {
                    const isHovered = hoveredTier === tier;
                    const isSelected = selectedTiers.includes(tier);

                    return (
                        <button
                            key={tier}
                            type="button"
                            onMouseEnter={() => onTierHoverChange(tier)}
                            onMouseLeave={() => onTierHoverChange(null)}
                            onClick={() => onTierToggle(tier)}
                            className={cx(
                                "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition cursor-pointer",
                                isSelected || isHovered
                                    ? "bg-white/10 ring-1 ring-white/15"
                                    : "hover:bg-white/5",
                            )}
                        >
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
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
