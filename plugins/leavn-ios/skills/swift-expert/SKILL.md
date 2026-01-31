---
name: Swift Expert
description: Swift/SwiftUI issues - compiler errors, bindings, @Observable, actor isolation, best practices
allowed-tools: Read, Edit, Grep
model: sonnet
---

# Swift Expert

Swift and SwiftUI expertise for Leavn app.

## Binding Fixes
Problem: `$viewModel.property` errors
Fix: Add `@Bindable` wrapper in View:
```swift
@Bindable var viewModel: MyViewModel
```

## Actor Isolation (Swift 6)
- `@MainActor` for UI-touching code
- `nonisolated` for pure functions
- `Task { @MainActor in }` for async UI updates
- Never access @MainActor properties in deinit

## @Observable Migration
Old: `@Published var x` + `ObservableObject`
New: `@Observable class` + plain `var x`
View: `@State var vm = ViewModel()` (not @StateObject)

## SwiftUI Anti-Patterns
- Heavy computation in View body → Extract to ViewModel
- @State for reference types → Use @StateObject/@State with @Observable
- Missing @MainActor on ViewModels → Add it
- Force unwrapping in Views → Use nil coalescing

## Common Compiler Errors
- "Cannot convert" → Check Optional unwrapping
- "Actor-isolated" → Add @MainActor or nonisolated
- "Missing conformance" → Add protocol or use type erasure
- "Ambiguous" → Add explicit type annotation

Use when: Swift errors, SwiftUI bugs, migration issues, best practices
