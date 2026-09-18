# PHASE 1: CONFIGURATION INFRASTRUCTURE
**Home Connect Entity Mapping Implementation Plan**

**Duration:** 5 days  
**Goal:** Complete entity mapping infrastructure for Home Connect appliances

---

## OVERVIEW

Phase 1 builds the foundation for accessing Home Connect entities through a clean abstraction layer. This phase adds:
- Home Connect entity accessor methods
- Convenience methods for common entity types
- Complete entity configuration documentation
- Test configurations for washer and dishwasher
- Basic visual editor support

---

## TASKS BREAKDOWN

### Task 1.1: Add Home Connect Entity Accessor
**Effort:** 2 hours  
**Priority:** P0 (Critical)

#### Implementation

Add to `WashingMachineCard` class after `_st()` method:

```javascript
/**
 * Home Connect Entity Accessor
 * ============================
 * Retrieves Home Connect entities from the nested home_connect configuration.
 * Returns undefined in standard mode.
 * 
 * @param {string} entityKey - Key from home_connect.{type} configuration
 * @returns {object|undefined} Entity state object or undefined
 */
_hcEntity(entityKey) {
    if (!this._isHomeConnectMode()) return undefined;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    if (!hc) return undefined;
    
    const entityId = hc[entityKey];
    return this._st(entityId);  // Reuses existing _st() method
}
```

#### Validation
- [ ] Returns `undefined` in standard mode
- [ ] Returns entity object in HC mode when entity exists
- [ ] Returns `undefined` when entity key not configured
- [ ] Works with washer and dishwasher configs

#### Test Code
```javascript
// Test in tests/phase1_test.js
const card = new WashingMachineCard();

// Standard mode - should return undefined
card.setConfig({ status_entity: 'binary_sensor.test' });
assert.strictEqual(card._hcEntity('power_entity'), undefined);

// HC mode - should return entity
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: {
        washer: {
            power_entity: 'switch.washer_power'
        }
    }
});
// Note: Need to inject mock hass object with states
card._hass = {
    states: {
        'switch.washer_power': { state: 'on', attributes: {} }
    }
};
const entity = card._hcEntity('power_entity');
assert.strictEqual(entity.state, 'on');
```

---

### Task 1.2: Add Convenience Accessors for Status Entities
**Effort:** 2 hours  
**Priority:** P0 (Critical)

#### Implementation

Add after `_hcEntity()`:

```javascript
// ========================================
// HOME CONNECT CONVENIENCE ACCESSORS
// ========================================
// These methods provide quick access to commonly used Home Connect entities.
// All return appropriate values or null when entity not configured.
// ========================================

/**
 * Get current operation state (Run, Pause, Ready, etc.)
 * @returns {string|null}
 */
_getOperationState() {
    return this._hcEntity("operation_state_entity")?.state;
}

/**
 * Get active (running) program name
 * @returns {string|null}
 */
_getActiveProgram() {
    return this._hcEntity("active_program_entity")?.state;
}

/**
 * Get selected (queued) program name
 * @returns {string|null}
 */
_getSelectedProgram() {
    return this._hcEntity("selected_program_entity")?.state;
}

/**
 * Get door state (open/closed)
 * @returns {string|null} "open", "closed", or null
 */
_getDoorState() {
    const door = this._hcEntity("door_entity");
    if (!door) return null;
    // binary_sensor: on = open, off = closed
    if (door.state === "on") return "open";
    if (door.state === "off") return "closed";
    return null;
}

/**
 * Get program progress percentage
 * @returns {number|null}
 */
_getProgress() {
    const progress = this._hcEntity("progress_entity")?.state;
    if (!progress) return null;
    const val = parseFloat(progress);
    return isNaN(val) ? null : val;
}

/**
 * Get remaining time (may be ISO duration string)
 * @returns {string|null}
 */
_getRemainingTime() {
    return this._hcEntity("remaining_time_entity")?.state;
}

/**
 * Get estimated end time (datetime)
 * @returns {string|null}
 */
_getEndTime() {
    return this._hcEntity("end_time_entity")?.state;
}

/**
 * Get connectivity state
 * @returns {string|null} "connected", "disconnected", or null
 */
_getConnectivityState() {
    const conn = this._hcEntity("connectivity_entity");
    if (!conn) return null;
    // binary_sensor: on = connected, off = disconnected
    if (conn.state === "on") return "connected";
    if (conn.state === "off") return "disconnected";
    return null;
}

/**
 * Get remote control enabled state
 * @returns {boolean}
 */
_getRemoteControlState() {
    const rc = this._hcEntity("remote_control_entity");
    return rc?.state === "on";
}

/**
 * Get remote start enabled state
 * @returns {boolean}
 */
_getRemoteStartState() {
    const rs = this._hcEntity("remote_start_entity");
    return rs?.state === "on";
}

/**
 * Get child lock state
 * @returns {boolean}
 */
_getChildLockState() {
    const cl = this._hcEntity("child_lock_entity");
    return cl?.state === "on";
}
```

