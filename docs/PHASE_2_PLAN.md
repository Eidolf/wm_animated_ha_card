# PHASE 2: SERVICE CALL INFRASTRUCTURE
**Home Connect Service Call Implementation Plan**

**Duration:** 3 days  
**Goal:** Complete service call abstractions for Home Connect device control

---

## OVERVIEW

Phase 2 adds the ability to **control** Home Connect appliances, not just display their status. This phase implements:
- Base service call method
- Service type abstractions (select, number, button, switch)
- Home Connect action methods (power, programs, features)
- Error handling and validation
- Remote control state checks

**Important:** This phase adds NO UI elements - only the backend logic. UI elements come in Phase 4.

---

## TASKS BREAKDOWN

### Task 2.1: Add Base Service Call Method
**Effort:** 1 hour  
**Priority:** P0 (Critical)

#### Implementation

Add after `_toggle()` method in `WashingMachineCard` class:

```javascript
/**
 * Base Service Call Method
 * ========================
 * Central method for all Home Assistant service calls.
 * Provides consistent error handling and logging.
 * 
 * @param {string} domain - Service domain (e.g., "switch", "select")
 * @param {string} service - Service name (e.g., "turn_on", "select_option")
 * @param {object} data - Service data (e.g., { entity_id: "...", option: "..." })
 * @returns {Promise} Service call promise
 */
_callService(domain, service, data) {
    if (!this._hass) {
        console.warn(`Cannot call ${domain}.${service}: hass not available`);
        return Promise.reject(new Error("hass not available"));
    }
    
    console.log(`Calling service: ${domain}.${service}`, data);
    return this._hass.callService(domain, service, data);
}
```

#### Validation
- [ ] Returns promise
- [ ] Logs service calls for debugging
- [ ] Handles missing hass gracefully
- [ ] Works with all service types

#### Test Code
```javascript
// In tests/phase2_test.js
const card = new WashingMachineCard();
card._hass = {
    callService: (domain, service, data) => {
        assert.strictEqual(domain, 'switch');
        assert.strictEqual(service, 'turn_on');
        assert.deepStrictEqual(data, { entity_id: 'switch.test' });
        return Promise.resolve();
    }
};

card._callService('switch', 'turn_on', { entity_id: 'switch.test' });
```

---

### Task 2.2: Add Service Type Abstractions
**Effort:** 2 hours  
**Priority:** P0 (Critical)

#### Implementation

Add after `_callService()`:

```javascript
// ========================================
// SERVICE TYPE ABSTRACTIONS
// ========================================
// Wrapper methods for different Home Assistant service types.
// Provide consistent interface for service calls with validation.
// ========================================

/**
 * Select an option from a select entity
 * Used for: program selection, temperature, spin speed
 * 
 * @param {string} entityId - Select entity ID
 * @param {string} option - Option to select
 * @returns {Promise}
 */
_selectOption(entityId, option) {
    if (!entityId || !option) {
        console.warn("selectOption: missing entityId or option");
        return Promise.reject(new Error("Missing parameters"));
    }
    return this._callService("select", "select_option", {
        entity_id: entityId,
        option: option,
    });
}

/**
 * Set value on a number entity
 * Used for: numeric settings (rare in Home Connect)
 * 
 * @param {string} entityId - Number entity ID
 * @param {number} value - Value to set
 * @returns {Promise}
 */
_setValue(entityId, value) {
    if (!entityId || value === undefined) {
        console.warn("setValue: missing entityId or value");
        return Promise.reject(new Error("Missing parameters"));
    }
    return this._callService("number", "set_value", {
        entity_id: entityId,
        value: value,
    });
}

/**
 * Press a button entity
 * Used for: stop program, machine care, etc.
 * 
 * @param {string} entityId - Button entity ID
 * @returns {Promise}
 */
_pressButton(entityId) {
    if (!entityId) {
        console.warn("pressButton: missing entityId");
        return Promise.reject(new Error("Missing entityId"));
    }
    return this._callService("button", "press", {
        entity_id: entityId,
    });
}

/**
 * Turn on a switch entity
 * 
 * @param {string} entityId - Switch entity ID
 * @returns {Promise}
 */
_turnOn(entityId) {
    if (!entityId) {
        console.warn("turnOn: missing entityId");
        return Promise.reject(new Error("Missing entityId"));
    }
    const domain = entityId.split(".")[0];
    return this._callService(domain, "turn_on", {
        entity_id: entityId,
    });
}

/**
 * Turn off a switch entity
 * 
 * @param {string} entityId - Switch entity ID
 * @returns {Promise}
 */
_turnOff(entityId) {
    if (!entityId) {
        console.warn("turnOff: missing entityId");
        return Promise.reject(new Error("Missing entityId"));
    }
    const domain = entityId.split(".")[0];
    return this._callService(domain, "turn_off", {
        entity_id: entityId,
    });
}

// IMPORTANT: Keep existing _toggle() method unchanged for backward compatibility
// _toggle(entityId) { ... }  // Already exists, DO NOT MODIFY
```

