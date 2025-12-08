import {EVMChains, SVMChains, TokenAPI, TVMChains} from "@pinax/token-api";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();

    const {selectedChain, contract} = data;

    // no native supply from Pinax yet
    if(!contract){
        switch(selectedChain){
            // hardcode known supplies for each
            case EVMChains.Ethereum:
            case EVMChains.Unichain:
                return NextResponse.json({supply: 120_000_000});
            case EVMChains.BSC:
                return NextResponse.json({supply: 137_000_000});
            case EVMChains.Polygon:
                return NextResponse.json({supply: 10_540_000_000});
            case EVMChains.Base:
                return NextResponse.json({supply: 961_000_000_000});
            case EVMChains.Avalanche:
                return NextResponse.json({supply: 460_000_000});
            case EVMChains.ArbitrumOne:
                return NextResponse.json({supply: 10_000_000_000});
            case EVMChains.Optimism:
                return NextResponse.json({supply: 4_290_000_000});
            case SVMChains.Solana:
                return NextResponse.json({supply: 615_340_000});
            case TVMChains.Tron:
                return NextResponse.json({supply: 98_670_000_000});
        }

    }

    if(selectedChain == SVMChains.Solana) {
        // only USDC support, return max supply
        return NextResponse.json({supply: 11_582_837_136});
    }

    const client = new TokenAPI({
        apiToken: process.env.TOKEN_API_KEY || ""
    });

    const isEVM = Object.values(EVMChains).includes(selectedChain);
    const isSVM = Object.values(SVMChains).includes(selectedChain);
    const isTVM = Object.values(TVMChains).includes(selectedChain);


    const params:any = {
        network: selectedChain,
        limit: 10,
    };

    if(isSVM){
        params.mint = contract === "" ? undefined : contract;
    } else {
        params.contract = contract === "" ? undefined : contract;
    }

    const vm = (() => {
        if (isEVM) return 'evm';
        if (isSVM) return 'svm';
        if (isTVM) return 'tvm';
        return null;
    })();
    if(!vm){
        return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
    }

    try {

        const res:any = await client[vm].tokens.getTokenMetadata(params);

        if(!res?.data || res.data.length === 0){
            return NextResponse.json({ error: 'Token not found' }, { status: 404 });
        }

        return NextResponse.json({
            supply: res.data[0].total_supply
        })
    } catch (err) {
        console.error("Error fetching transfers:", err);
        return NextResponse.json({ error: 'Error fetching transfers' }, { status: 500 });
    }
}
