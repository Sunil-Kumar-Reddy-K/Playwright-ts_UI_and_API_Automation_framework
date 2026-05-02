# API Mocking / Route Interception

Demonstrates Playwright's `page.route()` API for intercepting and modifying network responses at runtime.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `dynamicContent_APImocking.spec.ts` | Intercept a movie page response, modify the score from 87% to 100%, verify the mocked content renders |

## Key Patterns Demonstrated

- **`page.route()`** to intercept HTTP responses
- **`route.fetch()`** to get the original response before modification
- **`route.fulfill()`** to serve modified content back to the browser
- Modifying HTML response body (text replacement)
- Asserting on dynamically mocked UI content

## How to Run

```bash
npx playwright test tests/api_mocking/ --project=chromium --headed
```

**Tag:** `@UI`
