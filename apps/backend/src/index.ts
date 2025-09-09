import express from 'express';
const app = express();
const PORT = 3572;

app.listen(PORT, ()=>{
    console.log(`Listening to PORT ${PORT}`)
});

app.get('/',async (req, res)=>{
    res.send("Hello World");
});
