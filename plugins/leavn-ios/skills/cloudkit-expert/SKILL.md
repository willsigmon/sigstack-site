---
name: CloudKit Expert
description: CloudKit sync - schema design, conflict resolution, offline support, multi-device sync validation
allowed-tools: Read, Edit, Grep
---

# CloudKit Expert

CloudKit architecture for Leavn's multi-device sync.

## Core Concepts
- **Containers**: App's CloudKit namespace
- **Databases**: Private (user), Public (shared), Shared (collaboration)
- **Record Types**: Schema definitions
- **Zones**: Custom zones for atomic operations

## Sync Architecture
1. Local SwiftData/CoreData as source of truth
2. CloudKit as sync transport
3. CKSyncEngine for automatic sync (iOS 17+)

## Conflict Resolution
- **Last-write-wins**: Simple, may lose data
- **Field-level merge**: Merge non-conflicting fields
- **Custom resolver**: App-specific logic

## Offline Support
- Queue changes locally when offline
- Sync when connectivity restored
- Handle partial sync failures

## Validation Checklist
- [ ] Schema matches local model
- [ ] Indexes on query fields
- [ ] Conflict handling tested
- [ ] Offline → online sync works
- [ ] Delete propagation correct

Use when: CloudKit bugs, sync issues, schema design, conflict resolution
