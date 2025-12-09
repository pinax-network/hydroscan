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
        { symbol: "USDT", contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" },
    ],
    [EVMChains.ArbitrumOne]: [
        { symbol: "USD₮0", contract: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9" },
        { symbol: "USDC", contract: "0xaf88d065e77c8cc2239327c5edb3a432268e5831" },
        { symbol: "USDC.e", contract: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" },
    ],
    [EVMChains.Polygon]: [
        { symbol: "USD₮0", contract: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" },
        { symbol: "USDC", contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
        { symbol: "USDC.e", contract: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174" },
    ],
    [EVMChains.Avalanche]: [
        { symbol: "USDT", contract: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7" },
        { symbol: "USDC", contract: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },
        { symbol: "USDC.e", contract: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664" },
    ],
    [EVMChains.Unichain]: [
        { symbol: "USD₮0", contract: "0x9151434b16b9763660705744891fA906F660EcC5" },
        { symbol: "USDC", contract: "0x078D782b760474a361dDA0AF3839290b0EF57AD6" },
    ],
    [EVMChains.Optimism]: [
        { symbol: "USDT", contract: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58" },
        { symbol: "USDC", contract: "0x0b2c639c533813f4aa9d7837caf62653d097ff85" },
    ],
    [EVMChains.BSC]: [
        { symbol: "BSC-USD", contract: "0x55d398326f99059ff775485246999027b3197955" },
        { symbol: "USDC", contract: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" },
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
    const [selectedChain, setSelectedChain] = useState<string>(EVMChains.Ethereum);
    const [contract, setContract] = useState(tokens[EVMChains.Ethereum][0].contract);

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
