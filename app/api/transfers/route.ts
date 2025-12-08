import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();
    const {selectedChain, contract, lastBlock} = data;

    try {

        return NextResponse.json({
            transfers: [],
            lastBlock: 0
        })
    } catch (err) {
        console.error("Error fetching transfers:", err);
        return NextResponse.json({ error: 'Error fetching transfers' }, { status: 500 });
    }
}