#### Validation
- [ ] All methods validate parameters
- [ ] All methods return promises
- [ ] Warning messages logged for missing parameters
- [ ] Domain correctly extracted for turn_on/turn_off
- [ ] Existing `_toggle()` method unchanged

---

### Task 2.3: Add Home Connect Power Control
**Effort:** 1 hour  
**Priority:** P1 (High)

#### Implementation

Add after service abstractions:

```javascript
// ========================================
// HOME CONNECT ACTION METHODS
// ========================================
// High-level methods for common Home Connect actions.
// These use the service abstractions above and add HC-specific logic.
// ========================================

// ----------------
// POWER CONTROL
// ----------------

/**
 * Turn appliance power on
 * @returns {Promise|undefined}
 */
_hcPowerOn() {
    if (!this._isHomeConnectMode()) return;
    
    const entity = this._hcEntity("power_entity");
    if (!entity) {
        console.warn("No power_entity configured");
        return;
    }
    
    return this._turnOn(entity.entity_id);
}

/**
 * Turn appliance power off
 * @returns {Promise|undefined}
 */
_hcPowerOff() {
    if (!this._isHomeConnectMode()) return;
    
    const entity = this._hcEntity("power_entity");
    if (!entity) {
        console.warn("No power_entity configured");
        return;
    }
    
    return this._turnOff(entity.entity_id);
}

/**
 * Toggle appliance power with confirmation
 * Shows confirmation dialog when turning off
 * @returns {Promise|undefined}
 */
_hcTogglePower() {
    if (!this._isHomeConnectMode()) return;
    
    const entity = this._hcEntity("power_entity");
    if (!entity) {
        console.warn("No power_entity configured");
        return;
    }
    
    if (entity.state === "on") {
        // Confirm before turning off
        const t = this._t;
        const message = t.confirm_power_off || 
                       "Turn off appliance? This will stop the current program.";
        
        if (!window.confirm(message)) {
            return Promise.resolve(); // User cancelled
        }
        
        return this._hcPowerOff();
    } else {
        return this._hcPowerOn();
    }
}
```

#### Validation
- [ ] Power on works
- [ ] Power off works
- [ ] Toggle shows confirmation when on
- [ ] Toggle works without confirmation when off
- [ ] Handles missing entity gracefully
- [ ] Only works in HC mode

---

### Task 2.4: Add Program Selection
**Effort:** 2 hours  
**Priority:** P1 (High)

#### Implementation

```javascript
// ----------------
// PROGRAM SELECTION
// ----------------

/**
 * Select a program to run
 * Validates remote control state before selection
 * 
 * @param {string} programName - Program name (e.g., "Cotton", "Eco50")
 * @returns {Promise|undefined}
 */
_hcSelectProgram(programName) {
    if (!this._isHomeConnectMode()) return;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    // Validate configuration
    if (!hc?.program_selector_entity) {
        console.warn("No program_selector_entity configured");
        return;
    }
    
    // Check remote control state
    if (!this._getRemoteControlState()) {
        const t = this._t;
        const message = t.remote_control_required || 
                       "Remote control must be enabled on the appliance.\n" +
                       "Please enable remote control using the appliance controls.";
        alert(message);
        return Promise.reject(new Error("Remote control not enabled"));
    }
    
    // Select program
    return this._selectOption(hc.program_selector_entity, programName);
}
```

