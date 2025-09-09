import WebSocket from "ws";
const webSocketURL = new WebSocket("wss://ws.backpack.exchange");
async function getWSData(){
    const subscribeMessage = {
        method: "SUBSCRIBE",
        params: ["bookTicker.ETH_USDC","bookTicker.SOL_USDC","bookTicker.BTC_USDC"]
    };
    webSocketURL.on('open',()=>{
        webSocketURL.send(JSON.stringify(subscribeMessage));
        webSocketURL.on("message",(data)=>{
            console.log(JSON.parse(data.toString()));
        })
    })
};

await getWSData();
//TODO: Have to send the latest amount of all the three coins between a duration of 100ms over Redis stream to engine
