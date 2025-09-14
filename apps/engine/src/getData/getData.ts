import {createClient} from 'redis';
const redisClient = await createClient({
    url: "redis://localhost:6379"
});

try{
    await redisClient.connect();
}catch(e){
    console.log(`Some error ocurred while connecting to redis client: ${e}`);
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
const getData = async ()=>{
    try{
        PRICES = await getData100();
    }catch(e){
        console.log(`Some error ocurred while getting data: ${e}`);
    }
    return(PRICES);
};

const getData100 = async ()=>{
    const localPrices: Rates = {
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
    }
    const data = await redisClient.xRange('stream','-','+',{COUNT: 2});
    //@ts-ignore
    localPrices.BTC.price = JSON.parse(data[0].message.data.toString()).price_updates[0].price;
    //@ts-ignore
    localPrices.BTC.decimal = JSON.parse(data[0].message.data.toString()).price_updates[0].decimal;
    //@ts-ignore
    localPrices.ETH.price = JSON.parse(data[0].message.data.toString()).price_updates[1].price;
    //@ts-ignore
    localPrices.ETH.decimal = JSON.parse(data[0].message.data.toString()).price_updates[1].decimal;
    //@ts-ignore
    localPrices.SOL.price = JSON.parse(data[0].message.data.toString()).price_updates[2].price;
    //@ts-ignore
    localPrices.SOL.decimal = JSON.parse(data[0].message.data.toString()).price_updates[2].decimal;
    return localPrices;
}
export {getData};