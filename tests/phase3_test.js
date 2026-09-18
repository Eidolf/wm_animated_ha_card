const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock DOM element for tests
class MockElement {
    constructor(id = '') {
        this.id = id;
        this.textContent = '';
        this.innerHTML = '';
        this.style = {};
        this.attributes = {};
        this.classList = {
            _classes: new Set(),
            add(c) { this._classes.add(c); },
            remove(c) { this._classes.delete(c); },
            toggle(c, force) {
                if (force === undefined) {
                    if (this._classes.has(c)) this._classes.delete(c);
                    else this._classes.add(c);
                } else if (force) {
                    this._classes.add(c);
                } else {
                    this._classes.delete(c);
                }
            },
            contains(c) { return this._classes.has(c); }
        };
    }
    setAttribute(name, val) { this.attributes[name] = String(val); }
    getAttribute(name) { return this.attributes[name]; }
    addEventListener() {}
}

global.HTMLElement = class HTMLElement {
    constructor() {
        this.classList = new MockElement().classList;
    }
    getBoundingClientRect() { return { width: 400 }; }
};
global.customElements = { define: () => {}, get: () => {} };
global.window = {
    customCards: [],
    confirm: () => true,
    alert: () => {}
};
global.document = {
    createElement: () => new MockElement()
};

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn WashingMachineCard;');
const WashingMachineCard = script();

console.log('Testing Phase 3 State Management & Display Logic...\n');

// ========================================
// Task 3.1: Test _computeApplianceState() & _isRunning()
// ========================================
console.log('Testing Task 3.1: State Computation');

const card = new WashingMachineCard();

// Standard mode
card.setConfig({
    mode: 'standard',
    status_entity: 'binary_sensor.test_status'
});
card._hass = {
    states: {
        'binary_sensor.test_status': { state: 'off' }
    }
};
assert.strictEqual(card._computeApplianceState(), 'off');
assert.strictEqual(card._isRunning(), false);

card._hass.states['binary_sensor.test_status'].state = 'on'; // default running state
assert.strictEqual(card._computeApplianceState(), 'running');
assert.strictEqual(card._isRunning(), true);
console.log('  ✔ Standard mode _computeApplianceState() & _isRunning() verified');

// Home Connect mode
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: {
        washer: {
            operation_state_entity: 'sensor.washer_op_state'
        }
    }
});

const testStates = [
    { op: 'Run', expected: 'running', isRunning: true },
    { op: 'Pause', expected: 'paused', isRunning: false },
    { op: 'Ready', expected: 'ready', isRunning: false },
    { op: 'DelayedStart', expected: 'delayed', isRunning: false },
    { op: 'Finished', expected: 'finished', isRunning: false },
    { op: 'Error', expected: 'error', isRunning: false },
    { op: 'ActionRequired', expected: 'action_required', isRunning: false },
    { op: 'Inactive', expected: 'off', isRunning: false },
    { op: 'Aborting', expected: 'aborting', isRunning: false },
    { op: 'SomethingElse', expected: 'idle', isRunning: false },
    { op: null, expected: 'unknown', isRunning: false },
];

for (const tc of testStates) {
    card._hass.states['sensor.washer_op_state'] = tc.op ? { state: tc.op } : null;
    assert.strictEqual(card._computeApplianceState(), tc.expected, `OpState ${tc.op} should map to ${tc.expected}`);
    assert.strictEqual(card._isRunning(), tc.isRunning, `_isRunning() for ${tc.op} should be ${tc.isRunning}`);
}
console.log('  ✔ Home Connect mode _computeApplianceState() & _isRunning() verified for all states');

// ========================================
// Task 3.2: Test _formatTime()
// ========================================
console.log('\nTesting Task 3.2: _formatTime() Helper');

assert.strictEqual(card._formatTime('PT1H30M'), '1:30', 'PT1H30M -> 1:30');
assert.strictEqual(card._formatTime('PT45M'), '45:00', 'PT45M -> 45:00');
assert.strictEqual(card._formatTime('PT25M10S'), '25:10', 'PT25M10S -> 25:10');
assert.strictEqual(card._formatTime('5400'), '1:30', '5400 seconds -> 1:30');
assert.strictEqual(card._formatTime('300'), '5:00', '300 seconds -> 5:00');
assert.strictEqual(card._formatTime(null), '--:--', 'null -> --:--');
console.log('  ✔ _formatTime() correctly formats ISO durations, seconds, and null');

