import WebSocket from 'ws';
const webSocketUri = new WebSocket("wss://ws.backpack.exchange");
import {createClient} from 'redis';
const redisClient = createClient({
    url: "redis://localhost:6379"
});
try{
    await redisClient.connect();
}catch(e){
    console.log(`Some error ocurred while connecting to the redis client: ${e}`)
}
let newSendObject: DataObject = {
        price_updates: [{
            asset: "BTC",
            price: 0,
            decimal: 0   
        },{
            asset: "ETH",
            price: 0,
            decimal: 0
        },{
            asset: "SOL",
            price: 0,
            decimal: 0
        }]
    }
export default async function dataPush2(){
   
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
        if(dataCollection.length>=70){
            // await collectAndSend(dataCollection);
            await collectAndSend(dataCollection);
            dataCollection = [];
        }
    })
}
type DataObject = {
    price_updates: [{
        asset: "BTC",
        price: number,
        decimal: number
    },{
        asset: "ETH",
        price: number,
        decimal: number
    },{
        asset: "SOL",
        price: number,
        decimal: number
    }]
};
async function collectAndSend(dataCollection: WebSocket.RawData[]){
    let sendObject: DataObject = {
        price_updates: [{
            asset: "BTC",
            price: 0,
            decimal: 0
        },{
            asset: "ETH",
            price: 0,
            decimal: 0
        },{
            asset: "SOL",
            price: 0,
            decimal: 0
        }]
    }
    let collection = dataCollection.reverse();
    collection.forEach((data)=>{
        const recievedObj = JSON.parse(data.toString()).data;
        switch(recievedObj.s){
            case 'BTC_USDC':
                sendObject.price_updates[0].price = Math.trunc(recievedObj.b*10000);
                sendObject.price_updates[0].decimal = 4;
                break;
            case 'ETH_USDC':
                sendObject.price_updates[1].price = Math.trunc(recievedObj.b*10000);
                sendObject.price_updates[1].decimal = 4;
                break;
            case 'SOL_USDC':
                sendObject.price_updates[2].price = Math.trunc(recievedObj.b*10000);
                sendObject.price_updates[2].decimal = 4;
                break;
        }
        if(sendObject.price_updates[0].price!==0 && sendObject.price_updates[1].price!==0 && sendObject.price_updates[2].price!==0){
            newSendObject = sendObject;
            return;
        }
    })
    console.log(newSendObject);
    const sentData = await redisClient.xAdd("stream","*",{
        data: JSON.stringify(newSendObject)
    });
}
