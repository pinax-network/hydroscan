'use client';

import React, { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
    const [isMounted, setIsMounted] = useState(false);
    const [activeFish, setActiveFish] = useState<Transfer[]>([]);
    const [pinnedTransfers, setPinnedTransfers] = useState<PinnedTransfer[]>([]);
    const [mobileSelectedTransfer, setMobileSelectedTransfer] = useState<PinnedTransfer | null>(null);
    const [hoveredTier, setHoveredTier] = useState<Tier | null>(null);
    const [selectedTiers, setSelectedTiers] = useState<Tier[]>([]);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

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
        const pinnedTransfer = {
            key: `${fish.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            transfer: fish,
            chainMeta,
            token,
        };

        setSelectedTiers((prev) => (
            prev.includes(tier) ? prev : [...prev, tier]
        ));
        setMobileSelectedTransfer(pinnedTransfer);
        setPinnedTransfers((prev) => [
            pinnedTransfer,
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
            <section className="fixed inset-0 overflow-hidden bg-black h-dvh">
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
                <div className="relative z-20 h-full w-full overflow-hidden opacity-90">
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

                <div className="absolute left-3 right-3 top-24 z-40 hidden max-h-[34vh] flex-col gap-3 overflow-y-auto pb-2 md:left-4 md:right-auto md:top-30 md:flex md:w-[360px] md:max-w-[calc(100vw-2rem)] md:max-h-none md:overflow-visible md:pb-0">
                    {pinnedTransfers.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setPinnedTransfers([])}
                            className={cx(
                                "sticky top-2 ml-auto z-[70] flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition cursor-pointer md:absolute md:-top-5 md:-right-5",
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
                                "rounded p-3 text-xs sm:p-4",
                                isDarkMode
                                    ? "black-glass"
                                    : "white-glass text-white",
                            )}
                        >
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                <div className="flex min-w-0 items-center gap-2">
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
                                <div className="text-left font-semibold sm:text-right">{formatAmount(transfer.value)}</div>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-4">
                                    <span className="w-[84px] shrink-0 leading-none opacity-60 sm:text-[13px]">From</span>
                                    <a href={getExplorerUrl(pinnedChainMeta.explorerBaseUrl, "address", transfer.from)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 break-words font-mono leading-none text-blue-300 hover:underline text-right">
                                        {shortHash(transfer.from)}
                                    </a>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="w-[84px] shrink-0 leading-none opacity-60 sm:text-[13px]">To</span>
                                    <a href={getExplorerUrl(pinnedChainMeta.explorerBaseUrl, "address", transfer.to)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 break-words font-mono leading-none text-blue-300 hover:underline text-right">
                                        {shortHash(transfer.to)}
                                    </a>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="w-[84px] shrink-0 leading-none opacity-60 sm:text-[13px]">Transaction</span>
                                    <a href={getExplorerUrl(pinnedChainMeta.explorerBaseUrl, "tx", transfer.txid)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 break-words font-mono leading-none text-blue-300 hover:underline text-right">
                                        {shortHash(transfer.txid)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isMounted && mobileSelectedTransfer && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-4 md:hidden">
                        <div
                            className="absolute inset-0"
                            onClick={() => setMobileSelectedTransfer(null)}
                            aria-hidden="true"
                        />
                        <div
                            className={cx(
                                "relative h-full w-full overflow-y-auto rounded-none p-5 text-sm shadow-2xl",
                                isDarkMode
                                    ? "bg-slate-950 text-white"
                                    : "bg-white text-slate-950",
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => setMobileSelectedTransfer(null)}
                                className={cx(
                                    "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border text-base font-semibold transition cursor-pointer",
                                    isDarkMode
                                        ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                                        : "border-slate-200 bg-slate-100 text-slate-950 hover:bg-slate-200",
                                )}
                                aria-label="Close transfer info"
                                title="Close"
                            >
                                ×
                            </button>
                            <div className="mb-6 flex flex-col gap-3 pr-12">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Image src={mobileSelectedTransfer.chainMeta.logoPath} alt={`${mobileSelectedTransfer.chainMeta.label} logo`} width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                                    {mobileSelectedTransfer.token.logoPath ? (
                                        <Image src={mobileSelectedTransfer.token.logoPath} alt={`${mobileSelectedTransfer.token.symbol} logo`} width={18} height={18} className="h-[18px] w-[18px] object-contain rounded-full" />
                                    ) : (
                                        <div className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-semibold">
                                            {mobileSelectedTransfer.token.symbol}
                                        </div>
                                    )}
                                    <span className="font-semibold">{mobileSelectedTransfer.chainMeta.label}</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="text-3xl font-semibold">{formatAmount(mobileSelectedTransfer.transfer.value)}</div>
                                    <span className={cx("pb-1 text-base font-medium", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                        {mobileSelectedTransfer.token.symbol}
                                    </span>
                                </div>
                            </div>
                            <div className="grid gap-5">
                                <div className="grid gap-1">
                                    <span className={cx(isDarkMode ? "text-white/60" : "text-slate-500")}>From</span>
                                    <a href={getExplorerUrl(mobileSelectedTransfer.chainMeta.explorerBaseUrl, "address", mobileSelectedTransfer.transfer.from)} target="_blank" rel="noreferrer" className="break-words font-mono text-blue-300 hover:underline">
                                        {shortHash(mobileSelectedTransfer.transfer.from)}
                                    </a>
                                </div>
                                <div className="grid gap-1">
                                    <span className={cx(isDarkMode ? "text-white/60" : "text-slate-500")}>To</span>
                                    <a href={getExplorerUrl(mobileSelectedTransfer.chainMeta.explorerBaseUrl, "address", mobileSelectedTransfer.transfer.to)} target="_blank" rel="noreferrer" className="break-words font-mono text-blue-300 hover:underline">
                                        {shortHash(mobileSelectedTransfer.transfer.to)}
                                    </a>
                                </div>
                                <div className="grid gap-1">
                                    <span className={cx(isDarkMode ? "text-white/60" : "text-slate-500")}>Transaction</span>
                                    <a href={getExplorerUrl(mobileSelectedTransfer.chainMeta.explorerBaseUrl, "tx", mobileSelectedTransfer.transfer.txid)} target="_blank" rel="noreferrer" className="break-words font-mono text-blue-300 hover:underline">
                                        {shortHash(mobileSelectedTransfer.transfer.txid)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

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
