// Server only: reads ERC-20 Transfer events from Pinax RPC with eth_getLogs.
//
// One feed per (chain, token) is shared by every visitor of this process, so
// the upstream load depends on how many tokens are being watched, not on how
// many people watch them: at most one eth_blockNumber per chain and one
// eth_getLogs per token every REFRESH_MS. A feed only polls while someone asks
// for it; nothing runs in the background.
//
// Each refresh reads the few blocks since the previous one. Browsers poll
// every few seconds and get the transfers newer than the block they last saw,
// so the tank fills block by block and looks live.

import { CHAIN_META, type TokenOption } from "@/lib/token-config";

// keccak256("Transfer(address,address,uint256)"), topic 0 of every ERC-20 transfer.
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const REFRESH_MS = 2_000;
// A cold feed starts this many blocks behind the head, so the first visitor
// sees fish right away.
const COLD_START_BLOCKS = 5;
// The most blocks one eth_getLogs asks for. A feed further behind than this
// (nobody watched it for a while) jumps to the head instead of catching up.
const MAX_BLOCK_RANGE = 25;
// Recently read transfers kept for the browsers' next polls.
const RETAIN_MS = 30_000;
const MAX_BUFFER = 2_000;
// The most transfers one response carries. Busy tokens move far more per poll
// than the tank can show, so a response is a random sample of them.
const MAX_RESULTS = 15;
const RPC_TIMEOUT_MS = 10_000;
// Pinax RPC's JSON-RPC error code for a missing or invalid key.
const UNAUTHENTICATED = -32099;

export interface FeedTransfer {
    id: string;
    txid: string;
    blockNumber: number;
    from: string;
    to: string;
    value: string;
}

interface Buffered {
    readAt: number;
    transfer: FeedTransfer;
}

interface RpcLog {
    blockNumber: string;
    transactionHash: string;
    logIndex: string;
    topics: string[];
    data: string;
    removed?: boolean;
}

export class RpcError extends Error {
    constructor(message: string, readonly code?: number) {
        super(message);
        this.name = "RpcError";
    }
}

// Error messages name the method and the code only: the URL holds the key.
async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
    let res: Response;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
            cache: "no-store",
            signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
        });
    } catch (err) {
        throw new RpcError(`RPC ${method} failed: ${err instanceof Error ? err.name : "error"}`);
    }
    if (!res.ok) throw new RpcError(`RPC ${method} HTTP ${res.status}`);
    const json = (await res.json()) as { result?: T; error?: { code: number; message: string } };
    if (json.error) throw new RpcError(`RPC ${method} error ${json.error.code}`, json.error.code);
    if (json.result === undefined) throw new RpcError(`RPC ${method} returned no result`);
    return json.result;
}

const rpcUrl = (chain: string, key: string) =>
    `https://${CHAIN_META[chain].rpc}.rpc.pinax.network/v1/${encodeURIComponent(key)}/`;

// The chain head, shared by every token of the chain and read at most once per REFRESH_MS.
const heads = new Map<string, { at: number; value: Promise<number> }>();

function getHead(chain: string, key: string): Promise<number> {
    const cached = heads.get(chain);
    if (cached && Date.now() - cached.at < REFRESH_MS) return cached.value;
    const value = rpc<string>(rpcUrl(chain, key), "eth_blockNumber", []).then((hex) => parseInt(hex, 16));
    heads.set(chain, { at: Date.now(), value });
    // A failed read isn't cached: the next request tries again.
    value.catch(() => heads.delete(chain));
    return value;
}

// tsconfig targets ES2017, which has no bigint literals (0n): hence BigInt(0).
const ZERO = BigInt(0);

