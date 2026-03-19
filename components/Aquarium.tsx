'use client';

import React, { useRef, useState, useCallback } from "react";
import { Transfer, FishDirection } from "@/models/transfer.model";
import Image from "next/image";
import Fish from "@/components/Fish";
import WaterEffect from "@/components/WaterEffect";
import FishLegend from "@/components/FishLegend";
import { useTheme } from "@/contexts/ThemeContext";
import { Tier, TierRange, TokenOption, getTierForValue } from "@/lib/token-config";

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

const POLL_INTERVAL = 10;
const MAX_INFO_BUBBLES = 5;

interface ChainDisplayMeta {
    label: string;
    logoPath: string;
    explorerBaseUrl: string;
}

interface PinnedTransfer {
    key: string;
    transfer: Transfer;
    chainMeta: ChainDisplayMeta;
    token: TokenOption;
}

interface Props {
    transfers: Transfer[];
    tierRanges: TierRange[];
    resetKey: number;
    chainMeta: ChainDisplayMeta;
    token: TokenOption;
}

const formatAmount = (value: string) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value;
    return amount.toLocaleString(undefined, {
        maximumFractionDigits: amount >= 1 ? 2 : 6,
    });
};

const shortHash = (value: string) => `${value.slice(0, 10)}...${value.slice(-8)}`;

const getExplorerUrl = (baseUrl: string, kind: "tx" | "address", value: string) => {
    if (baseUrl.includes("solscan.io")) {
        return `${baseUrl}/${kind}/${value}`;
    }

    if (baseUrl.includes("tronscan.org/#")) {
        return `${baseUrl}/${kind}/${value}`;
    }

    return `${baseUrl}/${kind}/${value}`;
};

