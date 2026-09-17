# REPOSITORY DISCOVERY REPORT
**Home Assistant Animated Appliance Card - Repository Analysis**

**Date:** 2026-09-17  
**Version Analyzed:** 1.3.0  
**Analyst:** Claude (Technical Lead)

---

## 1. REPOSITORY OVERVIEW

### Purpose
This repository contains a custom Lovelace card for Home Assistant that provides animated, visually rich representations of appliances (washing machines, dryers, dishwashers, ovens, microwaves). The card is designed to work with "dumb" appliances connected via smart plugs, transforming power monitoring data into an engaging, Oikos-inspired dashboard widget.

### Technologies
- **Pure Vanilla JavaScript** (ES6+)
- **Web Components** (Custom Elements API with Shadow DOM)
- **SVG** for appliance illustrations and animations
- **CSS3** for animations and theming
- **Home Assistant Lovelace** integration

### Build System
**None.** This is a single-file, zero-dependency project with no build pipeline, bundling, or transpilation. The file `washing-machine-card.js` is deployed directly to Home Assistant's `/config/www/` directory.

### Dependencies
**Zero external dependencies.** The card is completely self-contained vanilla JavaScript.

### Distribution
- **HACS** (Home Assistant Community Store) compatible
- **Manual installation** via file copy

---

## 2. DIRECTORY STRUCTURE

```
wm_animated_ha_card/
├── washing-machine-card.js    # Single source file (2042 lines)
├── README.md                   # English documentation
├── README_DE.md                # German documentation
├── README_FR.md                # French documentation
├── README_RU.md                # Russian documentation
├── CHANGELOG.md                # Version history
├── LICENSE                     # MIT license
├── hacs.json                   # HACS metadata
├── examples/
│   ├── washing_machine_package.yaml    # HA package for dumb appliances
│   └── smart_appliance.yaml            # Configuration for smart appliances
└── media/
    └── [demo GIFs and screenshots]
```

### Critical Files
- **washing-machine-card.js** - The entire implementation
- **examples/washing_machine_package.yaml** - Reference automation/helper setup
- **examples/smart_appliance.yaml** - Smart appliance integration patterns

### Entry Points
- Custom element registration: `customElements.define("washing-machine-card", WashingMachineCard)`
- Editor registration: `customElements.define("washing-machine-card-editor", WashingMachineCardEditor)`
- Window registration: `window.customCards.push({...})`

---

## 3. ARCHITECTURE ASSESSMENT

### Core Architecture Pattern
**Web Component with Shadow DOM encapsulation**

The implementation consists of two main classes:

1. **WashingMachineCard** (lines 28-1447)
   - Main card component
   - Extends `HTMLElement`
   - Implements Lovelace card interface

2. **WashingMachineCardEditor** (lines 1457-2002)
   - Visual configuration editor
   - Extends `HTMLElement`
   - Provides UI for card configuration

### Component Lifecycle

```
User adds card to dashboard
         ↓
setConfig(config) called
         ↓
hass object injected (set hass())
         ↓
_build() creates Shadow DOM structure
         ↓
_update() populates with live data
         ↓
30-second interval timer for running state updates
```

### Rendering Flow

```
setConfig()
   ↓
[stores config, validates status_entity]
   ↓
set hass()
   ↓
_build() (first time only)
   │
   ├─→ attachShadow()
   ├─→ Generate CSS (inline <style>)
   ├─→ Generate HTML structure
   ├─→ Generate SVG appliance graphic
   └─→ Attach event listeners
   ↓
_update() (every hass update + 30s timer)
   │
   ├─→ Determine appliance state (running/idle/off)
   ├─→ Update theme classes
   ├─→ Update status badge
   ├─→ Update elapsed time ring
   ├─→ Update power gauge
   └─→ Update last cycle panel
```

### Data Flow

```
Home Assistant Core
   ↓
hass.states object (entity states)
   ↓
Card's set hass() method
   ↓
_st(entityId) helper → retrieves entity state
   ↓
_isRunning() → determines operational state
   ↓
_update() → updates DOM elements
   ↓
Shadow DOM → rendered to user
```

### State Flow

The card tracks appliance state through a combination of:

1. **Status Entity State** (required)
   - User-provided binary_sensor or sensor
   - Matched against `running_states` array

2. **Power Entity State** (optional)
   - Power (W) or Current (A) sensor
   - Threshold comparison: `value > power_threshold`

3. **Computed Appliance State** (lines 289-299)
   ```javascript
   _applianceState() {
       if (this._isRunning()) return "running";
       if (power >= 1W) return "idle";
       return "off";
   }
   ```

### Event Flow

