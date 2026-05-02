# Page Objects (POM)

Page Object Model classes organized by application. Each class encapsulates locators as **private** properties and exposes **public async methods** for test interactions.

## Structure

```
pages/
  greenkart/
    homepage.ts       # Product search, navigation, search icon interactions
    cart.ts           # Cart operations, checkout flow
    offers.ts         # Offers/deals page interactions
  orangehrm/
    orangehrm.page.ts # Login, My Info, dependents management
  riverside/
    riverside.page.ts # Login page with multi-tab/context handling
  todomvc/
    todo.page.ts      # Todo app CRUD operations (used for fixture learning)
```

## Conventions

- Locators: `private` class properties
- Methods: `public async` with descriptive names
- Constructor accepts `Page` or `BrowserContext`
- Uses `@step()` decorator from `features/steps/basepage.ts` for report annotations
- File naming: `<page-name>.page.ts` or `<page-name>.ts`