#### Validation
- [ ] All methods return null/false when entity not configured
- [ ] All methods work in HC mode
- [ ] All methods return undefined in standard mode
- [ ] Door state correctly maps binary_sensor values
- [ ] Connectivity state correctly maps binary_sensor values
- [ ] Progress returns number or null

---

### Task 1.3: Document Washer Entity Configuration
**Effort:** 1 hour  
**Priority:** P1 (High)

#### Implementation

Add comprehensive comment block before `_hcEntity()`:

```javascript
/*
 * ============================================================
 * HOME CONNECT ENTITY CONFIGURATION REFERENCE
 * ============================================================
 * This section documents all supported Home Connect entities
 * for each appliance type. All entities are optional unless
 * marked as required.
 * ============================================================
 */

/*
 * WASHER ENTITY CONFIGURATION
 * ===========================
 * 
 * Configuration structure:
 * ------------------------
 * home_connect:
 *   washer:
 *     # Status entities (what's happening)
 *     operation_state_entity: sensor.*_operation_state
 *       Values: Inactive, Ready, DelayedStart, Run, Pause,
 *               ActionRequired, Finished, Error, Aborting
 *     
 *     active_program_entity: sensor.*_active_program
 *       Currently running program name
 *     
 *     selected_program_entity: sensor.*_selected_program
 *       Program selected but not yet started
 *     
 *     progress_entity: sensor.*_program_progress
 *       Percentage complete (0-100)
 *     
 *     remaining_time_entity: sensor.*_remaining_time
 *       Time remaining (may be ISO duration PT1H30M)
 *     
 *     end_time_entity: sensor.*_program_finish_time
 *       Estimated completion datetime
 *     
 *     # Control entities (user actions)
 *     power_entity: switch.*_power
 *       Turn appliance on/off
 *     
 *     remote_start_entity: binary_sensor.*_remote_start
 *       Indicates if remote start is available
 *     
 *     remote_control_entity: binary_sensor.*_remote_control
 *       Indicates if remote control is enabled
 *     
 *     start_entity: switch.*_start_program (optional)
 *       Start program (if separate from remote_start)
 *     
 *     pause_entity: switch.*_pause_program (optional)
 *       Pause running program
 *     
 *     stop_entity: button.*_stop_program (optional)
 *       Stop/abort program
 *     
 *     # Program selection
 *     program_selector_entity: select.*_active_program
 *       Select program to run
 *     
 *     available_programs: [list] (optional)
 *       Filter/order programs shown in selection UI
 *       Example: ["Cotton", "EasyCare", "DelicatesSilk"]
 *       If omitted, shows all options from select entity
 *     
 *     # Options (washing parameters)
 *     temperature_entity: select.*_temperature
 *       Water temperature selection
 *     
 *     spin_speed_entity: select.*_spin_speed
 *       Spin speed selection
 *     
 *     # Safety & status
 *     door_entity: binary_sensor.*_door
 *       Door open/closed (on=open, off=closed)
 *     
 *     child_lock_entity: switch.*_child_lock
 *       Child lock on/off
 *     
 *     # Connectivity
 *     connectivity_entity: binary_sensor.*_connection_state
 *       Connected to cloud (on=connected, off=disconnected)
 *     
 *     local_control_entity: binary_sensor.*_local_control
 *       Local control active (may disable remote control)
 *     
 *     # i-Dos (Bosch/Siemens automatic dosing)
 *     idos1_active_entity: binary_sensor.*_idos1_dosing_active
 *       i-Dos 1 active for this cycle
 *     
 *     idos1_level_entity: sensor.*_idos1_fill_level
 *       i-Dos 1 fill level percentage
 *     
 *     idos2_active_entity: binary_sensor.*_idos2_dosing_active
 *       i-Dos 2 active for this cycle
 *     
 *     idos2_level_entity: sensor.*_idos2_fill_level
 *       i-Dos 2 fill level percentage
 *     
 *     idos1_low_entity: binary_sensor.*_idos1_low_fill
 *       i-Dos 1 needs refilling
 *     
 *     idos2_low_entity: binary_sensor.*_idos2_low_fill
 *       i-Dos 2 needs refilling
 * 
 * Example minimal configuration:
 * ------------------------------
 * home_connect:
 *   washer:
 *     operation_state_entity: sensor.washer_operation_state
 * 
 * Example full configuration:
 * --------------------------
 * See test-configs/04-hc-washer-full.yaml
 */
```

