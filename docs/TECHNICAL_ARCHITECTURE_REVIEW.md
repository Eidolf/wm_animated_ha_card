# TECHNICAL ARCHITECTURE REVIEW
**Home Assistant Animated Appliance Card - Home Connect Integration**

**Date:** 2026-09-17  
**Reviewer:** Claude (Technical Lead)  
**Based on:** Repository Discovery Report

---

## EXECUTIVE SUMMARY

This review analyzes the current architecture of the washing-machine-card project and evaluates its readiness for Home Connect integration. The card demonstrates solid architectural foundations with clear extension points, but requires careful design to add Home Connect functionality without compromising the existing single-file, zero-dependency architecture or breaking backward compatibility.

**Key Finding:** The project is architecturally ready for enhancement, but Home Connect integration requires a **mode-based architecture** to maintain backward compatibility while adding advanced features.

---

## 1. CURRENT ARCHITECTURE

### 1.1 Component Structure

```
WashingMachineCard (HTMLElement)
├── Configuration Layer
│   ├── setConfig() - Validates and stores configuration
│   └── DEFAULTS object - Default values
├── State Management Layer
│   ├── set hass() - Receives HA state updates
│   ├── _st(entityId) - Entity state accessor
│   ├── _isRunning() - Running state determination
│   └── _applianceState() - Computed state (running/idle/off)
├── Rendering Layer
│   ├── _build() - One-time Shadow DOM construction
│   ├── _update() - Reactive state-to-DOM updates
│   ├── _machineSvg() - Appliance-specific SVG generation
│   └── Theme system (CSS custom properties)
├── Presentation Layer
│   ├── SVG generators per appliance type
│   ├── CSS animations (pure CSS, no JS)
│   └── Localization (4 languages)
└── Event Handling Layer
    ├── _moreInfo() - Open HA dialogs
    ├── _toggle() - Service calls
    └── _confirmTogglePlug() - Confirmation flow

WashingMachineCardEditor (HTMLElement)
├── Visual configuration UI
├── Form field generation
└── Config change events
```

### 1.2 Data Flow Architecture

```
Home Assistant Core
        ↓
   hass object
        ↓
set hass(hass) [reactive property]
        ↓
   _update() [called on every hass change]
        ↓
┌───────────────────────────────────┐
│  State Computation                │
│  - _isRunning()                   │
│  - _applianceState()              │
│  - _startDate()                   │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│  DOM Updates                      │
│  - Badge state                    │
│  - Ring animation                 │
│  - Power gauge                    │
│  - Last cycle panel               │
└───────────────────────────────────┘
        ↓
   Shadow DOM
        ↓
  User Interface
```

### 1.3 Current Event Flow

```
User Action
    ↓
Event Listener (addEventListener)
    ↓
Event Handler (_moreInfo, _toggle, etc.)
    ↓
Home Assistant API
    ├─→ hass.callService() - Service calls
    └─→ CustomEvent("hass-more-info") - Dialogs
    ↓
Home Assistant Core
    ↓
State Update
    ↓
New hass object → set hass() → _update()
```

### 1.4 Configuration Flow

```
User creates YAML config
        ↓
Lovelace parser
        ↓
setConfig(config)
        ↓
Validation (status_entity required)
        ↓
Merge with DEFAULTS
        ↓
Store in this._config
        ↓
Used by _build() and _update()
```

---

## 2. CURRENT DATA FLOW

### 2.1 Entity Resolution Pattern

**Current Implementation:**
```javascript
_st(entityId) {
    return entityId ? this._hass.states[entityId] : undefined;
}
```

**Characteristics:**
- ✅ Simple and direct
- ✅ No abstraction overhead
- ⚠️ No entity type validation
- ⚠️ No entity grouping or relationships
- ⚠️ Direct coupling to entity IDs

### 2.2 State Determination Logic

