# Timer / Clock Control

Demonstrates Playwright's **Clock API** (`page.clock`) for manipulating time in browser tests.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `timer_control.spec.ts` | Install fake clock, fast-forward 2 hours on an online stopwatch, verify time change via OCR |

## Key Patterns Demonstrated

- **`page.clock.install()`** to replace the browser's `Date` and timers
- **`page.clock.fastForward()`** to skip ahead without real-world waiting
- **Tesseract.js OCR** to read canvas-rendered time (no DOM text available)
- **iFrame handling** with `page.frameLocator()`

## How to Run

```bash
npx playwright test tests/timer_control/ --project=chromium --headed
```

**Tag:** `@UI`
