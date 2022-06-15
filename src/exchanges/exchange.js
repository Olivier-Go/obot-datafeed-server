import Kucoin from "./Kucoin.js";

export const exchange = {
    loadWebsocket: (exchangeName) => {
        switch (exchangeName) {
            case 'KUCOIN':
                return new Kucoin();
            default:
                console.log(`Variable EXCHANGE non definie !`);
                process.exit(1);
        }
    },
}