**Running State Detection (lines 276-287):**
```javascript
_isRunning() {
    const status = this._st(c.status_entity);
    const byStatus = status && c.running_states.includes(String(status.state).toLowerCase());
    
    let byPower = false;
    if (c.power_entity) {
        const p = parseFloat(this._st(c.power_entity)?.state);
        byPower = !isNaN(p) && p > c.power_threshold;
    }
    
    return byStatus || byPower;  // OR logic
}
```

**Appliance State Computation (lines 289-299):**
```javascript
_applianceState() {
    if (this._isRunning()) return "running";
    if (c.power_entity) {
        const p = parseFloat(this._st(c.power_entity)?.state);
        if (!isNaN(p) && p >= 1) return "idle";
    }
    return "off";
}
```

**Analysis:**
- ✅ Clear three-state model (running/idle/off)
- ✅ Flexible entity-based detection
- ⚠️ Limited to power-based detection
- ⚠️ No support for operational state values beyond simple matching
- ⚠️ No door state consideration
- ⚠️ No program progress consideration

### 2.3 Display Update Pattern

**Update Cycle (lines 1346-1446):**
```javascript
_update() {
    // 1. Theme application
    // 2. State computation
    // 3. Badge update
    // 4. Ring update
    // 5. Status panel update
    // 6. Power gauge update (if power_entity)
    // 7. Last cycle panel update (if entities exist)
    // 8. Button state updates
}
```

**Pattern:**
- Imperative DOM updates
- Conditional block visibility based on entity existence
- No component reusability
- No data-binding framework

---

## 3. CURRENT RENDERING FLOW

### 3.1 Build Phase (One-Time)

```
_build() called (first hass injection)
    ↓
attachShadow({ mode: "open" })
    ↓
Generate Complete HTML String
    ├─→ <style> block (890+ lines CSS)
    ├─→ <ha-card> structure
    ├─→ Header (icon, title, badge, buttons)
    ├─→ Hero section with SVG
    ├─→ Status panel (ring + state + power)
    └─→ Last cycle panel
    ↓
Set innerHTML on shadow root
    ↓
Cache element references (_el function)
    ↓
Attach event listeners
    ↓
Set _built = true
```

### 3.2 Update Phase (Reactive)

```
set hass() called (every state change)
    ↓
if (!_built) → _build()
    ↓
_update() called
    ↓
Read entity states via _st()
    ↓
Compute derived states
    ↓
Update DOM element properties
    ├─→ textContent
    ├─→ classList.toggle()
    ├─→ style properties
    └─→ setAttribute()
```

### 3.3 SVG Generation

**Pattern:** Factory methods per appliance type

```javascript
_machineSvg() {
    const type = this._applianceType;
    if (type === "dryer") return this._svgDryer(u);
    if (type === "dishwasher") return this._svgDishwasher(u);
    if (type === "oven") return this._svgOven(u);
    if (type === "microwave") return this._svgMicrowave(u);
    return this._svgWasher(u);
}
```

**Each SVG method:**
1. Generates unique IDs for gradients/filters (using uid)
2. Calls `_svgChassis()` for common body structure
3. Adds appliance-specific elements
4. Returns complete SVG string

**Analysis:**
- ✅ Clean separation by appliance type
- ✅ Reusable chassis component
- ✅ No external dependencies
- ⚠️ SVG is static after build (no dynamic state)
- ⚠️ No interactive elements within SVG
- ⚠️ No door state visualization

---

## 4. CURRENT CONFIGURATION FLOW

### 4.1 Configuration Schema

**Current Structure:**
```typescript
interface Config {
    // Required
    status_entity: string;
    
    // Optional identification
    appliance_type?: "washer" | "dryer" | "dishwasher" | "oven" | "microwave";
    name?: string;
    
    // Optional detection
    power_entity?: string;
    power_threshold?: number;  // default: 10
    power_max?: number;        // default: 2500
    running_states?: string[]; // default: large array
    
    // Optional controls
    plug_entity?: string;
    notify_entity?: string;
    confirm_plug_off?: boolean; // default: true
    
    // Optional tracking
    last_wash_entity?: string;
    duration_entity?: string;
    energy_entity?: string;
    cost_entity?: string;
    
    // Optional display
    currency?: string;         // default: "€"
    language?: string;         // default: "auto"
    theme?: string;            // default: "auto"
    hide_status_panel?: boolean; // default: false
    duration_format?: string;  // default: "minutes"
}
```

