import {EVMChains, SVMChains, TokenAPI, TVMChains} from "@pinax/token-api";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();

    const {selectedChain, contract} = data;

    if(selectedChain === SVMChains.Solana && !contract) {
        return NextResponse.json({supply: 615_340_000});
    }

    if(selectedChain === SVMChains.Solana) {
        return NextResponse.json({supply: 11_582_837_136});
    }

    if(selectedChain === TVMChains.Tron && !contract) {
        return NextResponse.json({supply: 98_670_000_000});
    }

    const client = new TokenAPI({
        apiToken: process.env.TOKEN_API_KEY || ""
    });

    const isEVM = Object.values(EVMChains).includes(selectedChain);
    const isSVM = Object.values(SVMChains).includes(selectedChain);
    const isTVM = Object.values(TVMChains).includes(selectedChain);


    if(!isEVM && !isSVM && !isTVM){
        return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
    }

    try {
        let res: any;
        if (isEVM && !contract) {
            res = await client.evm.tokens.getNativeTokenMetadata({
                network: selectedChain
            });
        } else if (isSVM) {
            res = await client.svm.tokens.getTokenMetadata({
                network: selectedChain,
                mint: contract
            });
        } else if (isTVM) {
            res = await client.tvm.tokens.getTokenMetadata({
                network: selectedChain,
                contract
            });
        } else {
            res = await client.evm.tokens.getTokenMetadata({
                network: selectedChain,
                contract
            });
        }

        if(!res?.data || res.data.length === 0){
            return NextResponse.json({ error: 'Token not found' }, { status: 404 });
        }

        return NextResponse.json({
            supply: res.data[0].total_supply || res.data[0].circulating_supply || null
        })
    } catch (err) {
        console.error("Error fetching transfers:", err);
        return NextResponse.json({ error: 'Error fetching transfers' }, { status: 500 });
    }
}
