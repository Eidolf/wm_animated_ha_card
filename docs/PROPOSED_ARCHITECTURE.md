# PROPOSED ARCHITECTURE
**Home Assistant Animated Appliance Card - Home Connect Integration**

**Date:** 2026-09-17  
**Architect:** Claude (Technical Lead)  
**Based on:** Repository Discovery Report + Technical Architecture Review

---

## EXECUTIVE SUMMARY

This document proposes a **mode-based architecture** that adds complete Home Connect functionality while maintaining 100% backward compatibility with existing configurations. The design introduces a dual-mode system where `mode: "standard"` preserves current behavior exactly, and `mode: "home_connect"` unlocks advanced features including program selection, interactive controls, door animations, and comprehensive appliance state visualization.

**Key Design Principles:**
1. **Zero Breaking Changes** - All existing configs continue working unchanged
2. **Progressive Enhancement** - Features appear only when configured
3. **Mode Isolation** - Home Connect code only executes in home_connect mode
4. **Single-File Constraint** - Remains one deployable JavaScript file
5. **Zero Dependencies** - No external libraries

---

## 1. MODE-BASED ARCHITECTURE

### 1.1 Configuration Mode System

**Mode Selection:**
```yaml
type: custom:washing-machine-card
mode: standard           # Default - current behavior (omit for backward compat)
# OR
mode: home_connect       # Enables Home Connect features
```

**Mode Detection Logic:**
```javascript
_getMode() {
    const mode = this._config.mode;
    if (!mode) return "standard";  // Backward compatibility
    if (mode === "home_connect") return "home_connect";
    return "standard";  // Unknown modes default to standard
}

_isHomeConnectMode() {
    return this._getMode() === "home_connect";
}
```

### 1.2 Mode Behavior Matrix

| Feature | Standard Mode | Home Connect Mode |
|---------|---------------|-------------------|
| Status detection | ✅ Via status_entity + power_entity | ✅ Via operation_state entity |
| Animation trigger | ✅ Running state only | ✅ Running state only |
| Last cycle panel | ✅ Manual tracking via helpers | ✅ Manual tracking OR auto from HC |
| Interactive controls | ❌ No | ✅ Program selection, power, start/pause |
| Door visualization | ❌ No | ✅ Animated door open/closed |
| Program display | ❌ No | ✅ Active/selected program |
| Connectivity status | ❌ No | ✅ Online/offline indicator |
| Feature toggles | ❌ No | ✅ i-Dos, options, settings |
| Click on appliance | ❌ No interaction | ✅ Opens control panel |

### 1.3 Code Organization by Mode

**Separation Strategy:**
```javascript
_update() {
    // Common updates (both modes)
    this._updateTheme();
    this._updateBadge();
    
    if (this._isHomeConnectMode()) {
        this._updateHomeConnect();
    } else {
        this._updateStandard();
    }
}

_updateStandard() {
    // Existing logic - UNCHANGED
    // Preserve exact current behavior
}

_updateHomeConnect() {
    // New Home Connect logic
    this._updateOperationState();
    this._updateProgram();
    this._updateDoor();
    this._updateConnectivity();
    this._updateFeatures();
}
```

---

## 2. CONFIGURATION SCHEMA

### 2.1 Standard Mode Configuration (Unchanged)

```yaml
type: custom:washing-machine-card
mode: standard  # Optional, default

# All existing fields work exactly as before
appliance_type: washer
name: Washing machine
status_entity: binary_sensor.washing_in_progress
power_entity: sensor.washing_machine_power
plug_entity: switch.washing_machine_plug
notify_entity: automation.washing_finished
last_wash_entity: input_datetime.wm_last_start
duration_entity: input_number.wm_last_duration
energy_entity: input_number.wm_last_energy
cost_entity: input_number.wm_last_cost
currency: "€"
language: auto
theme: auto
```

### 2.2 Home Connect Mode Configuration

#### 2.2.1 Washer Configuration

```yaml
type: custom:washing-machine-card
mode: home_connect
appliance_type: washer
name: Washing Machine
language: auto
theme: auto

# Home Connect entity mapping
home_connect:
  washer:
    # Status entities
    operation_state_entity: sensor.washer_operation_state
    active_program_entity: sensor.washer_active_program
    selected_program_entity: sensor.washer_selected_program
    progress_entity: sensor.washer_program_progress
    remaining_time_entity: sensor.washer_remaining_time
    end_time_entity: sensor.washer_program_finish_time
    
    # Control entities
    power_entity: switch.washer_power
    remote_start_entity: binary_sensor.washer_remote_start
    remote_control_entity: binary_sensor.washer_remote_control
    start_entity: switch.washer_start_program  # If available
    pause_entity: switch.washer_pause_program  # If available
    stop_entity: button.washer_stop_program    # If available
    
    # Program selection
    program_selector_entity: select.washer_active_program
    available_programs:  # Optional: filter/order programs
      - "Cotton"
      - "EasyCare"
      - "DelicatesSilk"
      - "Sportswear"
      - "Quick45"
    
    # Options (if supported by your appliance)
    temperature_entity: select.washer_temperature
    spin_speed_entity: select.washer_spin_speed
    
    # Safety
    door_entity: binary_sensor.washer_door
    child_lock_entity: switch.washer_child_lock
    
    # Connectivity
    connectivity_entity: binary_sensor.washer_connection_state
    local_control_entity: binary_sensor.washer_local_control
    
    # i-Dos (Bosch/Siemens specific)
    idos1_active_entity: binary_sensor.washer_idos1_dosing_active
    idos1_level_entity: sensor.washer_idos1_fill_level
    idos2_active_entity: binary_sensor.washer_idos2_dosing_active
    idos2_level_entity: sensor.washer_idos2_fill_level
    idos1_low_entity: binary_sensor.washer_idos1_low_fill
    idos2_low_entity: binary_sensor.washer_idos2_low_fill
```

#### 2.2.2 Dishwasher Configuration

