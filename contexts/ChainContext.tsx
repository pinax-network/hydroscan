'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EVMChains } from "@pinax/token-api";
import { CHAIN_OPTIONS, TOKENS_BY_CHAIN, TokenOption } from "@/lib/token-config";

interface ChainContextType {
    selectedChain: string;
    contract: string;
    setSelectedChain: (chain: string) => void;
    setContract: (contract: string) => void;
    tokens: Record<string, TokenOption[]>;
    chains: Array<{ network: string; label: string }>;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export function ChainProvider({ children }: { children: ReactNode }) {
    const [selectedChain, setSelectedChain] = useState<string>(EVMChains.Ethereum);
    const [contract, setContract] = useState(TOKENS_BY_CHAIN[EVMChains.Ethereum][0].contract);

    return (
        <ChainContext.Provider
            value={{
                selectedChain,
                contract,
                setSelectedChain,
                setContract,
                tokens: TOKENS_BY_CHAIN,
                chains: CHAIN_OPTIONS,
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
