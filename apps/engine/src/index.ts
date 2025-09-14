import {createClient} from 'redis';
import { getData } from './getData/getData.js';
const redisClient = createClient({
    url: "redis://localhost:6389"
});

try{
    await redisClient.connect();
}catch(e){
    console.log(`Some error ocurred while connecting to the redis client: ${e}`);
};

type Rates = {
    BTC: {
        price: number,
        decimal: number
    },
    ETH: {
        price: number,
        decimal: number
    },
    SOL: {
        price: number,
        decimal: number
    }
};

let PRICES: Rates = {
    BTC: {
        price: 0,
        decimal: 0
    },
    ETH: {
        price: 0,
        decimal: 0
    },
    SOL: {
        price: 0,
        decimal: 0
    }
};

//updates every 100 miliseconds, to the latest price obtained from the poller
setInterval(async ()=>{
	PRICES=await getData()
}, 100);