---

### Task 1.4: Document Dishwasher Entity Configuration
**Effort:** 1 hour  
**Priority:** P1 (High)

#### Implementation

Add after washer documentation:

```javascript
/*
 * DISHWASHER ENTITY CONFIGURATION
 * ================================
 * 
 * Configuration structure:
 * ------------------------
 * home_connect:
 *   dishwasher:
 *     # Status entities
 *     operation_state_entity: sensor.*_operation_state
 *       Values: Inactive, Ready, DelayedStart, Run,
 *               Finished, Error, Aborting
 *     
 *     active_program_entity: sensor.*_active_program
 *       Currently running program name
 *     
 *     selected_program_entity: sensor.*_selected_program
 *       Program selected but not yet started
 *     
 *     progress_entity: sensor.*_program_progress
 *       Percentage complete (0-100)
 *     
 *     end_time_entity: sensor.*_finish_time
 *       Estimated completion datetime
 *     
 *     delayed_start_entity: sensor.*_delayed_start_time
 *       Scheduled start time for delayed start
 *     
 *     # Control entities
 *     power_entity: switch.*_power
 *       Turn appliance on/off
 *     
 *     remote_start_entity: binary_sensor.*_remote_start
 *       Indicates if remote start is available
 *     
 *     remote_control_entity: binary_sensor.*_remote_control
 *       Indicates if remote control is enabled
 *     
 *     stop_entity: button.*_stop_program
 *       Stop/abort program
 *     
 *     # Program selection
 *     program_selector_entity: select.*_active_program
 *       Select program to run
 *     
 *     available_programs: [list] (optional)
 *       Filter/order programs shown in selection UI
 *       Example: ["Auto1", "Eco50", "Intensiv70", "Quick45"]
 *     
 *     # Door
 *     door_entity: binary_sensor.*_door
 *       Door open/closed (on=open, off=closed)
 *     
 *     # Connectivity
 *     connectivity_entity: binary_sensor.*_connection_state
 *       Connected to cloud
 *     
 *     # Features (Bosch/Siemens specific options)
 *     hygiene_plus_entity: switch.*_hygiene_plus
 *       Extra hygiene mode
 *     
 *     intensive_zone_entity: switch.*_intensive_zone
 *       Intensive cleaning in bottom rack
 *     
 *     variospeed_plus_entity: switch.*_variospeed_plus
 *       Faster washing
 *     
 *     silence_on_demand_entity: switch.*_silence_on_demand
 *       Quiet mode
 *     
 *     brilliant_dry_entity: switch.*_brilliant_dry
 *       Enhanced drying
 *     
 *     # Consumables
 *     salt_low_entity: binary_sensor.*_salt_lack
 *       Salt needs refilling
 *     
 *     rinseaid_low_entity: binary_sensor.*_rinse_aid_lack
 *       Rinse aid needs refilling
 * 
 * Example minimal configuration:
 * ------------------------------
 * home_connect:
 *   dishwasher:
 *     operation_state_entity: sensor.dishwasher_operation_state
 * 
 * Example full configuration:
 * --------------------------
 * See test-configs/05-hc-dishwasher-full.yaml
 */
```