```yaml
type: custom:washing-machine-card
mode: home_connect
appliance_type: dishwasher
name: Dishwasher

home_connect:
  dishwasher:
    # Status entities
    operation_state_entity: sensor.dishwasher_operation_state
    active_program_entity: sensor.dishwasher_active_program
    selected_program_entity: sensor.dishwasher_selected_program
    progress_entity: sensor.dishwasher_program_progress
    end_time_entity: sensor.dishwasher_finish_time
    delayed_start_entity: sensor.dishwasher_delayed_start_time
    
    # Control entities
    power_entity: switch.dishwasher_power
    remote_start_entity: binary_sensor.dishwasher_remote_start
    remote_control_entity: binary_sensor.dishwasher_remote_control
    stop_entity: button.dishwasher_stop_program
    
    # Program selection
    program_selector_entity: select.dishwasher_active_program
    available_programs:
      - "Auto1"
      - "Eco50"
      - "Intensiv70"
      - "Kurz60"
      - "Quick45"
    
    # Door
    door_entity: binary_sensor.dishwasher_door
    
    # Connectivity
    connectivity_entity: binary_sensor.dishwasher_connection_state
    
    # Features (Bosch/Siemens specific)
    hygiene_plus_entity: switch.dishwasher_hygiene_plus
    intensive_zone_entity: switch.dishwasher_intensive_zone
    variospeed_plus_entity: switch.dishwasher_variospeed_plus
    silence_on_demand_entity: switch.dishwasher_silence_on_demand
    brilliant_dry_entity: switch.dishwasher_brilliant_dry
    
    # Consumables
    salt_low_entity: binary_sensor.dishwasher_salt_lack
    rinseaid_low_entity: binary_sensor.dishwasher_rinse_aid_lack
```

### 2.3 Configuration Structure in Code

```javascript
static DEFAULTS = {
    // Existing defaults
    appliance_type: "washer",
    mode: "standard",  // NEW - default mode
    language: "auto",
    theme: "auto",
    // ... all existing defaults
    
    // Home Connect defaults
    home_connect: null,  // Only populated in home_connect mode
};

setConfig(config) {
    if (!config.status_entity && !config.home_connect) {
        throw new Error("washing-machine-card: status_entity is required in standard mode");
    }
    
    this._config = {
        ...WashingMachineCard.DEFAULTS,
        ...config,
        appliance_type: WashingMachineCard.normalizeType(config.appliance_type),
    };
    
    // Validate mode-specific requirements
    if (this._getMode() === "home_connect") {
        if (!config.home_connect) {
            throw new Error("washing-machine-card: home_connect configuration required in home_connect mode");
        }
    }
    
    this._uid = `a${Math.random().toString(36).slice(2, 9)}`;
    this._built = false;
}
```

---

## 3. APPLIANCE ABSTRACTION LAYER

### 3.1 Capability Detection System

**Purpose:** Determine what features the appliance supports based on configuration.

```javascript
_getApplianceCapabilities() {
    const mode = this._getMode();
    const type = this._applianceType;
    
    if (mode === "standard") {
        return {
            mode: "standard",
            type: type,
            hasPrograms: false,
            hasDoor: false,
            hasInteractiveControls: false,
            hasConnectivity: false,
            hasOptions: false,
            hasFeatures: false,
            hasIDos: false,
            hasConsumables: false,
        };
    }
    
    // Home Connect mode
    const hc = this._config.home_connect?.[type] || {};
    
    return {
        mode: "home_connect",
        type: type,
        hasPrograms: !!(hc.program_selector_entity || hc.active_program_entity),
        hasDoor: !!hc.door_entity,
        hasInteractiveControls: !!(hc.power_entity || hc.program_selector_entity),
        hasConnectivity: !!hc.connectivity_entity,
        hasOptions: !!(hc.temperature_entity || hc.spin_speed_entity),
        hasFeatures: this._hasAnyFeature(hc),
        hasIDos: this._hasIDos(hc),
        hasConsumables: !!(hc.salt_low_entity || hc.rinseaid_low_entity),
        hasRemoteControl: !!hc.remote_control_entity,
        hasRemoteStart: !!hc.remote_start_entity,
    };
}

_hasAnyFeature(hc) {
    return !!(
        hc.hygiene_plus_entity ||
        hc.intensive_zone_entity ||
        hc.variospeed_plus_entity ||
        hc.silence_on_demand_entity ||
        hc.brilliant_dry_entity
    );
}

_hasIDos(hc) {
    return !!(
        hc.idos1_active_entity ||
        hc.idos2_active_entity
    );
}
```

### 3.2 Entity Mapping Strategy

**Design Goal:** Provide clean entity access while preserving backward compatibility.

```javascript
// Backward-compatible entity accessor (unchanged)
_st(entityId) {
    return entityId ? this._hass.states[entityId] : undefined;
}

// New: Home Connect entity accessor
_hcEntity(entityKey) {
    if (!this._isHomeConnectMode()) return undefined;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    if (!hc) return undefined;
    
    const entityId = hc[entityKey];
    return this._st(entityId);
}

// Convenience accessors
_getOperationState() {
    return this._hcEntity("operation_state_entity")?.state;
}

_getActiveProgram() {
    return this._hcEntity("active_program_entity")?.state;
}

_getSelectedProgram() {
    return this._hcEntity("selected_program_entity")?.state;
}

_getDoorState() {
    const door = this._hcEntity("door_entity");
    if (!door) return null;
    // binary_sensor: on = open, off = closed
    return door.state === "on" ? "open" : "closed";
}

_getProgress() {
    const progress = this._hcEntity("progress_entity")?.state;
    return progress ? parseFloat(progress) : null;
}

_getConnectivityState() {
    const conn = this._hcEntity("connectivity_entity");
    if (!conn) return null;
    return conn.state === "on" ? "connected" : "disconnected";
}
```

### 3.3 State Management Strategy

**Home Connect Operation States:**
- `Inactive` - Appliance is off
- `Ready` - Powered on, no program selected
- `DelayedStart` - Program scheduled for later
- `Run` - Program actively running
- `Pause` - Program paused
- `ActionRequired` - User action needed (e.g., add detergent)
- `Finished` - Program completed
- `Error` - Error state
- `Aborting` - Program being aborted

**State Mapping:**

