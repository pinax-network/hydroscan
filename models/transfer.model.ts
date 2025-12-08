export type FishDirection = 'leftToRight' | 'rightToLeft';

export interface Transfer {
    id:string;
    txid: string;
    from: string;
    to: string;
    value: string;


    // ------------------------------
    // Used for UI rendering only
    randomY: number;
    randomSwimFactor: number;
    randomFrameOffset: number;
    randomColor: number;
    randomEntranceDelay: number;
    randomDirection: FishDirection;
}