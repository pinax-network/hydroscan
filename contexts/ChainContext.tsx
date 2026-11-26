'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CHAIN_META, CHAIN_OPTIONS, NETWORKS, TOKENS_BY_CHAIN, TokenOption } from "@/lib/token-config";

interface ChainContextType {
    selectedChain: string;
    contract: string;
    setSelectedChain: (chain: string) => void;
    setContract: (contract: string) => void;
    tokens: Record<string, TokenOption[]>;
    chains: Array<{ network: string; label: string }>;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

const DEFAULT_CHAIN = NETWORKS.Ethereum;
const DEFAULT_CONTRACT = TOKENS_BY_CHAIN[DEFAULT_CHAIN][0].contract;

const getValidSelectionFromUrl = () => {
    if (typeof window === "undefined") {
        return {
            selectedChain: DEFAULT_CHAIN,
            contract: DEFAULT_CONTRACT,
        };
    }

    const params = new URLSearchParams(window.location.search);
    const chainParam = params.get("chain");
    const tokenParam = params.get("token");
    const selectedChain = chainParam && chainParam in CHAIN_META ? chainParam : DEFAULT_CHAIN;
    const tokenList = TOKENS_BY_CHAIN[selectedChain] || [];

    // Old links may name a native token (?token=native) or a removed chain; they
    // fall back to the chain's first token, or to the default chain.
    const matchingToken = tokenParam
        ? tokenList.find((token) => token.contract.toLowerCase() === tokenParam.toLowerCase())
        : undefined;

    return {
        selectedChain,
        contract: matchingToken?.contract || tokenList[0].contract,
    };
};

export function ChainProvider({ children }: { children: ReactNode }) {
    const initialSelection = getValidSelectionFromUrl();
    const [selectedChain, setSelectedChain] = useState<string>(initialSelection.selectedChain);
    const [contract, setContract] = useState(initialSelection.contract);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("chain", selectedChain);
        params.set("token", contract);

        const nextQuery = params.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", nextUrl);
    }, [selectedChain, contract]);

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