### 4.2 Configuration Processing

```
Raw YAML config
    ↓
setConfig(config)
    ↓
Validation: if (!config.status_entity) throw Error
    ↓
Merge: this._config = { ...DEFAULTS, ...config }
    ↓
Normalization: appliance_type via normalizeType()
    ↓
Generate unique ID: this._uid
    ↓
Set _built = false
```

**Analysis:**
- ✅ Simple flat structure
- ✅ Clear required vs optional
- ✅ Type normalization
- ⚠️ No nested configuration groups
- ⚠️ No mode-based configuration
- ⚠️ No entity grouping by function

---

## 5. HOME ASSISTANT INTEGRATION PATTERNS

### 5.1 Entity Access Pattern

**Direct Access:**
```javascript
const entity = this._hass.states[entityId];
const state = entity?.state;
const attributes = entity?.attributes;
```

**Characteristics:**
- Simple and direct
- No caching
- No error handling
- No entity validation

### 5.2 Service Call Pattern

**Current Implementation:**
```javascript
_toggle(entityId) {
    const domain = entityId.split(".")[0];
    const svcDomain = ["switch", "light", "input_boolean", "fan", "automation"]
        .includes(domain) ? domain : "homeassistant";
    this._hass.callService(svcDomain, "toggle", { entity_id: entityId });
}
```

**Analysis:**
- ✅ Domain-aware service routing
- ✅ Fallback to homeassistant domain
- ⚠️ Only supports toggle operation
- ⚠️ No set_value, select_option, or other operations
- ⚠️ No service call feedback or error handling

### 5.3 Event Dispatch Pattern

**More Info Dialog:**
```javascript
_moreInfo(entityId) {
    this.dispatchEvent(
        new CustomEvent("hass-more-info", {
            detail: { entityId },
            bubbles: true,
            composed: true,
        })
    );
}
```

**Analysis:**
- ✅ Standard Home Assistant event
- ✅ Proper event bubbling
- ⚠️ Only supports more-info dialog
- ⚠️ No custom modal/dialog support

### 5.4 State Subscription Pattern

**Current Pattern:**
```javascript
set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    this._update();
}
```

**Characteristics:**
- Lovelace calls set hass() on every state change
- No selective subscription
- Card updates on all state changes (not just relevant entities)
- 30-second timer for additional updates when running

---

## 6. EXTENSION POINT ANALYSIS

### 6.1 Identified Extension Points

#### ✅ Strong Extension Points

**1. Appliance Type System**
- Location: `APPLIANCE_TYPES` array, `normalizeType()`, `_machineSvg()`
- Extensibility: HIGH
- Adding new types requires:
  - Add to APPLIANCE_TYPES array
  - Add normalization aliases
  - Implement `_svg{Type}()` method
  - Add localized strings
  - Add animations

**2. Localization System**
- Location: `STRINGS` static object
- Extensibility: HIGH
- Adding new strings requires:
  - Add keys to all language objects
  - Reference in templates

**3. Theme System**
- Location: CSS custom properties in `:host` selectors
- Extensibility: MEDIUM
- Adding theme variants requires:
  - Define new CSS custom property set
  - Add theme detection logic

**4. Configuration Schema**
- Location: `setConfig()`, `DEFAULTS`
- Extensibility: HIGH (additive only)
- Adding new config options:
  - Add to DEFAULTS
  - Add to editor schema
  - Use in _update()

#### ⚠️ Limited Extension Points

