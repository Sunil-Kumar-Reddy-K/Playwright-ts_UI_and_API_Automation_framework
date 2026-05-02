# Shared Libraries

Cross-cutting utilities used across the framework.

## Files

| File | Purpose |
|---|---|
| `cryptoUtils.ts` | AES-256-CBC encryption/decryption for credentials — encrypt secrets at rest, decrypt at runtime |
| `slack_reporter.ts` | Parses test results JSON and generates Slack notification messages for CI/CD pipeline |