```
User Interactions:
   │
   ├─→ Click chart button → _moreInfo(power_entity)
   ├─→ Click ring → _moreInfo(last_wash_entity)
   ├─→ Click power value → _moreInfo(power_entity)
   ├─→ Click notify button → _toggle(notify_entity)
   ├─→ Click plug button → _confirmTogglePlug()
   └─→ Click last cycle items → _moreInfo(respective_entity)
       ↓
Home Assistant Event Bus
       ↓
hass-more-info / service calls
       ↓
Home Assistant Core
```

---

## 4. HOME ASSISTANT INTEGRATION ASSESSMENT

### Lovelace Card Interface Implementation

The card implements the standard Lovelace card interface:

```javascript
class WashingMachineCard extends HTMLElement {
    setConfig(config)           // Required: receives card configuration
    set hass(hass)              // Required: receives HA state updates
    getCardSize()               // Optional: returns grid height (6)
    static getConfigElement()   // Optional: returns editor element
    static getStubConfig()      // Optional: returns default config
}
```

### Entity Handling

**Configuration-Driven Entity Mapping:**
- Entities are specified in YAML configuration
- No hardcoded entity IDs
- Entity states accessed via `hass.states[entityId]`

**Entity Types Supported:**
- `binary_sensor.*` - Status detection
- `sensor.*` - Power, energy, duration
- `switch.*` - Plug control
- `input_boolean.*` - Notification toggle
- `input_datetime.*` - Last start timestamp
- `input_number.*` - Duration, energy, cost
- `automation.*` - Notification automation

### Service Calls

Service calls are made through the hass object (line 402-407):

```javascript
_toggle(entityId) {
    const domain = entityId.split(".")[0];
    const svcDomain = ["switch", "light", "input_boolean", "fan", "automation"]
        .includes(domain) ? domain : "homeassistant";
    this._hass.callService(svcDomain, "toggle", { entity_id: entityId });
}
```

### Configuration Model

**Current Structure (line 183-194):**
```javascript
{
    // Required
    status_entity: "binary_sensor.washing_in_progress",
    
    // Optional appliance configuration
    appliance_type: "washer",  // washer|dryer|dishwasher|oven|microwave
    name: "Washing machine",
    
    // Optional power monitoring
    power_entity: "sensor.washing_machine_power",
    power_threshold: 10,
    power_max: 2500,
    
    // Optional control entities
    plug_entity: "switch.washing_machine_plug",
    notify_entity: "automation.washing_finished",
    
    // Optional last cycle tracking
    last_wash_entity: "input_datetime.wm_last_start",
    duration_entity: "input_number.wm_last_duration",
    energy_entity: "input_number.wm_last_energy",
    cost_entity: "input_number.wm_last_cost",
    
    // Optional display configuration
    currency: "€",
    language: "auto",  // auto|en|ru|de|fr
    theme: "auto",     // auto|light|dark|ha
    hide_status_panel: false,
    confirm_plug_off: true,
    duration_format: "minutes",  // minutes|hhmm
    running_states: [array of state strings]
}
```

**Entity-to-Configuration Mapping:**
- Simple flat structure
- All entities optional except `status_entity`
- No nested objects
- No entity discovery or auto-configuration

### Lovelace Integration

- Registered via `window.customCards` array
- Visual editor enabled (`getConfigElement()`)
- Preview support enabled
- Documentation URL provided

---

## 5. ANIMATION ASSESSMENT

### Existing Animations

All animations are **pure CSS** using `@keyframes`. No JavaScript animation loops.

#### Washing Machine Animations (lines 1058-1065)
```css
.running .arcs    { animation: spin 3s linear infinite; }
.running .laundry { animation: tumble 3s ease-in-out infinite; }
```

#### Dryer Animations (lines 1064-1065)
```css
.running .drum { animation: spin 2.4s linear infinite; }
.running .heat { animation: heatPulse 2s ease-in-out infinite; }
```

#### Dishwasher Animations (lines 1067-1094)
```css
.running .dw-wash { animation: washPulse 2.4s ease-in-out infinite; }
.running .dw-stream { animation: streamFall 1.1s linear infinite; }
.running .dw-arm { animation: armSweep 3.2s ease-in-out infinite; }
.running .dw-frame { animation: dash-crawl 2.4s linear infinite; }
```

#### Oven Animations (lines 1096-1110)
```css
.running .ov-glow { animation: heatPulse 2s ease-in-out infinite; }
.running .ov-shimmer { animation: streamFall 1.4s linear infinite; }
.running .ov-flame { animation: flameFlicker 1.1s ease-in-out infinite; }
.running .ov-food { animation: foodSway 3.6s ease-in-out infinite; }
```

#### Microwave Animations (lines 1112-1131)
```css
.running .mw-glow { animation: heatPulse 2.2s ease-in-out infinite; }
.running .mw-wave { animation: streamFall 2.2s linear infinite; }
.running .mw-mug { animation: mugOrbit 12s linear infinite; }
.running .mw-rim { animation: dash-crawl 12s linear infinite; }
```

