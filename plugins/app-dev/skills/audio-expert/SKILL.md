---
name: Audio Expert
description: Leavn and Modcaster audio systems - TTS, streaming, recording, fingerprinting, ML processing, caption sync
allowed-tools: Read, Edit, Grep
---

# Audio Expert

Audio architecture for Leavn (Bible app) and Modcaster (podcast app).

## Leavn Audio Systems

### Core Services
- `AudioPlaybackService` - TTS + verse reading
- `GuidedAudioOrchestrator` - Guided mode coordination
- `SermonRecordingService` - Sermon capture
- `StreamingTTSClient` - Real-time TTS
- `ChatterboxKit` - Voice profiles

### Caption & Timing
- `CaptionTimecodeAligner` - Precision sync
- `CaptionSyncCoordinator` - State machine
- Verse boundary detection

### Audio Graph
- `AudioGraphManager` initialization
- Scene modes: CarPlay, background, etc.

### Common Fixes
- Audio conflicts/interruptions
- TTS voice selection
- Recording state management
- Caption synchronization

## Modcaster Audio Systems

### Audio Fingerprinting
Spectral peak extraction (Shazam-style):
1. Apply FFT using vDSP
2. Extract spectral peaks
3. Create constellation map
4. Hash into compact fingerprint

Use cases: Intro/outro detection, ad identification, cross-show matching

### On-Device ML
- `AVAudioEngine` tap installation, buffer processing
- `Core ML` models for voice enhancement, noise reduction
- `Sound Analysis` for speech/music classification
- Neural Engine utilization

### Content Classification
- Episode type: full/trailer/bonus
- Ad segment detection
- Intro/outro recognition
- Speech vs music separation
