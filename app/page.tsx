'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Transfer } from "@/models/transfer.model";
import Aquarium from "@/components/Aquarium";
import Menu from "@/components/Menu";
import { ChainProvider, useChain } from "@/contexts/ChainContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");
const POLL_INTERVAL = 10;

function AquariumContent() {
    const { selectedChain, contract } = useChain();
    const { theme } = useTheme();
    const [resetKey, setResetKey] = useState<number>(0);

    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [lastBlock, setLastBlock] = useState<number | null>(null);
    const [supply, setSupply] = useState<number | null>(null);




    const fetchTransfers = useCallback(async () => {


        // setTransfers(prev => [...prev, ...incoming]);
        // setLastBlock(result.lastBlock);
    }, [selectedChain, contract, lastBlock]);




















    const fetchSupply = useCallback(async () => {
        const result = await fetch('/api/supply/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedChain, contract, lastBlock })
        }).then(res => res.json()).catch(() => null);

        if(!result){
            alert("Error fetching supply. Please check the selected chain and token contract.");
            return;
        }

        setSupply(result!.supply);
    }, [selectedChain, contract, lastBlock]);

    const fetchTransfersRef = useRef(fetchTransfers);
    const fetchSupplyRef = useRef(fetchSupply);

    useEffect(() => {
        fetchTransfersRef.current = fetchTransfers;
    }, [fetchTransfers]);

    useEffect(() => {
        fetchSupplyRef.current = fetchSupply;
    }, [fetchSupply]);

    useEffect(() => {
        let id: NodeJS.Timeout | null = null;

        const startPolling = () => {
            id = setInterval(() => fetchTransfersRef.current(), POLL_INTERVAL * 1000);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (id) clearInterval(id);
                id = null;
            } else {
                startPolling();
                fetchTransfersRef.current();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Initial fetch and start polling
        setTimeout(() => {
            fetchSupplyRef.current();
            fetchTransfersRef.current();
        }, 1);
        startPolling();

        return () => {
            if (id) clearInterval(id);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const resetAll = useCallback(() => {
        setTransfers([]);
        setLastBlock(null);
        setSupply(null);
    }, []);

    const changeDetails = useCallback(async () => {
        resetAll();
        setResetKey(prev => prev + 1);
        await fetchSupplyRef.current();
        await fetchTransfersRef.current();
    }, [resetAll]);

    return (
        <div className={cx("min-h-screen", theme.bg, theme.textPrimary)}>
            <div className="absolute inset-0 flex justify-center pointer-events-none">
                <div className="w-200 h-100 bg-blue-500/4 blur-3xl rounded-full"></div>
            </div>
            <Menu onChangeDetails={changeDetails} />
            <Aquarium transfers={transfers} supply={supply} resetKey={resetKey} />
            <div className="fixed bottom-10 right-10 z-50 hover:opacity-100 transition">
                <a href="https://pinax.network" target="_blank" aria-label="Pinax.io" className="flex justify-end items-end flex-col">
                    <svg width="30" viewBox="0 0 75 97" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M60.4485 69.0969L46.469 81.4903V84.5524L60.4485 96.9458L74.4279 84.5524V81.4903L60.4485 69.0969ZM69.2794 83.987L60.4485 91.8123L51.6175 83.987V82.0507L60.4485 74.2254L69.2794 82.0507V83.987Z" fill="#FFFFFE"/>
                        <path d="M60.4485 46.3765L46.469 58.7699V61.8319L60.4485 74.2253L74.4279 61.8319V58.7699L60.4485 46.3765ZM69.2794 61.2666L60.4485 69.0919L51.6175 61.2666V59.3302L60.4485 51.5049L69.2794 59.3302V61.2666Z" fill="#FFFFFE"/>
                        <path d="M37.4779 69.0969L23.4984 81.4903V84.5524L37.4779 96.9458L51.4573 84.5524V81.4903L37.4779 69.0969ZM46.3089 83.987L37.4779 91.8123L28.6469 83.987V82.0507L37.4779 74.2254L46.3089 82.0507V83.987Z" fill="#FFFFFE"/>
                        <path d="M60.4485 23.6611L46.469 36.0545V39.1166L60.4485 51.51L74.4279 39.1166V36.0545L60.4485 23.6611ZM69.2794 38.5512L60.4485 46.3765L51.6175 38.5512V36.6149L60.4485 28.7896L69.2794 36.6149V38.5512Z" fill="#FFFFFE"/>
                        <path d="M14.5123 69.0969L0.532837 81.4903V84.5524L14.5123 96.9458L28.4918 84.5524V81.4903L14.5123 69.0969ZM23.3433 83.987L14.5123 91.8123L5.68132 83.987V82.0507L14.5123 74.2254L23.3433 82.0507V83.987Z" fill="#FFFFFE"/>
                        <path d="M37.4779 23.6611L23.4984 36.0545V39.1166L37.4779 51.51L51.4573 39.1166V36.0545L37.4779 23.6611ZM46.3089 38.5512L37.4779 46.3765L28.6469 38.5512V36.6149L37.4779 28.7896L46.3089 36.6149V38.5512Z" fill="#FFFFFE"/>
                        <path d="M14.5123 46.3765L0.532837 58.7699V61.8319L14.5123 74.2253L28.4918 61.8319V58.7699L14.5123 46.3765ZM23.3433 61.2666L14.5123 69.0919L5.68132 61.2666V59.3302L14.5123 51.5049L23.3433 59.3302V61.2666Z" fill="#FFFFFE"/>
                        <path d="M37.4779 0.945801L23.4984 13.3392V16.4013L37.4779 28.7947L51.4573 16.4013V13.3392L37.4779 0.945801ZM46.3089 15.8359L37.4779 23.6612L28.6469 15.8359V13.8996L37.4779 6.07427L46.3089 13.8996V15.8359Z" fill="#FFFFFE"/>
                        <path d="M14.5123 23.6611L0.532837 36.0545V39.1166L14.5123 51.51L28.4918 39.1166V36.0545L14.5123 23.6611ZM23.3433 38.5512L14.5123 46.3765L5.68132 38.5512V36.6149L14.5123 28.7896L23.3433 36.6149V38.5512Z" fill="#FFFFFE"/>
                    </svg>

                </a>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <ThemeProvider>
            <ChainProvider>
                <AquariumContent />
            </ChainProvider>
        </ThemeProvider>
    );
}
