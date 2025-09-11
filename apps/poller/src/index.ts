import {createClient} from 'redis';
import WebSocket from 'ws';
const webSocketUri = new WebSocket("wss://ws.backpack.exchange");
const redisClient = createClient({
    url: "redis://localhost:6379"
});

try{
    await redisClient.connect();
}catch(e){
    console.log(`Some error ocurred while connecting to the redis client: ${e}`);
}

async function getDataWS(){
    let dataCollection: WebSocket.RawData[] = [];
    const subscribeMessage = {
        method: "SUBSCRIBE",
        params: ["bookTicker.ETH_USDC", "bookTicker.SOL_USDC","bookTicker.BTC_USDC"]
    };
    webSocketUri.on('open',()=>{
        webSocketUri.send(JSON.stringify(subscribeMessage));
    });
    webSocketUri.on('message',async (data)=>{
        dataCollection.push(data);
        if(dataCollection.length>=100){
            await collectDataAndSend(dataCollection);
            dataCollection = [];
        }
    })
};

await getDataWS();

type recievedValue = {
    SOL_USDC: {
        asset: "SOL_USDC",
        price: number,
        decimal: number,
    },
    BTC_USDC: {
        asset: "BTC_USDC",
        price: number,
        decimal: number
    },
    ETH_USDC: {
        asset: "ETH_USDC",
        price: number,
        decimal: number
    }
}
async function collectDataAndSend(data: WebSocket.RawData[]){
    let obj: recievedValue = {
        SOL_USDC: {
            asset: "SOL_USDC",
            price: 0,
            decimal: 0
        },
        BTC_USDC: {
            asset: "BTC_USDC",
            price: 0,
            decimal: 0
        },
        ETH_USDC: {
            asset: "ETH_USDC",
            price: 0,
            decimal: 0
        }
    };
    for(let i=data.length-1;i>=60;i--){
        // console.log(JSON.parse(data[i]?.toString()));
        const value = JSON.parse(data[i]?.toString()??" ");
        if(value?.data?.s==="SOL_USDC"){
            obj.SOL_USDC = {
                asset: "SOL_USDC",
                price: Number(Math.trunc(value?.data?.b*10000)),
                decimal: 4
            }
        }
        if(value?.data?.s==="BTC_USDC"){
            obj.BTC_USDC = {
                asset: "BTC_USDC",
                price: Number(Math.trunc(value?.data?.b*10000)),
                decimal: 4
            }
        }
        if(value?.data?.s==="ETH_USDC"){
            obj.ETH_USDC = {
                asset: "ETH_USDC",
                price: Number(Math.trunc(value?.data?.b*10000)),
                decimal: 4
            }
        }
    };
    try{
        setInterval(async ()=>{
            const res = await redisClient.xAdd("stream","*",{
                data: JSON.stringify(obj)
            });
            console.log(res);
        },100)
    }catch(e){
        console.log(`Some error occurred while sending stream data on redis: ${e}`);
    }
};