// ========================================
// Task 3.3: Test Home Connect Update Logic
// ========================================
console.log('\nTesting Task 3.3: Home Connect Update Display');

// Set up mock DOM elements container
const elements = {};
const mockIds = [
    'wrap', 'name', 'badgeText', 'dispTime', 'dispDot',
    'ringTime', 'ringLabel', 'ringArc', 'stState', 'statusPanel',
    'powerRow', 'bar', 'powerLabel', 'powerValue', 'barFill',
    'notifyBtn', 'plugBtn'
];
for (const id of mockIds) {
    elements[id] = new MockElement(id);
}
card._el = (id) => elements[id] || new MockElement(id);

// Configure with full HC details
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    name: 'Smart Washer',
    home_connect: {
        washer: {
            operation_state_entity: 'sensor.washer_op_state',
            active_program_entity: 'sensor.washer_active_program',
            remaining_time_entity: 'sensor.washer_remaining_time',
            progress_entity: 'sensor.washer_progress'
        }
    }
});

// Case 1: Running state with remaining time & progress
card._hass = {
    locale: { language: 'en' },
    states: {
        'sensor.washer_op_state': { state: 'Run' },
        'sensor.washer_active_program': { state: 'Cotton' },
        'sensor.washer_remaining_time': { state: 'PT1H15M' },
        'sensor.washer_progress': { state: '60' }
    }
};

card._update();

assert.strictEqual(elements.name.textContent, 'Smart Washer');
assert.strictEqual(elements.badgeText.textContent, 'RUNNING');
assert.strictEqual(elements.dispTime.textContent, '1:15');
assert.strictEqual(elements.ringTime.textContent, '1:15');
assert.strictEqual(elements.ringLabel.textContent, 'ELAPSED');
assert.strictEqual(elements.stState.textContent, 'Cotton');
assert.strictEqual(elements.ringArc.getAttribute('stroke-dasharray'), '147 245'); // (60/100)*245 = 147
assert.strictEqual(elements.wrap.classList.contains('running'), true);
console.log('  ✔ Running state update and progress arc verified');

// Case 2: Paused state
card._hass.states['sensor.washer_op_state'].state = 'Pause';
card._update();

assert.strictEqual(elements.badgeText.textContent, 'PAUSED');
assert.strictEqual(elements.ringLabel.textContent, 'PAUSED');
assert.strictEqual(elements.wrap.classList.contains('running'), false);
console.log('  ✔ Paused state update verified');

// Case 3: Ready state
card._hass.states['sensor.washer_op_state'].state = 'Ready';
card._update();

assert.strictEqual(elements.badgeText.textContent, 'READY');
assert.strictEqual(elements.ringLabel.textContent, 'READY');
console.log('  ✔ Ready state update verified');

// Case 4: Finished state
card._hass.states['sensor.washer_op_state'].state = 'Finished';
card._update();

assert.strictEqual(elements.badgeText.textContent, 'FINISHED');
assert.strictEqual(elements.stState.textContent, 'Finished');
console.log('  ✔ Finished state update verified');

// ========================================
// Task 3.4: Localization Strings Check
// ========================================
console.log('\nTesting Task 3.4: Phase 3 Localization Strings');
const t = card._t;
assert.strictEqual(t.badge_finished, 'FINISHED');
assert.strictEqual(t.badge_paused, 'PAUSED');
assert.strictEqual(t.badge_ready, 'READY');
assert.strictEqual(t.badge_delayed, 'DELAYED');
assert.strictEqual(t.state_finished, 'Finished');
assert.strictEqual(t.state_paused, 'Paused');
assert.strictEqual(t.state_ready, 'Ready');
assert.strictEqual(t.ring_ready, 'READY');
console.log('  ✔ All Phase 3 localization strings verified');

console.log('\n========================================');
console.log('All Phase 3 tests passed successfully!');
console.log('========================================');
