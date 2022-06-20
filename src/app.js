import "./utils/env.js";
import {
    startTime,
    memoryUsage,
    updateCandlesArr,
    calcOhlc4,
    calcSMA,
    calcShortMA,
    calcLongMA
} from "./utils/functions.js";
import state from "./state.js";
import { exchange } from "./exchanges/exchange.js";

let exchangeWs;

export const app = {
    init: () => {
        state.startTime = Date.now();
        exchangeWs = exchange.loadWebsocket(process.env.EXCHANGE);
        exchangeWs.onCandles((e) => {
            state.candles = updateCandlesArr(e.symbol, e.candles);
            state.OHLC4 = calcOhlc4(state.candles);
            state.SMA = calcSMA(process.env.SMA_LEN);
            state.LongMA = calcLongMA();
            state.ShortMA = calcShortMA();
        })
    },

    printBanner: () => {
        console.log(`----------------------------------------------------------------------------`);
        const startedTime = startTime();
        console.log(` ${startedTime.date} ${startedTime.time} - Started : ${startedTime.since} - Mem : ${memoryUsage()} MB `);
        console.log(` ${process.env.EXCHANGE} : ${exchangeWs.state}`);
        console.log(`----------------------------------------------------------------------------`);
    },

    printConsole: () => {
        console.clear();
        app.printBanner();
        console.log('candles:', state.candles.length > 0 ? state.candles[0] : state.candles);
        console.log('OHLC4:', state.OHLC4);
        console.log('SMA:', state.SMA);
        console.log('ShortMA:', state.ShortMA);
        console.log('LongMA:', state.LongMA);
    },

    run: () => {
        app.init();
        state.interval = setInterval(app.printConsole, 250);
    }
};

app.run();

