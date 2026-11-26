# HydroScan

Token transfers as fish in an aquarium. Each fish is one ERC-20 transfer, sized by its amount, read
live from [Pinax RPC](https://app.pinax.network/docs/rpc).

## How it works

The browser polls `POST /api/transfers` every 3 seconds. The server reads the token's `Transfer`
events with `eth_getLogs` from `https://<chain>.rpc.pinax.network/v1/<PINAX_API_KEY>/` and answers
with the decoded transfers of the blocks since the browser's last poll, so the tank fills block by
block. The key stays on the server: responses carry transfers only.

- One feed per token is shared by every visitor of a server process
  ([`lib/transfer-feed.ts`](lib/transfer-feed.ts)): at most one `eth_blockNumber` per chain and one
  `eth_getLogs` per token every 2 seconds, and only while someone is watching. A response carries at
  most 15 transfers (5 a second, as before), a random sample when a busy token moves more.
- The chains and tokens are in [`lib/token-config.ts`](lib/token-config.ts): each chain's Pinax RPC
  host, each token's contract and decimals. The API answers for those only. To add a token, add its
  contract and its `decimals()`; to add a chain, its RPC host (`<host>.rpc.pinax.network`), explorer
  and logo too.
- Native tokens (ETH, BNB, …) aren't shown: a native transfer emits no log.

## Running locally

Requires [Bun](https://bun.com) 1.4.3 or later, and a Pinax API key from
[app.pinax.network](https://app.pinax.network).

```bash
cp .env.example .env.local   # then set PINAX_API_KEY
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

HydroScan runs on Kubernetes (ott-monitor1), from the manifests in
[`k8s-pinax-ui`](https://github.com/pinax-network/k8s-pinax-ui) (`hydroscan/`). Every push to `main`
builds `ghcr.io/pinax-network/hydroscan:<sha7>-<unix-ts>` ([`Dockerfile`](Dockerfile),
[`container.yml`](.github/workflows/container.yml)). Flux proposes the new tag in that repo's
`Deploy to prod` pull request, and merging it deploys. `PINAX_API_KEY` is the Kubernetes Secret
`hydroscan-env`, never a build argument: the image builds without it.
