---
name: Performance Expert
description: iOS performance - main thread blocking, rendering, memory leaks, battery drain, profiling
allowed-tools: Read, Edit, Grep, Glob
---

# Performance Expert

Performance optimization for Leavn iOS app.

## Main Thread Violations
Find heavy work in View body:
```swift
// BAD: In View body
let image = processImage(data) // Blocks UI

// GOOD: In ViewModel, async
Task { processedImage = await processImage(data) }
```

## SwiftUI Rendering
- Use `@Observable` (not @Published) for granular updates
- `EquatableView` for expensive views
- `LazyVStack/LazyHStack` for lists
- `drawingGroup()` for complex graphics

## Memory Issues
- Capture `[weak self]` in closures
- Break retain cycles in delegates
- Use `Instruments > Leaks` to find issues

## Battery/Thermal
- Batch network requests
- Reduce location update frequency
- Use `beginBackgroundTask` sparingly
- Profile with Instruments > Energy Log

## Profiling Commands
```bash
# Time Profile
xcrun xctrace record --template "Time Profiler" --launch -- /path/to/app

# Memory
xcrun xctrace record --template "Leaks" --launch -- /path/to/app
```

Use when: Slow UI, battery drain, memory issues, thermal throttling