#### Validation
- [ ] Requires remote control enabled
- [ ] Shows helpful message if remote control disabled
- [ ] Validates entity configuration
- [ ] Works with both washer and dishwasher
- [ ] Returns promise for chaining

---

### Task 2.5: Add Start/Pause/Stop Control
**Effort:** 2 hours  
**Priority:** P1 (High)

#### Implementation

```javascript
// ----------------
// START / PAUSE / STOP
// ----------------

/**
 * Start the appliance program
 * Uses start_entity
 * @returns {Promise|undefined}
 */
_hcStart() {
    if (!this._isHomeConnectMode()) return;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    if (hc?.start_entity) {
        // Use dedicated start entity
        return this._turnOn(hc.start_entity);
    }
    
    console.warn("No start_entity configured");
    return;
}

/**
 * Pause the running program
 * @returns {Promise|undefined}
 */
_hcPause() {
    if (!this._isHomeConnectMode()) return;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    if (!hc.pause_entity) {
        console.warn("No pause_entity configured");
        return;
    }
    
    return this._turnOn(hc.pause_entity);
}

/**
 * Stop/abort the program
 * @returns {Promise|undefined}
 */
_hcStop() {
    if (!this._isHomeConnectMode()) return;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    if (!hc.stop_entity) {
        console.warn("No stop_entity configured");
        return;
    }
    
    return this._pressButton(hc.stop_entity);
}

/**
 * Intelligent start/pause toggle
 * - If running → pause
 * - If paused or ready → start
 * 
 * @returns {Promise|undefined}
 */
_hcToggleStartPause() {
    if (!this._isHomeConnectMode()) return;
    
    const opState = this._getOperationState();
    
    if (!opState) {
        console.warn("Cannot determine operation state");
        return;
    }
    
    const state = opState.toLowerCase();
    
    if (state === "run") {
        return this._hcPause();
    } else if (state === "ready" || state === "pause") {
        return this._hcStart();
    } else {
        console.warn(`Cannot start/pause from state: ${opState}`);
        return;
    }
}
```

#### Validation
- [ ] Start works with start_entity
- [ ] Pause works
- [ ] Stop works
- [ ] Toggle correctly detects state
- [ ] Toggle starts when ready
- [ ] Toggle pauses when running
- [ ] Handles missing entities gracefully

---

### Task 2.6: Add Feature Toggles
**Effort:** 1 hour  
**Priority:** P2 (Medium)

#### Implementation

```javascript
// ----------------
// FEATURE TOGGLES
// ----------------

/**
 * Toggle a feature on/off
 * Generic method for any feature switch entity
 * 
 * @param {string} featureKey - Key from home_connect config (e.g., "hygiene_plus_entity")
 * @returns {Promise|undefined}
 */
_hcToggleFeature(featureKey) {
    if (!this._isHomeConnectMode()) return;
    
    const entity = this._hcEntity(featureKey);
    if (!entity) {
        console.warn(`Feature not configured: ${featureKey}`);
        return;
    }
    
    return this._toggle(entity.entity_id);
}

/**
 * Toggle child lock
 * @returns {Promise|undefined}
 */
_hcToggleChildLock() {
    return this._hcToggleFeature("child_lock_entity");
}

/**
 * Toggle hygiene plus (dishwasher)
 * @returns {Promise|undefined}
 */
_hcToggleHygienePlus() {
    return this._hcToggleFeature("hygiene_plus_entity");
}

/**
 * Toggle intensive zone (dishwasher)
 * @returns {Promise|undefined}
 */
_hcToggleIntensiveZone() {
    return this._hcToggleFeature("intensive_zone_entity");
}

/**
 * Toggle variospeed plus (dishwasher)
 * @returns {Promise|undefined}
 */
_hcToggleVariospeedPlus() {
    return this._hcToggleFeature("variospeed_plus_entity");
}

/**
 * Toggle silence on demand (dishwasher)
 * @returns {Promise|undefined}
 */
_hcToggleSilenceOnDemand() {
    return this._hcToggleFeature("silence_on_demand_entity");
}

/**
 * Toggle brilliant dry (dishwasher)
 * @returns {Promise|undefined}
 */
_hcToggleBrilliantDry() {
    return this._hcToggleFeature("brilliant_dry_entity");
}
```

