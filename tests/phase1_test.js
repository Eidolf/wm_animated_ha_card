const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

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
            remote_start_entity: 'binary_sensor.washer_remote_start',
            child_lock_entity: 'switch.washer_child_lock',
            active_program_entity: 'sensor.washer_active_program',
            selected_program_entity: 'sensor.washer_selected_program',
            remaining_time_entity: 'sensor.washer_remaining_time',
            end_time_entity: 'sensor.washer_end_time'
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
        'binary_sensor.washer_remote_start': { state: 'on' },
        'switch.washer_child_lock': { state: 'off' },
        'sensor.washer_active_program': { state: 'Cotton' },
        'sensor.washer_selected_program': { state: 'EasyCare' },
        'sensor.washer_remaining_time': { state: '01:15:00' },
        'sensor.washer_end_time': { state: '2026-09-18T01:00:00Z' }
    }
};

assert.strictEqual(card._getOperationState(), 'Run', 'Should get operation state');
console.log('  ✔ _getOperationState() works');

assert.strictEqual(card._getActiveProgram(), 'Cotton', 'Should get active program');
console.log('  ✔ _getActiveProgram() works');

assert.strictEqual(card._getSelectedProgram(), 'EasyCare', 'Should get selected program');
console.log('  ✔ _getSelectedProgram() works');

assert.strictEqual(card._getDoorState(), 'closed', 'Should get door state');
console.log('  ✔ _getDoorState() works and maps binary_sensor correctly');

assert.strictEqual(card._getProgress(), 45, 'Should get progress as number');
console.log('  ✔ _getProgress() works and returns number');

assert.strictEqual(card._getRemainingTime(), '01:15:00', 'Should get remaining time');
console.log('  ✔ _getRemainingTime() works');

assert.strictEqual(card._getEndTime(), '2026-09-18T01:00:00Z', 'Should get end time');
console.log('  ✔ _getEndTime() works');

assert.strictEqual(card._getConnectivityState(), 'connected', 'Should get connectivity');
console.log('  ✔ _getConnectivityState() works and maps binary_sensor');

assert.strictEqual(card._getRemoteControlState(), true, 'Should get remote control state');
console.log('  ✔ _getRemoteControlState() works');

assert.strictEqual(card._getRemoteStartState(), true, 'Should get remote start state');
console.log('  ✔ _getRemoteStartState() works');

assert.strictEqual(card._getChildLockState(), false, 'Should get child lock state');
console.log('  ✔ _getChildLockState() works');

// Test door open state
card._hass.states['binary_sensor.washer_door'].state = 'on';
assert.strictEqual(card._getDoorState(), 'open', 'Door should be open');
console.log('  ✔ Door state correctly maps on=open');

// Test disconnected connectivity state
card._hass.states['binary_sensor.washer_connected'].state = 'off';
assert.strictEqual(card._getConnectivityState(), 'disconnected', 'Connectivity should be disconnected');
console.log('  ✔ Connectivity state correctly maps off=disconnected');

// Test null returns when entities missing
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: { washer: {} }  // No entities configured
});
assert.strictEqual(card._getOperationState(), null, 'Should return null when entity missing');
assert.strictEqual(card._getActiveProgram(), null, 'Should return null when entity missing');
assert.strictEqual(card._getSelectedProgram(), null, 'Should return null when entity missing');
assert.strictEqual(card._getDoorState(), null, 'Should return null when entity missing');
assert.strictEqual(card._getProgress(), null, 'Should return null when entity missing');
assert.strictEqual(card._getRemainingTime(), null, 'Should return null when entity missing');
assert.strictEqual(card._getEndTime(), null, 'Should return null when entity missing');
assert.strictEqual(card._getConnectivityState(), null, 'Should return null when entity missing');
assert.strictEqual(card._getRemoteControlState(), false, 'Should return false when entity missing');
assert.strictEqual(card._getRemoteStartState(), false, 'Should return false when entity missing');
assert.strictEqual(card._getChildLockState(), false, 'Should return false when entity missing');
console.log('  ✔ Returns null/false when entities not configured');

console.log('✔ Task 1.2 completed successfully\n');

// ========================================
// Task 1.5: Test full configurations load
// ========================================
console.log('Testing Task 1.5: Full configuration loading');

function parseYamlFile(filePath) {
    const pyCmd = `python3 -c "import yaml, json, sys; print(json.dumps(yaml.safe_load(open(sys.argv[1]))))" "${filePath}"`;
    const jsonStr = execSync(pyCmd).toString();
    return JSON.parse(jsonStr);
}

// Test washer full config
const washerConfig = parseYamlFile(path.join(__dirname, '../test-configs/04-hc-washer-full.yaml'));
card.setConfig(washerConfig);
assert.strictEqual(card._getMode(), 'home_connect', 'Washer config should set HC mode');
assert.strictEqual(card._config.appliance_type, 'washer', 'Should be washer type');
console.log('  ✔ Washer full configuration loads');

// Test dishwasher full config
const dishwasherConfig = parseYamlFile(path.join(__dirname, '../test-configs/05-hc-dishwasher-full.yaml'));
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
