import { NextResponse } from "next/server";
import { findTokenOption } from "@/lib/token-config";
import { getTransfers } from "@/lib/transfer-feed";

export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

// POST { selectedChain, contract, lastBlock } -> { transfers, lastBlock }
//
// The browser polls this every few seconds. The server reads Pinax RPC with
// PINAX_API_KEY, which stays on the server: responses carry decoded transfers
// only, never an RPC URL. Only the chains and tokens of lib/token-config.ts
// are accepted, so a request can't make the server query anything else.
export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const { selectedChain, contract, lastBlock } = body ?? {};

    const token = typeof selectedChain === "string" && typeof contract === "string"
        ? findTokenOption(selectedChain, contract)
        : null;
    if (!token) {
        return NextResponse.json({ error: "Unsupported chain or token" }, { status: 400, headers: NO_STORE });
    }
    const since = Number.isSafeInteger(lastBlock) && lastBlock >= 0 ? (lastBlock as number) : null;

    // Read per request, never at module scope: the image is built without secrets.
    const key = process.env.PINAX_API_KEY;
    if (!key) {
        console.error("[transfers] PINAX_API_KEY is not set");
        return NextResponse.json({ error: "Transfers are not configured" }, { status: 503, headers: NO_STORE });
    }

    try {
        return NextResponse.json(await getTransfers(selectedChain, token, since, key), { headers: NO_STORE });
    } catch (err) {
        // Details stay in the server log; the message names the RPC method and code, never the URL.
        console.error(`[transfers] ${selectedChain} ${token.symbol}: ${err instanceof Error ? err.message : err}`);
        return NextResponse.json({ error: "Upstream RPC request failed" }, { status: 502, headers: NO_STORE });
    }
}
