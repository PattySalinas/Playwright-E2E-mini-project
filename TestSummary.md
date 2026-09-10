# Test Summary — TodoMVC React App

App under test: https://todomvc.com/examples/react/dist/
Test type: UI automation (Playwright + TypeScript)
Source of truth: `generatedTestCases/HL_TodoMVC_MainFunctionalities.txt`
Automated in: `tests/todo-hl.spec.ts`
Last updated: 2026-09-09

---

## Test cases

| #  | Title | Type / Tags | Coverage area | Automated | Traceability tag |
|----|-------|-------------|---------------|-----------|------------------|
| 1  | Verify a new todo can be added to the list | functional, happy-path, Regression | Create | ✅ | `@HL-todo-create` (also `@sanityTest`) |
| 2  | Verify multiple todos can be added and appear in order | functional, happy-path | Create | ✅ | `@HL-todo-create-multiple` |
| 3  | Verify a todo can be marked as completed | functional, happy-path, Regression | Complete | ✅ | `@HL-todo-complete` |
| 4  | Verify a completed todo can be reactivated | functional, happy-path | Complete | ✅ | `@HL-todo-reactivate` |
| 5  | Verify a todo can be deleted | functional, happy-path, Regression | Delete | ✅ | `@HL-todo-delete` |
| 6  | Verify an existing todo can be edited via double-click | functional, happy-path | Edit | ✅ | `@HL-todo-edit` |
| 7  | Verify the filters show All, Active, and Completed todos correctly | functional, happy-path, Regression | Filter | ✅ | `@HL-todo-filter` |
| 8  | Verify all todos can be toggled complete at once | functional, happy-path | Bulk actions | ✅ | `@HL-todo-toggle-all` |
| 9  | Verify completed todos are removed with Clear completed | functional, happy-path, Regression | Bulk actions | ✅ | `@HL-todo-clear-completed` |
| 10 | Verify an empty or whitespace-only todo is not added | functional, negative, Edge Case | Create (input boundary) | ✅ | `@HL-todo-empty-input` |
| 11 | Verify todos are not persisted after a page reload | functional, negative, Edge Case | Persistence | ✅ | `@HL-todo-no-persistence` |

---

## Metrics at a glance

**Total test cases:** 11 (all high-level, all automated)

### By coverage area
| Area | Count |
|------|-------|
| Create | 3 |
| Complete | 2 |
| Delete | 1 |
| Edit | 1 |
| Filter | 1 |
| Bulk actions | 2 |
| Persistence | 1 |

### By coverage type
| Type | Count |
|------|-------|
| Happy path | 9 |
| Negative / Edge case | 2 |

### By automation status
| Status | Count |
|--------|-------|
| Automated | 11 |
| Manual only | 0 |

### Regression subset
5 cases tagged `Regression` (core CRUD + filters): #1, #3, #5, #7, #9.
Smoke subset: 1 case tagged `@sanityTest` (#1).

---

## How to run

```bash
# All HL tests (chromium/firefox/webkit per playwright.config.ts)
npx playwright test tests/todo-hl.spec.ts

# Smoke (sanity) only
npx playwright test --grep "@sanityTest"

# A single scenario by tag
npx playwright test --grep "@HL-todo-delete"

# Single browser
npx playwright test tests/todo-hl.spec.ts --project=chromium
```

---

## Notes / findings

- **No persistence:** this TodoMVC build does not persist todos to
  localStorage; state is lost on reload. Captured as negative test #11.
- **Empty state:** the footer counter (`.todo-count`) is not rendered when
  there are no todos, so empty-state assertions check the list count and
  input reset rather than the counter element.
- Selectors were verified live against the app via the Playwright MCP
  before automation.