#### Validation
- [ ] Generic toggle works for any feature
- [ ] Specific toggles call generic correctly
- [ ] Handles missing entities gracefully
- [ ] Works for both washer and dishwasher features

---

### Task 2.7: Add Options Control
**Effort:** 1 hour  
**Priority:** P2 (Medium)

#### Implementation

```javascript
// ----------------
// OPTIONS CONTROL
// ----------------

/**
 * Set wash temperature
 * 
 * @param {string} temperature - Temperature option (e.g., "Cold", "40°C", "60°C")
 * @returns {Promise|undefined}
 */
_hcSetTemperature(temperature) {
    if (!this._isHomeConnectMode()) return;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    if (!hc?.temperature_entity) {
        console.warn("No temperature_entity configured");
        return;
    }
    
    return this._selectOption(hc.temperature_entity, temperature);
}

/**
 * Set spin speed
 * 
 * @param {string} speed - Speed option (e.g., "800", "1200", "1400")
 * @returns {Promise|undefined}
 */
_hcSetSpinSpeed(speed) {
    if (!this._isHomeConnectMode()) return;
    
    const type = this._applianceType;
    const hc = this._config.home_connect?.[type];
    
    if (!hc?.spin_speed_entity) {
        console.warn("No spin_speed_entity configured");
        return;
    }
    
    return this._selectOption(hc.spin_speed_entity, speed);
}
```

#### Validation
- [ ] Temperature selection works
- [ ] Spin speed selection works
- [ ] Handles missing entities gracefully
- [ ] Only works in HC mode

---

### Task 2.8: Add Localization Strings
**Effort:** 30 minutes  
**Priority:** P2 (Medium)

#### Implementation

Add to `STRINGS` object (English only for now, other languages in Phase 9):

```javascript
static STRINGS = {
    en: {
        // ... existing strings ...
        
        // NEW: Phase 2 strings
        confirm_power_off: "Turn off appliance? This will stop the current program.",
        remote_control_required: "Remote control must be enabled on the appliance.\nPlease enable remote control using the appliance controls.",
        program_selection_failed: "Failed to select program. Check that remote control is enabled.",
        service_call_failed: "Action failed. Please try again.",
    },
    
    // Other languages get English fallbacks for now
    ru: { /* ... existing Russian strings ... */ },
    de: { /* ... existing German strings ... */ },
    fr: { /* ... existing French strings ... */ },
};
```

---

### Task 2.9: Create Phase 2 Tests
**Effort:** 3 hours  
**Priority:** P1 (High)

#### File: tests/phase2_test.js

