## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

opencode --port 44315
All done. Here's the summary:
Changes to backend/src/server.js
Change Before After
Duplicate dotenv import import "dotenv/config" + import dotenv; dotenv.config() Single import "dotenv/config"
Shutdown order Redis → HTTP → MongoDB Socket.IO → HTTP → Redis → MongoDB
Socket.IO cleanup Not closed during shutdown io.close() added as step 1
Mongoose API (already correct)
Line 99: await mongoose.connection.close() — this is the current async API for Mongoose 9.x. The deprecated pattern was mongoose.disconnect(callback) or the callback overload connection.close(cb). No change needed.
Shutdown sequence (clean, ordered by dependency)

1. Socket.IO — disconnects WebSocket clients
2. HTTP server — stops accepting connections, drains in-flight requests
3. Redis — optional; no-op if never connected (local dev safe)
4. MongoDB — mongoose.connection.close() (async, no callback)
5. Force-exit timer at 10s as safety net
   Verification results
   Check Result
   npm test 12 suites, 50 tests passed
   npm audit 0 vulnerabilities
   node --check (all source files) All pass, zero syntax errors
   npm run dev startup Clean — MongoDB connected, Redis optional fallback works, server listening
   Graceful shutdown logic All 4 resources close in correct order; process.exit(0) after cleanup
   Note: process.kill() on Windows calls TerminateProcess which bypasses Node.js signal handlers — this is a Windows OS limitation, not a code bug. On Linux/Docker/Kubernetes (production), SIGTERM/SIGINT handlers fire correctly.


opencode -s ses_fa9da9a9cffe03VY7hYVrcPn5O

opencode -s ses_f888c9caeffehYIZM4Ts6JHGc4