import {Router} from 'express';
import {Instance} from 'express-ws';
import {IncomingMessage, Pixel, ActiveConnections} from '../types';
import crypto from "node:crypto";

const pixels: Pixel[] = [];
const activeConnections: ActiveConnections = {};

const createCanvasRouter = (wsInstance: Instance) => {
    const router = Router();
    wsInstance.applyTo(router);

    router.ws('/', (ws, _req) => {
        const id = crypto.randomUUID();
        activeConnections[id] = ws;
        console.log(`User ${id} connected`);

        ws.send(JSON.stringify({
            type: 'INIT',
            payload: pixels
        }));

        ws.on('message', (message: string) => {
            try {
                const decodedMessage: IncomingMessage = JSON.parse(message);

                if (decodedMessage.type === 'NEW_PIXEL') {
                    const newPixel = decodedMessage.payload as Pixel;

                    pixels.push(newPixel);

                    Object.keys(activeConnections).forEach(connectId => {
                        const connect = activeConnections[connectId];

                        if (connect && connectId != id && connect.readyState === 1) {
                            connect.send(JSON.stringify({
                                type: 'NEW_PIXEL',
                                payload: newPixel
                            }));
                        }
                    });
                }
            } catch (e) {
                console.error(e);
            }
        });

        ws.on('close', () => {
            delete activeConnections[id];
            console.log(`User ${id} disconnected`);
        });
    });

    return router;
};

export default createCanvasRouter;