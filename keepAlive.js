const http = require("http");

const PORT = process.env.PORT || 8080 ;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Anti-Nuke bot is alive!");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[INFO] Keep-alive server listening on port ${PORT}`);
});

module.exports = server;
