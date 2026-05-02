# Grocery Store API Tests

API automation for the [Simple Grocery Store API](https://github.com/vdespa/Postman-Complete-Guide-API-Testing/blob/main/simple-grocery-store-api.md) using Playwright's built-in `request` fixture (no external HTTP libraries).

## What's Tested

| Spec File | Scenarios |
|---|---|
| `gs_status-api.spec.ts` | Health check — verify API returns `200` with `status: "UP"` |
| `gs_products-api.spec.ts` | Product listing, filtering, individual product lookup |
| `gs_e2eFlow-api.spec.ts` | Full E2E: status check, create cart, add product, authorize (Bearer token), place order |

## Key Patterns Demonstrated

- **`test.describe.serial()`** for dependent API calls sharing state (`cartId`, `accessToken`, `orderId`)
- **Bearer token authentication** pattern
- **Status code + response body** assertions
- **Winston logging** for debug-level request/response inspection
- Zero external HTTP dependencies — pure Playwright `APIRequestContext`

## How to Run

```bash
npx playwright test --grep @API --project=chromium
```

**Tag:** `@API`
