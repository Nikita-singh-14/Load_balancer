import http from "node:http";

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Upstream 2");
}).listen(9002, () => {
  console.log("Upstream 2 running on http://localhost:9002");
});