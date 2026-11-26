// Every chain here is EVM, and every token an ERC-20: the server reads its Transfer
// events with eth_getLogs from Pinax RPC (app/api/transfers/route.ts). The keys
// are the Pinax network IDs, which also appear in the page's ?chain= parameter.
export const NETWORKS = {
    Ethereum: "mainnet",
    Base: "base",
    ArbitrumOne: "arbitrum-one",
    Polygon: "polygon",
    Avalanche: "avalanche",
    Unichain: "unichain",
    Optimism: "optimism",
    BSC: "bsc",
} as const;

export type Tier = "bottomFeeder" | "tiny" | "small" | "medium" | "large" | "huge" | "whale";

export interface TierRange {
    tier: Tier;
    minValue: number;
    maxValue: number | null;
}

export interface TokenOption {
    symbol: string;
    contract: string;
    // The contract's decimals(): Transfer events carry raw integer amounts.
    decimals: number;
    tierRanges: TierRange[];
    logoPath?: string;
}

interface ChainMeta {
    label: string;
    logoPath: string;
    explorerBaseUrl: string;
    // https://<rpc>.rpc.pinax.network/v1/<PINAX_API_KEY>/, the chain's Pinax RPC
    // host. Only the server uses it, and the key never leaves the server.
    rpc: string;
}

const buildTierRanges = (thresholds: [number, number, number, number, number, number]): TierRange[] => [
    { tier: "bottomFeeder", minValue: 0, maxValue: thresholds[0] },
    { tier: "tiny", minValue: thresholds[0], maxValue: thresholds[1] },
    { tier: "small", minValue: thresholds[1], maxValue: thresholds[2] },
    { tier: "medium", minValue: thresholds[2], maxValue: thresholds[3] },
    { tier: "large", minValue: thresholds[3], maxValue: thresholds[4] },
    { tier: "huge", minValue: thresholds[4], maxValue: thresholds[5] },
    { tier: "whale", minValue: thresholds[5], maxValue: null },
];

const STABLECOIN_RANGES = buildTierRanges([10, 100, 1_000, 10_000, 100_000, 1_000_000]);

const TOKEN_LOGOS: Record<string, string> = {
    USDC: "/tokens/usdc.svg",
    "USDC.e": "/tokens/usdc.svg",
    DAI: "/tokens/dai.svg",
    USDT: "/tokens/usdt.svg",
    "USDT0": "/tokens/usdt.svg",
    "USD₮0": "/tokens/usdt.svg",
};

const withLogo = (symbol: string, contract: string, decimals: number, tierRanges: TierRange[]): TokenOption => ({
    symbol,
    contract,
    decimals,
    tierRanges,
    logoPath: TOKEN_LOGOS[symbol],
});

export const CHAIN_META: Record<string, ChainMeta> = {
    [NETWORKS.Ethereum]: {
        label: "Ethereum",
        logoPath: "/chains/eth.svg",
        explorerBaseUrl: "https://etherscan.io",
        rpc: "eth",
    },
    [NETWORKS.Base]: {
        label: "Base",
        logoPath: "/chains/base.svg",
        explorerBaseUrl: "https://basescan.org",
        rpc: "base",
    },
    [NETWORKS.ArbitrumOne]: {
        label: "Arbitrum One",
        logoPath: "/chains/arbone.svg",
        explorerBaseUrl: "https://arbiscan.io",
        rpc: "arbone",
    },
    [NETWORKS.Polygon]: {
        label: "Polygon",
        logoPath: "/chains/polygon.svg",
        explorerBaseUrl: "https://polygonscan.com",
        rpc: "polygon",
    },
    [NETWORKS.Avalanche]: {
        label: "Avalanche",
        logoPath: "/chains/avalanche.svg",
        explorerBaseUrl: "https://snowtrace.io",
        rpc: "avalanche",
    },
    [NETWORKS.Unichain]: {
        label: "Unichain",
        logoPath: "/chains/unichain.svg",
        explorerBaseUrl: "https://uniscan.xyz",
        rpc: "unichain",
    },
    [NETWORKS.Optimism]: {
        label: "Optimism",
        logoPath: "/chains/optimism.svg",
        explorerBaseUrl: "https://optimistic.etherscan.io",
        rpc: "optimism",
    },
    [NETWORKS.BSC]: {
        label: "BNB Chain",
        logoPath: "/chains/bsc.svg",
        explorerBaseUrl: "https://bscscan.com",
        rpc: "bsc",
    },
};

