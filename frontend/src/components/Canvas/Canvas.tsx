import {useEffect, useRef, useState} from 'react';
import type {Pixel} from "../../../types";
import React from "react";
import "./canvasStyles.css";

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const isDrawingRef = useRef(false);

    const [color, setColor] = useState('#000000');

    const onMouseDown = () => {
        isDrawingRef.current = true;
    };

    const onMouseUp = () => {
        isDrawingRef.current = false;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDrawingRef.current || !socketRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const pixel: Pixel = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
            color: color
        };

        drawCircle(pixel);

        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'NEW_PIXEL',
                payload: pixel
            }));
        }
    };

    const drawCircle = (pixel: Pixel) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = pixel.color;
        ctx.beginPath();
        ctx.arc(pixel.x, pixel.y, 5, 0, Math.PI * 2);
        ctx.fill();
    };

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8008/draw');
        socketRef.current = socket;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'INIT') {
                data.payload.forEach((pixel: Pixel) => {
                    drawCircle(pixel);
                })
            } else if (data.type === 'NEW_PIXEL') {
                drawCircle(data.payload);
            }
        };

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, []);

    return (
        <div className='container'>
            <div>
                <label style={{marginRight: '10px'}}>Color</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>

            <canvas
                className='canvas'
                ref={canvasRef}
                width={800}
                height={600}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onMouseMove={onMouseMove}
            />
        </div>
    );
};

export default Canvas;