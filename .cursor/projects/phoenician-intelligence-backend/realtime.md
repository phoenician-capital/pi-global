# Realtime — PI .NET (v4)

## SSE status-stream
- connect: `{"type":"connected"}`
- events: `status_change` (+ optional `updateRequestedAt`); `screening_status_change`
- heartbeat: `: heartbeat` every **15s**

## SignalR CompanyNotesHub
- Path: **`/hubs/company-notes`** (never `/api/hubs/`)
- Group: `note-page:{pageId}`
- Client events: `presenceUpdated`, `userJoined`, `userLeft`, `syncUpdate`, `awarenessUpdate`, `stateRequested`, `stateProvided`
- REST→hub: `pageSaved`, `commentAdded`
- Invoke: `JoinPage`, `LeavePage`, `SyncUpdate`, `AwarenessUpdate`, `RequestState`, `ProvideState`
