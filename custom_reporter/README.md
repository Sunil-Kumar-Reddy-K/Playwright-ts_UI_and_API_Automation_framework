# Custom Reporters

Custom Playwright reporters implementing the [Reporter API](https://playwright.dev/docs/test-reporters#custom-reporters).

## Files

| File | Purpose |
|---|---|
| `json_reporter.ts` | Generates structured JSON test results for CI/CD consumption |
| `txt_reporter.ts` | Generates human-readable text report output |

## Usage

Configured in `playwright.config.ts`:

```typescript
reporter: [
    ['./custom_reporter/json_reporter.ts'],
    // ['./custom_reporter/txt_reporter.ts'],
]
```
