import ReconnectingWebSocket from "reconnecting-websocket";
import WS from "ws";
import { updateOB, existingOrder } from "../utils/functions.js";
import { debug } from "./../utils/functions.js";

const openWebSocket = (url) => (
    new Promise((resolve, reject) => {
        const connection = new ReconnectingWebSocket(url, undefined, {
            WebSocket: WS,
            connectionTimeout: 4000,
            debug: false,
            maxReconnectionDelay: 10000,
            maxRetries: Infinity,
            minReconnectionDelay: 4000
        })

        connection.onopen = () => resolve(connection);
        connection.onerror = (err) => reject(err);
    })
)

const ping = () => {
    return JSON.stringify({
        id: Date.now(),
        type: 'ping',
        response: true
    })
}

const subscribe = (topic, symbol, type = null) => {
    return JSON.stringify({
        id: Date.now(),
        type: 'subscribe',
        topic: `${topic}${symbol}${type ? `_${type}` : ''}`,
        response: true
    })
}

export const open = async (endpoint, symbol, type, candlesCB, l2updateCB, state) => {
    let ask = {};
    let bid = {};
    const w = await openWebSocket(endpoint);

    w.onmessage = (msg) => {
        let msg_data = JSON.parse(msg.data);

        if (msg_data.type === "welcome") {
            state('Connected');
            setInterval(() => {
                w.send(ping());
            }, 20000)
            w.send(subscribe("/market/candles:", symbol, type));
            w.send(subscribe("/spotMarket/level2Depth5:", symbol));
        }

        if (msg_data.type === "message") {
            if (msg_data.subject.includes('candles')) {
                candlesCB(msg_data.data);
            }
            if (msg_data.subject.includes('level2')) {
                const { asks, bids } = msg_data.data;
                ask = updateOB(asks);
                bid = updateOB(bids);
                const orderbook = { ask, bid, timestamp: msg_data.data.timestamp};
                if (!existingOrder(orderbook)) {
                    l2updateCB(orderbook);
                }
            }
        }
    }

    return () => {
        w.close(1000, "Close handle was called", { keepClosed: true });
        state('Disconnected');
    }
}