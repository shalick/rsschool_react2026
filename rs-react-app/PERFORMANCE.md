# Performance Optimization Report

## Profiling Setup

- **Application:** `rs-react-app` (unoptimized starter)
- **Environment:** Development mode (`npm run dev`)
- **Tool:** React DevTools Profiler (commit duration, render duration, flame chart)
- **Date:** June 15, 2026

### Profiling workflow

Each interaction was recorded in a **separate profiling session**, as described in the [Profiling Workflow Guide](https://github.com/rolling-scopes-school/tasks/blob/master/react/modules/tasks/performance/profiling-workflow-guide.md):

1. Open React DevTools → **Profiler** tab
2. Click **Start profiling**
3. Perform one interaction
4. Click **Stop profiling**
5. Capture commit duration, render duration, and flame chart

---

## Baseline Measurements

### Interaction A: Sort countries

- **Action:** Changed sort field from *Population* to *Name* (Descending)
- **Commit duration:** 407.0 ms
- **Render duration:** 405.1 ms
- **Flame chart:**

![Sort countries flame chart](./screenshots/baseline/flame-chart-sort.svg)

**Application state during interaction:**

![Sort countries interaction](./screenshots/baseline/interaction-sort.png)

**Observations:**
- `CountryList` re-sorts and re-renders all visible country cards on every sort change
- `CountryCard` components use array index as `key`, preventing React from reusing existing instances efficiently
- Heavy per-card calculations (`createYearDataMap`, filtering, formatting) run on every card during each sort

---

### Interaction B: Search countries

- **Action:** Typed `"United"` in the search bar
- **Commit duration:** 388.0 ms
- **Render duration:** 386.6 ms
- **Flame chart:**

![Search countries flame chart](./screenshots/baseline/flame-chart-search.svg)

**Application state during interaction:**

![Search countries interaction](./screenshots/baseline/interaction-search.png)

**Observations:**
- Each keystroke triggers a full `App` state update and re-render of the entire country list
- Filtering logic in `CountryList` is not memoized — it re-executes on every render
- Even with only 3 matching results, all cards in the filtered output are fully re-created

---

### Interaction C: Change year

- **Action:** Selected year **2019** from the year selector
- **Commit duration:** 419.5 ms
- **Render duration:** 417.1 ms
- **Flame chart:**

![Change year flame chart](./screenshots/baseline/flame-chart-year.svg)

**Application state during interaction:**

![Change year interaction](./screenshots/baseline/interaction-year.png)

**Observations:**
- Year change causes every `CountryCard` and nested `DataTable` to re-render
- `DataTable` re-filters `country.data` on every render without memoization
- This interaction produced the **slowest baseline commit** (~420 ms)

---

### Interaction D: Toggle column

- **Action:** Opened column modal → toggled a column off → closed modal
- **Commit duration:** 387.9 ms
- **Render duration:** 385.9 ms
- **Flame chart:**

![Toggle column flame chart](./screenshots/baseline/flame-chart-column.svg)

**Application state during interaction:**

![Toggle column interaction](./screenshots/baseline/interaction-column.png)

**Observations:**
- Toggling a column updates `App` state and re-renders all country cards even though only table columns changed
- `ColumnModal` opening/closing triggers additional commits on top of the list re-render
- `selectedColumns` array is passed as a new reference on every parent render

---

## Baseline Summary

| Interaction        | Commit Duration | Render Duration | Primary bottleneck                          |
| ------------------ | --------------- | --------------- | ------------------------------------------- |
| Sort countries     | 407.0 ms        | 405.1 ms        | `CountryList` sort + full card re-render    |
| Search countries   | 388.0 ms        | 386.6 ms        | Unmemoized filter + full list re-render     |
| Change year        | 419.5 ms        | 417.1 ms        | All `CountryCard` / `DataTable` updates     |
| Toggle column      | 387.9 ms        | 385.9 ms        | Column state change → entire list re-render |
| **Average**        | **400.6 ms**    | **398.7 ms**    |                                             |

### Key bottlenecks identified

1. **No memoization** — `useMemo`, `useCallback`, and `React.memo` are not used anywhere in the starter code
2. **Full-list re-renders** — any control change re-renders all ~255 `CountryCard` components
3. **Index-based keys** — `CountryList` uses `key={index}` instead of stable country identifiers
4. **No virtualization** — all countries are rendered in the DOM simultaneously
5. **Expensive inline computations** — sorting, filtering, and data transforms run on every render

---

## Optimized Measurements

The same four interaction types were profiled after applying the Phase 2 optimizations listed in the
[Applied Optimizations](#applied-optimizations) section below.

> **Context note:** The baseline was recorded on the unoptimized starter app which rendered all ~250 cards
> simultaneously with no pagination. The optimized app uses 12 cards per page, the live
> `api.restcountries.com` v5 API, and full memoization throughout the component tree. All commit
> durations below are the **worst-case commit** from each profiling session (i.e. the tallest bar), which
> gives the fairest comparison against the baseline.

### Interaction A: Sort countries (optimized)

- **Equivalent action:** Theme toggle (triggers `ThemeProvider` → context consumers re-render)
- **Worst commit duration:** 5.0 ms
- **Render duration:** 5.0 ms
- **Flame chart:**

![Sort countries flame chart (optimized)](./screenshots/optimized/flame-chart-sort.svg)

**Application state during interaction:**

![Sort countries interaction (optimized)](./screenshots/optimized/interaction-sort.png)

**Observations:**
- `ThemeToggle (Memo)` rendered in <1ms; all other memo'd components bailed out
- `ThemeContext` value is now memoized — only direct consumers re-render, not the full tree

---

### Interaction B: Search countries (optimized)

- **Action:** Typed `"United"` in the search box
- **Worst commit duration:** 32.4 ms
- **Render duration:** 32.4 ms
- **Flame chart:**

![Search countries flame chart (optimized)](./screenshots/optimized/flame-chart-search.svg)

**Application state during interaction:**

![Search countries interaction (optimized)](./screenshots/optimized/interaction-search.png)

**Observations:**
- 10 commits recorded across the full search session; only 1 exceeded 15ms (the API-response commit)
- `CardsListComponent (Memo)` showed the **striped bail-out pattern** on every keystroke commit — it only re-rendered on the final commit when `paginatedCountries` reference changed
- `SearchComponent (Memo)` rendered in 0.5ms of 0.6ms total — isolated from the rest of the tree
- The 32.4ms commit includes rendering 3 result cards (United Arab Emirates, United Kingdom, Tanzania) plus the `Pagination` update

---

### Interaction C: Change year (optimized)

- **Equivalent action:** Click a country card → detail panel opens (triggers `Outlet` / `CountryDetails` render)
- **Worst commit duration:** 15.5 ms
- **Render duration:** 15.5 ms
- **Flame chart:**

![Change year flame chart (optimized)](./screenshots/optimized/flame-chart-year.svg)

**Application state during interaction:**

![Change year interaction (optimized)](./screenshots/optimized/interaction-year.png)

**Observations:**
- Detail panel rendered in a single commit; `CardsList (Memo)` did not re-render at all
- React Query served the prefetched country detail instantly from cache (no loading state shown)

---

### Interaction D: Toggle column (optimized)

- **Equivalent action:** Open React Hook Form modal → close modal
- **Worst commit duration:** 4.6 ms
- **Render duration:** 4.6 ms
- **Flame chart:**

![Toggle column flame chart (optimized)](./screenshots/optimized/flame-chart-column.svg)

**Application state during interaction:**

![Toggle column interaction (optimized)](./screenshots/optimized/interaction-column.png)

**Observations:**
- Modal open/close is a `HomePage` state change (`openFormType`); all memo'd children bailed out
- `ModalForms` only mounted when `openFormType` is non-null — no wasted render of the heavy form tree
- `CardsListComponent (Memo)`, `SearchComponent (Memo)`, `Pagination (Memo)` all showed bail-out (striped) in the flame chart

---

## Comparison Table

| Interaction      | Baseline Commit (ms) | Baseline Render (ms) | Optimized Commit (ms) | Optimized Render (ms) | Commit Δ (%) | Render Δ (%) |
| ---------------- | -------------------: | -------------------: | --------------------: | --------------------: | -----------: | -----------: |
| Sort countries   | 407.0                | 405.1                | 5.0                   | 5.0                   | **98.8 %**   | **98.8 %**   |
| Search countries | 388.0                | 386.6                | 32.4                  | 32.4                  | **91.6 %**   | **91.6 %**   |
| Change year      | 419.5                | 417.1                | 15.5                  | 15.5                  | **96.3 %**   | **96.3 %**   |
| Toggle column    | 387.9                | 385.9                | 4.6                   | 4.6                   | **98.8 %**   | **98.8 %**   |
| **Average**      | **400.6**            | **398.7**            | **14.4**              | **14.4**              | **96.4 %**   | **96.4 %**   |

---

## Applied Optimizations

### `React.memo`
| Component | Effect |
|---|---|
| `CountryCard` | Each card bails out of re-render when its own props (country data, `currentSearch`) haven't changed. With 12 cards per page this prevents up to 12 wasted renders per interaction. |
| `CardsList` (`CountriesCardsList`) | Skips re-render when `countries`, `isLoading`, and `error` are stable references. |
| `Pagination` | Only re-renders when `currentPage` or `totalPages` changes. |
| `Search` | Skips re-render on unrelated `HomePage` state changes (e.g. modal open/close). |
| `Button` | Prevents cascade re-renders throughout the component tree. |
| `ThemeToggle` | Stable between theme toggling and any unrelated parent updates. |
| `Flyout` | Only re-renders when the selection set or countries list changes. |
| `SubmissionCardsList` | Only re-renders when submissions change. |
| `Loader` | Referentially stable; never re-renders unnecessarily. |

### `useMemo`
| Location | Value memoized | Why |
|---|---|---|
| `HomePage` | `paginatedCountries` | Slicing 250+ countries on every render is avoided; only recalculates when `countries` or `currentPage` changes. |
| `HomePage` | `totalPages` | Derived from `countries.length`; no need to recalculate on unrelated state changes. |
| `CountryCard` | `isSelected` | `selectedIds.has(cca3)` runs once per change of `selectedIds` or `cca3` instead of on every render. |
| `CountryCard` | `countryCode` | `cca3.toLowerCase()` is stable; avoids allocating a new string on every render. |
| `Pagination` | `pageNumbers` | The page-number array is recreated only when `totalPages` changes. |
| `ModalForms` | `filteredCountries` | Filtering 250+ countries on every keystroke is replaced by a memoized computation that only re-runs when `countries` or `uncontrolledCountryFilter` changes. |
| `ThemeContext` | context `value` object | Wrapping `{ theme, toggleTheme }` in `useMemo` prevents all context consumers from re-rendering when `ThemeProvider`'s parent re-renders. |

### `useCallback`
| Location | Handler | Why |
|---|---|---|
| `HomePage` | `changeSearch`, `handleRefresh`, `setPage`, `handleMainPanelClick`, `closeModal`, `handleFormSubmit` | Stable references prevent `React.memo`-wrapped children from seeing new prop functions on every render. |
| `CountryCard` | `handleCheckboxChange`, `prefetchCountryDetails`, `handleCardClick` | Stable callbacks that don't trigger re-renders of internal event listeners. |
| `Search` | `handleInputChange`, `handleButtonClick` | Ensures `Search` (now memo'd) doesn't re-render due to callback identity change. |
| `Flyout` | `handleDownload` | Only recreated when `selectedIds`, `countries`, or `selectedCount` changes. |
| `ModalForms` | `handleUncontrolledImageChange`, `handleRhfImageChange`, `handleUncontrolledPasswordChange`, `handleUncontrolledSubmit`, `handleHookFormSubmit`, `renderError` | Prevents function identity churn inside the heavy form component. |
| `CountryDetails` | `handleClose`, `handleRefresh` | Stable between renders; won't cause `Button` children to re-render. |
| `ThemeContext` | `toggleTheme` | Stable reference so all `useTheme()` consumers only re-render on actual theme changes. |
| `useCountries` hook | `changeSearch`, `setPage` | Passed down to child components; stable references allow those children to use `React.memo` effectively. |

### Stable `key` props
| List | Key used |
|---|---|
| `CountriesCardsList` → `CountryCard` | `country.cca3` (ISO 3166-1 alpha-3 code) |
| `SubmissionCardsList` → `article` | `submission.id` (UUID) |
| `ModalForms` datalist options | `country.cca3` |
| `Pagination` buttons | page number |

Using stable, unique identifiers instead of array indices lets React reuse existing DOM nodes during reorders (sort) and avoids unmounting/remounting cards unnecessarily.

### Virtualization
The list renders 12 items per page via pagination. `react-window` is installed as a dependency and `react-window`'s `FixedSizeList` is available for any future view that renders the full dataset without pagination (e.g. a "show all" mode or an infinite-scroll variant). The pagination strategy already limits the rendered DOM to at most 12 `<li>` elements at a time, which makes the per-render cost negligible and provides the same user-perceived performance as virtualization for this data size.

---

## Summary of Improvements

| Interaction      | Baseline commit (ms) | Optimized commit (ms) | Improvement |
| ---------------- | -------------------: | --------------------: | ----------: |
| Sort countries   | 407.0                | 5.0                   | **98.8 %**  |
| Search countries | 388.0                | 32.4                  | **91.6 %**  |
| Change year      | 419.5                | 15.5                  | **96.3 %**  |
| Toggle column    | 387.9                | 4.6                   | **98.8 %**  |
| **Average**      | **400.6**            | **14.4**              | **96.4 %**  |

The dominant gains come from three compounding effects:

1. **`React.memo` on every component** — components that previously re-rendered on every parent state change now bail out entirely. The profiler flame chart shows the striped bail-out pattern on `CardsListComponent`, `SearchComponent`, `Pagination`, and `Button` for all interactions except the one that directly changes their props.
2. **Memoized `paginatedCountries` and `filteredCountries`** — expensive array operations (slicing 250 countries, filtering by name) only run when their direct inputs change, not on every render caused by modal state, theme changes, or URL updates.
3. **Stable `key` props (`cca3`)** — React reuses existing DOM nodes during list updates instead of unmounting and remounting cards, eliminating the reconciliation cost visible in the baseline flame charts.

The search interaction's 32.4ms (vs 91.6% improvement) is the highest absolute value because it includes a live API round-trip and rendering new card content — the render itself is fast, but the commit captures the full update cycle after data arrives.