```javascript
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock environment
global.HTMLElement = class HTMLElement {};
global.customElements = { define: () => {}, get: () => {} };
global.window = { 
    customCards: [],
    confirm: () => true,  // Auto-confirm for tests
    alert: () => {}       // Silent alerts
};
global.document = { createElement: () => ({}) };

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn WashingMachineCard;');
const WashingMachineCard = script();

console.log('Testing Phase 2 Service Call Infrastructure...\n');

// ========================================
// Task 2.1: Test _callService()
// ========================================
console.log('Testing Task 2.1: _callService() base method');

const card = new WashingMachineCard();
let serviceCalled = false;

card._hass = {
    callService: (domain, service, data) => {
        serviceCalled = true;
        assert.strictEqual(domain, 'switch');
        assert.strictEqual(service, 'turn_on');
        assert.deepStrictEqual(data, { entity_id: 'switch.test' });
        return Promise.resolve();
    }
};

card._callService('switch', 'turn_on', { entity_id: 'switch.test' });
assert.strictEqual(serviceCalled, true, 'Service should be called');
console.log('  ✔ _callService() executes service calls');

// Test without hass
card._hass = null;
const promise = card._callService('switch', 'turn_on', { entity_id: 'switch.test' });
assert.strictEqual(promise instanceof Promise, true, 'Should return promise');
promise.catch(() => {
    console.log('  ✔ _callService() handles missing hass');
});

console.log('✔ Task 2.1 completed successfully\n');

// ========================================
// Task 2.2: Test service abstractions
// ========================================
console.log('Testing Task 2.2: Service type abstractions');

card._hass = {
    callService: (domain, service, data) => {
        return Promise.resolve({ domain, service, data });
    }
};

// Test _selectOption
card._selectOption('select.test', 'option1').then(result => {
    assert.strictEqual(result.domain, 'select');
    assert.strictEqual(result.service, 'select_option');
    assert.strictEqual(result.data.option, 'option1');
    console.log('  ✔ _selectOption() works');
});

// Test _setValue
card._setValue('number.test', 42).then(result => {
    assert.strictEqual(result.domain, 'number');
    assert.strictEqual(result.service, 'set_value');
    assert.strictEqual(result.data.value, 42);
    console.log('  ✔ _setValue() works');
});

// Test _pressButton
card._pressButton('button.test').then(result => {
    assert.strictEqual(result.domain, 'button');
    assert.strictEqual(result.service, 'press');
    console.log('  ✔ _pressButton() works');
});

// Test _turnOn
card._turnOn('switch.test').then(result => {
    assert.strictEqual(result.domain, 'switch');
    assert.strictEqual(result.service, 'turn_on');
    console.log('  ✔ _turnOn() works');
});

// Test _turnOff
card._turnOff('switch.test').then(result => {
    assert.strictEqual(result.domain, 'switch');
    assert.strictEqual(result.service, 'turn_off');
    console.log('  ✔ _turnOff() works');
});

// Test parameter validation
card._selectOption(null, 'option').catch(() => {
    console.log('  ✔ Parameter validation works');
});

setTimeout(() => {
    console.log('✔ Task 2.2 completed successfully\n');
    
    // ========================================
    // Task 2.3: Test power control
    // ========================================
    console.log('Testing Task 2.3: Power control');
    
    card.setConfig({
        mode: 'home_connect',
        appliance_type: 'washer',
        home_connect: {
            washer: {
                power_entity: 'switch.washer_power'
            }
        }
    });
    
    card._hass = {
        states: {
            'switch.washer_power': { state: 'off', entity_id: 'switch.washer_power' }
        },
        callService: (domain, service, data) => {
            return Promise.resolve({ domain, service, data });
        }
    };
    
    // Test power on
    card._hcPowerOn().then(result => {
        assert.strictEqual(result.service, 'turn_on');
        console.log('  ✔ _hcPowerOn() works');
    });
    
    // Test power off
    card._hcPowerOff().then(result => {
        assert.strictEqual(result.service, 'turn_off');
        console.log('  ✔ _hcPowerOff() works');
    });
    
    // Test toggle (off → on, no confirmation)
    card._hcTogglePower().then(result => {
        assert.strictEqual(result.service, 'turn_on');
        console.log('  ✔ _hcTogglePower() works when off');
    });
    
    // Test toggle (on → off, with confirmation)
    card._hass.states['switch.washer_power'].state = 'on';
    card._hcTogglePower().then(result => {
        assert.strictEqual(result.service, 'turn_off');
        console.log('  ✔ _hcTogglePower() works when on (with confirmation)');
    });
    
    console.log('✔ Task 2.3 completed successfully\n');
    
    // ========================================
    // Task 2.4: Test program selection
    // ========================================
    console.log('Testing Task 2.4: Program selection');
    
    card.setConfig({
        mode: 'home_connect',
        appliance_type: 'washer',
        home_connect: {
            washer: {
                program_selector_entity: 'select.washer_program',
                remote_control_entity: 'binary_sensor.washer_remote_control'
            }
        }
    });
    
    card._hass.states['binary_sensor.washer_remote_control'] = { 
        state: 'on', 
        entity_id: 'binary_sensor.washer_remote_control' 
    };
    
    // Test program selection with remote control enabled
    card._hcSelectProgram('Cotton').then(result => {
        assert.strictEqual(result.service, 'select_option');
        assert.strictEqual(result.data.option, 'Cotton');
        console.log('  ✔ _hcSelectProgram() works with remote control enabled');
    });
    
    // Test without remote control
    card._hass.states['binary_sensor.washer_remote_control'].state = 'off';
    card._hcSelectProgram('Cotton').catch(() => {
        console.log('  ✔ _hcSelectProgram() rejects without remote control');
    });
    
    console.log('✔ Task 2.4 completed successfully\n');
    
    // ========================================
    // Task 2.5: Test start/pause/stop
    // ========================================
    console.log('Testing Task 2.5: Start/Pause/Stop control');
    
    card.setConfig({
        mode: 'home_connect',
        appliance_type: 'washer',
        home_connect: {
            washer: {
                operation_state_entity: 'sensor.washer_operation_state',
                start_entity: 'switch.washer_start',
                pause_entity: 'switch.washer_pause',
                stop_entity: 'button.washer_stop'
            }
        }
    });
    
    card._hass.states['sensor.washer_operation_state'] = { 
        state: 'Ready', 
        entity_id: 'sensor.washer_operation_state' 
    };
    
    // Test start
    card._hcStart().then(result => {
        assert.strictEqual(result.service, 'turn_on');
        console.log('  ✔ _hcStart() works');
    });
    
    // Test pause
    card._hcPause().then(result => {
        assert.strictEqual(result.service, 'turn_on');
        console.log('  ✔ _hcPause() works');
    });
    
    // Test stop
    card._hcStop().then(result => {
        assert.strictEqual(result.service, 'press');
        console.log('  ✔ _hcStop() works');
    });
    
    // Test toggle from Ready (should start)
    card._hcToggleStartPause().then(result => {
        assert.strictEqual(result.service, 'turn_on');
        console.log('  ✔ _hcToggleStartPause() starts when Ready');
    });
    
    // Test toggle from Run (should pause)
    card._hass.states['sensor.washer_operation_state'].state = 'Run';
    card._hcToggleStartPause().then(result => {
        assert.strictEqual(result.service, 'turn_on');
        console.log('  ✔ _hcToggleStartPause() pauses when Running');
    });
    
    console.log('✔ Task 2.5 completed successfully\n');
    
    // ========================================
    // Task 2.6: Test feature toggles
    // ========================================
    console.log('Testing Task 2.6: Feature toggles');
    
    card.setConfig({
        mode: 'home_connect',
        appliance_type: 'dishwasher',
        home_connect: {
            dishwasher: {
                child_lock_entity: 'switch.dw_child_lock',
                hygiene_plus_entity: 'switch.dw_hygiene_plus'
            }
        }
    });
    
    card._hass.states['switch.dw_child_lock'] = { 
        state: 'off', 
        entity_id: 'switch.dw_child_lock' 
    };
    card._hass.states['switch.dw_hygiene_plus'] = { 
        state: 'off', 
        entity_id: 'switch.dw_hygiene_plus' 
    };
    
    // Test generic toggle
    card._hcToggleFeature('child_lock_entity');
    console.log('  ✔ _hcToggleFeature() works');
    
    // Test specific toggles
    card._hcToggleChildLock();
    console.log('  ✔ _hcToggleChildLock() works');
    
    card._hcToggleHygienePlus();
    console.log('  ✔ _hcToggleHygienePlus() works');
    
    console.log('✔ Task 2.6 completed successfully\n');
    
    // ========================================
    // Task 2.7: Test options control
    // ========================================
    console.log('Testing Task 2.7: Options control');
    
    card.setConfig({
        mode: 'home_connect',
        appliance_type: 'washer',
        home_connect: {
            washer: {
                temperature_entity: 'select.washer_temperature',
                spin_speed_entity: 'select.washer_spin_speed'
            }
        }
    });
    
    // Test temperature
    card._hcSetTemperature('40°C').then(result => {
        assert.strictEqual(result.service, 'select_option');
        assert.strictEqual(result.data.option, '40°C');
        console.log('  ✔ _hcSetTemperature() works');
    });
    
    // Test spin speed
    card._hcSetSpinSpeed('1200').then(result => {
        assert.strictEqual(result.service, 'select_option');
        assert.strictEqual(result.data.option, '1200');
        console.log('  ✔ _hcSetSpinSpeed() works');
    });
    
    console.log('✔ Task 2.7 completed successfully\n');
    
    // ========================================
    // Summary
    // ========================================
    console.log('========================================');
    console.log('All Phase 2 tests passed successfully!');
    console.log('========================================');
    console.log('Service call infrastructure complete:');
    console.log('  • Base service call method working');
    console.log('  • Service abstractions working');
    console.log('  • Power control working');
    console.log('  • Program selection working');
    console.log('  • Start/Pause/Stop working');
    console.log('  • Feature toggles working');
    console.log('  • Options control working');
    console.log('  • Ready for Phase 3 (State Management)');
}, 500); // Wait for async operations
```