---

### Task 1.5: Create Full Test Configurations
**Effort:** 2 hours  
**Priority:** P1 (High)

#### File: test-configs/04-hc-washer-full.yaml

```yaml
# ============================================================
# Home Connect Washer - Complete Configuration Example
# ============================================================
# This shows all supported entities for a Home Connect washer.
# Copy and adjust entity IDs to match your appliance.
# Remove lines for entities your appliance doesn't have.
# ============================================================

type: custom:washing-machine-card
mode: home_connect
appliance_type: washer
name: Washing Machine
language: en
theme: auto

home_connect:
  washer:
    # ========================================
    # Status Entities (what's happening)
    # ========================================
    operation_state_entity: sensor.washer_operation_state
    active_program_entity: sensor.washer_active_program
    selected_program_entity: sensor.washer_selected_program
    progress_entity: sensor.washer_program_progress
    remaining_time_entity: sensor.washer_remaining_time
    end_time_entity: sensor.washer_program_finish_time
    
    # ========================================
    # Control Entities (user actions)
    # ========================================
    power_entity: switch.washer_power
    remote_start_entity: binary_sensor.washer_remote_start
    remote_control_entity: binary_sensor.washer_remote_control
    
    # Optional: separate start/pause/stop if available
    # start_entity: switch.washer_start_program
    # pause_entity: switch.washer_pause_program
    # stop_entity: button.washer_stop_program
    
    # ========================================
    # Program Selection
    # ========================================
    program_selector_entity: select.washer_active_program
    
    # Optional: filter/order programs shown in UI
    available_programs:
      - "Cotton"
      - "EasyCare"
      - "DelicatesSilk"
      - "Sportswear"
      - "Quick45"
      - "Mix"
      - "Spin"
      - "Rinse"
    
    # ========================================
    # Options (washing parameters)
    # ========================================
    temperature_entity: select.washer_temperature
    spin_speed_entity: select.washer_spin_speed
    
    # ========================================
    # Safety & Status
    # ========================================
    door_entity: binary_sensor.washer_door
    child_lock_entity: switch.washer_child_lock
    
    # ========================================
    # Connectivity
    # ========================================
    connectivity_entity: binary_sensor.washer_connection_state
    local_control_entity: binary_sensor.washer_local_control
    
    # ========================================
    # i-Dos (Bosch/Siemens automatic dosing)
    # ========================================
    idos1_active_entity: binary_sensor.washer_idos1_dosing_active
    idos1_level_entity: sensor.washer_idos1_fill_level
    idos2_active_entity: binary_sensor.washer_idos2_dosing_active
    idos2_level_entity: sensor.washer_idos2_fill_level
    idos1_low_entity: binary_sensor.washer_idos1_low_fill
    idos2_low_entity: binary_sensor.washer_idos2_low_fill

# ============================================================
# Notes:
# ------------------------------------------------------------
# 1. Replace "washer" prefix with your actual entity prefix
# 2. Entity names may vary by integration/brand
# 3. Not all features available on all appliances
# 4. Remove entities your appliance doesn't have
# ============================================================
```

#### File: test-configs/05-hc-dishwasher-full.yaml

