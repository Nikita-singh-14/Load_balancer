import cluster, { Worker } from "node:cluster";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import crypto from "node:crypto";

import { rootConfigSchema, type ConfigSchemaType } from "./schema/configSchema.js";
import {
  workerMessageSchema,
  workerMessageReplySchema,
  type WorkerMessageType,
  type WorkerMessageReplyType,
} from "./schema/serverSchema.js";

interface CreateServerConfig {
  port: number;
  workerCount: number;
  config: ConfigSchemaType;
}

export async function createServer(configInput: CreateServerConfig) {
  const { workerCount, port } = configInput;
  const WORKER_POOL: Worker[] = [];


  if (cluster.isPrimary) {
    console.log("Master process started");

    for (let i = 0; i < workerCount; i++) {
      const worker = cluster.fork({
        config: JSON.stringify(configInput.config),
      });
      WORKER_POOL.push(worker);
      console.log(`Worker ${i} started`);
    }

    const server = http.createServer((req, res) => {
      const worker =
        WORKER_POOL[Math.floor(Math.random() * WORKER_POOL.length)];

      if (!worker) {
        res.writeHead(500);
        return res.end("No worker available");
      }

      const requestId = crypto.randomUUID();

      const payload: WorkerMessageType = {
        requestId,
        requestType: "HTTP",
        headers: req.headers,
        body: null,
        url: req.url ?? "/",
      };

      worker.send(JSON.stringify(payload));

      const timeout = setTimeout(() => {
        worker.off("message", onMessage);
        res.writeHead(504);
        res.end("Upstream timeout");
      }, 5000);

      const onMessage = (message: string) => {
        const reply = workerMessageReplySchema.parse(
          JSON.parse(message.toString())
        );

        if (reply.requestId !== requestId) return;

        clearTimeout(timeout);
        worker.off("message", onMessage);

        const status =
          reply.statusCode ??
          (reply.errorCode ? Number(reply.errorCode) : 200);


        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            response: reply.data ?? reply.error,
            handledBy: {
              workerId: reply.workerId,
              pid: reply.pid,
            },
          })
        );
      };

      worker.once("message", onMessage);

    });

    server.listen(port, () => {
      console.log(`Reverse proxy listening on port ${port}`);
    });
  }

  else {
    console.log("Worker process running");

    const config = await rootConfigSchema.parseAsync(
      JSON.parse(process.env.config ?? "{}")
    );

    process.on("message", async (message: string) => {

      const msg = await workerMessageSchema.parseAsync(JSON.parse(message));

      const requestURL = msg.url;
     
      console.log(
        `Worker ${cluster.worker?.id} (PID ${process.pid}) handled ${msg.url} | ${msg.requestId}`
      );


      const rule =
        config.server.rules.find(
          (r) => r.path !== "/" && requestURL.startsWith(r.path)
        ) ??
        config.server.rules.find((r) => r.path === "/");

      if (!rule) {
        return process.send?.(
          JSON.stringify({
            requestId: msg.requestId,
            errorCode: "404",
            error: "Rule not found",
          })
        );
      }

      const upstream = config.server.upstreams.find(
        (u) => u.id === rule.upstreams[0]
      );

      if (!upstream) {
        return process.send?.(
          JSON.stringify({
            requestId: msg.requestId,
            errorCode: "500",
            error: "Upstream not found",
          })
        );
      }

      const target = new URL(upstream.url);
      const client = target.protocol === "https:" ? https : http;


      const headers = { ...msg.headers };
      delete headers.host;
      delete headers.connection;
      delete headers["content-length"];
      delete headers["transfer-encoding"];

      const proxyReq = client.request(
        {
          hostname: target.hostname,
          port: target.port || (target.protocol === "https:" ? 443 : 80),
          path: requestURL,
          method: "GET",
          headers,
        },
        (proxyRes) => {
          let body = "";

          proxyRes.on("data", (chunk) => {
            body += chunk;
          });

          proxyRes.on("end", () => {
            process.send?.(
              JSON.stringify({
                requestId: msg.requestId,
                statusCode: proxyRes.statusCode,
                data: body,
                workerId: cluster.worker?.id,
                pid: process.pid,
              })
            );
          });
        }
      );

      proxyReq.on("error", (err) => {
        process.send?.(
          JSON.stringify({
            requestId: msg.requestId,
            errorCode: "502",
            error: err.message,
          })
        );
      });

      proxyReq.setTimeout(5000, () => {
        proxyReq.destroy();
      });

      proxyReq.end();
    });
  }
}