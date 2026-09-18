const fs = require('fs');
const path = require('path');
const assert = require('assert');

// ─── Minimal DOM mock (reuse pattern from other phase tests) ──────────────────

class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id; this.tagName = tagName.toUpperCase();
        this.textContent = ''; this.innerHTML = ''; this.style = {};
        this.attributes = {}; this.dataset = {}; this.className = '';
        this.classList = {
            _classes: new Set(),
            add(c) { this._classes.add(c); },
            remove(c) { this._classes.delete(c); },
            toggle(c, f) {
                if (f === undefined) { this._classes.has(c) ? this._classes.delete(c) : this._classes.add(c); }
                else if (f) this._classes.add(c); else this._classes.delete(c);
            },
            contains(c) { return this._classes.has(c); }
        };
    }
    setAttribute(n, v) { this.attributes[n] = String(v); }
    getAttribute(n) { return this.attributes[n]; }
    addEventListener() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
}

class MockShadowRoot {
    constructor() { this.elements = {}; this.innerHTML = ''; }
    getElementById(id) {
        if (!this.elements[id]) this.elements[id] = new MockElement(id);
        return this.elements[id];
    }
    querySelector() { return null; }
    querySelectorAll() { return []; }
}

global.HTMLElement = class {
    constructor() { this.classList = new MockElement().classList; this.style = {}; }
    attachShadow() { this.shadowRoot = new MockShadowRoot(); return this.shadowRoot; }
    getBoundingClientRect() { return { width: 400, height: 500 }; }
};
global.customElements = { get: () => null, define: () => {} };
global.window = { customCards: [], confirm: () => true, alert: () => {}, addEventListener: () => {} };
global.document = { createElement: (t) => new MockElement('', t) };

// ─── Load card ────────────────────────────────────────────────────────────────

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const WashingMachineCard = new Function(code + '\nreturn WashingMachineCard;')();

console.log('Testing Phase 9 Localization...\n');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getT(lang) {
    const card = new WashingMachineCard();
    card._hass = { locale: { language: lang }, states: {} };
    card.setConfig({ mode: 'standard', status_entity: 'binary_sensor.x' });
    return card._t;
}

function translateAs(lang, programName) {
    const card = new WashingMachineCard();
    card._hass = { locale: { language: lang }, states: {} };
    card.setConfig({ mode: 'standard', status_entity: 'binary_sensor.x' });
    return card._translateProgram(programName);
}