```javascript
_computeApplianceState() {
    const mode = this._getMode();
    
    if (mode === "standard") {
        // Existing logic - UNCHANGED
        if (this._isRunning()) return "running";
        const c = this._config;
        if (c.power_entity) {
            const p = parseFloat(this._st(c.power_entity)?.state);
            if (!isNaN(p) && p >= 1) return "idle";
        }
        return "off";
    }
    
    // Home Connect mode
    const opState = this._getOperationState();
    if (!opState) return "unknown";
    
    const state = opState.toLowerCase();
    
    // Map Home Connect states to card states
    if (state === "run") return "running";
    if (state === "pause") return "paused";
    if (state === "ready") return "ready";
    if (state === "delayedstart") return "delayed";
    if (state === "finished") return "finished";
    if (state === "error") return "error";
    if (state === "actionrequired") return "action_required";
    if (state === "inactive") return "off";
    
    return "idle";
}

_isRunning() {
    const mode = this._getMode();
    
    if (mode === "standard") {
        // Existing logic - UNCHANGED
        const c = this._config;
        const status = this._st(c.status_entity);
        const byStatus = status && c.running_states.includes(String(status.state).toLowerCase());
        
        let byPower = false;
        if (c.power_entity) {
            const p = parseFloat(this._st(c.power_entity)?.state);
            byPower = !isNaN(p) && p > c.power_threshold;
        }
        
        return byStatus || byPower;
    }
    
    // Home Connect mode
    return this._computeApplianceState() === "running";
}
```

---

## 4. SERVICE CALL STRATEGY

### 4.1 Service Call Abstraction

**Unified service call interface:**

```javascript
_callService(domain, service, data) {
    if (!this._hass) return;
    return this._hass.callService(domain, service, data);
}

_toggleEntity(entityId) {
    if (!entityId) return;
    const domain = entityId.split(".")[0];
    const svcDomain = ["switch", "light", "input_boolean", "fan", "automation"]
        .includes(domain) ? domain : "homeassistant";
    this._callService(svcDomain, "toggle", { entity_id: entityId });
}

_selectOption(entityId, option) {
    if (!entityId || !option) return;
    this._callService("select", "select_option", {
        entity_id: entityId,
        option: option,
    });
}

_setValue(entityId, value) {
    if (!entityId || value === undefined) return;
    this._callService("number", "set_value", {
        entity_id: entityId,
        value: value,
    });
}

_pressButton(entityId) {
    if (!entityId) return;
    this._callService("button", "press", {
        entity_id: entityId,
    });
}
```

### 4.2 Home Connect-Specific Actions

```javascript
// Power control
_hcPowerOn() {
    const entityId = this._hcEntity("power_entity")?.entity_id;
    if (entityId) this._callService("switch", "turn_on", { entity_id: entityId });
}

_hcPowerOff() {
    const entityId = this._hcEntity("power_entity")?.entity_id;
    if (entityId) this._callService("switch", "turn_off", { entity_id: entityId });
}

// Program selection
_hcSelectProgram(programName) {
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    if (!hc?.program_selector_entity) return;
    
    this._selectOption(hc.program_selector_entity, programName);
}

// Start/Pause/Stop
_hcStart() {
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    if (hc.start_entity) {
        this._toggleEntity(hc.start_entity);
    } else {
        // Fallback: Some integrations use remote_start
        const remoteStart = hc.remote_start_entity;
        if (remoteStart) this._toggleEntity(remoteStart);
    }
}

_hcPause() {
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    if (hc.pause_entity) this._toggleEntity(hc.pause_entity);
}

_hcStop() {
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    if (hc.stop_entity) this._pressButton(hc.stop_entity);
}

// Feature toggles
_hcToggleFeature(featureKey) {
    const entityId = this._hcEntity(featureKey)?.entity_id;
    if (entityId) this._toggleEntity(entityId);
}

// Child lock
_hcToggleChildLock() {
    this._hcToggleFeature("child_lock_entity");
}
```

---

## 5. INTERACTIVE CONTROL SYSTEM

### 5.1 Modal Dialog Infrastructure

**Design:** Use native HTML `<dialog>` element for program selection and control panels.