**1. State Determination**
- Location: `_isRunning()`, `_applianceState()`
- Extensibility: MEDIUM
- Constraints:
  - Hard-coded three-state model
  - Limited to power-based detection
  - No entity relationship modeling

**2. Rendering System**
- Location: `_build()`, `_update()`
- Extensibility: LOW
- Constraints:
  - Single build phase (no rebuild)
  - Imperative DOM updates
  - No component abstraction
  - SVG is static after build

**3. Interaction System**
- Location: Event listeners in `_build()`
- Extensibility: MEDIUM
- Constraints:
  - Static event binding
  - Limited to click events
  - No in-SVG interaction support
  - No modal/dialog infrastructure

### 6.2 Architectural Constraints for Extension

**MUST PRESERVE:**
1. Single-file architecture
2. Zero external dependencies
3. Shadow DOM encapsulation
4. Backward compatibility with all existing configs
5. Zero-build deployment model

**CANNOT CHANGE:**
1. Lovelace card interface (`setConfig`, `set hass`, `getCardSize`)
2. Custom element registration pattern
3. File structure (must remain `washing-machine-card.js`)

**CAN EXTEND:**
1. Configuration schema (additive only)
2. Entity mapping patterns
3. State computation logic
4. SVG generation
5. Animation definitions
6. Localization strings

---

## 7. RISK ASSESSMENT FOR HOME CONNECT

### 7.1 Breaking Change Risks

#### 🔴 HIGH RISK

**1. Configuration Schema Changes**
- **Risk:** Adding required fields or changing structure breaks existing configs
- **Impact:** All existing dashboards break on update
- **Mitigation:** All new fields must be optional with sensible defaults

**2. State Computation Changes**
- **Risk:** Changing `_isRunning()` or `_applianceState()` logic affects existing behavior
- **Impact:** Cards display wrong states, animations don't trigger
- **Mitigation:** Mode-based logic that preserves standard mode behavior exactly

**3. Entity Resolution Changes**
- **Risk:** Changing how entities are accessed breaks existing entity references
- **Impact:** Cards show no data
- **Mitigation:** Maintain `_st()` pattern, add parallel abstraction

#### 🟡 MEDIUM RISK

**1. Adding Interactive Controls**
- **Risk:** New click handlers may conflict with existing more-info behaviors
- **Impact:** Users lose expected functionality
- **Mitigation:** Add controls only in new mode, preserve existing click targets

**2. SVG Structure Changes**
- **Risk:** Changing SVG classes/IDs breaks existing CSS selectors
- **Impact:** Animations break, styling fails
- **Mitigation:** Add new elements alongside existing, use new class names

**3. Event Handling Additions**
- **Risk:** New event types may not bubble correctly or conflict
- **Impact:** Controls don't work in some contexts
- **Mitigation:** Follow existing event patterns, test in Shadow DOM

#### 🟢 LOW RISK

**1. Adding New Appliance Types**
- **Risk:** Minimal if following existing patterns
- **Impact:** Isolated to new types
- **Mitigation:** Follow existing SVG/animation patterns

**2. Adding Localization Strings**
- **Risk:** Minimal, additive only
- **Impact:** Missing translations fall back to English
- **Mitigation:** Add to all language objects

**3. Adding CSS Animations**
- **Risk:** Performance impact only
- **Impact:** May slow rendering on low-end devices
- **Mitigation:** Use efficient CSS, respect prefers-reduced-motion

### 7.2 Maintenance Risks

#### 🔴 HIGH RISK

**1. File Size Growth**
- **Current:** 2042 lines (~91KB)
- **Risk:** Home Connect features could add 1000+ lines
- **Impact:** Slower load times, harder to maintain
- **Mitigation:** Keep code dense, avoid duplication, consider compression

**2. Complexity Growth**
- **Risk:** Mode-based logic increases cognitive load
- **Impact:** Harder to debug, more bugs
- **Mitigation:** Clear separation of concerns, extensive comments for mode logic

#### 🟡 MEDIUM RISK