### Existing SVG Usage

Each appliance type has a dedicated SVG generation method:

- `_svgWasher(u)` (lines 508-546)
- `_svgDryer(u)` (lines 548-618)
- `_svgDishwasher(u)` (lines 620-718)
- `_svgOven(u)` (lines 720-798)
- `_svgMicrowave(u)` (lines 800-881)

**SVG Structure:**
- Complete inline SVG markup
- Gradients, filters, and clip paths defined in `<defs>`
- Grouped elements with class names for animation targeting
- Transform-origin set via CSS for rotation animations

### Existing CSS

**Animation Keyframes:** (lines 1133-1181)
- `@keyframes spin` - 360° rotation
- `@keyframes tumble` - oscillating rotation
- `@keyframes heatPulse` - opacity pulsing
- `@keyframes washPulse` - opacity pulsing (different range)
- `@keyframes streamFall` - stroke-dashoffset animation
- `@keyframes armSweep` - sweeping rotation
- `@keyframes dash-crawl` - stroke-dashoffset animation
- `@keyframes flameFlicker` - opacity + scaleY
- `@keyframes foodSway` - translateY oscillation
- `@keyframes mugOrbit` - circular translate path

**Animation Control:**
- Triggered by `.running` class on wrapper
- Respects `prefers-reduced-motion` (lines 1182-1191)
- All animations stop when appliance is idle/off

### Existing Interaction Patterns

**Current Interactive Elements:**
- Header buttons (notify, plug, history)
- Elapsed time ring (clickable)
- Power value (clickable)
- Last cycle items (clickable)

**Current Interaction Type:**
- All interactions trigger Home Assistant more-info dialogs or service calls
- No in-card dialogs or modals
- No appliance-specific controls on the graphic itself

**Event Handling Pattern:**
```javascript
element.addEventListener("click", () => this._moreInfo(entityId));
element.addEventListener("click", () => this._toggle(entityId));
element.addEventListener("click", () => this._confirmTogglePlug());
```

---

## 6. EXTENSION ASSESSMENT

### Best Extension Points

#### 1. Configuration Structure
**Current:** Flat object with optional properties  
**Extension Strategy:** Add new optional properties without breaking existing configs

#### 2. Appliance Type System
**Current:** String-based type with normalizer (line 143-156)  
**Extension Strategy:** Add new types to `APPLIANCE_TYPES` array and implement corresponding SVG/animation methods

#### 3. SVG Generation
**Current:** Dedicated method per appliance type  
**Extension Strategy:** Add new `_svg{Type}(uid)` methods following existing patterns

#### 4. Animation System
**Current:** CSS class-based with `.running` trigger  
**Extension Strategy:** Add new animation classes and keyframes for new features

#### 5. State Determination
**Current:** `_isRunning()` and `_applianceState()` methods  
**Extension Strategy:** Extend logic to handle additional states and entity types

### Reusable Components

#### 1. SVG Chassis Generator
`_svgChassis(u, opts)` (line 487-506) - Reusable appliance body structure

#### 2. String Localization System
`STRINGS` static object (lines 31-115) - Multi-language label system

#### 3. Theme System
CSS custom properties with three theme modes (lines 891-996)

#### 4. Entity State Helpers
- `_st(entityId)` - Get entity state
- `_parseDate(state)` - Parse datetime
- `_fmtDateTime(state)` - Format datetime
- `_fmtNum(value, digits)` - Format numbers
- `_fmtDuration(state)` - Format duration

#### 5. Event Dispatchers
- `_moreInfo(entityId)` - Open HA more-info dialog
- `_toggle(entityId)` - Toggle entity state

### Potential Refactoring Candidates

#### 1. Entity Mapping Layer
**Current State:** Direct entity ID references throughout code  
**Refactoring Opportunity:** Create abstraction layer for entity access

#### 2. Appliance-Specific Logic
**Current State:** Scattered type checks and conditionals  
**Refactoring Opportunity:** Appliance strategy pattern or factory

#### 3. Animation Management
**Current State:** Hardcoded CSS classes and keyframes  
**Refactoring Opportunity:** Dynamic animation system (future enhancement)

---

## 7. CONSTRAINTS

### Technical Constraints

1. **Zero Build Pipeline**
   - Must remain single-file JavaScript
   - No TypeScript, JSX, or build tools
   - No module imports or bundling

2. **Home Assistant Integration**
   - Must implement Lovelace card interface
   - Must work within Shadow DOM constraints
   - Must respect Home Assistant theme system

3. **Browser Compatibility**
   - Must support Home Assistant's minimum browser requirements
   - Must use standard Web Components APIs
   - Must handle Shadow DOM limitations

