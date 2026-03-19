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

const NORMALIZED_WIDTH = 42; // pixels

interface Props {
    tierRanges: TierRange[];
    token: TokenOption;
    hoveredTier: Tier | null;
    selectedTiers: Tier[];
    onTierHoverChange: (tier: Tier | null) => void;
    onTierToggle: (tier: Tier) => void;
}

interface LegendEntry {
    key: string;
    tiers: Tier[];
    spriteTier: Tier;
    label: string;
    minValue: number;
    maxValue: number | null;
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
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const tierMap = new Map(tierRanges.map((range) => [range.tier, range]));
    const visibleTierRanges: LegendEntry[] = [
        {
            key: "bottomFeeder",
            tiers: ["bottomFeeder"],
            spriteTier: "bottomFeeder",
            label: tierLabels.bottomFeeder,
            minValue: tierMap.get("bottomFeeder")?.minValue ?? 0,
            maxValue: tierMap.get("bottomFeeder")?.maxValue ?? null,
        },
        {
            key: "guppy",
            tiers: ["tiny", "small"],
            spriteTier: "small",
            label: tierLabels.small,
            minValue: tierMap.get("tiny")?.minValue ?? 0,
            maxValue: tierMap.get("small")?.maxValue ?? null,
        },
        {
            key: "medium",
            tiers: ["medium"],
            spriteTier: "medium",
            label: tierLabels.medium,
            minValue: tierMap.get("medium")?.minValue ?? 0,
            maxValue: tierMap.get("medium")?.maxValue ?? null,
        },
        {
            key: "large",
            tiers: ["large"],
            spriteTier: "large",
            label: tierLabels.large,
            minValue: tierMap.get("large")?.minValue ?? 0,
            maxValue: tierMap.get("large")?.maxValue ?? null,
        },
        {
            key: "huge",
            tiers: ["huge"],
            spriteTier: "huge",
            label: tierLabels.huge,
            minValue: tierMap.get("huge")?.minValue ?? 0,
            maxValue: tierMap.get("huge")?.maxValue ?? null,
        },
        {
            key: "whale",
            tiers: ["whale"],
            spriteTier: "whale",
            label: tierLabels.whale,
            minValue: tierMap.get("whale")?.minValue ?? 0,
            maxValue: tierMap.get("whale")?.maxValue ?? null,
        },
    ];

    return (
        <div className={cx(
            "absolute bottom-3 left-3 right-3 z-40 rounded p-2 text-xs overflow-visible md:top-30 md:bottom-auto md:left-auto md:right-4 md:w-[280px] md:max-w-[calc(100vw-2rem)] md:p-4",
            isDarkMode
                ? "black-glass"
                : "white-glass text-white",
        )}>
            <div className="mb-2 flex min-h-[3.25rem] items-center gap-2 border-b border-white/10 pb-2 md:mb-4 md:min-h-[4.5rem] md:gap-3 md:pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 ring-1 ring-white/10 md:h-14 md:w-14 md:rounded-2xl">
                    {token.logoPath ? (
                        <Image
                            src={token.logoPath}
                            alt={`${token.symbol} logo`}
                            width={40}
                            height={40}
                            className="h-5 w-5 object-contain md:h-10 md:w-10"
                        />
                    ) : (
                        <div className="text-sm font-semibold md:text-lg">{token.symbol}</div>
                    )}
                </div>
                <div className="min-w-0">
                    <div className="hidden text-[11px] uppercase tracking-[0.24em] opacity-50 md:block">School Sizes</div>
                    <div className="text-base font-semibold leading-none md:mt-1 md:text-2xl">{token.symbol}</div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-sm transition hover:bg-white/15 cursor-pointer"
                    aria-label={isCollapsed ? "Expand school sizes" : "Collapse school sizes"}
                    title={isCollapsed ? "Expand school sizes" : "Collapse school sizes"}
                >
                    {isCollapsed ? "+" : "−"}
                </button>
            </div>
            {!isCollapsed && (
            <div className="grid grid-cols-3 gap-1 md:block md:space-y-2">
                {visibleTierRanges.map(({ key, tiers, spriteTier, label, minValue, maxValue }) => {
                    const isHovered = hoveredTier !== null && tiers.includes(hoveredTier);
                    const isSelected = tiers.some((tier) => selectedTiers.includes(tier));

                    return (
                        <button
                            key={key}
                            type="button"
                            onMouseEnter={() => onTierHoverChange(tiers[0])}
                            onMouseLeave={() => onTierHoverChange(null)}
                            onClick={() => {
                                if (isSelected) {
                                    tiers
                                        .filter((tier) => selectedTiers.includes(tier))
                                        .forEach((tier) => onTierToggle(tier));
                                    return;
                                }

                                tiers
                                    .filter((tier) => !selectedTiers.includes(tier))
                                    .forEach((tier) => onTierToggle(tier));
                            }}
                            className={cx(
                                "flex w-full items-center gap-1 rounded-lg px-1 py-1 text-left transition cursor-pointer md:rounded-xl md:px-2 md:py-2",
                                isSelected || isHovered
                                    ? "bg-white/10 ring-1 ring-white/15"
                                    : "hover:bg-white/5",
                            )}
                        >
                            <div 
                                className="flex-shrink-0"
                                style={{
                                    width: `${NORMALIZED_WIDTH}px`,
                                    height: '20px',
                                    backgroundImage: `url(/sprites/${spriteTier}/spritesheet.png)`,
                                    backgroundSize: `${NORMALIZED_WIDTH * 4}px auto`,
                                    backgroundPosition: '0 0',
                                    backgroundRepeat: 'no-repeat',
                                    aspectRatio: 'auto',
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="truncate text-[9px] font-semibold leading-tight md:text-sm">{label}</div>
                                <div className="text-[9px] leading-tight opacity-50 md:text-xs">
                                    {formatValue(minValue)} - {maxValue === null ? '∞' : formatValue(maxValue)}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            )}
        </div>
    );
});
