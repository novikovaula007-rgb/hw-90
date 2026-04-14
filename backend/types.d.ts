import {WebSocket} from 'ws';

export interface Pixel {
    x: number;
    y: number;
    color: string;
}

export interface IncomingMessage {
    type: 'INIT' | 'NEW_PIXEL';
    payload: Pixel | Pixel[];
}

export interface ActiveConnections {
    [id: string]: WebSocket;
}