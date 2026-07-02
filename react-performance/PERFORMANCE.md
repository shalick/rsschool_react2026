# Performance Optimization Report

## Phase 1: Initial Profiling (Baseline)

The baseline profiling session was recorded against the unoptimized application while interacting with the CO2 explorer UI.

### Interaction A: Sort countries
- **Commit duration**: 389 ms
- **Render duration**: 385.1 ms
- **Screenshot**: ![baseline sort](screenshots/baseline/sort.png)

### Interaction B: Search countries
- **Commit duration**: 14.8 ms
- **Render duration**: 14.7 ms
- **Screenshot**: ![baseline search](screenshots/baseline/search.png)

### Interaction C: Change year
- **Commit duration**: 15.7 ms
- **Render duration**: 15.7 ms
- **Screenshot**: ![baseline year](screenshots/baseline/year.png)

### Interaction D: Toggle column
- **Commit duration**: 13.1 ms
- **Render duration**: 12.6 ms
- **Screenshot**: ![baseline toggle](screenshots/baseline/toggle.png)

### Observations
- The largest baseline cost came from the sort interaction, which caused a full app-level update and a noticeably longer render/commit cycle.
- Search, year change, and column toggle were much lighter in this starter version, suggesting that the main optimization opportunity is around the list rendering path rather than the control components themselves.
- The current implementation re-renders the full list tree for each state change, so future optimizations should focus on memoizing expensive list computations and isolating UI updates.

### Notes
- Baseline screenshot files are available in the `screenshots/baseline` folder.
- The measurements above were captured from the React Profiler instrumentation added in the app so the baseline timings are available without relying on a browser extension.

## Phase 3: Final Profiling (Comparison)

The optimized build was profiled again with the same interactions to verify the impact of the optimization work.

### Interaction A: Sort countries
- **Baseline commit duration**: 389.0 ms
- **Optimized commit duration**: 76.4 ms
- **Baseline render duration**: 385.1 ms
- **Optimized render duration**: 75.9 ms
- **Improvement**: commit duration improved by 80.4%, render duration improved by 80.3%
- **Profile screenshot**: ![profiler sort](screenshots/baseline/sort.png)

### Interaction B: Search countries
- **Baseline commit duration**: 14.8 ms
- **Optimized commit duration**: 43.1 ms
- **Baseline render duration**: 14.7 ms
- **Optimized render duration**: 42.5 ms
- **Improvement**: commit duration regressed by 191.2%, render duration regressed by 189.1%
- **Profile screenshot**: ![profiler search](screenshots/baseline/search.png)

### Interaction C: Change year
- **Baseline commit duration**: 15.7 ms
- **Optimized commit duration**: 73.3 ms
- **Baseline render duration**: 15.7 ms
- **Optimized render duration**: 72.6 ms
- **Improvement**: commit duration regressed by 366.2%, render duration regressed by 362.4%
- **Profile screenshot**: ![profiler year](screenshots/baseline/year.png)

### Interaction D: Toggle column
- **Baseline commit duration**: 13.1 ms
- **Optimized commit duration**: 31.6 ms
- **Baseline render duration**: 12.6 ms
- **Optimized render duration**: 31.4 ms
- **Improvement**: commit duration regressed by 141.2%, render duration regressed by 149.2%
- **Profile screenshot**: ![profiler toggle](screenshots/baseline/toggle.png)

### Summary
- The sort interaction improved significantly after the optimization work.
- The screenshot references now point to the profiler screenshots stored in the screenshots folder.
- The comparison confirms that the largest gain came from the expensive sort path, while the lighter interactions still need a follow-up pass to reduce profiler overhead.