```yaml
# ============================================================
# Home Connect Dishwasher - Complete Configuration Example
# ============================================================

type: custom:washing-machine-card
mode: home_connect
appliance_type: dishwasher
name: Dishwasher
language: en
theme: auto

home_connect:
  dishwasher:
    # ========================================
    # Status Entities
    # ========================================
    operation_state_entity: sensor.dishwasher_operation_state
    active_program_entity: sensor.dishwasher_active_program
    selected_program_entity: sensor.dishwasher_selected_program
    progress_entity: sensor.dishwasher_program_progress
    end_time_entity: sensor.dishwasher_finish_time
    delayed_start_entity: sensor.dishwasher_delayed_start_time
    
    # ========================================
    # Control Entities
    # ========================================
    power_entity: switch.dishwasher_power
    remote_start_entity: binary_sensor.dishwasher_remote_start
    remote_control_entity: binary_sensor.dishwasher_remote_control
    stop_entity: button.dishwasher_stop_program
    
    # ========================================
    # Program Selection
    # ========================================
    program_selector_entity: select.dishwasher_active_program
    
    available_programs:
      - "Auto1"
      - "Auto2"
      - "Eco50"
      - "Intensiv70"
      - "Kurz60"
      - "MachineCare"
      - "NightWash"
      - "PreRinse"
      - "Quick45"
    
    # ========================================
    # Door
    # ========================================
    door_entity: binary_sensor.dishwasher_door
    
    # ========================================
    # Connectivity
    # ========================================
    connectivity_entity: binary_sensor.dishwasher_connection_state
    
    # ========================================
    # Features (Bosch/Siemens options)
    # ========================================
    hygiene_plus_entity: switch.dishwasher_hygiene_plus
    intensive_zone_entity: switch.dishwasher_intensive_zone
    variospeed_plus_entity: switch.dishwasher_variospeed_plus
    silence_on_demand_entity: switch.dishwasher_silence_on_demand
    brilliant_dry_entity: switch.dishwasher_brilliant_dry
    
    # ========================================
    # Consumables
    # ========================================
    salt_low_entity: binary_sensor.dishwasher_salt_lack
    rinseaid_low_entity: binary_sensor.dishwasher_rinse_aid_lack

# ============================================================
# Notes:
# ------------------------------------------------------------
# 1. Feature entities may not be available on all models
# 2. Some programs may have different names
# 3. Check Developer Tools → States for exact entity names
# ============================================================
```

---

### Task 1.6: Add Visual Editor Mode Selection
**Effort:** 4 hours  
**Priority:** P2 (Medium)

#### Implementation

Add to `WashingMachineCardEditor._sections`:

```javascript
{
    title: "Operating Mode",
    icon: "mdi:cog-outline",
    expanded: true,  // Show by default
    fields: [{
        key: "mode",
        kind: "select",
        title: "Mode",
        description: "Standard mode for basic appliances, Home Connect for smart appliances",
        default: "standard",
        selector: {
            select: {
                mode: "dropdown",
                options: [{
                    value: "standard",
                    label: "Standard (current functionality)"
                }, {
                    value: "home_connect",
                    label: "Home Connect (smart appliance features)"
                }],
            },
        },
    }],
},
```

Add informational message when HC mode selected:

