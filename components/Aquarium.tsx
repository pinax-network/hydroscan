'use client';

import React, { useRef, useState, useCallback } from "react";
import { Transfer, FishDirection } from "@/models/transfer.model";
import Image from "next/image";
import Fish from "@/components/Fish";
import WaterEffect from "@/components/WaterEffect";
import FishLegend from "@/components/FishLegend";
import { useTheme } from "@/contexts/ThemeContext";

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

const POLL_INTERVAL = 10;

interface Props {
    transfers: Transfer[];
    supply: number|null;
    resetKey: number;
}

const SUPPLY_MODIFIER = 100;
export default React.memo(function Aquarium({ transfers, supply, resetKey }: Props) {
    if(supply) supply = supply / SUPPLY_MODIFIER;
    const { isDarkMode } = useTheme();

    const seen = useRef(new Set<string>());
    const [activeFish, setActiveFish] = useState<Transfer[]>([]);
    const [pausedFish, setPausedFish] = useState<Transfer | null>(null);

    React.useEffect(() => {
        seen.current = new Set();
        setActiveFish([]);
        setPausedFish(null);
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

    const handleHoverStart = useCallback((fish: Transfer) => {
        setPausedFish(fish);
    }, []);

    const handleHoverEnd = useCallback(() => {
        setPausedFish(null);
    }, []);

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
                    {supply !== null && activeFish.map(t => (
                        <Fish key={`${t.id}-${t.randomFrameOffset}-${t.randomEntranceDelay}`}
                              fish={t}
                              supply={supply}
                              maxSwimTime={POLL_INTERVAL*3}
                              minSwimTime={POLL_INTERVAL*1.5}
                              onDone={finishFish}
                              isPaused={!!pausedFish}
                              onHoverStart={() => handleHoverStart(t)}
                              onHoverEnd={handleHoverEnd}
                        />
                    ))}
                </div>

                {pausedFish ? (
                    <div className={cx(
                        "text-xs absolute top-30 right-4 z-40 p-4 rounded",
                        isDarkMode
                            ? "black-glass"
                            : "white-glass text-white",
                    )}>
                        <div><b>From:</b> {pausedFish.from.slice(0, 10)}...{pausedFish.from.slice(-8)}</div>
                        <div><b>To:</b> {pausedFish.to.slice(0, 10)}...{pausedFish.to.slice(-8)}</div>
                        <div><b>TXID:</b> {pausedFish.txid.slice(0, 10)}...{pausedFish.txid.slice(-8)}</div>
                        <div><b>Amount:</b> {pausedFish.value.toLocaleString()}</div>
                    </div>
                ) : (
                    supply !== null && <FishLegend supply={supply} />
                )}
            </section>
        </>
    );
});
