# Battery Maintenance – Implementation Details

This document describes the internal structure, helpers, scripts, automations,
and UI used to implement the battery maintenance system.


## Architecture Overview

The system is built around a central **controller script**, supported by
dedicated phase scripts and a shared set of helpers.

```

User / Automation
↓
Confirmation Script
↓
Battery Maintenance – Controller
↓
┌───────────────┬────────────────┬────────────────┐
│ Discharge     │ Charge         │ Restore        │
│ to 15%        │ to 100%        │ Backup Mode    │
└───────────────┴────────────────┴────────────────┘

```


## Scripts

### 1. Battery Maintenance – Controller
**Role:** Orchestrates the full maintenance cycle.

Responsibilities:
- Prevents concurrent execution
- Initializes helpers
- Starts discharge and charge phases
- Waits for SOC thresholds using `wait_for_trigger`
- Handles timeouts and error conditions
- Stops cleanly on cancellation
- Marks completion and updates timestamps

Key characteristics:
- `mode: single`
- Uses `input_boolean.battery_maintenance_active` as a cancel signal
- Uses `input_select.battery_maintenance_phase` as the system state machine


### 2. Battery Maintenance – Cancel
**Role:** Safe, idempotent cancellation and cleanup.

Design goals:
- Safe to run multiple times
- Never depends on `battery_maintenance_active` being ON
- Guarantees battery restore

Behavior:
1. If phase is already `cancelled`, exit immediately
2. Mark phase as `cancelled`
3. Turn off `battery_maintenance_active`
4. Restore 50% backup reservation
5. Notify user

This ensures no repeated Modbus writes and no partial restores.


### 3. Discharge Backup Battery to 15%
**Role:** Configures inverter for controlled discharge.

Actions:
- Sets phase to `discharging`
- Records phase start timestamp
- Disables reserve mode
- Sets discharge limit to 15%
- Enables discharge mode

This script only performs hardware configuration.
All monitoring is handled by the controller.


### 4. Charge Backup Battery to 100%
**Role:** Configures inverter for full charge.

Actions:
- Sets phase to `charging`
- Records phase start timestamp
- Disables discharge mode
- Enables charging mode


### 5. Restore 50% Backup Mode
**Role:** Return inverter to normal operating mode.

Actions:
- Sets phase to `restoring`
- Records phase start timestamp
- Disables maintenance-specific modes
- Restores 50% backup reservation

This script is intentionally safe to re-run if needed.


## Helpers (Detailed)

### input_boolean.battery_maintenance_active
- ON → maintenance running
- OFF → cancel requested or maintenance finished
- Observed by controller `wait_for_trigger`


### input_select.battery_maintenance_phase
Acts as a **state machine** and UI signal.

Typical values:
- starting
- discharging
- discharge_delay
- charging
- charge_delay
- restoring
- cancelled
- completed
- error

This helper is the authoritative system state.


### input_datetime.battery_maintenance_phase_start_time
- Automatically set using `input_datetime.set_datetime`
- Represents the local timestamp of the current phase start
- Used for:
  - elapsed time display
  - progress estimation
  - diagnostics


## Automations

### Scheduled Maintenance Automation
- Triggers weekly (or manually)
- Calls confirmation script
- Does not directly start maintenance

This ensures accidental runs are avoided.


## User Interface (Dashboard)

The dashboard provides:
- Current phase display
- Phase elapsed time
- Start / Cancel buttons
- Last maintenance timestamp
- Real-time SOC monitoring

UI elements are bound directly to helpers, making state transparent.


## Error Handling & Timeouts

Each phase:
- Uses `wait_for_trigger` with SOC thresholds
- Includes a generous timeout
- On timeout:
  - Phase is set to `error`
  - Cancel script is executed
  - Battery is restored safely


## Restart Safety

If Home Assistant restarts mid-maintenance:
- Helpers retain last known state
- User can run **Battery Maintenance – Cancel**
- System returns to a safe configuration


## Design Rationale

Key decisions:
- Cancel logic based on phase, not boolean
- Controller handles logic, phase scripts handle hardware
- Idempotency prioritized over brevity
- Explicit helpers preferred over implicit state


## Future Improvements (Optional)

- Modbus write deduplication
- Resume logic after restart
- Maintenance statistics (cycle count, durations)
- Alerting if scheduled run is skipped