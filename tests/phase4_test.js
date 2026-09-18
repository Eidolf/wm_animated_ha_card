const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock DOM elements
class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName.toUpperCase();
        this.textContent = '';
        this.innerHTML = '';
        this.style = {};
        this.attributes = {};
        this.dataset = {};
        this.eventListeners = {};
        this.children = [];
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
    addEventListener(event, fn) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(fn);
    }
    click() {
        if (this.eventListeners['click']) {
            const ev = { stopPropagation: () => {} };
            this.eventListeners['click'].forEach(fn => fn(ev));
        }
    }
    showModal() { this.isOpen = true; }
    close() { this.isOpen = false; }
    querySelector(sel) {
        if (sel === '#closeHcDialog') return this.closeBtn;
        return null;
    }
    querySelectorAll(sel) {
        if (sel === '.hc-program-item') return this.programItems || [];
        return [];
    }
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
    createElement: (tag) => new MockElement('', tag)
};

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn WashingMachineCard;');
const WashingMachineCard = script();

console.log('Testing Phase 4 Interactive Controls (Washer)...\n');

// ========================================
// Task 4.1: SVG Interactive Areas
// ========================================
console.log('Testing Task 4.1: SVG Interactive Elements');

const card = new WashingMachineCard();

// Standard mode - should NOT have interactive overlays
card.setConfig({
    mode: 'standard',
    status_entity: 'binary_sensor.washer_status'
});
const standardSvg = card._svgWasher('u1');
assert.strictEqual(standardSvg.includes('hc-interactive'), false);
assert.strictEqual(standardSvg.includes('id="hcProgramBtn"'), false);
assert.strictEqual(standardSvg.includes('id="hcPowerBtn"'), false);
assert.strictEqual(standardSvg.includes('id="hcStartBtn"'), false);
console.log('  ✔ Standard mode washer SVG does not include interactive overlays');

// Home Connect mode - SHOULD have interactive overlays
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: {
        washer: {
            program_selector_entity: 'select.washer_program'
        }
    }
});
const hcSvg = card._svgWasher('u2');
assert.strictEqual(hcSvg.includes('hc-interactive'), true);
assert.strictEqual(hcSvg.includes('id="hcProgramBtn"'), true);
assert.strictEqual(hcSvg.includes('id="hcPowerBtn"'), true);
assert.strictEqual(hcSvg.includes('id="hcStartBtn"'), true);
console.log('  ✔ Home Connect washer SVG includes interactive overlays');

// ========================================
// Task 4.2: Program Icon Helpers
// ========================================
console.log('\nTesting Task 4.2: Program Icons & Translations');
assert.strictEqual(card._getProgramIcon('Cotton'), '👕');
assert.strictEqual(card._getProgramIcon('EasyCare'), '👔');
assert.strictEqual(card._getProgramIcon('DelicatesSilk'), '🧵');
assert.strictEqual(card._getProgramIcon('Quick45'), '⚡');
assert.strictEqual(card._getProgramIcon('Spin'), '🌀');
assert.strictEqual(card._getProgramIcon('Rinse'), '💧');
assert.strictEqual(card._getProgramIcon('CustomProgram'), '🔄');
console.log('  ✔ _getProgramIcon() maps program names to icons');

assert.strictEqual(card._translateProgram('Laundry.Washer.Program.Cotton'), 'Cotton');
assert.strictEqual(card._translateProgram('EasyCare'), 'EasyCare');
console.log('  ✔ _translateProgram() strips prefixes');

// ========================================
// Task 4.3: Dialog & Selection Interaction
// ========================================
console.log('\nTesting Task 4.3: Dialog & Program Selection');

const mockDialog = new MockElement('hcDialog', 'dialog');
mockDialog.closeBtn = new MockElement('closeHcDialog', 'button');

const itemCotton = new MockElement('', 'div');
itemCotton.dataset.program = 'Cotton';
const itemEco = new MockElement('', 'div');
itemEco.dataset.program = 'Eco50';
mockDialog.programItems = [itemCotton, itemEco];

card.shadowRoot = {
    getElementById: (id) => {
        if (id === 'hcDialog') return mockDialog;
        return null;
    }
};

let selectedProgram = null;
card._hcSelectProgram = (prog) => {
    selectedProgram = prog;
    return Promise.resolve();
};

card._openProgramSelector();
assert.strictEqual(mockDialog.isOpen, true, 'Dialog should open');
assert.ok(mockDialog.innerHTML.includes('Cotton'), 'Dialog contains program options');

// Click on a program
itemCotton.click();
assert.strictEqual(selectedProgram, 'Cotton', 'Clicking program item should dispatch selection');
assert.strictEqual(mockDialog.isOpen, false, 'Dialog should close after selection');
console.log('  ✔ _openProgramSelector() renders and selects programs');

// ========================================
// Task 4.4: SVG Click Attachments
// ========================================
console.log('\nTesting Task 4.4: SVG Click Attachments');

const pBtn = new MockElement('hcProgramBtn');
const powBtn = new MockElement('hcPowerBtn');
const sBtn = new MockElement('hcStartBtn');

const domElements = {
    hcProgramBtn: pBtn,
    hcPowerBtn: powBtn,
    hcStartBtn: sBtn
};
card._el = (id) => domElements[id] || new MockElement(id);

let selectorOpened = false;
let powerToggled = false;
let startPauseToggled = false;

card._openProgramSelector = () => { selectorOpened = true; };
card._hcTogglePower = () => { powerToggled = true; };
card._hcToggleStartPause = () => { startPauseToggled = true; };

card._attachSVGInteractions();

pBtn.click();
assert.strictEqual(selectorOpened, true, 'Program button click opens selector');

powBtn.click();
assert.strictEqual(powerToggled, true, 'Power button click toggles power');

sBtn.click();
assert.strictEqual(startPauseToggled, true, 'Start/pause button click toggles start/pause');
console.log('  ✔ SVG click handlers correctly invoke action methods');

// ========================================
// Task 4.5: Localization Strings Check
// ========================================
console.log('\nTesting Task 4.5: Localization Strings');
assert.ok(card._t.select_program, 'select_program string present');
assert.ok(card._t.close, 'close string present');
assert.ok(card._t.tip_program_btn, 'tip_program_btn string present');
assert.ok(card._t.tip_power_btn, 'tip_power_btn string present');
assert.ok(card._t.tip_start_btn, 'tip_start_btn string present');
console.log('  ✔ Phase 4 localization strings present in _t');

console.log('\n========================================');
console.log('All Phase 4 tests passed successfully!');
console.log('========================================');