export default React.memo(function Aquarium({ transfers, tierRanges, resetKey, chainMeta, token }: Props) {
    const { isDarkMode } = useTheme();

    const seen = useRef(new Set<string>());
    const [activeFish, setActiveFish] = useState<Transfer[]>([]);
    const [pinnedTransfers, setPinnedTransfers] = useState<PinnedTransfer[]>([]);
    const [hoveredTier, setHoveredTier] = useState<Tier | null>(null);
    const [selectedTiers, setSelectedTiers] = useState<Tier[]>([]);

    React.useEffect(() => {
        seen.current = new Set();
        setActiveFish([]);
        setHoveredTier(null);
    }, [resetKey]);

    React.useEffect(() => {
        const newTransfers = transfers.filter(t => !seen.current.has(t.id));
        
        if (newTransfers.length === 0) return;

        newTransfers.forEach(t => seen.current.add(t.id));
        
        const processedTransfers = newTransfers.map(transfer => {
            const canChangeColor = Math.random() < 0.5;
            const direction: FishDirection = Math.random() < 0.5 ? 'leftToRight' : 'rightToLeft';
            return {
                ...transfer,
                randomColor: canChangeColor ? Math.floor(Math.random() * 360) : 0,
                randomY: 5 + Math.random() * 65,
                randomSwimFactor: Math.random(),
                randomFrameOffset: Math.floor(Math.random() * 4),
                randomEntranceDelay: Math.random(),
                randomDirection: direction,
            };
        });

        setActiveFish(prev => {
            const existing = new Set(prev.map(f => f.id));
            const deduped = processedTransfers.filter(t => !existing.has(t.id));
            return [...prev, ...deduped];
        });
    }, [transfers]);

    const finishFish = useCallback((id: string) => {
        setActiveFish(prev => {
            return prev.filter(f => f.id !== id);
        });
    }, []);

    const handleSelect = useCallback((fish: Transfer) => {
        const tier = getTierForValue(Number(fish.value), tierRanges);

        setSelectedTiers((prev) => (
            prev.includes(tier) ? prev : [...prev, tier]
        ));
        setPinnedTransfers((prev) => [
            {
                key: `${fish.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                transfer: fish,
                chainMeta,
                token,
            },
            ...prev,
        ].slice(0, MAX_INFO_BUBBLES));
    }, [chainMeta, tierRanges, token]);

    const handleTierToggle = useCallback((tier: Tier) => {
        setSelectedTiers((prev) => (
            prev.includes(tier)
                ? prev.filter((currentTier) => currentTier !== tier)
                : [...prev, tier]
        ));
    }, []);

    const activeTierSet = new Set<Tier>([
        ...selectedTiers,
        ...(hoveredTier ? [hoveredTier] : []),
    ]);

    return (
        <>
            {/* Aquarium Canvas */}
            <section className="fixed top-0 bottom-0 left-0 right-0 overflow-hidden bg-black h-screen min-h-[900px]">
                <div className="absolute inset-0 top-[90%] bg-gradient-to-b from-transparent to-black/80 z-30 pointer-events-none"></div>
                <div className="absolute inset-0 bottom-[90%] bg-gradient-to-t from-transparent to-black/80 z-30 pointer-events-none"></div>

                <WaterEffect className={cx(
                    "absolute opacity-90 -top-10 -bottom-10 ",
                    isDarkMode ? "-left-14 -right-15" : "-left-10 -right-10"
                )} scale={15} baseFreq="0.05 0.01" speed={50}>
                    <Image
                        src={isDarkMode ? "/bg-dark.png" : "/bg-light.png"}
                        alt="background"
                        fill
                        className=""
                    />
                </WaterEffect>
                <div className="relative z-20 h-screen w-screen overflow-hidden opacity-90">
                    {activeFish.map(t => (
                        (() => {
                            const tier = getTierForValue(Number(t.value), tierRanges);
                            const isDimmed = activeTierSet.size > 0 && !activeTierSet.has(tier);

                            return (
                        <Fish key={`${t.id}-${t.randomFrameOffset}-${t.randomEntranceDelay}`}
                              fish={t}
                              tierRanges={tierRanges}
                              maxSwimTime={POLL_INTERVAL*3}
                              minSwimTime={POLL_INTERVAL*1.5}
                              onDone={finishFish}
                              onSelect={handleSelect}
                              onTierHoverChange={setHoveredTier}
                              isDimmed={isDimmed}
                        />
                            );
                        })()
                    ))}
                </div>

                <div className="absolute top-30 left-4 z-40 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
                    {pinnedTransfers.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setPinnedTransfers([])}
                            className={cx(
                                "absolute -top-4 -right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition cursor-pointer",
                                isDarkMode
                                    ? "black-glass text-white hover:bg-white/10"
                                    : "white-glass text-white hover:bg-white/10",
                            )}
                            aria-label="Close all transfer info"
                            title="Close all"
                        >
                            ×
                        </button>
                    )}
                    {pinnedTransfers.map(({ key, transfer, chainMeta: pinnedChainMeta, token: pinnedToken }) => (
                        <div
                            key={key}
                            className={cx(
                                "text-xs p-4 rounded",
                                isDarkMode
                                    ? "black-glass"
                                    : "white-glass text-white",
                            )}
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Image src={pinnedChainMeta.logoPath} alt={`${pinnedChainMeta.label} logo`} width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                                    {pinnedToken.logoPath ? (
                                        <Image src={pinnedToken.logoPath} alt={`${pinnedToken.symbol} logo`} width={18} height={18} className="h-[18px] w-[18px] object-contain rounded-full" />
                                    ) : (
                                        <div className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-semibold">
                                            {pinnedToken.symbol}
                                        </div>
                                    )}
                                    <span className="font-semibold">{pinnedChainMeta.label}</span>
                                    <span className="opacity-60">{pinnedToken.symbol}</span>
                                </div>
                                <div className="text-right font-semibold">{formatAmount(transfer.value)}</div>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="opacity-60">From</span>
                                    <a href={getExplorerUrl(pinnedChainMeta.explorerBaseUrl, "address", transfer.from)} target="_blank" rel="noreferrer" className="font-mono text-blue-300 hover:underline">
                                        {shortHash(transfer.from)}
                                    </a>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="opacity-60">To</span>
                                    <a href={getExplorerUrl(pinnedChainMeta.explorerBaseUrl, "address", transfer.to)} target="_blank" rel="noreferrer" className="font-mono text-blue-300 hover:underline">
                                        {shortHash(transfer.to)}
                                    </a>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="opacity-60">Transaction</span>
                                    <a href={getExplorerUrl(pinnedChainMeta.explorerBaseUrl, "tx", transfer.txid)} target="_blank" rel="noreferrer" className="font-mono text-blue-300 hover:underline">
                                        {shortHash(transfer.txid)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <FishLegend
                    tierRanges={tierRanges}
                    token={token}
                    hoveredTier={hoveredTier}
                    selectedTiers={selectedTiers}
                    onTierHoverChange={setHoveredTier}
                    onTierToggle={handleTierToggle}
                />
            </section>
        </>
    );
});