export function formatUnits(raw: bigint, decimals: number): string {
    const base = BigInt(10) ** BigInt(decimals);
    const whole = raw / base;
    const fraction = raw % base;
    if (fraction === ZERO) return whole.toString();
    return `${whole}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}

// An ERC-20 Transfer has from and to as topics 1 and 2 and the amount as data.
// ERC-721 uses the same signature with the token ID as a fourth topic: skipped.
export function decodeTransfer(log: RpcLog, decimals: number): FeedTransfer | null {
    if (log.removed || log.topics.length !== 3 || log.topics[0]?.toLowerCase() !== TRANSFER_TOPIC) return null;
    if (!/^0x[0-9a-fA-F]{64}/.test(log.data)) return null;
    const raw = BigInt(log.data.slice(0, 66));
    if (raw === ZERO) return null;
    const logIndex = parseInt(log.logIndex, 16);
    return {
        id: `${log.transactionHash}-${logIndex}`,
        txid: log.transactionHash,
        blockNumber: parseInt(log.blockNumber, 16),
        from: `0x${log.topics[1].slice(26)}`,
        to: `0x${log.topics[2].slice(26)}`,
        value: formatUnits(raw, decimals),
    };
}

function sample<T>(items: T[], n: number): T[] {
    if (items.length <= n) return items;
    const picked = items.map((item, i) => ({ item, i }));
    for (let i = 0; i < n; i++) {
        const j = i + Math.floor(Math.random() * (picked.length - i));
        [picked[i], picked[j]] = [picked[j], picked[i]];
    }
    // Back in chain order, so fish arrive in the order they moved.
    return picked.slice(0, n).sort((a, b) => a.i - b.i).map(({ item }) => item);
}

class TransferFeed {
    // The last block read; null until the first successful refresh.
    head: number | null = null;
    private buffer: Buffered[] = [];
    private refreshedAt = 0;
    private refreshing: Promise<void> | null = null;

    constructor(private chain: string, private token: TokenOption) {}

    refresh(key: string): Promise<void> {
        if (this.refreshing) return this.refreshing;
        if (Date.now() - this.refreshedAt < REFRESH_MS) return Promise.resolve();
        this.refreshing = this.read(key).finally(() => {
            this.refreshedAt = Date.now();
            this.refreshing = null;
        });
        return this.refreshing;
    }

    private async read(key: string) {
        const latest = await getHead(this.chain, key);
        if (this.head !== null && latest <= this.head) return;

        let from: number;
        if (this.head === null || latest - this.head > MAX_BLOCK_RANGE) {
            from = Math.max(0, latest - COLD_START_BLOCKS + 1);
            this.buffer = [];
        } else {
            from = this.head + 1;
        }

        const logs = await this.getLogs(key, from, latest);
        const now = Date.now();
        for (const log of logs) {
            const transfer = decodeTransfer(log, this.token.decimals);
            if (transfer) this.buffer.push({ readAt: now, transfer });
        }
        this.head = latest;
        this.buffer = this.buffer.filter(({ readAt }) => now - readAt < RETAIN_MS).slice(-MAX_BUFFER);
    }

    // A provider may refuse a range with too many logs; then read the newest half, twice at most.
    private async getLogs(key: string, from: number, to: number): Promise<RpcLog[]> {
        for (let attempt = 0; ; attempt++) {
            try {
                return await rpc<RpcLog[]>(rpcUrl(this.chain, key), "eth_getLogs", [{
                    fromBlock: `0x${from.toString(16)}`,
                    toBlock: `0x${to.toString(16)}`,
                    address: this.token.contract,
                    topics: [TRANSFER_TOPIC],
                }]);
            } catch (err) {
                // Only a JSON-RPC error can be about the range; -32099 is a rejected key.
                if (attempt >= 2 || from >= to || !(err instanceof RpcError) || err.code === undefined || err.code === UNAUTHENTICATED) throw err;
                from = to - Math.floor((to - from) / 2);
            }
        }
    }

    // Transfers in blocks after `since`. A first poll (since null) gets the most recent ones.
    since(since: number | null): FeedTransfer[] {
        const after = since ?? (this.head ?? 0) - COLD_START_BLOCKS;
        return sample(
            this.buffer.map(({ transfer }) => transfer).filter(({ blockNumber }) => blockNumber > after),
            MAX_RESULTS,
        );
    }
}

const feeds = new Map<string, TransferFeed>();

// `token` must come from the allowlist (findTokenOption), which bounds the number of feeds.
export async function getTransfers(chain: string, token: TokenOption, since: number | null, key: string) {
    const id = `${chain}:${token.contract.toLowerCase()}`;
    let feed = feeds.get(id);
    if (!feed) {
        feed = new TransferFeed(chain, token);
        feeds.set(id, feed);
    }
    try {
        await feed.refresh(key);
    } catch (err) {
        // Keep serving what was read before; fail only when there is nothing.
        if (feed.head === null) throw err;
        console.error(`[transfers] ${chain} ${token.symbol}: ${err instanceof Error ? err.message : err}`);
    }
    const head = feed.head ?? 0;
    return {
        transfers: feed.since(since),
        // Never move a browser back: another replica may have read further.
        lastBlock: since === null ? head : Math.max(since, head),
    };
}
