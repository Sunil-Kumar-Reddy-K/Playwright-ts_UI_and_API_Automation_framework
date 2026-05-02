# Playwright Fixtures Learning

Side-by-side comparison of two approaches to using Playwright fixtures — demonstrates understanding of the fixture system.

## What's Tested

| Spec File | Approach |
|---|---|
| `mastering-fixtures-traditional.spec.ts` | **Traditional:** Manually instantiate page objects in `beforeEach` hooks |
| `mastering-fixtures-inside.spec.ts` | **Fixture-based:** Extend `test` with custom fixtures, auto-inject page objects |

## Key Patterns Demonstrated

- **`base.extend<T>()`** to create custom fixtures
- **Dependency injection** via fixture parameters vs. manual setup
- **TodoMVC** app as the test target (`pages/todomvc/todo.page.ts`)
- Trade-offs: fixture approach reduces boilerplate and improves test isolation
