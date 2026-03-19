import {EVMChains, SVMChains, TokenAPI, TVMChains} from "@pinax/token-api";
import { NextResponse } from 'next/server';

const MAX_PAGES = 20;
const MAX_RESULTS = 50;

export async function POST(request: Request) {
    const data = await request.json();
    const {selectedChain, contract, lastBlock} = data;

    const client = new TokenAPI({
        apiToken: process.env.TOKEN_API_KEY || ""
    });

    const isEVM = Object.values(EVMChains).includes(selectedChain);
    const isSVM = Object.values(SVMChains).includes(selectedChain);
    const isTVM = Object.values(TVMChains).includes(selectedChain);
    const isNative = contract === "";

    const limit = 10;
    const baseParams: any = {
        network: selectedChain,
        limit,
        start_block: lastBlock === null ? undefined : lastBlock + 1,
    };

    if (isSVM && !isNative) {
        baseParams.mint = contract;
    }

    if (!isSVM && !isNative) {
        baseParams.contract = contract;
    }

    try {
        if(!isEVM && !isSVM && !isTVM){
            return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
        }

        const allData: any[] = [];

        for (let page = 1; page <= MAX_PAGES; page++) {
            const params = { ...baseParams, page };
            let res: any;
            if (isNative && isEVM) {
                res = await client.evm.tokens.getNativeTransfers(params);
            } else if (isNative && isTVM) {
                res = await client.tvm.tokens.getNativeTransfers(params);
            } else if (isEVM) {
                res = await client.evm.tokens.getTransfers(params);
            } else if (isSVM) {
                res = await client.svm.tokens.getTransfers(params);
            } else {
                res = await client.tvm.tokens.getTransfers(params);
            }

            const pageData = res?.data || [];
            allData.push(...pageData);

            if (pageData.length < limit) {
                break;
            }

            if (allData.length >= MAX_RESULTS) {
                break;
            }
        }

        let filtered = isNative && isSVM ? allData.filter((item: {contract?: string, mint?: string}) => {
            if(item.contract){
                return item.contract.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
            }
            if(item.mint){
                return item.mint === "So11111111111111111111111111111111111111111";
            }

            return false;
        }) : allData;

        filtered = filtered.filter((item) => {
            const amount = item.value ?? item.amount;
            return amount !== null && amount !== undefined && Number(amount) > 0;
        });

        const makeId = (item: any) => {
            const txid = item.transaction_id || item.signature;
            return `${item.from || item.source}-${item.to || item.destination}-${item.value || item.amount}-${item.block_num}-${txid}`;
        }

        const list = filtered.map((item: any) => ({
            id: makeId(item),
            txid: item.transaction_id || item.signature,
            blockNumber: item.block_num,
            from: item.from || item.source,
            to: item.to || item.destination,
            value: String(item.value ?? item.amount ?? 0),
        }));

        const maxBlockNumber = list.length
            ? Math.max(...list.map(item => item.blockNumber)) 
            : lastBlock;

        return NextResponse.json({
            transfers: list,
            lastBlock: maxBlockNumber
        })
    } catch (err) {
        console.error("Error fetching transfers:", err);
        return NextResponse.json({ error: 'Error fetching transfers' }, { status: 500 });
    }
}
