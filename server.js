'use strict';
// Single entry point for Hostinger shared hosting.
// Starts Express API (internal port 4000) + Next.js (internal port 3001),
// then proxies all traffic through Hostinger's assigned PORT.

const http = require('http');
const net  = require('net');
const { spawn }    = require('child_process');
const { execSync } = require('child_process');
const path = require('path');

const PROXY_PORT = parseInt(process.env.PORT) || 3000;
const API_PORT   = 4000;
const WEB_PORT   = 3001;

// ── Sync DB schema before anything starts ───────────────────────────────────
try {
  console.log('[cykle] Syncing database schema...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'apps', 'api'),
    env: { ...process.env },
  });
} catch (e) {
  console.warn('[cykle] prisma db push failed (continuing):', e.message);
}

// ── Start child processes ────────────────────────────────────────────────────
const apiProc = spawn('node', ['dist/index.js'], {
  env:   { ...process.env, PORT: String(API_PORT) },
  stdio: 'inherit',
  cwd:   path.join(__dirname, 'apps', 'api'),
});

const nextBin = path.join(__dirname, 'apps', 'web', 'node_modules', '.bin', 'next');
const webProc = spawn('node', [nextBin, 'start', '-p', String(WEB_PORT)], {
  env:   { ...process.env, PORT: String(WEB_PORT) },
  stdio: 'inherit',
  cwd:   path.join(__dirname, 'apps', 'web'),
});

apiProc.on('error', err => { console.error('[api]', err.message); });
webProc.on('error', err => { console.error('[web]', err.message); });
apiProc.on('exit', code => { if (code !== 0) console.error(`[api] exited with code ${code}`); });
webProc.on('exit', code => { if (code !== 0) console.error(`[web] exited with code ${code}`); });

// ── Minimal HTTP proxy (no extra dependencies) ───────────────────────────────
function proxyReq(req, res, targetPort) {
  const options = {
    hostname: '127.0.0.1',
    port:     targetPort,
    path:     req.url,
    method:   req.method,
    headers:  { ...req.headers, host: `127.0.0.1:${targetPort}` },
  };
  const proxyRequest = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxyRequest.on('error', err => {
    console.error('[proxy]', err.message);
    if (!res.headersSent) { res.writeHead(502); res.end('Service unavailable'); }
  });
  req.pipe(proxyRequest, { end: true });
}

const server = http.createServer((req, res) => {
  const target = req.url.startsWith('/api') ? API_PORT : WEB_PORT;
  proxyReq(req, res, target);
});

// WebSocket upgrade for Next.js
server.on('upgrade', (req, socket, head) => {
  const target = new net.Socket();
  target.connect(WEB_PORT, '127.0.0.1', () => {
    target.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n'
    );
    target.write(head);
    socket.pipe(target).pipe(socket);
  });
  target.on('error', () => socket.destroy());
});

server.listen(PROXY_PORT, () => {
  console.log(`[cykle] Proxy on :${PROXY_PORT}  →  API :${API_PORT}  |  Web :${WEB_PORT}`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = () => {
  apiProc.kill('SIGTERM');
  webProc.kill('SIGTERM');
  server.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