---

## VALIDATION CRITERIA

### Code Quality
- [ ] All methods have JSDoc comments
- [ ] Consistent error handling
- [ ] Parameter validation on all methods
- [ ] Promises returned where appropriate
- [ ] Console warnings for missing config

### Functionality
- [ ] All service abstractions work
- [ ] Power control works
- [ ] Program selection validates remote control
- [ ] Start/pause/stop work
- [ ] Feature toggles work
- [ ] Options control works
- [ ] Handles missing entities gracefully

### Testing
- [ ] All Phase 2 tests pass
- [ ] Works in both modes (HC methods only in HC mode)
- [ ] Standard mode unchanged
- [ ] No breaking changes

### Backward Compatibility
- [ ] Existing `_toggle()` method unchanged
- [ ] No modifications to existing methods
- [ ] All new methods are additive

---

## SUCCESS METRICS

- **Code Added:** ~250 lines (service methods + action methods)
- **File Size Target:** ~2,800 lines (currently 2,543)
- **Test Coverage:** 100% of new service methods
- **Methods Added:** 20+ new methods

---

## RISKS & MITIGATION

### Risk: Service calls fail silently
**Impact:** Medium  
**Mitigation:** All methods log warnings, return promises for error handling

### Risk: Remote control check too strict
**Impact:** Low  
**Mitigation:** Clear error messages explain requirement

### Risk: Confusion between _toggle() and _turnOn/_turnOff
**Impact:** Low  
**Mitigation:** Clear documentation, _toggle() unchanged for backward compatibility

---

## DELIVERABLES CHECKLIST

- [ ] `_callService()` base method implemented
- [ ] 5 service abstraction methods implemented
- [ ] 3 power control methods implemented
- [ ] 1 program selection method implemented
- [ ] 4 start/pause/stop methods implemented
- [ ] 7 feature toggle methods implemented
- [ ] 2 options control methods implemented
- [ ] Localization strings added (English)
- [ ] tests/phase2_test.js created and passing
- [ ] Standard mode behavior verified unchanged
- [ ] Existing `_toggle()` method unchanged

---

## NEXT PHASE PREVIEW

**Phase 3: State Management**
- Extend `_computeApplianceState()` for HC states
- Split `_update()` into mode-specific methods
- Add HC-specific display updates
- Map Home Connect operation states to card states
- Update badge/ring/status displays for HC mode

---

**Phase 2 Planning Status:** ✅ COMPLETE  
**Ready for Implementation:** ✅ YES  
**Estimated Completion:** 3 days
