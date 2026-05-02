# Playwright v1.59 New Features

Hands-on exploration of features introduced in Playwright v1.59 — each subfolder is a self-contained learning module with inline comments explaining the concept.

## Modules

| Module | Spec File | Feature |
|---|---|---|
| 01 | `01_screencast_api/screencast-api.spec.ts` | Screencast API for recording browser sessions |
| 02 | `02_browser_binding/browser-binding.spec.ts` | Browser bindings for exposing Node.js functions to the browser |
| 03 | `03_observability_dashboard/observability-dashboard.spec.ts` | Built-in observability and test dashboard |
| 04 | `04_cli_debugger/cli-debugger.spec.ts` | Enhanced CLI debugging capabilities |
| 05 | `05_cli_trace_analysis/cli-trace-analysis.spec.ts` | CLI-based trace file analysis |
| 06 | `06_async_disposables/async-disposables.spec.ts` | Async disposable patterns for resource cleanup |

## How to Run

```bash
# Run all v1.59 feature tests
npx playwright test tests/playwright_v1.59_features/ --project=chromium

# Run a specific module
npx playwright test tests/playwright_v1.59_features/01_screencast_api/ --project=chromium
```
