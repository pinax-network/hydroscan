'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EVMChains } from "@pinax/token-api";
import { CHAIN_META, CHAIN_OPTIONS, NATIVE_TOKEN_BY_CHAIN, TOKENS_BY_CHAIN, TokenOption } from "@/lib/token-config";

interface ChainContextType {
    selectedChain: string;
    contract: string;
    setSelectedChain: (chain: string) => void;
    setContract: (contract: string) => void;
    tokens: Record<string, TokenOption[]>;
    chains: Array<{ network: string; label: string }>;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

const DEFAULT_CHAIN = EVMChains.Ethereum;
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

    if (!tokenParam) {
        return {
            selectedChain,
            contract: selectedChain === DEFAULT_CHAIN ? DEFAULT_CONTRACT : (tokenList[0]?.contract || ""),
        };
    }

    if (tokenParam === "native") {
        return {
            selectedChain,
            contract: "",
        };
    }

    const matchingToken = tokenList.find((token) => token.contract.toLowerCase() === tokenParam.toLowerCase());

    return {
        selectedChain,
        contract: matchingToken?.contract || tokenList[0]?.contract || NATIVE_TOKEN_BY_CHAIN[selectedChain]?.contract || "",
    };
};

export function ChainProvider({ children }: { children: ReactNode }) {
    const initialSelection = getValidSelectionFromUrl();
    const [selectedChain, setSelectedChain] = useState<string>(initialSelection.selectedChain);
    const [contract, setContract] = useState(initialSelection.contract);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("chain", selectedChain);

        if (contract === "") {
            params.set("token", "native");
        } else {
            params.set("token", contract);
        }

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