```javascript
_buildDialog() {
    const dialog = document.createElement("dialog");
    dialog.id = "hcDialog";
    dialog.className = "hc-dialog";
    
    // Style within shadow DOM
    const style = `
        .hc-dialog {
            border: none;
            border-radius: 20px;
            padding: 0;
            max-width: 90vw;
            max-height: 80vh;
            background: var(--wm-grad);
            color: var(--wm-text);
            box-shadow: 0 10px 40px rgba(0,0,0,.3);
        }
        .hc-dialog::backdrop {
            background: rgba(0,0,0,.5);
            backdrop-filter: blur(4px);
        }
        .hc-dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--wm-divider);
        }
        .hc-dialog-title {
            font-size: 18px;
            font-weight: 700;
        }
        .hc-dialog-close {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: none;
            background: var(--wm-btn-bg);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .hc-dialog-body {
            padding: 20px 24px;
            overflow-y: auto;
            max-height: 60vh;
        }
    `;
    
    // Inject style (would be part of main <style> block)
    
    return dialog;
}

_openProgramSelector() {
    const dialog = this.shadowRoot.getElementById("hcDialog");
    if (!dialog) return;
    
    const t = this._t;
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    // Get available programs
    const programEntity = this._hcEntity("program_selector_entity");
    const availablePrograms = hc.available_programs || 
                              programEntity?.attributes?.options || 
                              [];
    
    const currentProgram = this._getSelectedProgram() || this._getActiveProgram();
    
    // Build dialog content
    dialog.innerHTML = `
        <div class="hc-dialog-header">
            <div class="hc-dialog-title">${t.select_program || "Select Program"}</div>
            <button class="hc-dialog-close" id="closeDialog">✕</button>
        </div>
        <div class="hc-dialog-body">
            <div class="hc-program-grid" id="programGrid">
                ${availablePrograms.map(prog => `
                    <div class="hc-program-item ${prog === currentProgram ? 'selected' : ''}" 
                         data-program="${prog}">
                        <div class="hc-program-icon">${this._getProgramIcon(prog)}</div>
                        <div class="hc-program-name">${this._translateProgram(prog)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Attach event listeners
    dialog.getElementById("closeDialog").addEventListener("click", () => dialog.close());
    
    const items = dialog.querySelectorAll(".hc-program-item");
    items.forEach(item => {
        item.addEventListener("click", () => {
            const program = item.dataset.program;
            this._hcSelectProgram(program);
            dialog.close();
        });
    });
    
    dialog.showModal();
}

_getProgramIcon(programName) {
    // Return appropriate icon/emoji for program
    const icons = {
        "Cotton": "👕",
        "EasyCare": "👔",
        "DelicatesSilk": "🧵",
        "Sportswear": "🏃",
        "Quick45": "⚡",
        "Eco50": "🌿",
        "Intensiv70": "💪",
        // ... more mappings
    };
    return icons[programName] || "🔄";
}

_translateProgram(programName) {
    // Translate technical names to user-friendly names
    // Could use localization system
    const translations = {
        "Cotton": this._t.program_cotton || "Cotton",
        "EasyCare": this._t.program_easycare || "Easy Care",
        // ... more translations
    };
    return translations[programName] || programName;
}
```

### 5.2 Interactive SVG Controls

**Design:** Add clickable areas to the SVG appliance graphic in Home Connect mode.

```javascript
_svgWasher(u) {
    const mode = this._getMode();
    const interactiveClass = mode === "home_connect" ? "hc-interactive" : "";
    
    return `
      <svg class="machine ${interactiveClass}" id="machine" viewBox="0 0 220 232" 
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${/* ... existing defs ... */}
        </defs>
        ${this._svgChassis(u)}
        
        ${/* Door - will have open/closed states */}
        <g class="door-group" id="doorGroup">
          <circle cx="110" cy="128" r="58" fill="url(#${u}-ring)"/>
          <circle cx="110" cy="128" r="58" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
          <circle cx="110" cy="128" r="47" fill="#e3e9f0"/>
          <circle cx="110" cy="128" r="42" fill="url(#${u}-glass)"/>
        </g>
        
        ${/* Laundry inside */}
        <g class="laundry">
          <circle cx="100" cy="124" r="14" fill="#ea4335"/>
          <circle cx="119" cy="131" r="13.2" fill="#4285f4"/>
          <circle cx="110" cy="115" r="11" fill="#fbbc05"/>
          <circle cx="103" cy="135" r="8" fill="#f28b82" opacity=".9"/>
        </g>
        
        ${/* Interactive control areas (Home Connect mode only) */}
        ${mode === "home_connect" ? `
          <!-- Program selector button area -->
          <rect class="hc-control" id="hcProgramBtn" x="42" y="20" width="34" height="13" 
                rx="4" fill="transparent" cursor="pointer">
            <title>Select Program</title>
          </rect>
          
          <!-- Power button area -->
          <circle class="hc-control" id="hcPowerBtn" cx="176" cy="27" r="10" 
                  fill="transparent" cursor="pointer">
            <title>Power</title>
          </circle>
          
          <!-- Start/Pause button area (on display) -->
          <rect class="hc-control" id="hcStartBtn" x="88" y="18" width="70" height="18" 
                rx="9" fill="transparent" cursor="pointer">
            <title>Start/Pause</title>
          </rect>
        ` : ''}
        
        ${/* Existing arcs and effects */}
        <g class="arcs">
          <circle cx="110" cy="128" r="53" fill="none" stroke="#2f80ed" 
                  stroke-width="5.5" stroke-linecap="round" 
                  stroke-dasharray="104 62.5" opacity=".95"/>
        </g>
      </svg>`;
}

_attachSVGInteractions() {
    if (!this._isHomeConnectMode()) return;
    
    const programBtn = this._el("hcProgramBtn");
    const powerBtn = this._el("hcPowerBtn");
    const startBtn = this._el("hcStartBtn");
    
    if (programBtn) {
        programBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._openProgramSelector();
        });
    }
    
    if (powerBtn) {
        powerBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._hcTogglePower();
        });
    }
    
    if (startBtn) {
        startBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._hcToggleStartPause();
        });
    }
}

_hcTogglePower() {
    const power = this._hcEntity("power_entity");
    if (!power) return;
    
    if (power.state === "on") {
        if (window.confirm(this._t.confirm_power_off || "Turn off appliance?")) {
            this._hcPowerOff();
        }
    } else {
        this._hcPowerOn();
    }
}

_hcToggleStartPause() {
    const opState = this._getOperationState();
    
    if (opState === "Run") {
        this._hcPause();
    } else if (opState === "Ready" || opState === "Pause") {
        this._hcStart();
    }
}
```

### 5.3 CSS for Interactive Elements

```css
/* Interactive control hover states (Home Connect mode) */
.hc-interactive .hc-control {
    transition: opacity 0.2s;
}

.hc-interactive .hc-control:hover {
    opacity: 0.7;
}

/* Program grid styles */
.hc-program-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.hc-program-item {
    padding: 16px;
    border-radius: 12px;
    background: var(--wm-panel-bg);
    border: 2px solid var(--wm-panel-border);
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
}

.hc-program-item:hover {
    background: var(--wm-btn-on-bg);
    border-color: var(--wm-accent);
    transform: translateY(-2px);
}

.hc-program-item.selected {
    background: var(--wm-btn-on-bg);
    border-color: var(--wm-accent);
    border-width: 3px;
}

.hc-program-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.hc-program-name {
    font-size: 13px;
    font-weight: 600;
}
```

---

## 6. DOOR ANIMATION SYSTEM

### 6.1 Door State Detection

```javascript
_getDoorState() {
    if (!this._isHomeConnectMode()) return null;
    
    const door = this._hcEntity("door_entity");
    if (!door) return null;
    
    // binary_sensor: on = open, off = closed
    return door.state === "on" ? "open" : "closed";
}

_updateDoorAnimation() {
    if (!this._isHomeConnectMode()) return;
    
    const doorState = this._getDoorState();
    if (!doorState) return;
    
    const doorGroup = this._el("doorGroup");
    if (!doorGroup) return;
    
    doorGroup.classList.toggle("door-open", doorState === "open");
    doorGroup.classList.toggle("door-closed", doorState === "closed");
}
```

### 6.2 Washer Door Animation (Rotating Door)

**SVG Structure with Door Separation:**

```javascript
_svgWasherWithDoor(u) {
    return `
      <svg class="machine" id="machine" viewBox="0 0 220 232" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${/* gradients, filters */}
        </defs>
        
        ${this._svgChassis(u)}
        
        <!-- Door group with transform origin at hinge point -->
        <g class="door-group" id="doorGroup" style="transform-origin: 80px 128px;">
          <!-- Outer ring -->
          <circle cx="110" cy="128" r="58" fill="url(#${u}-ring)"/>
          <circle cx="110" cy="128" r="58" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
          
          <!-- Glass window -->
          <circle cx="110" cy="128" r="47" fill="#e3e9f0"/>
          <circle cx="110" cy="128" r="42" fill="url(#${u}-glass)"/>
          
          <!-- Door handle (subtle) -->
          <rect x="155" y="125" width="12" height="6" rx="3" fill="#b0bac6"/>
          
          <!-- Highlight -->
          <ellipse cx="94" cy="106" rx="22" ry="13" fill="#ffffff" opacity=".14"
                   transform="rotate(-24 94 106)"/>
          
          <!-- Inner shadow -->
          <circle cx="110" cy="128" r="42" fill="none" stroke="#0d1526" 
                  stroke-width="2" opacity=".35"/>
        </g>
        
        <!-- Drum interior (visible when door open) -->
        <g class="drum-interior" id="drumInterior" opacity="0">
          <circle cx="110" cy="128" r="40" fill="#304562"/>
          <g class="drum-pattern" opacity=".6">
            <!-- Drum holes pattern -->
            <circle cx="100" cy="115" r="2" fill="#1c2d45"/>
            <circle cx="120" cy="115" r="2" fill="#1c2d45"/>
            <circle cx="95" cy="128" r="2" fill="#1c2d45"/>
            <circle cx="125" cy="128" r="2" fill="#1c2d45"/>
            <circle cx="100" cy="141" r="2" fill="#1c2d45"/>
            <circle cx="120" cy="141" r="2" fill="#1c2d45"/>
          </g>
        </g>
        
        <!-- Laundry (inside drum) -->
        <g class="laundry">
          <circle cx="100" cy="124" r="14" fill="#ea4335"/>
          <circle cx="119" cy="131" r="13.2" fill="#4285f4"/>
          <circle cx="110" cy="115" r="11" fill="#fbbc05"/>
          <circle cx="103" cy="135" r="8" fill="#f28b82" opacity=".9"/>
        </g>
        
        <!-- Progress arcs -->
        <g class="arcs">
          <circle cx="110" cy="128" r="53" fill="none" stroke="#2f80ed" 
                  stroke-width="5.5" stroke-linecap="round" 
                  stroke-dasharray="104 62.5" opacity=".95"/>
        </g>
      </svg>`;
}
```

**CSS Animations:**

```css
/* Door animation - rotating open */
.door-group {
    transform-origin: 80px 128px;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.door-group.door-open {
    transform: rotate(-85deg);
}

.door-group.door-closed {
    transform: rotate(0deg);
}

/* Drum interior visibility */
.drum-interior {
    transition: opacity 0.4s ease-in-out;
}

.door-open ~ .drum-interior {
    opacity: 1;
}

/* Hide laundry when door open (optional) */
.door-open ~ .laundry {
    opacity: 0.3;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
    .door-group,
    .drum-interior {
        transition: none;
    }
}
```

### 6.3 Dishwasher Door Animation (Fold-Down Door)

**SVG Structure:**

```javascript
_svgDishwasherWithDoor(u) {
    return `
      <svg class="machine" id="machine" viewBox="0 0 220 232" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${/* gradients, clips */}
          <clipPath id="${u}-door-clip">
            <rect x="56" y="60" width="108" height="120" rx="8"/>
          </clipPath>
        </defs>
        
        ${this._svgChassis(u)}
        
        <!-- Fixed dishwasher frame -->
        <rect x="48" y="52" width="124" height="148" rx="12" fill="url(#${u}-frame)"/>
        <rect x="48" y="52" width="124" height="148" rx="12" fill="none" 
              stroke="#c2cbd6" stroke-width="1.4"/>
        
        <!-- Door group (transform origin at bottom edge) -->
        <g class="door-group dw-door" id="doorGroup" 
           style="transform-origin: 110px 182px;">
          
          <!-- Glass window -->
          <rect x="56" y="60" width="108" height="120" rx="8" fill="url(#${u}-glass)"/>
          
          <!-- Interior content (dishes, racks) -->
          <g clip-path="url(#${u}-door-clip)">
            <g class="dw-dishes" opacity=".98">
              ${/* dish graphics from original */}
            </g>
            
            <!-- Wash effect -->
            <rect class="dw-wash" x="56" y="60" width="108" height="120" 
                  fill="url(#${u}-mist)"/>
            
            <!-- Water streams -->
            <g>
              <line class="dw-stream" x1="74" y1="64" x2="74" y2="172" 
                    stroke="#9fd0ff" stroke-width="1.6"/>
              <line class="dw-stream" x1="92" y1="64" x2="92" y2="172" 
                    stroke="#9fd0ff" stroke-width="1.6"/>
              ${/* more streams */}
            </g>
          </g>
          
          <!-- Glass reflection -->
          <rect x="62" y="66" width="36" height="18" rx="6" fill="#ffffff" 
                opacity=".12" transform="rotate(-12 80 75)"/>
          
          <!-- Inner shadow -->
          <rect x="56" y="60" width="108" height="120" rx="8" fill="none" 
                stroke="#0d1526" stroke-width="2" opacity=".3"/>
          
          <!-- Handle bar -->
          <rect x="78" y="188" width="64" height="7" rx="3.5" fill="#cfd7e0" 
                stroke="#b4bec9" stroke-width="1"/>
        </g>
        
        <!-- Interior view (visible when door open) -->
        <g class="dw-interior" id="dwInterior" opacity="0">
          <!-- Rack structure -->
          <rect x="56" y="90" width="108" height="4" rx="2" fill="#8fa0b5" opacity=".7"/>
          <rect x="56" y="140" width="108" height="4" rx="2" fill="#8fa0b5" opacity=".7"/>
          
          <!-- Interior walls -->
          <rect x="56" y="60" width="4" height="120" fill="#2a3a52" opacity=".5"/>
          <rect x="160" y="60" width="4" height="120" fill="#2a3a52" opacity=".5"/>
        </g>
        
        <!-- Progress frame -->
        <rect class="dw-frame" x="52" y="56" width="116" height="140" rx="10" 
              fill="none" stroke="#2f80ed" stroke-width="4" stroke-linecap="round"
              stroke-dasharray="90 70" opacity=".9"/>
      </svg>`;
}
```

**CSS Animations:**

```css
/* Dishwasher door - fold down animation */
.dw-door {
    transform-origin: 110px 182px;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.dw-door.door-open {
    transform: rotateX(45deg);
    /* Note: This requires CSS 3D transforms */
    /* May need perspective on parent */
}

.dw-door.door-closed {
    transform: rotateX(0deg);
}

/* Parent perspective for 3D effect */
.machine {
    perspective: 800px;
    perspective-origin: 50% 40%;
}

/* Interior visibility */
.dw-interior {
    transition: opacity 0.4s ease-in-out 0.2s;
}

.door-open ~ .dw-interior {
    opacity: 1;
}

/* Dishes fade slightly when door opens */
.dw-door.door-open .dw-dishes {
    opacity: 0.5;
}
```

---

## 7. STATUS VISUALIZATION

### 7.1 Connectivity Indicator

**Design:** Add connectivity status badge in header.

```javascript
_buildConnectivityIndicator() {
    if (!this._isHomeConnectMode()) return '';
    
    return `
        <div class="hc-connectivity" id="hcConnectivity">
            <div class="hc-conn-dot" id="hcConnDot"></div>
            <span class="hc-conn-label" id="hcConnLabel"></span>
        </div>
    `;
}

_updateConnectivity() {
    if (!this._isHomeConnectMode()) return;
    
    const connState = this._getConnectivityState();
    const dot = this._el("hcConnDot");
    const label = this._el("hcConnLabel");
    
    if (!dot || !label) return;
    
    if (connState === "connected") {
        dot.className = "hc-conn-dot connected";
        label.textContent = this._t.connected || "Connected";
    } else if (connState === "disconnected") {
        dot.className = "hc-conn-dot disconnected";
        label.textContent = this._t.disconnected || "Offline";
    } else {
        dot.className = "hc-conn-dot unknown";
        label.textContent = this._t.unknown || "Unknown";
    }
}
```

**CSS:**

```css
.hc-connectivity {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--wm-panel-bg);
}

.hc-conn-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.hc-conn-dot.connected {
    background: #22b263;
    box-shadow: 0 0 0 2px rgba(34, 178, 99, 0.2);
}

.hc-conn-dot.disconnected {
    background: #d93025;
    box-shadow: 0 0 0 2px rgba(217, 48, 37, 0.2);
}

.hc-conn-dot.unknown {
    background: #8a95a3;
}

.hc-conn-label {
    color: var(--wm-muted);
}
```

### 7.2 Program Display Panel

**Add current program display to status panel:**

```javascript
_buildProgramDisplay() {
    if (!this._isHomeConnectMode()) return '';
    
    const t = this._t;
    
    return `
        <div class="hc-program-panel hidden" id="hcProgramPanel">
            <div class="hc-program-row">
                <span class="hc-program-label">${t.active_program || "Program"}</span>
                <span class="hc-program-value" id="hcProgramValue">—</span>
            </div>
            <div class="hc-program-progress hidden" id="hcProgressBar">
                <div class="hc-progress-fill" id="hcProgressFill"></div>
            </div>
        </div>
    `;
}

_updateProgramDisplay() {
    if (!this._isHomeConnectMode()) return;
    
    const activeProgram = this._getActiveProgram();
    const progress = this._getProgress();
    
    const panel = this._el("hcProgramPanel");
    const value = this._el("hcProgramValue");
    const progressBar = this._el("hcProgressBar");
    const progressFill = this._el("hcProgressFill");
    
    if (!panel || !value) return;
    
    if (activeProgram) {
        panel.classList.remove("hidden");
        value.textContent = this._translateProgram(activeProgram);
        
        if (progress !== null && progressBar && progressFill) {
            progressBar.classList.remove("hidden");
            progressFill.style.width = `${progress}%`;
        } else if (progressBar) {
            progressBar.classList.add("hidden");
        }
    } else {
        panel.classList.add("hidden");
    }
}
```

### 7.3 Feature Status Display (i-Dos, Options)

**Compact feature status chips:**

```javascript
_buildFeatureChips() {
    if (!this._isHomeConnectMode()) return '';
    
    const caps = this._getApplianceCapabilities();
    if (!caps.hasIDos && !caps.hasFeatures && !caps.hasConsumables) {
        return '';
    }
    
    return `
        <div class="hc-features" id="hcFeatures">
            <!-- Feature chips will be dynamically populated -->
        </div>
    `;
}

_updateFeatureChips() {
    if (!this._isHomeConnectMode()) return;
    
    const container = this._el("hcFeatures");
    if (!container) return;
    
    const chips = [];
    
    // i-Dos indicators
    const idos1Active = this._hcEntity("idos1_active_entity")?.state === "on";
    const idos1Low = this._hcEntity("idos1_low_entity")?.state === "on";
    const idos2Active = this._hcEntity("idos2_active_entity")?.state === "on";
    const idos2Low = this._hcEntity("idos2_low_entity")?.state === "on";
    
    if (idos1Active) {
        chips.push(`<div class="hc-chip ${idos1Low ? 'warning' : ''}">i-Dos 1</div>`);
    }
    if (idos2Active) {
        chips.push(`<div class="hc-chip ${idos2Low ? 'warning' : ''}">i-Dos 2</div>`);
    }
    
    // Dishwasher consumables
    const saltLow = this._hcEntity("salt_low_entity")?.state === "on";
    const rinseaidLow = this._hcEntity("rinseaid_low_entity")?.state === "on";
    
    if (saltLow) {
        chips.push(`<div class="hc-chip warning">🧂 ${this._t.salt_low || "Salt Low"}</div>`);
    }
    if (rinseaidLow) {
        chips.push(`<div class="hc-chip warning">💧 ${this._t.rinseaid_low || "Rinse Aid Low"}</div>`);
    }
    
    // Active features
    const hygiene = this._hcEntity("hygiene_plus_entity")?.state === "on";
    const intensive = this._hcEntity("intensive_zone_entity")?.state === "on";
    const variospeed = this._hcEntity("variospeed_plus_entity")?.state === "on";
    
    if (hygiene) chips.push(`<div class="hc-chip">🦠 Hygiene+</div>`);
    if (intensive) chips.push(`<div class="hc-chip">💪 Intensive</div>`);
    if (variospeed) chips.push(`<div class="hc-chip">⚡ Vario+</div>`);
    
    container.innerHTML = chips.join('');
    container.classList.toggle("hidden", chips.length === 0);
}
```

**CSS:**

```css
.hc-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.hc-chip {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 12px;
    background: var(--wm-badge-bg);
    color: var(--wm-badge-fg);
    white-space: nowrap;
}

.hc-chip.warning {
    background: var(--wm-badge-idle-bg);
    color: var(--wm-badge-idle-fg);
}

.hc-chip.active {
    background: var(--wm-badge-run-bg);
    color: var(--wm-badge-run-fg);
}
```

---

## 8. LOCALIZATION STRATEGY

### 8.1 Extended String Table

**Add Home Connect-specific strings to existing STRINGS object:**

```javascript
static STRINGS = {
    en: {
        // Existing strings...
        name: "Washing machine",
        badge_running: "RUNNING",
        // ... all existing strings ...
        
        // NEW: Home Connect strings
        select_program: "Select Program",
        active_program: "Program",
        selected_program: "Selected",
        confirm_power_off: "Turn off the appliance? This will stop the current program.",
        connected: "Connected",
        disconnected: "Offline",
        unknown: "Unknown",
        remote_start_enabled: "Remote Start Enabled",
        remote_control_active: "Remote Control Active",
        door_open: "Door Open",
        door_closed: "Door Closed",
        child_lock_active: "Child Lock Active",
        salt_low: "Salt Low",
        rinseaid_low: "Rinse Aid Low",
        
        // Program translations
        program_cotton: "Cotton",
        program_easycare: "Easy Care",
        program_delicates: "Delicates/Silk",
        program_sportswear: "Sportswear",
        program_quick45: "Quick 45",
        program_eco50: "Eco 50°",
        program_intensiv70: "Intensive 70°",
        program_auto: "Auto",
        program_kurz60: "Short 60",
        program_machineCare: "Machine Care",
        program_nightwash: "Night Wash",
        program_prerinse: "Pre-Rinse",
    },
    
    ru: {
        // Existing Russian strings...
        
        // NEW: Home Connect Russian
        select_program: "Выбрать программу",
        active_program: "Программа",
        connected: "Подключено",
        disconnected: "Не в сети",
        door_open: "Дверь открыта",
        door_closed: "Дверь закрыта",
        // ... more translations
    },
    
    de: {
        // Existing German strings...
        
        // NEW: Home Connect German
        select_program: "Programm wählen",
        active_program: "Programm",
        connected: "Verbunden",
        disconnected: "Offline",
        door_open: "Tür offen",
        door_closed: "Tür geschlossen",
        // ... more translations
    },
    
    fr: {
        // Existing French strings...
        
        // NEW: Home Connect French
        select_program: "Sélectionner le programme",
        active_program: "Programme",
        connected: "Connecté",
        disconnected: "Hors ligne",
        door_open: "Porte ouverte",
        door_closed: "Porte fermée",
        // ... more translations
    },
};
```

---

## 9. IMPLEMENTATION PHASES

### Phase 0: Foundation (Week 1)
**Goal:** Add mode system without breaking existing functionality

**Tasks:**
- Add `mode` config field with "standard" default
- Add `_getMode()` and `_isHomeConnectMode()` helpers
- Add `home_connect` config object structure
- Update `setConfig()` validation
- Add mode detection tests
- **Validation:** All existing configs work unchanged

### Phase 1: Home Connect Configuration (Week 1-2)
**Goal:** Entity mapping infrastructure

**Tasks:**
- Add washer entity mapping (all entities)
- Add dishwasher entity mapping (all entities)
- Add `_hcEntity(key)` accessor
- Add convenience accessors (`_getOperationState()`, etc.)
- Add capability detection (`_getApplianceCapabilities()`)
- Update editor with home_connect section
- **Validation:** Config validates, entities accessible

### Phase 2: Service Call Infrastructure (Week 2)
**Goal:** Service abstractions

**Tasks:**
- Add `_callService()` base method
- Add `_selectOption()` for select entities
- Add `_setValue()` for number entities
- Add `_pressButton()` for button entities
- Add HC-specific methods (`_hcSelectProgram()`, etc.)
- **Validation:** Service calls work in test environment

### Phase 3: State Management (Week 2-3)
**Goal:** Home Connect state computation

**Tasks:**
- Extend `_computeApplianceState()` for HC mode
- Add operation state mapping
- Update `_isRunning()` with mode awareness
- Add progress tracking
- Add door state tracking
- **Validation:** Badge and animations work correctly

### Phase 4: Interactive Controls - Washer (Week 3-4)
**Goal:** Program selection UI

**Tasks:**
- Add `<dialog>` infrastructure
- Build program selector UI
- Add program selection logic
- Add SVG click handlers (mode-gated)
- Add interactive SVG areas to washer
- Test in Shadow DOM
- **Validation:** Program selection works end-to-end

### Phase 5: Door Animation - Washer (Week 4)
**Goal:** Animated door visualization

**Tasks:**
- Refactor washer SVG with door group
- Add door open/closed CSS transitions
- Add drum interior graphics
- Connect to door entity state
- Test animation performance
- **Validation:** Door animates smoothly on state change

### Phase 6: Interactive Controls - Dishwasher (Week 5)
**Goal:** Dishwasher program selection

**Tasks:**
- Add dishwasher-specific programs
- Add dishwasher SVG click handlers
- Test dishwasher program selection
- **Validation:** Dishwasher controls work

### Phase 7: Door Animation - Dishwasher (Week 5)
**Goal:** Dishwasher door animation

**Tasks:**
- Refactor dishwasher SVG with door group
- Add fold-down CSS 3D transform
- Add interior rack graphics
- Test animation
- **Validation:** Dishwasher door animates

### Phase 8: Status Visualization (Week 6)
**Goal:** Connectivity, features, progress

**Tasks:**
- Add connectivity indicator
- Add program display panel
- Add progress bar
- Add feature chips (i-Dos, consumables, options)
- **Validation:** All status indicators work

### Phase 9: Localization (Week 6)
**Goal:** Translate all new strings

**Tasks:**
- Add English strings
- Add Russian strings
- Add German strings
- Add French strings
- Test language switching
- **Validation:** All languages display correctly

### Phase 10: Documentation (Week 7)
**Goal:** Complete documentation

**Tasks:**
- Update README with Home Connect mode
- Add configuration examples
- Add screenshots
- Update CHANGELOG
- Create migration guide
- **Validation:** Docs are clear and complete

### Phase 11: Testing & Polish (Week 7-8)
**Goal:** Production readiness

**Tasks:**
- Test all washer entities
- Test all dishwasher entities
- Test mode switching
- Test backward compatibility
- Test mobile layouts
- Performance testing
- Fix bugs
- **Validation:** Ready for release

---

## 10. FILE SIZE PROJECTION

**Current:**
- Line count: 2042 lines
- File size: ~91 KB

**Estimated Additions:**
```
Mode system:                     +50 lines
Configuration handling:          +100 lines
Entity accessors:                +150 lines
Service abstractions:            +100 lines
State management:                +150 lines
Dialog infrastructure:           +200 lines
Program selection UI:            +150 lines
Door animations (both):          +200 lines
Status visualization:            +200 lines
Localization additions:          +150 lines
Interactive SVG updates:         +100 lines
CSS additions:                   +200 lines
-------------------------------------------
TOTAL ADDITIONS:                 ~1750 lines
```

**Projected Total:**
- Line count: ~3800 lines
- File size: ~170 KB

**Mitigation:**
- Keep code dense
- Avoid duplication through helper functions
- Minify CSS where possible (remove comments in production)
- Use concise variable names where clarity isn't sacrificed

---

## 11. BACKWARD COMPATIBILITY GUARANTEE

### 11.1 Configuration Compatibility

**Guarantee:** All existing configurations work without modification.

**Mechanism:**
```javascript
// Default mode is "standard"
const mode = config.mode || "standard";

// Standard mode uses existing logic paths
if (mode === "standard") {
    // Execute original code unchanged
}
```

**Test Cases:**
```yaml
# Test 1: Minimal config (currently works)
type: custom:washing-machine-card
status_entity: binary_sensor.washing_in_progress

# Test 2: Full standard config (currently works)
type: custom:washing-machine-card
appliance_type: washer
name: Washing machine
status_entity: binary_sensor.washing_in_progress
power_entity: sensor.washing_machine_power
plug_entity: switch.washing_machine_plug
# ... all other existing fields

# Test 3: Smart appliance config (currently works)
type: custom:washing-machine-card
appliance_type: washer
status_entity: sensor.washer_operation_state
plug_entity: switch.washer_power
running_states: [run]
```

**Validation:** All three test cases must render and behave identically to v1.3.0.

### 11.2 Behavior Compatibility

**Guarantee:** Standard mode behaves exactly like current version.

**Protected Behaviors:**
- Status detection logic
- Animation triggers
- Power gauge calculation
- Last cycle panel display
- Button functionality
- Theme switching
- Language switching
- All existing click handlers

**Implementation Strategy:**
- Keep existing methods unchanged
- Add new methods with HC-specific names
- Route through mode-aware dispatchers

### 11.3 Visual Compatibility

**Guarantee:** Standard mode looks identical to current version.

**Protected Visual Elements:**
- Card layout and spacing
- Color scheme and theme
- Badge styles
- Ring animation
- Power gauge
- Last cycle grid
- Header buttons
- SVG appliance graphics (when in standard mode)

**Implementation Strategy:**
- CSS changes only add new classes
- Existing classes remain unchanged
- Home Connect elements hidden in standard mode

---

## 12. RISKS & MITIGATION

### 12.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| File size exceeds 200KB | Performance impact | MEDIUM | Keep code dense, optimize CSS, consider compression |
| Dialog doesn't work in Shadow DOM | Feature broken | LOW | Use native `<dialog>`, test early |
| Door animations lag on mobile | Poor UX | MEDIUM | Use CSS transforms (GPU-accelerated), test on devices |
| Mode detection fails | Wrong behavior | LOW | Simple string comparison, extensive testing |
| Entity mapping breaks | No data display | MEDIUM | Fallback to undefined, show placeholder |

### 12.2 Compatibility Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing configs | User dashboards break | HIGH | Mode isolation, extensive testing |
| HA integration changes | Features stop working | LOW | Use standard HA APIs, document version requirements |
| Browser incompatibility | Card doesn't render | LOW | Use widely-supported APIs, test major browsers |

### 12.3 UX Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Configuration too complex | Users confused | MEDIUM | Clear examples, visual editor, progressive disclosure |
| Mobile layout issues | Poor mobile UX | MEDIUM | Responsive design, test on narrow widths |
| Dialog UX inconsistent | Feels non-native | MEDIUM | Match HA dialog styles, use standard patterns |
| Too many status indicators | Visual clutter | MEDIUM | Show only active features, use compact chips |

---

## 13. SUCCESS CRITERIA

### 13.1 Functional Requirements

✅ **MUST HAVE:**
- [ ] Backward compatibility: All existing configs work unchanged
- [ ] Mode system: `mode: "standard"` and `mode: "home_connect"`
- [ ] Washer support: All specified entities and features
- [ ] Dishwasher support: All specified entities and features
- [ ] Program selection: Interactive program picker
- [ ] Door animation: Washer and dishwasher doors animate
- [ ] Status display: Connectivity, program, features

✅ **SHOULD HAVE:**
- [ ] i-Dos support: Display and status indicators
- [ ] Consumables display: Salt/rinse aid warnings
- [ ] Feature chips: Active features shown as chips
- [ ] Progress visualization: Program progress display
- [ ] Localization: All 4 languages updated

✅ **NICE TO HAVE:**
- [ ] Options control: Temperature, spin speed selection
- [ ] Remote start indicator: Show when available
- [ ] Child lock indicator: Visual indicator

### 13.2 Quality Requirements

✅ **Performance:**
- [ ] File size under 200KB
- [ ] Animations at 60fps on modern devices
- [ ] Dialog opens in <100ms
- [ ] No layout shifts on state updates

✅ **Compatibility:**
- [ ] Works on Home Assistant 2023.x and newer
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile (iOS, Android)
- [ ] Works in Shadow DOM context

✅ **Usability:**
- [ ] Configuration clear and well-documented
- [ ] Visual editor supports all options
- [ ] Error messages are helpful
- [ ] Mobile-friendly controls

---

## CONCLUSION

This proposed architecture provides a **comprehensive roadmap** for adding Home Connect functionality while maintaining the project's core principles:

✅ **Zero Breaking Changes** - Mode-based isolation  
✅ **Single File** - All code in washing-machine-card.js  
✅ **Zero Dependencies** - Pure vanilla JavaScript  
✅ **Progressive Enhancement** - Features appear when configured  
✅ **Clean Architecture** - Clear separation of concerns

**Next Step:** Risk Assessment document to validate this approach and identify edge cases.

---

**Document Status:** ✅ COMPLETE  
**Architecture Readiness:** ✅ APPROVED  
**Ready for Risk Assessment:** ✅ YES