**1. Testing Coverage**
- **Risk:** No automated tests, manual testing only
- **Impact:** Regressions not caught before release
- **Mitigation:** Comprehensive manual test plan, visual regression testing

**2. Documentation Drift**
- **Risk:** README doesn't cover new features adequately
- **Impact:** Users don't discover or misuse features
- **Mitigation:** Update docs as part of implementation

### 7.3 UI/UX Risks

#### 🟡 MEDIUM RISK

**1. Configuration Complexity**
- **Risk:** Home Connect config has 20+ optional entities
- **Impact:** Users overwhelmed, misconfigure
- **Mitigation:** Clear examples, visual editor improvements, progressive disclosure

**2. Visual Inconsistency**
- **Risk:** New UI elements don't match existing style
- **Impact:** Card looks fragmented
- **Mitigation:** Reuse existing CSS custom properties, match animation styles

**3. Mobile Layout**
- **Risk:** New controls don't work well on small screens
- **Impact:** Poor mobile experience
- **Mitigation:** Test on narrow widths, use existing responsive patterns

---

## 8. HOME ASSISTANT COMPATIBILITY RISKS

### 8.1 Entity Type Compatibility

**Home Connect Entity Patterns:**
```
select.* - Program selection
sensor.* - Operation state, progress, times
binary_sensor.* - Door, remote start capability
switch.* - Power, child lock, options
number.* - Temperature, spin speed (rare)
```

**Current Support:**
- ✅ `sensor.*` - Full support
- ✅ `binary_sensor.*` - Full support
- ✅ `switch.*` - Toggle support only
- ⚠️ `select.*` - No support for select_option service
- ⚠️ `number.*` - No support for set_value service

**Risk:** Medium - Need to add service call types

### 8.2 Service Call Compatibility

**Required Services for Home Connect:**
- `select.select_option` - Program selection
- `switch.turn_on/turn_off` - Power, features
- `number.set_value` - Temperature, speed (if used)

**Current Support:**
- ✅ Toggle services
- ❌ Select services
- ❌ Number services

**Risk:** Medium - Need service call abstraction

### 8.3 Event Compatibility

**Current Event Usage:**
- `hass-more-info` - Standard, widely supported

**Needed for Home Connect:**
- Custom modal/dialog events (not standard HA)

**Risk:** Low - Can use browser-standard modal/dialog

---

## 9. RECOMMENDATIONS

### 9.1 Architecture Recommendations

#### ✅ RECOMMENDED: Mode-Based Architecture

Implement a **dual-mode system** that preserves existing behavior while enabling Home Connect features:

```javascript
const mode = config.mode || "standard";  // "standard" | "home_connect"

if (mode === "home_connect") {
    // Home Connect-specific logic
    // - Program selection
    // - Interactive controls
    // - Door animations
    // - Connectivity indicators
} else {
    // Existing standard mode logic (unchanged)
}
```

**Benefits:**
- ✅ Zero breaking changes
- ✅ Clear separation of concerns
- ✅ Easy to test both modes independently
- ✅ Users opt-in explicitly

**Drawbacks:**
- ⚠️ Increases code complexity
- ⚠️ Potential for code duplication

#### ✅ RECOMMENDED: Appliance Abstraction Layer

Create a lightweight abstraction that maps config to capabilities:

```javascript
_getApplianceCapabilities() {
    const mode = this._config.mode || "standard";
    const type = this._applianceType;
    
    if (mode === "home_connect") {
        return {
            hasPrograms: !!this._config.home_connect?.program_entity,
            hasDoor: !!this._config.home_connect?.door_entity,
            hasOptions: this._getHomeConnectOptions(),
            // ... more capabilities
        };
    }
    
    return {
        hasPrograms: false,
        hasDoor: false,
        hasOptions: [],
    };
}
```

**Benefits:**
- ✅ Single source of truth for capabilities
- ✅ Easy to query in rendering logic
- ✅ Testable in isolation
- ✅ Doesn't require major refactoring

