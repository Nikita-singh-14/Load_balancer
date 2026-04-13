import http from "node:http";
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from Upstream 1");
}).listen(9001, () => {
    console.log("Upstream 1 running on http://localhost:9001");
});
//# sourceMappingURL=upstream1.js.map