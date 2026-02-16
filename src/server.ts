import { type ConfigSchemaType, rootConfigSchema } from "./configSchema.js";
import cluster, { Worker } from "node:cluster";
import http from "node:http";
import { workerMessageSchema, type WorkerMessageType } from "./serverSchema.js";
import {
  workerMessageReplySchema,
  type WorkerMessageReplyType,
} from "./serverSchema.js";

interface CreateServerConfig {
  port: number;
  workerCount: number;
  config: ConfigSchemaType;
}

export async function createServer(config: CreateServerConfig) {
  const { workerCount, port } = config;
  const WORKER_POOL: Worker[] = [];

  if (cluster.isPrimary) {
    console.log("Master process is up");

    for (let i = 0; i < workerCount; i++) {
      const w = cluster.fork({ config: JSON.stringify(config.config) });
      WORKER_POOL.push(w);
      console.log(`Master Process: Worker Node Spinned ${i}`);
    }

    const server = http.createServer((req, res) => {
      const index = Math.floor(Math.random() * WORKER_POOL.length);
      const worker = WORKER_POOL.at(index);

      if (!worker) throw new Error("Worker not found");

      const payload: WorkerMessageType = {
        requestType: "HTTP",
        headers: req.headers,
        body: null,
        url: `${req.url}`,
      };

      worker.send(JSON.stringify(payload));

      worker.once("message", async (workerReply) => {
        if (res.headersSent) return;

        const reply = await workerMessageReplySchema.parseAsync(
          JSON.parse(workerReply)
        );

        if (reply.errorCode) {
          res.writeHead(Number(reply.errorCode));
          res.end(reply.error);
        } else {
          res.writeHead(200);
          res.end(reply.data);
        }
      });
    });

    server.listen(port, () => {
      console.log(`Reverse Proxy listening on PORT ${port}`);
    });
  } else {
    console.log("Worker Node");

    const config = await rootConfigSchema.parseAsync(
      JSON.parse(`${process.env.config}`)
    );

    process.on("message", async (message: string) => {
      const messageValidated = await workerMessageSchema.parseAsync(
        JSON.parse(message)
      );

      const requestURL = messageValidated.url;
      const rule = config.server.rules.find((e) => {
        // If path is "/", match everything
        if (e.path === "/") {
          return /^\/.*$/.test(requestURL);
        }

        // Otherwise match exact path or subpaths
        const regex = new RegExp(`^${e.path}(\/.*)?$`);
        return regex.test(requestURL);
      });

      if (!rule) {
        const reply: WorkerMessageReplyType = {
          errorCode: "404",
          error: "Rule not found",
        };
        return process.send?.(JSON.stringify(reply));
      }

      const upstreamID = rule.upstreams[0];
      const upstream = config.server.upstreams.find(
        (e) => e.id === upstreamID
      );

      if (!upstreamID || !upstream) {
        const reply: WorkerMessageReplyType = {
          errorCode: "500",
          error: "upstream not found",
        };
        return process.send?.(JSON.stringify(reply));
      }

      const request = http.request(
        {
          hostname: upstream?.url,
          path: requestURL,
          method: "GET",
        },
        (proxyRes) => {
          let body = "";

          proxyRes.on("data", (chunk) => {
            body += chunk;
          });

          proxyRes.on("end", () => {
            const reply: WorkerMessageReplyType = {
              data: body,
            };
            process.send?.(JSON.stringify(reply));
          });
        }
      );

      request.end();
    });
  }
}
