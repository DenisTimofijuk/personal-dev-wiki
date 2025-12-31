# Battery Maintenance – Full Cycle Automation

## Purpose
This project implements a fully automated, scheduled full-cycle maintenance
routine for a home backup battery system managed via Home Assistant.

The maintenance cycle:
- Discharges the battery to 15%
- Charges the battery to 100%
- Restores a 50% backup reservation

The goal is to preserve battery health, capacity accuracy, and long-term
reliability while ensuring safety and recoverability at all times.


## High-level Flow

1. User or automation starts maintenance (with confirmation)
2. Controller script initializes state and helpers
3. Phase 1 – Discharge battery to 15%
4. Optional stabilization delay
5. Phase 2 – Charge battery to 100%
6. Optional stabilization delay
7. Restore 50% backup reservation
8. Mark maintenance as completed

At any time, the process can be safely cancelled.


## Key Design Principles

- **Single controller script** orchestrates the entire process
- **Explicit phase tracking** via helpers for UI and safety
- **Idempotent cancel logic** (safe to run multiple times)
- **Fail-safe restore** ensures backup mode is always returned to 50%
- **No concurrent executions** (`mode: single`)
- **Manual and scheduled control supported**


## Core Helpers

- `input_boolean.battery_maintenance_active`  
  Indicates maintenance is running. Turning OFF requests cancellation.

- `input_select.battery_maintenance_phase`  
  Tracks the current maintenance phase (starting, discharging, charging,
  cancelled, completed, error, etc.).

- `input_datetime.battery_maintenance_phase_start_time`  
  Automatically updated at each phase transition. Used for progress tracking
  and UI.

- `input_datetime.last_battery_maintenance_run`  
  Records the last successful maintenance completion.


## Safety Model

- Cancel operation is **idempotent**
- Battery restore logic runs exactly once per cancel or completion
- Timeouts protect against stalled SOC changes
- Manual cancel is always respected immediately
- System can be safely recovered after Home Assistant restart


## Manual Recovery

If Home Assistant restarts or maintenance is interrupted:
1. Run **“Battery Maintenance – Cancel”**
2. Battery will be restored to 50% backup reservation
3. System returns to a known safe state


## Status

This system is actively used in production and has been validated
during live maintenance runs.
