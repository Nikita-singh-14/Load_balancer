import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const client = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.RESID_PORT),
    password: process.env.REDIS_PASSWORD,
    db: 0,
});

client.on("connect", () => console.log("Connecting to Redis..."));
client.on("ready", () => console.log("Redis is ready!"));
client.on("error", (err) => console.log("Redis Error:", err));
client.on("close", () => console.log("Redis connection closed"));

export default client;




