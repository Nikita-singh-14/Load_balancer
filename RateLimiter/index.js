const express = require('express');
const ip = require('ip');
const {hideIp} = require('./helpers/helper')
const redis = require('./helpers/redis')

const MAX_ALLOWED_REQ = 5;
const MAX_TIME = 10;

//let ip_mapping = {};

const app = express();

//setInterval(() => {
    //ip_mapping = {};
    //console.log("ip mapping cleared");
//}, MAX_TIME);

app.use(async(req, res, next) => {
    const my_ip = hideIp(req.ip);

    //increment out ip request
    const request = await redis.incr(my_ip);
    //ip_mapping[my_ip] = ip_mapping[my_ip] + 1 || 1;

    if (request === 1){
        await redis.expire(my_ip, MAX_TIME);
    }

    //console.log(`recieved request no ${ip_mapping[my_ip]} from ${my_ip}`);

    if(request > MAX_ALLOWED_REQ){
        return res.status(429).json({message: "too many requests"});
    }
    //if (ip_mapping[my_ip] > MAX_ALLOWED_REQ){
        //console.error('Too many requests');
        //return res.status(429).send("too many requests");
    //}

    next();
})

app.get('/', (req, res) => {
    console.log("received a request");
    res.status(200).send("ok");
})

app.listen(8000, ()=> console.log('running on port 8000'));