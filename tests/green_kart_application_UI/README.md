# GreenKart UI Tests

End-to-end UI tests for the [GreenKart](https://rahulshettyacademy.com/seleniumPractise/) e-commerce application using the **Page Object Model**.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `gk_basicChecks.spec.ts` | Title verification, product search, multi-tab (popup) handling |
| `gk_happyPath.spec.ts` | Search product, add to cart, checkout, place order |
| `gk_orderMultipleProducts.spec.ts` | Add multiple products, verify cart totals, complete checkout |

## Key Patterns Demonstrated

- **Page Object Model** via `pages/greenkart/` (Homepage, Cart, Offers)
- **Custom fixtures** from `features/steps/basepage.ts`
- **Winston logging** at debug/info levels
- **`test.step()`** for structured reporting
- Multi-tab/popup handling with `page.waitForEvent("popup")`

## How to Run

```bash
npx playwright test tests/green_kart_application_UI/ --project=chromium
# or by tag
npx playwright test --grep @UI --project=chromium
```

**Tag:** `@UI`