// decimals checked against each contract's decimals() on 2026-11-26.
export const TOKENS_BY_CHAIN: Record<string, TokenOption[]> = {
    [NETWORKS.Ethereum]: [
        withLogo("USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6, STABLECOIN_RANGES),
        withLogo("USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6, STABLECOIN_RANGES),
        withLogo("DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18, STABLECOIN_RANGES),
    ],
    [NETWORKS.Base]: [
        withLogo("USDT", "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", 6, STABLECOIN_RANGES),
        withLogo("USDC", "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", 6, STABLECOIN_RANGES),
    ],
    [NETWORKS.ArbitrumOne]: [
        withLogo("USD₮0", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", 6, STABLECOIN_RANGES),
        withLogo("USDC", "0xaf88d065e77c8cc2239327c5edb3a432268e5831", 6, STABLECOIN_RANGES),
        withLogo("USDC.e", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", 6, STABLECOIN_RANGES),
    ],
    [NETWORKS.Polygon]: [
        withLogo("USD₮0", "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 6, STABLECOIN_RANGES),
        withLogo("USDC", "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", 6, STABLECOIN_RANGES),
        withLogo("USDC.e", "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", 6, STABLECOIN_RANGES),
    ],
    [NETWORKS.Avalanche]: [
        withLogo("USDT", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", 6, STABLECOIN_RANGES),
        withLogo("USDC", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", 6, STABLECOIN_RANGES),
        withLogo("USDC.e", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", 6, STABLECOIN_RANGES),
    ],
    [NETWORKS.Unichain]: [
        withLogo("USD₮0", "0x9151434b16b9763660705744891fA906F660EcC5", 6, STABLECOIN_RANGES),
        withLogo("USDC", "0x078D782b760474a361dDA0AF3839290b0EF57AD6", 6, STABLECOIN_RANGES),
    ],
    [NETWORKS.Optimism]: [
        withLogo("USDT", "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", 6, STABLECOIN_RANGES),
        withLogo("USDC", "0x0b2c639c533813f4aa9d7837caf62653d097ff85", 6, STABLECOIN_RANGES),
    ],
    [NETWORKS.BSC]: [
        withLogo("BSC-USD", "0x55d398326f99059ff775485246999027b3197955", 18, STABLECOIN_RANGES),
        withLogo("USDC", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", 18, STABLECOIN_RANGES),
    ],
};

export const CHAIN_OPTIONS = Object.keys(CHAIN_META).map((network) => ({
    network,
    label: CHAIN_META[network].label,
}));

// The allowlist of what the server will query: only these chains and contracts.
export const findTokenOption = (selectedChain: string, contract: string): TokenOption | null => {
    if (!Object.hasOwn(TOKENS_BY_CHAIN, selectedChain)) return null;
    return TOKENS_BY_CHAIN[selectedChain].find((token) => token.contract.toLowerCase() === contract.toLowerCase()) || null;
};

export const getTierForValue = (value: number, tierRanges: TierRange[]): Tier => {
    const tier = tierRanges.find(({ maxValue }) => maxValue === null || value < maxValue);
    return tier?.tier || "whale";
};

export const getTierRanges = (
    selectedChain: string,
    contract: string
): TierRange[] => {
    const token = findTokenOption(selectedChain, contract);
    return token?.tierRanges || STABLECOIN_RANGES;
};
