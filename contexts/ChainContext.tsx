'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EVMChains, SVMChains, TVMChains } from "@pinax/token-api";

const tokens: Record<string, { symbol: string; contract: string }[]> = {
    [EVMChains.Ethereum]: [
        { symbol: "USDT", contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
        { symbol: "USDC", contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
        { symbol: "DAI", contract: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
    ],
    [EVMChains.Base]: [
        { symbol: "USDT", contract: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2" },
        { symbol: "USDC", contract: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" },
    ],
    [SVMChains.Solana]: [
        { symbol: "USDT", contract: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" },
    ],
    [TVMChains.Tron]: [
        { symbol: "USDT", contract: "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj" },
        { symbol: "USDC", contract: "THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF" },
    ],
};

interface ChainContextType {
    selectedChain: string;
    contract: string;
    setSelectedChain: (chain: string) => void;
    setContract: (contract: string) => void;
    tokens: Record<string, { symbol: string; contract: string }[]>;
    chains: Record<string, string>;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export function ChainProvider({ children }: { children: ReactNode }) {
    const chains = { ...EVMChains, ...SVMChains, ...TVMChains };
    const [selectedChain, setSelectedChain] = useState<string>(SVMChains.Solana);
    const [contract, setContract] = useState(tokens[SVMChains.Solana][0].contract);

    return (
        <ChainContext.Provider
            value={{
                selectedChain,
                contract,
                setSelectedChain,
                setContract,
                tokens,
                chains,
            }}
        >
            {children}
        </ChainContext.Provider>
    );
}

export function useChain() {
    const context = useContext(ChainContext);
    if (context === undefined) {
        throw new Error('useChain must be used within a ChainProvider');
    }
    return context;
}