function runTests() {

    // ── Task 9.1: All EN strings present ─────────────────────────────────────
    console.log('Testing Task 9.1: English – all required keys present');
    {
        const t = getT('en');
        const required = [
            'badge_finished', 'badge_paused', 'badge_ready', 'badge_delayed', 'badge_error', 'badge_action_required',
            'state_finished', 'state_paused', 'state_ready', 'state_delayed', 'state_error', 'state_action_required',
            'ring_ready', 'ring_paused',
            'confirm_power_off', 'remote_control_required', 'program_selection_failed', 'service_call_failed',
            'select_program', 'close', 'tip_program_btn', 'tip_power_btn', 'tip_start_btn',
            'connected', 'disconnected', 'active_program', 'salt_low', 'rinseaid_low',
        ];
        for (const key of required) {
            assert(t[key], `EN: missing key "${key}"`);
        }
        assert(t.programs, 'EN: missing programs map');
        assert(t.programs.Cotton, 'EN: Cotton translation missing');
        assert(t.programs.EasyCare, 'EN: EasyCare translation missing');
        assert(t.programs.Auto1, 'EN: dishwasher Auto1 missing');
        console.log('  ✔ All required EN strings present');
    }

    // ── Task 9.2: DE strings complete ─────────────────────────────────────────
    console.log('Testing Task 9.2: German – all HC strings and programs present');
    {
        const t = getT('de');
        assert(t.badge_finished === 'FERTIG',        'DE badge_finished');
        assert(t.badge_paused  === 'PAUSIERT',       'DE badge_paused');
        assert(t.state_finished === 'Fertig',        'DE state_finished');
        assert(t.state_delayed === 'Verzögerter Start', 'DE state_delayed');
        assert(t.ring_ready === 'BEREIT',            'DE ring_ready');
        assert(t.confirm_power_off,                  'DE confirm_power_off');
        assert(t.remote_control_required,            'DE remote_control_required');
        assert(t.select_program === 'Programm wählen', 'DE select_program');
        assert(t.close === 'Schließen',              'DE close');
        assert(t.tip_program_btn === 'Programm wählen', 'DE tip_program_btn');
        assert(t.tip_start_btn === 'Start / Pause', 'DE tip_start_btn');
        assert(t.programs?.Cotton === 'Baumwolle',   'DE Cotton=Baumwolle');
        assert(t.programs?.EasyCare === 'Pflegeleicht', 'DE EasyCare=Pflegeleicht');
        assert(t.programs?.NightWash === 'Nachtwaschen', 'DE NightWash=Nachtwaschen');
        assert(t.programs?.PreRinse === 'Vorspülen', 'DE PreRinse=Vorspülen');
        console.log('  ✔ All required DE strings and program translations present');
    }

    // ── Task 9.3: RU strings complete ─────────────────────────────────────────
    console.log('Testing Task 9.3: Russian – all HC strings and programs present');
    {
        const t = getT('ru');
        assert(t.badge_finished === 'ЗАВЕРШЕНО',     'RU badge_finished');
        assert(t.badge_paused  === 'НА ПАУЗЕ',       'RU badge_paused');
        assert(t.state_finished === 'Завершено',     'RU state_finished');
        assert(t.ring_ready === 'ГОТОВО',            'RU ring_ready');
        assert(t.confirm_power_off,                  'RU confirm_power_off');
        assert(t.remote_control_required,            'RU remote_control_required');
        assert(t.select_program === 'Выбрать программу', 'RU select_program');
        assert(t.close === 'Закрыть',                'RU close');
        assert(t.programs?.Cotton === 'Хлопок',      'RU Cotton=Хлопок');
        assert(t.programs?.EasyCare === 'Лёгкий уход', 'RU EasyCare');
        assert(t.programs?.Eco50 === 'Эко 50°',      'RU Eco50');
        assert(t.programs?.PreRinse,                 'RU PreRinse missing');
        console.log('  ✔ All required RU strings and program translations present');
    }

    // ── Task 9.4: FR strings complete ─────────────────────────────────────────
    console.log('Testing Task 9.4: French – all HC strings and programs present');
    {
        const t = getT('fr');
        assert(t.badge_finished === 'TERMINÉ',       'FR badge_finished');
        assert(t.badge_ready === 'PRÊT',             'FR badge_ready');
        assert(t.state_finished === 'Terminé',       'FR state_finished');
        assert(t.state_delayed === 'Départ différé', 'FR state_delayed');
        assert(t.ring_ready === 'PRÊT',              'FR ring_ready');
        assert(t.confirm_power_off,                  'FR confirm_power_off');
        assert(t.select_program === 'Choisir un programme', 'FR select_program');
        assert(t.close === 'Fermer',                 'FR close');
        assert(t.tip_power_btn === 'Marche/Arrêt',   'FR tip_power_btn');
        assert(t.programs?.Cotton === 'Coton',       'FR Cotton=Coton');
        assert(t.programs?.EasyCare === 'Entretien facile', 'FR EasyCare');
        assert(t.programs?.NightWash === 'Lavage nuit', 'FR NightWash');
        assert(t.programs?.Eco50 === 'Éco 50°',      'FR Eco50');
        console.log('  ✔ All required FR strings and program translations present');
    }

    // ── Task 9.5: _translateProgram – locale map lookup ───────────────────────
    console.log('Testing Task 9.5: _translateProgram uses locale map');
    {
        assert.strictEqual(translateAs('en', 'Cotton'),        'Cotton',        'EN Cotton');
        assert.strictEqual(translateAs('de', 'Cotton'),        'Baumwolle',     'DE Cotton=Baumwolle');
        assert.strictEqual(translateAs('ru', 'Cotton'),        'Хлопок',        'RU Cotton=Хлопок');
        assert.strictEqual(translateAs('fr', 'Cotton'),        'Coton',         'FR Cotton=Coton');
        assert.strictEqual(translateAs('de', 'EasyCare'),      'Pflegeleicht',  'DE EasyCare');
        assert.strictEqual(translateAs('ru', 'Eco50'),         'Эко 50°',       'RU Eco50');
        assert.strictEqual(translateAs('fr', 'NightWash'),     'Lavage nuit',   'FR NightWash');
        console.log('  ✔ _translateProgram returns locale-specific program names for all 4 locales');
    }

    // ── Task 9.6: _translateProgram – strips HC API prefix ───────────────────
    console.log('Testing Task 9.6: _translateProgram strips HC API prefixes');
    {
        // Full HC API path
        assert.strictEqual(translateAs('de', 'LaundryCare.Washer.Program.Cotton'), 'Baumwolle', 'Strip washer prefix');
        assert.strictEqual(translateAs('en', 'Dishcare.Dishwasher.Program.Auto1'), 'Auto',      'Strip dishwasher prefix');
        assert.strictEqual(translateAs('fr', 'LaundryCare.Washer.Program.Eco50'), 'Éco 50°',   'Strip and translate FR');
        console.log('  ✔ _translateProgram strips HC API prefix then translates');
    }

    // ── Task 9.7: _translateProgram – CamelCase fallback ─────────────────────
    console.log('Testing Task 9.7: _translateProgram CamelCase fallback for unknown programs');
    {
        // Unknown program not in any map
        const result = translateAs('en', 'SuperFreshPlus');
        assert.strictEqual(result, 'Super Fresh Plus', `CamelCase fallback: expected "Super Fresh Plus", got "${result}"`);
        console.log('  ✔ _translateProgram CamelCase fallback works for unknown programs');
    }

    // ── Task 9.8: _translateProgram – null/empty safety ──────────────────────
    console.log('Testing Task 9.8: _translateProgram handles null and empty gracefully');
    {
        assert.strictEqual(translateAs('en', null), '',  'null → empty string');
        assert.strictEqual(translateAs('en', ''),   '',  'empty → empty string');
        assert.strictEqual(translateAs('de', undefined), '', 'undefined → empty string');
        console.log('  ✔ _translateProgram is null-safe');
    }

    // ── Task 9.9: Dishwasher program translations ─────────────────────────────
    console.log('Testing Task 9.9: Dishwasher program translations (all locales)');
    {
        const cases = [
            ['en', 'PreRinse',     'Pre-Rinse'],
            ['de', 'PreRinse',     'Vorspülen'],
            ['ru', 'PreRinse',     'Предварительное полоскание'],
            ['fr', 'PreRinse',     'Pré-rinçage'],
            ['en', 'Intensiv70dw', 'Intensive 70°'],
            ['de', 'Intensiv70dw', 'Intensiv 70°'],
            ['ru', 'Intensiv70dw', 'Интенсивный 70°'],
            ['fr', 'Intensiv70dw', 'Intensif 70°'],
        ];
        for (const [lang, prog, expected] of cases) {
            const result = translateAs(lang, prog);
            assert.strictEqual(result, expected, `${lang} ${prog}: expected "${expected}", got "${result}"`);
        }
        console.log('  ✔ Dishwasher program translations verified for all 4 locales');
    }

    // ── Task 9.10: EN fallback for auto-detected locale ───────────────────────
    console.log('Testing Task 9.10: Auto language detection falls back to EN');
    {
        const card = new WashingMachineCard();
        card._hass = { locale: { language: 'es' }, states: {} }; // Spanish not supported
        card.setConfig({ mode: 'standard', status_entity: 'binary_sensor.x' });
        const t = card._t;
        // Should fall back to EN
        assert.strictEqual(t.close, 'Close', 'Unsupported locale falls back to EN close');
        assert.strictEqual(t.programs?.Cotton, 'Cotton', 'Unsupported locale falls back to EN programs');
        console.log('  ✔ Auto-detects unsupported locale falls back to EN');
    }

    console.log('\nAll Phase 9 tests passed successfully! 🎉\n');
}

runTests();
