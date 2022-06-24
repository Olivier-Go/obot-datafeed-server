import './../utils/env.js';
import { open } from './websocket-client.js';
import axios from "axios";

export default class {
    state = 'Disconnected';

    async getPublicWsToken() {
        let url = `${process.env.KUCOIN_API_URL}/api/v1/bullet-public`;
        let result = await axios.post(url, {});
        return result.data;
    }

    async getSocketEndpoint() {
        let response = await this.getPublicWsToken();
        let token = response.data.token;
        let endpoint = response.data.instanceServers[0].endpoint;
        return `${endpoint}?token=${token}&[connectId=${Date.now()}]`;
    }

    async onMessage(candlesCB, l2updateCB) {
        let endpoint = await this.getSocketEndpoint();
        return await open(
            endpoint,
            process.env.KUCOIN_SYMBOL,
            process.env.KUCOIN_TYPE,
            candlesCB,
            l2updateCB,
            (e) => this.state = e
        );
    }
}