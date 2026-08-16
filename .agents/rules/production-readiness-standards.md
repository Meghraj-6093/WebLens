---
trigger: always_on
description: Strict verification and audit standards for production readiness evaluations
---

# Production Readiness & Audit Verification Standards

When conducting architectural reviews, end-to-end audits, or assessing whether a software project is "Ready for Production":

### 1. Distinction Between Local Verification & Production Readiness
- **Local Application Health**: Confirms code compiles, business logic functions, and unit/integration tests pass on loopback.
- **Production Infrastructure Readiness**: Requires explicit verification across:
  1. **Hostile Attack Hardening**: Defense against IPv6-mapped addresses (`::ffff:...`), cloud metadata endpoints (`169.254.169.254`, `100.100.100.200`, `fd00:ec2::...`), non-standard port scans, and auth token tampering/replay.
  2. **Worker Concurrency & OOM Safety**: Semaphore/queue throttling to prevent unbounded sub-process (e.g., headless browser) spawns and runaway memory leaks.
  3. **Real-World Live Testing**: Verification against actual diverse public web architectures (e.g., SPAs, dynamic CDNs, legacy sites) rather than purely controlled local test fixtures.
  4. **Security Headers & Secrets**: Verification of HTTP protection headers (`X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, strict CORS) and secret hygiene.
  5. **Observability & Diagnostics**: Deep health endpoints reporting memory RSS, queue depths, error logs, and failure categorization.

### 2. Verdict Standards
- Never claim "Ready for Production" based solely on green unit/mock tests.
- Clearly differentiate **"Implementation Complete (Local Tests Passing)"** vs. **"Production Infrastructure Verified"**.
