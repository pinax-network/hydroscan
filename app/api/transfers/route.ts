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

    const limit = 10;
    const baseParams: any = {
        network: selectedChain,
        limit,
        contract: contract === "" ? undefined : contract,
        lastBlock
    };

    try {
        const vm = (() => {
            if (isEVM) return 'evm';
            if (isSVM) return 'svm';
            if (isTVM) return 'tvm';
            return null;
        })();
        if(!vm){
            return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
        }

        const allData: any[] = [];

        for (let page = 1; page <= MAX_PAGES; page++) {
            const params = { ...baseParams, page };
            const res: any = await client[vm].tokens.getTransfers(params);

            const pageData = res?.data || [];
            allData.push(...pageData);

            if (pageData.length < limit) {
                break;
            }

            if (allData.length >= MAX_RESULTS) {
                break;
            }
        }

        let filtered = contract === "" ? allData.filter((item: {contract?: string, mint?: string}) => {
            if(item.contract){
                return item.contract.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
            }
            if(item.mint){
                return item.mint === "So11111111111111111111111111111111111111111";
            }

            return false;
        }) : allData;

        filtered = filtered.filter(x => x.value && parseFloat(x.value) > 0);

        const makeId = (item: any) => {
            if(isSVM) return `${item.source}-${item.destination}-${item.value}-${item.block_num}-${item.signature}`;
            return `${item.from}-${item.to}-${item.value}-${item.log_index}-${item.transaction_id}`;
        }

        const list = filtered.map((item: any) => ({
            id: makeId(item),
            txid: item.transaction_id || item.signature,
            blockNumber: item.block_num,
            from: item.from || item.source,
            to: item.to || item.destination,
            value: item.value,
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