#### ⚠️ CONSIDER: Entity Mapping Layer

Add a light mapping layer without breaking direct access:

```javascript
_getEntity(key) {
    const mode = this._config.mode || "standard";
    if (mode === "home_connect") {
        const hc = this._config.home_connect || {};
        return this._st(hc[key]);
    }
    return this._st(this._config[key]);
}
```

**Benefits:**
- ✅ Cleaner entity access
- ✅ Mode-aware entity resolution

**Drawbacks:**
- ⚠️ Adds indirection
- ⚠️ Existing code must migrate gradually

#### ❌ NOT RECOMMENDED: Complete Refactor

**Do not:**
- Rewrite the card as multiple files
- Introduce a build pipeline
- Add external dependencies (Lit, React, etc.)
- Break existing configuration schema

**Reasons:**
- Violates project constraints
- High risk of breaking changes
- Loss of zero-dependency benefit

### 9.2 Implementation Recommendations

#### Phase 0: Foundation (Non-Breaking)
1. Add `mode` configuration field (default: "standard")
2. Add mode detection helper
3. Add capability detection helper
4. Add tests for backward compatibility

#### Phase 1: Home Connect Configuration
1. Add `home_connect` nested configuration object
2. Add entity mapping for washer entities
3. Add entity mapping for dishwasher entities
4. Preserve all existing config fields (backward compat)

#### Phase 2: Service Call Infrastructure
1. Add `_callService(domain, service, data)` helper
2. Add `select.select_option` support
3. Add `number.set_value` support
4. Keep existing `_toggle()` working

#### Phase 3: Interactive Controls (Washer)
1. Add modal/dialog infrastructure
2. Add program selection UI
3. Add click handlers to SVG (mode-gated)
4. Test in Shadow DOM context

#### Phase 4: Door Animations (Washer)
1. Design door open/closed SVG variations
2. Add CSS animations for transitions
3. Add door state detection
4. Test animation performance

#### Phase 5: Repeat for Dishwasher
1. Dishwasher-specific entities
2. Dishwasher-specific controls
3. Dishwasher door animation

#### Phase 6: Status Visualization
1. Add connectivity indicators
2. Add progress visualization
3. Add feature status displays

---

## 10. CONCLUSION

### Architecture Readiness: ✅ READY WITH MODIFICATIONS

The washing-machine-card architecture is **fundamentally sound** and ready for Home Connect integration with the following approach:

**Required Changes:**
1. ✅ Add mode-based configuration (`mode: "standard" | "home_connect"`)
2. ✅ Add nested home_connect configuration object
3. ✅ Add capability detection layer
4. ✅ Add service call abstraction (select, number services)
5. ✅ Add modal/dialog infrastructure for program selection
6. ✅ Add interactive SVG controls (mode-gated)
7. ✅ Add door animation system (mode-gated)

**Must Preserve:**
- ✅ Single-file architecture
- ✅ Zero external dependencies  
- ✅ All existing configuration options
- ✅ All existing behavior in standard mode
- ✅ Shadow DOM encapsulation
- ✅ Lovelace card interface

**Key Success Factors:**
1. **Backward Compatibility**: Standard mode must behave exactly as current version
2. **Mode Isolation**: Home Connect code only runs when mode = "home_connect"
3. **Progressive Enhancement**: Features appear only when entities configured
4. **File Size**: Keep under 3500 lines (current 2042 + ~1500 for HC features)

### Next Deliverable

**PROPOSED ARCHITECTURE** document detailing:
- Mode-based configuration schema
- Appliance Abstraction Layer design
- Entity mapping strategy
- Service call strategy
- State management strategy
- Animation strategy
- Interaction strategy

---

**Review Status:** ✅ COMPLETE  
**Architecture Verdict:** ✅ APPROVED FOR ENHANCEMENT  
**Ready for Proposed Architecture:** ✅ YES
