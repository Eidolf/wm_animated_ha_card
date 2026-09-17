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

async function runTests() {
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

    await card._callService('switch', 'turn_on', { entity_id: 'switch.test' });
    assert.strictEqual(serviceCalled, true, 'Service should be called');
    console.log('  ✔ _callService() executes service calls');

    // Test without hass
    card._hass = null;
    let failedWithoutHass = false;
    try {
        await card._callService('switch', 'turn_on', { entity_id: 'switch.test' });
    } catch (e) {
        failedWithoutHass = true;
    }
    assert.strictEqual(failedWithoutHass, true, 'Should reject when hass not available');
    console.log('  ✔ _callService() handles missing hass');

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
    const resSelect = await card._selectOption('select.test', 'option1');
    assert.strictEqual(resSelect.domain, 'select');
    assert.strictEqual(resSelect.service, 'select_option');
    assert.strictEqual(resSelect.data.option, 'option1');
    console.log('  ✔ _selectOption() works');

    // Test _setValue
    const resValue = await card._setValue('number.test', 42);
    assert.strictEqual(resValue.domain, 'number');
    assert.strictEqual(resValue.service, 'set_value');
    assert.strictEqual(resValue.data.value, 42);
    console.log('  ✔ _setValue() works');

    // Test _pressButton
    const resButton = await card._pressButton('button.test');
    assert.strictEqual(resButton.domain, 'button');
    assert.strictEqual(resButton.service, 'press');
    console.log('  ✔ _pressButton() works');

    // Test _turnOn
    const resOn = await card._turnOn('switch.test');
    assert.strictEqual(resOn.domain, 'switch');
    assert.strictEqual(resOn.service, 'turn_on');
    console.log('  ✔ _turnOn() works');

    // Test _turnOff
    const resOff = await card._turnOff('switch.test');
    assert.strictEqual(resOff.domain, 'switch');
    assert.strictEqual(resOff.service, 'turn_off');
    console.log('  ✔ _turnOff() works');

    // Test parameter validation
    let failedValidation = false;
    try {
        await card._selectOption(null, 'option');
    } catch (e) {
        failedValidation = true;
    }
    assert.strictEqual(failedValidation, true);
    console.log('  ✔ Parameter validation works');

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
    const resPowerOn = await card._hcPowerOn();
    assert.strictEqual(resPowerOn.service, 'turn_on');
    console.log('  ✔ _hcPowerOn() works');

    // Test power off
    const resPowerOff = await card._hcPowerOff();
    assert.strictEqual(resPowerOff.service, 'turn_off');
    console.log('  ✔ _hcPowerOff() works');

    // Test toggle (off → on, no confirmation)
    const resToggleOn = await card._hcTogglePower();
    assert.strictEqual(resToggleOn.service, 'turn_on');
    console.log('  ✔ _hcTogglePower() works when off');

    // Test toggle (on → off, with confirmation)
    card._hass.states['switch.washer_power'].state = 'on';
    const resToggleOff = await card._hcTogglePower();
    assert.strictEqual(resToggleOff.service, 'turn_off');
    console.log('  ✔ _hcTogglePower() works when on (with confirmation)');

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
    const resProg = await card._hcSelectProgram('Cotton');
    assert.strictEqual(resProg.service, 'select_option');
    assert.strictEqual(resProg.data.option, 'Cotton');
    console.log('  ✔ _hcSelectProgram() works with remote control enabled');

    // Test without remote control
    card._hass.states['binary_sensor.washer_remote_control'].state = 'off';
    let failedWithoutRC = false;
    try {
        await card._hcSelectProgram('Cotton');
    } catch (e) {
        failedWithoutRC = true;
    }
    assert.strictEqual(failedWithoutRC, true);
    console.log('  ✔ _hcSelectProgram() rejects without remote control');

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
    const resStart = await card._hcStart();
    assert.strictEqual(resStart.service, 'turn_on');
    console.log('  ✔ _hcStart() works');

    // Test pause
    const resPause = await card._hcPause();
    assert.strictEqual(resPause.service, 'turn_on');
    console.log('  ✔ _hcPause() works');

    // Test stop
    const resStop = await card._hcStop();
    assert.strictEqual(resStop.service, 'press');
    console.log('  ✔ _hcStop() works');

    // Test toggle from Ready (should start)
    const resToggleStart = await card._hcToggleStartPause();
    assert.strictEqual(resToggleStart.service, 'turn_on');
    console.log('  ✔ _hcToggleStartPause() starts when Ready');

    // Test toggle from Run (should pause)
    card._hass.states['sensor.washer_operation_state'].state = 'Run';
    const resTogglePause = await card._hcToggleStartPause();
    assert.strictEqual(resTogglePause.service, 'turn_on');
    console.log('  ✔ _hcToggleStartPause() pauses when Running');

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
                hygiene_plus_entity: 'switch.dw_hygiene_plus',
                intensive_zone_entity: 'switch.dw_intensive_zone',
                variospeed_plus_entity: 'switch.dw_variospeed_plus',
                silence_on_demand_entity: 'switch.dw_silence_on_demand',
                brilliant_dry_entity: 'switch.dw_brilliant_dry'
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
    card._hass.states['switch.dw_intensive_zone'] = { 
        state: 'off', 
        entity_id: 'switch.dw_intensive_zone' 
    };
    card._hass.states['switch.dw_variospeed_plus'] = { 
        state: 'off', 
        entity_id: 'switch.dw_variospeed_plus' 
    };
    card._hass.states['switch.dw_silence_on_demand'] = { 
        state: 'off', 
        entity_id: 'switch.dw_silence_on_demand' 
    };
    card._hass.states['switch.dw_brilliant_dry'] = { 
        state: 'off', 
        entity_id: 'switch.dw_brilliant_dry' 
    };

    let toggleCallCount = 0;
    card._toggle = (entityId) => {
        toggleCallCount++;
        return Promise.resolve({ toggled: entityId });
    };

    // Test generic toggle
    card._hcToggleFeature('child_lock_entity');
    assert.strictEqual(toggleCallCount, 1);
    console.log('  ✔ _hcToggleFeature() works');

    // Test specific toggles
    card._hcToggleChildLock();
    card._hcToggleHygienePlus();
    card._hcToggleIntensiveZone();
    card._hcToggleVariospeedPlus();
    card._hcToggleSilenceOnDemand();
    card._hcToggleBrilliantDry();
    assert.strictEqual(toggleCallCount, 7);
    console.log('  ✔ All feature toggles work');

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
    const resTemp = await card._hcSetTemperature('40°C');
    assert.strictEqual(resTemp.service, 'select_option');
    assert.strictEqual(resTemp.data.option, '40°C');
    console.log('  ✔ _hcSetTemperature() works');

    // Test spin speed
    const resSpin = await card._hcSetSpinSpeed('1200');
    assert.strictEqual(resSpin.service, 'select_option');
    assert.strictEqual(resSpin.data.option, '1200');
    console.log('  ✔ _hcSetSpinSpeed() works');

    console.log('✔ Task 2.7 completed successfully\n');

    // ========================================
    // Task 2.8: Test localization strings
    // ========================================
    console.log('Testing Task 2.8: Localization strings');
    assert.ok(card._t.confirm_power_off, 'confirm_power_off string present');
    assert.ok(card._t.remote_control_required, 'remote_control_required string present');
    assert.ok(card._t.program_selection_failed, 'program_selection_failed string present');
    assert.ok(card._t.service_call_failed, 'service_call_failed string present');
    console.log('  ✔ Phase 2 localization strings present in _t');

    console.log('✔ Task 2.8 completed successfully\n');

    console.log('========================================');
    console.log('All Phase 2 tests passed successfully!');
    console.log('========================================');
}

runTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
