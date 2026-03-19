import { EVMChains, SVMChains, TVMChains } from "@pinax/token-api";

export type Tier = "bottomFeeder" | "tiny" | "small" | "medium" | "large" | "huge" | "whale";

export interface TierRange {
    tier: Tier;
    minValue: number;
    maxValue: number | null;
}

export interface TokenOption {
    symbol: string;
    contract: string;
    tierRanges: TierRange[];
    logoPath?: string;
}

interface ChainMeta {
    label: string;
    logoPath: string;
    explorerBaseUrl: string;
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
const ETH_RANGES = buildTierRanges([0.01, 0.1, 1, 10, 100, 1_000]);
const BNB_RANGES = buildTierRanges([0.02, 0.2, 2, 20, 200, 2_000]);
const POL_RANGES = buildTierRanges([10, 100, 1_000, 10_000, 100_000, 1_000_000]);
const AVAX_RANGES = buildTierRanges([0.5, 5, 50, 500, 5_000, 50_000]);
const OP_RANGES = buildTierRanges([10, 100, 1_000, 10_000, 100_000, 1_000_000]);
const UNI_RANGES = buildTierRanges([5, 50, 500, 5_000, 50_000, 500_000]);
const SOL_RANGES = buildTierRanges([0.05, 0.5, 5, 50, 500, 5_000]);
const TRX_RANGES = buildTierRanges([100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000]);

const TOKEN_LOGOS: Record<string, string> = {
    ETH: "/tokens/eth.svg",
    USDC: "/tokens/usdc.svg",
    "USDC.e": "/tokens/usdc.svg",
    DAI: "/tokens/dai.svg",
    USDT: "/tokens/usdt.svg",
    "USDT0": "/tokens/usdt.svg",
    "USD₮0": "/tokens/usdt.svg",
};

const withLogo = (symbol: string, contract: string, tierRanges: TierRange[]): TokenOption => ({
    symbol,
    contract,
    tierRanges,
    logoPath: TOKEN_LOGOS[symbol],
});

export const CHAIN_META: Record<string, ChainMeta> = {
    [EVMChains.Ethereum]: {
        label: "Ethereum",
        logoPath: "/chains/eth.svg",
        explorerBaseUrl: "https://etherscan.io",
    },
    [EVMChains.Base]: {
        label: "Base",
        logoPath: "/chains/base.svg",
        explorerBaseUrl: "https://basescan.org",
    },
    [SVMChains.Solana]: {
        label: "Solana",
        logoPath: "/chains/solana.svg",
        explorerBaseUrl: "https://solscan.io",
    },
    [TVMChains.Tron]: {
        label: "Tron",
        logoPath: "/chains/tron.svg",
        explorerBaseUrl: "https://tronscan.org/#",
    },
    [EVMChains.ArbitrumOne]: {
        label: "Arbitrum One",
        logoPath: "/chains/arbone.svg",
        explorerBaseUrl: "https://arbiscan.io",
    },
    [EVMChains.Polygon]: {
        label: "Polygon",
        logoPath: "/chains/polygon.svg",
        explorerBaseUrl: "https://polygonscan.com",
    },
    [EVMChains.Avalanche]: {
        label: "Avalanche",
        logoPath: "/chains/avalanche.svg",
        explorerBaseUrl: "https://snowtrace.io",
    },
    [EVMChains.Unichain]: {
        label: "Unichain",
        logoPath: "/chains/unichain.svg",
        explorerBaseUrl: "https://uniscan.xyz",
    },
    [EVMChains.Optimism]: {
        label: "Optimism",
        logoPath: "/chains/optimism.svg",
        explorerBaseUrl: "https://optimistic.etherscan.io",
    },
    [EVMChains.BSC]: {
        label: "BNB Chain",
        logoPath: "/chains/bsc.svg",
        explorerBaseUrl: "https://bscscan.com",
    },
};

export const TOKENS_BY_CHAIN: Record<string, TokenOption[]> = {
    [EVMChains.Ethereum]: [
        withLogo("USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7", STABLECOIN_RANGES),
        withLogo("USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", STABLECOIN_RANGES),
        withLogo("DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", STABLECOIN_RANGES),
    ],
    [EVMChains.Base]: [
        withLogo("USDT", "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", STABLECOIN_RANGES),
        withLogo("USDC", "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", STABLECOIN_RANGES),
    ],
    [SVMChains.Solana]: [
        withLogo("USDT", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", STABLECOIN_RANGES),
    ],
    [TVMChains.Tron]: [
        withLogo("USDT", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", STABLECOIN_RANGES),
    ],
    [EVMChains.ArbitrumOne]: [
        withLogo("USD₮0", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", STABLECOIN_RANGES),
        withLogo("USDC", "0xaf88d065e77c8cc2239327c5edb3a432268e5831", STABLECOIN_RANGES),
        withLogo("USDC.e", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", STABLECOIN_RANGES),
    ],
    [EVMChains.Polygon]: [
        withLogo("USD₮0", "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", STABLECOIN_RANGES),
        withLogo("USDC", "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", STABLECOIN_RANGES),
        withLogo("USDC.e", "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", STABLECOIN_RANGES),
    ],
    [EVMChains.Avalanche]: [
        withLogo("USDT", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", STABLECOIN_RANGES),
        withLogo("USDC", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", STABLECOIN_RANGES),
        withLogo("USDC.e", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", STABLECOIN_RANGES),
    ],
    [EVMChains.Unichain]: [
        withLogo("USD₮0", "0x9151434b16b9763660705744891fA906F660EcC5", STABLECOIN_RANGES),
        withLogo("USDC", "0x078D782b760474a361dDA0AF3839290b0EF57AD6", STABLECOIN_RANGES),
    ],
    [EVMChains.Optimism]: [
        withLogo("USDT", "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", STABLECOIN_RANGES),
        withLogo("USDC", "0x0b2c639c533813f4aa9d7837caf62653d097ff85", STABLECOIN_RANGES),
    ],
    [EVMChains.BSC]: [
        withLogo("BSC-USD", "0x55d398326f99059ff775485246999027b3197955", STABLECOIN_RANGES),
        withLogo("USDC", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", STABLECOIN_RANGES),
    ],
};

export const NATIVE_TOKEN_BY_CHAIN: Record<string, TokenOption> = {
    [EVMChains.Ethereum]: withLogo("ETH", "", ETH_RANGES),
    [EVMChains.Base]: withLogo("ETH", "", ETH_RANGES),
    [SVMChains.Solana]: withLogo("SOL", "", SOL_RANGES),
    [TVMChains.Tron]: withLogo("TRX", "", TRX_RANGES),
    [EVMChains.ArbitrumOne]: withLogo("ETH", "", ETH_RANGES),
    [EVMChains.Polygon]: withLogo("POL", "", POL_RANGES),
    [EVMChains.Avalanche]: withLogo("AVAX", "", AVAX_RANGES),
    [EVMChains.Unichain]: withLogo("UNI", "", UNI_RANGES),
    [EVMChains.Optimism]: withLogo("OP", "", OP_RANGES),
    [EVMChains.BSC]: withLogo("BNB", "", BNB_RANGES),
};

export const CHAIN_OPTIONS = Object.keys(CHAIN_META).map((network) => ({
    network,
    label: CHAIN_META[network].label,
}));

export const findTokenOption = (selectedChain: string, contract: string) => {
    if (contract === "") {
        return NATIVE_TOKEN_BY_CHAIN[selectedChain];
    }

    return TOKENS_BY_CHAIN[selectedChain]?.find((token) => token.contract.toLowerCase() === contract.toLowerCase()) || null;
};

export const getTierRanges = (
    selectedChain: string,
    contract: string
): TierRange[] => {
    const token = findTokenOption(selectedChain, contract);
    return token?.tierRanges || STABLECOIN_RANGES;
};
