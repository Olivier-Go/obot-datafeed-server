import state from "./../state.js";

export const isEmptyObj = (obj) => (
    Object.keys(obj).length === 0
)

export const timeAgo = (timestamp) => (
    (Date.now() - timestamp) / 1000
)

export const twoDigit = (number) => (
    number.toLocaleString('fr-FR', { minimumIntegerDigits: 2, useGrouping: false })
)

export const startTime = () => {
    const today = new Date();
    const date = `${twoDigit(today.getDate())}/${twoDigit(today.getMonth()+1)}/${today.getFullYear()}`;
    const time = `${twoDigit(today.getHours())}:${twoDigit(today.getMinutes())}:${twoDigit(today.getSeconds())}`;
    let since = new Date(timeAgo(state.startTime) * 1000).toISOString();
    const days = new Date(timeAgo(state.startTime) * 1000).toISOString().substring(8, 10);
    const hours = new Date(timeAgo(state.startTime) * 1000).toISOString().substring(11, 19);
    since = `${Number(days) - 1}D-${hours}`
    return {
        date,
        time,
        since
    }
}

export const memoryUsage = () => (
    Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
)

const formatCandle = (symbol, candle) => (
    {
        symbol,
        timecycleMs: parseInt(candle[0]) * 1000,
        timecycleDate: new Date(parseInt(candle[0]) * 1000).toLocaleString('fr-FR'),
        open: candle[1],
        close: candle[2],
        high: candle[3],
        low: candle[4],
        volume: candle[5],
        amount: candle[6]
    }
)

export const updateCandlesArr = (symbol, kline) => {
    const candle = formatCandle(symbol, kline);
    let result = [candle];
    state.candles.map((c) => {
        if (c.timecycleMs !== candle.timecycleMs) {
            result.push(c);
        }
    })
    result.sort((a, b) => parseFloat(b.timecycleMs) - parseFloat(a.timecycleMs));
    if (result.length > 3) result.pop();
    return result;
}

export const calcOhlc = () => {
    let arr = [...state.candles];
    if (arr.length > 1) {
        arr.shift();
        const candle = arr[0];
        return (parseFloat(candle.open) + parseFloat(candle.high) + parseFloat(candle.low) + parseFloat(candle.close)) / 4;
    }
    return null;
}