```javascript
// In _build() method, after editor container
const modeInfo = document.createElement("div");
modeInfo.id = "modeInfo";
modeInfo.className = "mode-info hidden";
modeInfo.innerHTML = `
    <style>
        .mode-info {
            margin: 12px 0;
            padding: 12px 16px;
            background: var(--primary-color);
            color: var(--text-primary-color);
            border-radius: 8px;
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }
        .mode-info ha-icon {
            --mdc-icon-size: 24px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .mode-info-text {
            flex: 1;
        }
        .mode-info code {
            background: rgba(0,0,0,0.2);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
    <ha-icon icon="mdi:information-outline"></ha-icon>
    <div class="mode-info-text">
        <strong>Home Connect Mode Selected</strong><br>
        Additional configuration required. Please edit the YAML to add the 
        <code>home_connect</code> configuration object.<br>
        See example configurations in <code>test-configs/</code> directory.
    </div>
`;
editor.insertBefore(modeInfo, editor.firstChild);

// Update visibility when mode changes
_updateModeInfo() {
    const mode = this._config.mode || "standard";
    const modeInfo = this.shadowRoot.getElementById("modeInfo");
    if (modeInfo) {
        modeInfo.classList.toggle("hidden", mode !== "home_connect");
    }
}

// Call in _syncValues()
_syncValues() {
    if (!this._built) return;
    
    // ... existing sync logic ...
    
    this._updateModeInfo();
}
```

---

### Task 1.7: Create Phase 1 Tests
**Effort:** 3 hours  
**Priority:** P1 (High)

#### File: tests/phase1_test.js

```javascript
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock environment
global.HTMLElement = class HTMLElement {};
global.customElements = { define: () => {}, get: () => {} };
global.window = { customCards: [] };
global.document = { createElement: () => ({}) };

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn WashingMachineCard;');
const WashingMachineCard = script();

console.log('Testing Phase 1 Entity Mapping Infrastructure...\n');

// ========================================
// Task 1.1: Test _hcEntity() accessor
// ========================================
console.log('Testing Task 1.1: _hcEntity() accessor');

const card = new WashingMachineCard();

// Standard mode should return undefined
card.setConfig({ status_entity: 'binary_sensor.test' });
assert.strictEqual(card._hcEntity('power_entity'), undefined, 
    '_hcEntity should return undefined in standard mode');
console.log('  ✔ Returns undefined in standard mode');

// HC mode without hass should return undefined
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: {
        washer: {
            power_entity: 'switch.washer_power'
        }
    }
});
assert.strictEqual(card._hcEntity('power_entity'), undefined,
    '_hcEntity should return undefined without hass');
console.log('  ✔ Returns undefined without hass object');

// HC mode with hass should return entity
card._hass = {
    states: {
        'switch.washer_power': { 
            state: 'on', 
            entity_id: 'switch.washer_power',
            attributes: {} 
        },
        'sensor.washer_operation_state': {
            state: 'Run',
            entity_id: 'sensor.washer_operation_state',
            attributes: {}
        }
    }
};
const entity = card._hcEntity('power_entity');
assert.strictEqual(entity.state, 'on', 'Should return entity with state');
assert.strictEqual(entity.entity_id, 'switch.washer_power', 'Should return full entity object');
console.log('  ✔ Returns entity object in HC mode with hass');

// Missing entity key
const missing = card._hcEntity('nonexistent_entity');
assert.strictEqual(missing, undefined, 'Should return undefined for missing entity');
console.log('  ✔ Returns undefined for unconfigured entity');

console.log('✔ Task 1.1 completed successfully\n');

// ========================================
// Task 1.2: Test convenience accessors
// ========================================
console.log('Testing Task 1.2: Convenience accessors');

// Test operation state
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: {
        washer: {
            operation_state_entity: 'sensor.washer_operation_state',
            door_entity: 'binary_sensor.washer_door',
            progress_entity: 'sensor.washer_progress',
            connectivity_entity: 'binary_sensor.washer_connected',
            remote_control_entity: 'binary_sensor.washer_remote_control',
            child_lock_entity: 'switch.washer_child_lock'
        }
    }
});

card._hass = {
    states: {
        'sensor.washer_operation_state': { state: 'Run' },
        'binary_sensor.washer_door': { state: 'off' },  // closed
        'sensor.washer_progress': { state: '45' },
        'binary_sensor.washer_connected': { state: 'on' },  // connected
        'binary_sensor.washer_remote_control': { state: 'on' },
        'switch.washer_child_lock': { state: 'off' }
    }
};

assert.strictEqual(card._getOperationState(), 'Run', 'Should get operation state');
console.log('  ✔ _getOperationState() works');

assert.strictEqual(card._getDoorState(), 'closed', 'Should get door state');
console.log('  ✔ _getDoorState() works and maps binary_sensor correctly');

assert.strictEqual(card._getProgress(), 45, 'Should get progress as number');
console.log('  ✔ _getProgress() works and returns number');

assert.strictEqual(card._getConnectivityState(), 'connected', 'Should get connectivity');
console.log('  ✔ _getConnectivityState() works and maps binary_sensor');

assert.strictEqual(card._getRemoteControlState(), true, 'Should get remote control state');
console.log('  ✔ _getRemoteControlState() works');

assert.strictEqual(card._getChildLockState(), false, 'Should get child lock state');
console.log('  ✔ _getChildLockState() works');

// Test door open state
card._hass.states['binary_sensor.washer_door'].state = 'on';
assert.strictEqual(card._getDoorState(), 'open', 'Door should be open');
console.log('  ✔ Door state correctly maps on=open');

// Test null returns
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: { washer: {} }  // No entities configured
});
assert.strictEqual(card._getOperationState(), null, 'Should return null when entity missing');
assert.strictEqual(card._getDoorState(), null, 'Should return null when entity missing');
assert.strictEqual(card._getProgress(), null, 'Should return null when entity missing');
console.log('  ✔ Returns null when entities not configured');

console.log('✔ Task 1.2 completed successfully\n');

// ========================================
// Task 1.5: Test full configurations load
// ========================================
console.log('Testing Task 1.5: Full configuration loading');

const yaml = require('js-yaml');

// Test washer full config
const washerYaml = fs.readFileSync(
    path.join(__dirname, '../test-configs/04-hc-washer-full.yaml'), 
    'utf8'
);
const washerConfig = yaml.load(washerYaml);
card.setConfig(washerConfig);
assert.strictEqual(card._getMode(), 'home_connect', 'Washer config should set HC mode');
assert.strictEqual(card._config.appliance_type, 'washer', 'Should be washer type');
console.log('  ✔ Washer full configuration loads');

// Test dishwasher full config
const dishwasherYaml = fs.readFileSync(
    path.join(__dirname, '../test-configs/05-hc-dishwasher-full.yaml'),
    'utf8'
);
const dishwasherConfig = yaml.load(dishwasherYaml);
card.setConfig(dishwasherConfig);
assert.strictEqual(card._getMode(), 'home_connect', 'Dishwasher config should set HC mode');
assert.strictEqual(card._config.appliance_type, 'dishwasher', 'Should be dishwasher type');
console.log('  ✔ Dishwasher full configuration loads');

console.log('✔ Task 1.5 completed successfully\n');

// ========================================
// Summary
// ========================================
console.log('========================================');
console.log('All Phase 1 tests passed successfully!');
console.log('========================================');
console.log('Entity mapping infrastructure complete:');
console.log('  • _hcEntity() accessor working');
console.log('  • Convenience accessors working');
console.log('  • Full configurations validated');
console.log('  • Ready for Phase 2 (Service Calls)');
```

---

## VALIDATION CRITERIA

### Code Quality
- [ ] All methods have JSDoc comments
- [ ] Entity configuration documented comprehensively
- [ ] Code follows existing style patterns
- [ ] No duplicate logic

### Functionality
- [ ] `_hcEntity()` works in both modes
- [ ] All convenience accessors return correct values
- [ ] Null handling correct for missing entities
- [ ] Binary sensor mapping correct (door, connectivity)

### Testing
- [ ] All Phase 1 tests pass
- [ ] Test configurations load without errors
- [ ] Works with partial configurations
- [ ] Standard mode unchanged

### Documentation
- [ ] Entity configuration reference complete
- [ ] Example configurations provided
- [ ] Comments clear and helpful

---

## SUCCESS METRICS

- **Code Added:** ~200 lines (accessor methods + documentation)
- **File Size Target:** <2,350 lines (currently 2,132)
- **Test Coverage:** 100% of new accessor methods
- **Documentation:** Complete entity reference for washer & dishwasher

---

## RISKS & MITIGATION

### Risk: Entity accessor performance
**Impact:** Low  
**Mitigation:** Simple object property access, no complex logic

### Risk: Missing entity handling
**Impact:** Medium  
**Mitigation:** All methods return null/undefined gracefully

### Risk: Binary sensor mapping confusion
**Impact:** Medium  
**Mitigation:** Clear documentation, explicit mapping in code

---

## DELIVERABLES CHECKLIST

- [ ] `_hcEntity()` method implemented
- [ ] 11 convenience accessor methods implemented
- [ ] Washer entity configuration documented
- [ ] Dishwasher entity configuration documented
- [ ] test-configs/04-hc-washer-full.yaml created
- [ ] test-configs/05-hc-dishwasher-full.yaml created
- [ ] Visual editor mode selection added
- [ ] tests/phase1_test.js created and passing
- [ ] Standard mode behavior verified unchanged

---

## NEXT PHASE PREVIEW

**Phase 2: Service Call Infrastructure**
- Add service call abstractions
- Implement HC action methods (power, program selection, etc.)
- Add error handling for service calls
- Test with mock Home Assistant services

---

**Phase 1 Planning Status:** ✅ COMPLETE  
**Ready for Implementation:** ✅ YES  
**Estimated Completion:** 5 days
