---
name: TCA Migration
description: Remove TCA (Composable Architecture) - find usage, migrate to @Observable, delete reducers
allowed-tools: Read, Edit, Grep, Glob, Bash
---

# TCA Migration

Remove The Composable Architecture from Leavn codebase.

## Find TCA Usage
```bash
grep -r "Reducer" --include="*.swift" | grep -v "Pods\|DerivedData"
grep -r "Store\|ViewStore" --include="*.swift"
grep -r "@Dependency" --include="*.swift"
grep -r "ComposableArchitecture" --include="*.swift"
```

## Migration Pattern
TCA Feature → @Observable ViewModel

**Before (TCA)**:
```swift
@Reducer struct MyFeature {
  @ObservableState struct State { var count = 0 }
  enum Action { case increment }
  var body: some ReducerOf<Self> { ... }
}
```

**After (@Observable)**:
```swift
@Observable @MainActor
class MyViewModel {
  var count = 0
  func increment() { count += 1 }
}
```

## Removal Order
1. Leaf features (no child reducers)
2. Parent features (after children migrated)
3. App-level store (last)
4. Remove TCA from Package.swift

## Audit Command
```bash
find . -name "*Feature.swift" -o -name "*Reducer.swift" | wc -l
```

Use when: TCA removal, migration tracking, @Observable conversion
