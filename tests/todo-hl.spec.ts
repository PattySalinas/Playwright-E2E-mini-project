import { test, expect, Page } from '@playwright/test';

const URL = 'https://todomvc.com/examples/react/dist/';

// Shared locator helpers (verified live via the Playwright MCP).
const newTodoInput = (page: Page) => page.getByTestId('text-input');
const items = (page: Page) => page.locator('.todo-list li');
const counter = (page: Page) => page.locator('.todo-count');
const item = (page: Page, text: string) =>
  page.getByRole('listitem').filter({ hasText: text });

async function addTodo(page: Page, text: string) {
  await newTodoInput(page).fill(text);
  await newTodoInput(page).press('Enter');
}

test.describe('TodoMVC - High-level UI scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    // Ensure a clean slate for test independence.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Verify a new todo can be added to the list @HL-todo-create @sanityTest', async ({ page }) => {
    // Step 1: app loads, input visible and empty
    await expect(newTodoInput(page)).toBeVisible();
    await expect(newTodoInput(page)).toHaveValue('');
    // Step 2: add "Buy groceries"
    await addTodo(page, 'Buy groceries');
    await expect(item(page, 'Buy groceries')).toBeVisible();
    await expect(newTodoInput(page)).toHaveValue('');
    // Step 3: counter shows "1 item left"
    await expect(counter(page)).toHaveText(/1 item left/);
  });

  test('Verify multiple todos can be added and appear in order @HL-todo-create-multiple', async ({ page }) => {
    const todos = ['Buy groceries', 'Go for walk', 'rest', 'Play', 'Pay bills'];
    for (const t of todos) await addTodo(page, t);
    await expect(items(page)).toHaveCount(5);
    await expect(items(page)).toHaveText(todos);
    await expect(counter(page)).toHaveText(/5 items left/);
  });

  test('Verify a todo can be marked as completed @HL-todo-complete', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await expect(counter(page)).toHaveText(/1 item left/);
    // Step 2: complete it
    await item(page, 'Buy groceries').getByTestId('todo-item-toggle').check();
    await expect(item(page, 'Buy groceries')).toHaveClass(/completed/);
    // Step 3: counter shows 0
    await expect(counter(page)).toHaveText(/0 items left/);
  });

  test('Verify a completed todo can be reactivated @HL-todo-reactivate', async ({ page }) => {
    await addTodo(page, 'Go for walk');
    await item(page, 'Go for walk').getByTestId('todo-item-toggle').check();
    await expect(counter(page)).toHaveText(/0 items left/);
    // Step 2: uncheck it
    await item(page, 'Go for walk').getByTestId('todo-item-toggle').uncheck();
    await expect(item(page, 'Go for walk')).not.toHaveClass(/completed/);
    // Step 3: counter back to 1
    await expect(counter(page)).toHaveText(/1 item left/);
  });

  test('Verify a todo can be deleted @HL-todo-delete', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Pay bills');
    await expect(counter(page)).toHaveText(/2 items left/);
    // Step 2: hover + delete "Buy groceries"
    await item(page, 'Buy groceries').hover();
    await item(page, 'Buy groceries').getByRole('button', { name: 'Delete todo' }).click();
    await expect(item(page, 'Buy groceries')).toHaveCount(0);
    await expect(item(page, 'Pay bills')).toBeVisible();
    // Step 3: counter shows 1
    await expect(counter(page)).toHaveText(/1 item left/);
  });

  test('Verify an existing todo can be edited via double-click @HL-todo-edit', async ({ page }) => {
    await addTodo(page, 'rest');
    await expect(item(page, 'rest')).toBeVisible();
    // Step 2: double-click enters edit mode
    await item(page, 'rest').getByText('rest').dblclick();
    const editBox = page.getByRole('textbox', { name: 'Edit todo' });
    await expect(editBox).toBeVisible();
    await expect(editBox).toHaveValue('rest');
    // Step 3: replace text + Enter
    await editBox.fill('rest well');
    await editBox.press('Enter');
    await expect(item(page, 'rest well')).toBeVisible();
    await expect(editBox).toHaveCount(0);
  });

  test('Verify the filters show All, Active, and Completed todos correctly @HL-todo-filter', async ({ page }) => {
    await addTodo(page, 'Go for walk');
    await addTodo(page, 'Buy groceries');
    await item(page, 'Buy groceries').getByTestId('todo-item-toggle').check();
    // Step 2: Active shows only "Go for walk"
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(items(page)).toHaveText(['Go for walk']);
    // Step 3: Completed shows only "Buy groceries"
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(items(page)).toHaveText(['Buy groceries']);
    // Step 4: All shows both
    await page.getByRole('link', { name: 'All' }).click();
    await expect(items(page)).toHaveText(['Go for walk', 'Buy groceries']);
  });

  test('Verify all todos can be toggled complete at once @HL-todo-toggle-all', async ({ page }) => {
    for (const t of ['Buy groceries', 'Go for walk', 'Play']) await addTodo(page, t);
    await expect(counter(page)).toHaveText(/3 items left/);
    // Step 2: toggle all complete
    await page.getByTestId('toggle-all').check();
    await expect(counter(page)).toHaveText(/0 items left/);
    // Step 3: toggle all back to active
    await page.getByTestId('toggle-all').uncheck();
    await expect(counter(page)).toHaveText(/3 items left/);
  });

  test('Verify completed todos are removed with Clear completed @HL-todo-clear-completed', async ({ page }) => {
    await addTodo(page, 'Go for walk');
    await addTodo(page, 'rest');
    await item(page, 'rest').getByTestId('todo-item-toggle').check();
    // Step 2: clear completed
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(item(page, 'rest')).toHaveCount(0);
    await expect(item(page, 'Go for walk')).toBeVisible();
    // Step 3: Clear completed button hidden when nothing completed
    await expect(page.getByRole('button', { name: 'Clear completed' })).toHaveCount(0);
  });

  test('Verify an empty or whitespace-only todo is not added @HL-todo-empty-input', async ({ page }) => {
    // Step 2: Enter with no text
    await newTodoInput(page).focus();
    await newTodoInput(page).press('Enter');
    await expect(items(page)).toHaveCount(0);
    // Step 3: whitespace-only
    await newTodoInput(page).fill('   ');
    await newTodoInput(page).press('Enter');
    await expect(items(page)).toHaveCount(0);
  });

  test('Verify todos are not persisted after a page reload @HL-todo-no-persistence', async ({ page }) => {
    // Negative test: this build does NOT persist to localStorage (verified via MCP).
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Pay bills');
    await expect(items(page)).toHaveCount(2);
    // localStorage should hold no todo data
    const stored = await page.evaluate(() => JSON.stringify(localStorage));
    expect(stored).toBe('{}');
    // Step 2: reload -> todos are gone; app returns to the empty state
    // (no todo list rendered, input reset to empty).
    await page.reload();
    await expect(items(page)).toHaveCount(0);
    await expect(newTodoInput(page)).toBeVisible();
    await expect(newTodoInput(page)).toHaveValue('');
  });
});