4. **Animation Performance**
   - Must use CSS animations (not JavaScript)
   - Must respect `prefers-reduced-motion`
   - Must not cause layout thrashing

5. **File Size**
   - Currently 2042 lines (~91KB)
   - Should remain reasonable for browser loading
   - SVG graphics are inline (no external assets)

### Compatibility Constraints

1. **Backward Compatibility (CRITICAL)**
   - All existing YAML configurations must continue working
   - No breaking changes to configuration schema
   - Existing entity mappings must remain functional

2. **Home Assistant Versions**
   - Must work with current HA release
   - Should remain compatible with recent versions

3. **Lovelace Ecosystem**
   - Must coexist with other custom cards
   - Must not pollute global namespace beyond registration
   - Must use standard HA events and services

### Architectural Constraints

1. **Single Responsibility**
   - Card displays data, does not create or manage entities
   - Automations and helpers are external to the card
   - Card does not perform business logic

2. **Configuration Over Convention**
   - All entities must be explicitly configured
   - No automatic entity discovery
   - No assumptions about entity naming

3. **State Management**
   - State is owned by Home Assistant
   - Card is a pure view layer
   - No local state persistence

---

## 8. HOME CONNECT INTEGRATION ANALYSIS

### Current Smart Appliance Support

The card currently supports smart appliances through flexible entity mapping (see examples/smart_appliance.yaml):

**Supported Pattern:**
```yaml
type: custom:washing-machine-card
appliance_type: washer
status_entity: sensor.washer_operation_state
plug_entity: switch.washer_power
running_states: [run]
```

**Current Limitations for Home Connect:**
1. No dedicated Home Connect mode
2. No program selection interface
3. No door state visualization
4. No interactive controls on appliance graphic
5. No Home Connect-specific entity types
6. No program/option display
7. No connectivity indicators
8. No i-Dos or feature-specific displays

### Home Connect Entity Patterns (from examples/smart_appliance.yaml)

**Observed Entity Types:**
- `sensor.washer_operation_state` - Operation state
- `sensor.washer_program_progress` - Progress percentage
- `sensor.washer_program_finish_time` - Estimated completion
- `sensor.washer_door` - Door open/closed
- `select.washer_active_program` - Program selector
- `binary_sensor.washer_remote_start` - Remote start capability
- `switch.washer_child_lock` - Child lock state

**Current Display Strategy:**
The example suggests displaying Home Connect entities in separate tile/entity cards alongside the animated card, not within it.

### Gap Analysis: Required vs. Current

**Missing for Full Home Connect Support:**
1. Program selection UI within the card
2. Interactive SVG controls (buttons on graphic)
3. Door animation system
4. Feature toggles (i-Dos, options)
5. Connectivity state indicators
6. Progress visualization beyond time ring
7. Modal dialogs for selection
8. Home Connect-specific entity mapping

---

## 9. CONCLUSION

### Repository Characteristics

**Strengths:**
- ✅ Clean, self-contained architecture
- ✅ Zero dependencies
- ✅ Excellent visual design
- ✅ Strong internationalization (4 languages)
- ✅ Flexible entity mapping
- ✅ Comprehensive documentation
- ✅ Respects accessibility (reduced-motion)

**Extension Readiness:**
- ✅ Modular appliance type system
- ✅ Reusable SVG generation patterns
- ✅ CSS-based animation framework
- ✅ Clear extension points
- ⚠️ Limited abstraction layers for major feature additions

**Architecture Quality:**
- Well-organized single file
- Clear separation between card and editor
- Consistent naming conventions
- Good code documentation
- Standard Web Components patterns

### Readiness for Home Connect Enhancement

**Ready:**
- Entity handling infrastructure
- Configuration system
- Event handling patterns
- Localization framework

**Needs Design:**
- Mode-based configuration (standard vs home_connect)
- Appliance abstraction layer
- Interactive control system
- Modal/dialog framework
- Program selection interface
- Door animation system

**Must Preserve:**
- Existing configuration compatibility
- Single-file architecture
- Zero-build deployment
- Current appliance types and animations
- All existing features

---

## NEXT STEPS

Repository analysis is complete. The project is ready for:

1. **Technical Architecture Review** - Design the Home Connect integration architecture
2. **Proposed Architecture** - Define the Appliance Abstraction Layer
3. **Risk Assessment** - Identify breaking change risks and mitigation strategies
4. **Implementation Strategy** - Define phases, milestones, and validation criteria

All architectural decisions must be derived from the findings in this report, not from assumptions.

---

**Report Status:** ✅ COMPLETE  
**Repository Understanding:** ✅ COMPREHENSIVE  
**Ready for Architecture Phase:** ✅ YES
