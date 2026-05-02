# TodoMVC Test Plan

## Application Overview

The TodoMVC application (React implementation at https://demo.playwright.dev/todomvc/#/) is a classic single-page todo list application. It allows users to create, edit, delete, and filter todo items. Key features include: adding items via an input field, marking items complete or active via checkboxes, editing items via double-click, deleting items via a hover-revealed button, bulk operations (mark all complete, clear completed), three filter views (All / Active / Completed), a live counter for active items, and URL-based routing for filter state. State is persisted via localStorage for the current browser session.

## Test Scenarios

### 1. Adding Todo Items

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add a single todo item

**File:** `tests/todomvc/adding-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page title is 'React • TodoMVC'
    - expect: The heading 'todos' is visible
    - expect: The input placeholder reads 'What needs to be done?'
    - expect: No todo items are listed
    - expect: The footer counter and filter bar are not visible
  2. Click the 'What needs to be done?' input field and type 'Buy groceries'
    - expect: The typed text 'Buy groceries' is visible in the input field
  3. Press Enter to submit
    - expect: The input field is cleared
    - expect: One todo item 'Buy groceries' appears in the list
    - expect: The footer shows '1 item left'
    - expect: The All, Active, Completed filter links are visible
    - expect: The 'Mark all as complete' checkbox is visible

#### 1.2. Add multiple todo items sequentially

**File:** `tests/todomvc/adding-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state with no todos listed
  2. Type 'First task' in the input field and press Enter
    - expect: 'First task' appears as the first item in the list
    - expect: Counter shows '1 item left'
  3. Type 'Second task' in the input field and press Enter
    - expect: 'Second task' appears below 'First task'
    - expect: Counter shows '2 items left'
  4. Type 'Third task' in the input field and press Enter
    - expect: 'Third task' appears at the bottom of the list
    - expect: Counter shows '3 items left'
    - expect: All three items are visible and in the order they were added

#### 1.3. Attempt to add an empty todo item

**File:** `tests/todomvc/adding-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Click the input field and press Enter without typing anything
    - expect: No todo item is added to the list
    - expect: The list remains empty
    - expect: The footer counter and filter bar remain hidden

#### 1.4. Attempt to add a whitespace-only todo item

**File:** `tests/todomvc/adding-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Click the input field, type three or more space characters, and press Enter
    - expect: No todo item is added to the list
    - expect: The list remains empty
    - expect: The input field is cleared or unchanged

#### 1.5. Add a todo item with special HTML characters

**File:** `tests/todomvc/adding-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Type '<script>alert("xss")</script>' in the input field and press Enter
    - expect: The item is added to the list and displayed as literal text: <script>alert("xss")</script>
    - expect: No JavaScript alert dialog appears
    - expect: The script tag is not executed — it is rendered safely as text content

#### 1.6. Add a todo item with a very long text string

**File:** `tests/todomvc/adding-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Type a string of 200+ characters in the input field and press Enter
    - expect: The item is added successfully
    - expect: The full text is preserved and visible in the list item
    - expect: The layout is not broken

### 2. Completing and Toggling Todo Items

**Seed:** `tests/seed.spec.ts`

#### 2.1. Mark a single todo item as complete

**File:** `tests/todomvc/completing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add three todo items: 'Alpha', 'Beta', 'Gamma'
    - expect: All three items are listed
    - expect: Counter shows '3 items left'
  3. Click the circle checkbox next to the 'Alpha' item
    - expect: The 'Alpha' item is visually marked as complete (strikethrough text and grayed out)
    - expect: The 'Alpha' checkbox is checked
    - expect: The counter decrements to '2 items left'
    - expect: The 'Clear completed' button appears in the footer

#### 2.2. Unmark a completed todo item as active

**File:** `tests/todomvc/completing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add the item 'Buy milk' and mark it as complete by clicking its checkbox
    - expect: The item shows as completed (checked and styled)
    - expect: Counter shows '0 items left'
  3. Click the checkbox of the 'Buy milk' item again to unmark it
    - expect: The 'Buy milk' item returns to active state (unchecked, normal styling)
    - expect: Counter returns to '1 item left'
    - expect: The 'Clear completed' button disappears

#### 2.3. Mark all items as complete using the toggle-all checkbox

**File:** `tests/todomvc/completing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add three items: 'Task One', 'Task Two', 'Task Three'
    - expect: All three items are active
    - expect: Counter shows '3 items left'
    - expect: The toggle-all checkbox (chevron) is unchecked
  3. Click the toggle-all checkbox (the downward chevron '❯' to the left of the input)
    - expect: All three items are marked as complete
    - expect: All three item checkboxes are checked
    - expect: Counter shows '0 items left'
    - expect: The toggle-all checkbox becomes checked/filled
    - expect: The 'Clear completed' button appears

#### 2.4. Toggle all items back to active using the toggle-all checkbox

**File:** `tests/todomvc/completing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two items and mark both as complete individually, then verify all items are complete
    - expect: Counter shows '0 items left'
    - expect: Toggle-all checkbox is checked
  3. Click the toggle-all checkbox
    - expect: All items are unchecked and returned to active state
    - expect: Counter shows '2 items left'
    - expect: The 'Clear completed' button disappears

#### 2.5. Toggle-all checkbox state auto-updates when all items are manually completed

**File:** `tests/todomvc/completing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two items: 'One', 'Two'. Mark 'One' as complete by clicking its checkbox.
    - expect: Counter shows '1 item left'
    - expect: Toggle-all checkbox remains unchecked
  3. Mark 'Two' as complete by clicking its checkbox
    - expect: Counter shows '0 items left'
    - expect: The toggle-all checkbox automatically becomes checked/filled indicating all complete

### 3. Editing Todo Items

**Seed:** `tests/seed.spec.ts`

#### 3.1. Edit a todo item text by double-clicking and saving with Enter

**File:** `tests/todomvc/editing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add the item 'Original text'
    - expect: Item 'Original text' is in the list
  3. Double-click on the 'Original text' item label
    - expect: The item enters edit mode
    - expect: An input field pre-filled with 'Original text' appears
    - expect: The item is in editing state (no checkbox or delete button visible, only the edit input)
  4. Clear the edit field, type 'Updated text', and press Enter
    - expect: The item exits edit mode
    - expect: The item now displays 'Updated text'
    - expect: The 'Original text' label is no longer present in the list

#### 3.2. Save an edited todo item by clicking outside (blur)

**File:** `tests/todomvc/editing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add the item 'Before blur edit' and double-click it to enter edit mode
    - expect: The item is in edit mode with the text pre-filled
  3. Change the text to 'After blur edit' and click elsewhere on the page (e.g., the 'todos' heading)
    - expect: The item exits edit mode
    - expect: The item is saved with the text 'After blur edit'
    - expect: The original text 'Before blur edit' is no longer shown

#### 3.3. Cancel an edit by pressing Escape

**File:** `tests/todomvc/editing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add the item 'Keep this text' and double-click it to enter edit mode
    - expect: The item is in edit mode
  3. Change the text in the edit field to 'Discard this text' and press Escape
    - expect: The item exits edit mode without saving
    - expect: The item still shows the original text 'Keep this text'
    - expect: 'Discard this text' is not stored

#### 3.4. Delete a todo by editing it to an empty string

**File:** `tests/todomvc/editing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add the item 'Soon to be deleted' and double-click it to enter edit mode
    - expect: The item is in edit mode
  3. Clear all text in the edit field and press Enter
    - expect: The item is removed from the list entirely
    - expect: If this was the only item, the list becomes empty and the footer disappears

#### 3.5. Only one item can be in edit mode at a time

**File:** `tests/todomvc/editing-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two items: 'Item A' and 'Item B'. Double-click 'Item A' to enter edit mode.
    - expect: 'Item A' is in edit mode
    - expect: 'Item B' is still in its normal display state (not in edit mode)
  3. Double-click 'Item B' while 'Item A' is in edit mode
    - expect: 'Item A' saves (or reverts) and exits edit mode
    - expect: 'Item B' enters edit mode
    - expect: Only one item is in edit mode at any time

### 4. Deleting Todo Items

**Seed:** `tests/seed.spec.ts`

#### 4.1. Delete a single todo using the delete button revealed on hover

**File:** `tests/todomvc/deleting-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two items: 'Keep me' and 'Delete me'
    - expect: Both items are in the list
    - expect: Counter shows '2 items left'
  3. Hover the mouse over the 'Delete me' item
    - expect: A red 'x' delete button (×) becomes visible on the right side of the 'Delete me' item
  4. Click the '×' delete button on the 'Delete me' item
    - expect: The 'Delete me' item is removed from the list immediately
    - expect: 'Keep me' remains in the list
    - expect: Counter updates to '1 item left'

#### 4.2. Delete button is not visible without hovering

**File:** `tests/todomvc/deleting-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add one item: 'Visible item'. Do not hover over it.
    - expect: The delete button (×) is not visible on the item without hovering over it

#### 4.3. Delete the last remaining todo item

**File:** `tests/todomvc/deleting-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add one item: 'Last item'. Hover over it and click the '×' button.
    - expect: The 'Last item' is removed
    - expect: The list is now empty
    - expect: The filter bar (All / Active / Completed) and the item counter disappear
    - expect: The toggle-all checkbox disappears
    - expect: The page returns to the initial empty state appearance

### 5. Filtering Todo Items

**Seed:** `tests/seed.spec.ts`

#### 5.1. Filter view: All shows all todo items

**File:** `tests/todomvc/filtering-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add three items: 'Active task', 'Another active', 'Done task'. Mark 'Done task' as complete.
    - expect: Two active items and one completed item exist
  3. Click the 'All' filter link
    - expect: The URL changes to '#/'
    - expect: The 'All' link is highlighted as selected
    - expect: All three items are shown: 'Active task', 'Another active', and 'Done task' (which appears with completed styling)
    - expect: Counter still shows '2 items left'

#### 5.2. Filter view: Active shows only incomplete items

**File:** `tests/todomvc/filtering-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add three items: 'Active task', 'Another active', 'Done task'. Mark 'Done task' as complete.
    - expect: Two active items and one completed item exist
  3. Click the 'Active' filter link
    - expect: The URL changes to '#/active'
    - expect: The 'Active' link is highlighted as selected
    - expect: Only the two active items are displayed: 'Active task' and 'Another active'
    - expect: 'Done task' is not shown in the list
    - expect: Counter shows '2 items left'

#### 5.3. Filter view: Completed shows only completed items

**File:** `tests/todomvc/filtering-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add three items: 'Active task', 'Another active', 'Done task'. Mark 'Done task' as complete.
    - expect: Two active items and one completed item exist
  3. Click the 'Completed' filter link
    - expect: The URL changes to '#/completed'
    - expect: The 'Completed' link is highlighted as selected
    - expect: Only 'Done task' is displayed in the list
    - expect: 'Active task' and 'Another active' are not visible
    - expect: Counter still shows '2 items left'

#### 5.4. Active filter shows empty list when all items are completed

**File:** `tests/todomvc/filtering-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add one item 'All done' and mark it as complete
    - expect: Counter shows '0 items left'
  3. Click the 'Active' filter link
    - expect: The URL changes to '#/active'
    - expect: The list appears empty — no items are shown under the Active filter
    - expect: The filter bar and counter remain visible

#### 5.5. Completed filter shows empty list when no items are completed

**File:** `tests/todomvc/filtering-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add one item 'Not done yet' without marking it complete
    - expect: Counter shows '1 item left'
  3. Click the 'Completed' filter link
    - expect: The URL changes to '#/completed'
    - expect: The list appears empty — no completed items to show
    - expect: The 'Clear completed' button is absent

#### 5.6. Direct URL navigation to filter views

**File:** `tests/todomvc/filtering-todos.spec.ts`

**Steps:**
  1. Navigate directly to https://demo.playwright.dev/todomvc/#/active in the browser address bar
    - expect: The page loads the TodoMVC application
    - expect: The 'Active' filter link is highlighted as the current view
    - expect: Only active (incomplete) items are listed
  2. Navigate directly to https://demo.playwright.dev/todomvc/#/completed
    - expect: The page loads the TodoMVC application
    - expect: The 'Completed' filter link is highlighted as the current view
    - expect: Only completed items are listed
  3. Navigate directly to https://demo.playwright.dev/todomvc/#/
    - expect: The page loads with the 'All' filter active and all items shown

#### 5.7. Adding a new item while Active filter is active

**File:** `tests/todomvc/filtering-todos.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add one item 'Existing item', mark it complete, then click the 'Active' filter
    - expect: The Active view is showing with an empty list
  3. Type 'New active item' in the input and press Enter
    - expect: The new 'New active item' appears in the Active filter view
    - expect: Counter increments to '1 item left'

### 6. Clear Completed

**Seed:** `tests/seed.spec.ts`

#### 6.1. Clear completed removes all completed items

**File:** `tests/todomvc/clear-completed.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add three items: 'Keep active', 'Remove one', 'Remove two'. Mark 'Remove one' and 'Remove two' as complete.
    - expect: Two items are complete, one is active
    - expect: Counter shows '1 item left'
    - expect: 'Clear completed' button is visible
  3. Click the 'Clear completed' button
    - expect: 'Remove one' and 'Remove two' are deleted from the list
    - expect: 'Keep active' remains in the list
    - expect: Counter still shows '1 item left'
    - expect: The 'Clear completed' button disappears

#### 6.2. Clear completed is hidden when no items are complete

**File:** `tests/todomvc/clear-completed.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two active items: 'Task A' and 'Task B'. Do not mark either as complete.
    - expect: Both items are active
    - expect: The 'Clear completed' button is NOT present in the footer

#### 6.3. Clear completed removes all items when all are complete

**File:** `tests/todomvc/clear-completed.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two items: 'A' and 'B'. Click the toggle-all checkbox to mark both complete.
    - expect: Counter shows '0 items left'
    - expect: 'Clear completed' button is visible
  3. Click the 'Clear completed' button
    - expect: Both items are removed
    - expect: The list is empty
    - expect: The footer counter bar and filter links disappear
    - expect: The page returns to the initial empty state

### 7. Item Counter

**Seed:** `tests/seed.spec.ts`

#### 7.1. Counter shows singular 'item left' for exactly one active item

**File:** `tests/todomvc/item-counter.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add exactly one item: 'Solo task'
    - expect: The footer counter reads '1 item left' (singular, not 'items')

#### 7.2. Counter shows plural 'items left' for two or more active items

**File:** `tests/todomvc/item-counter.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two items: 'First' and 'Second'
    - expect: The footer counter reads '2 items left' (plural)

#### 7.3. Counter only counts active (incomplete) items, not completed ones

**File:** `tests/todomvc/item-counter.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add three items and mark one as complete
    - expect: The counter shows '2 items left' — only counting the two incomplete items, not the completed one

#### 7.4. Counter is not shown on an empty list

**File:** `tests/todomvc/item-counter.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in a fresh empty state
  2. Observe the page without adding any items
    - expect: No item counter is displayed
    - expect: The footer section with filters is not shown

### 8. Keyboard Navigation and Accessibility

**Seed:** `tests/seed.spec.ts`

#### 8.1. Input field is focused on page load

**File:** `tests/todomvc/keyboard-accessibility.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The 'What needs to be done?' input field is automatically focused on page load without requiring a click

#### 8.2. Submit a new item using Enter key

**File:** `tests/todomvc/keyboard-accessibility.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Type 'Keyboard entry' in the input and press the Enter key
    - expect: The item 'Keyboard entry' is added to the list
    - expect: The input field is cleared and ready for the next entry

#### 8.3. Cancel an in-progress edit using the Escape key

**File:** `tests/todomvc/keyboard-accessibility.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add 'Original value' and double-click it to enter edit mode
    - expect: Edit mode is active
  3. Change the text to 'Will be discarded' and press Escape
    - expect: Edit mode is cancelled
    - expect: The item still reads 'Original value'
    - expect: The change 'Will be discarded' is not saved

#### 8.4. Save an edit using Enter key

**File:** `tests/todomvc/keyboard-accessibility.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add 'Before edit' and double-click it to enter edit mode
    - expect: Edit mode is active
  3. Change the text to 'After edit' and press Enter
    - expect: Edit mode is exited
    - expect: The item reads 'After edit'
    - expect: The changes are saved

### 9. Persistence and State

**Seed:** `tests/seed.spec.ts`

#### 9.1. Todo items persist after page reload

**File:** `tests/todomvc/persistence.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add two items: 'Remember me' and 'Persist this'. Mark 'Persist this' as complete.
    - expect: Both items are in the list with correct states
  3. Reload the page (press F5 or use browser reload)
    - expect: Both items are still in the list after reload
    - expect: 'Remember me' is still in active state
    - expect: 'Persist this' is still marked as complete
    - expect: The counter still shows '1 item left'

#### 9.2. Filter state is preserved in the URL

**File:** `tests/todomvc/persistence.spec.ts`

**Steps:**
  1. Navigate to https://demo.playwright.dev/todomvc/#/
    - expect: The page is in empty state
  2. Add an item, mark it complete, then click the 'Completed' filter
    - expect: URL changes to '#/completed'
  3. Reload the page
    - expect: The Completed filter remains active after reload
    - expect: The URL still shows '#/completed'
    - expect: Only completed items are displayed
