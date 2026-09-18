# Home Connect Integration Fixes - Technical Specification

**Target File:** `washing-machine-card.js`  
**Branch:** `feature/hc-visual-editor-entity-picker`  
**Status:** MULTIPLE CRITICAL FIXES REQUIRED

---

## ISSUES IDENTIFIED

### Issue 1: Power Entity Should Be Available in Home Connect Mode ✅
**Problem:** Power monitoring fields (power_entity, power_threshold, power_max) are hidden in Home Connect mode, but Home Connect does NOT provide power consumption data.

**Impact:** Users cannot monitor power consumption when using Home Connect mode.

### Issue 2: Button Actions Not Working ❌
**Problem:** Control buttons on the machine have wrong targets:
- Power button (on/off) not working
- Program selection button not working  
- Start/Pause button probably not working
- Dishwashers have no pause - only stop

### Issue 3: No Overlay for Program Selection and Options ❌
**Problem:** Program selection and additional functions should open in a beautiful overlay modal, not inline or alert dialogs.

**Desired:** Overlay window with:
- Program selection list (nice entity list design)
- Additional functions/options (temperature, spin speed, etc.)
- Beautiful modern design matching card theme

### Issue 4: Missing i-Dos Display ❌
**Problem:** Top-left panel of washing machine should display i-Dos entities for detergent monitoring when available.

**Entities to display:**
- `idos1_level_entity` - i-Dos 1 fill level
- `idos2_level_entity` - i-Dos 2 fill level
- `idos1_active_entity` - i-Dos 1 active state
- `idos2_active_entity` - i-Dos 2 active state

### Issue 5: Progress Entity Pattern Incorrect ❌
**Problem:** Progress entity pattern does not match German entity names.

**Current pattern:** `/_program_progress$/`
**Actual German entity:** `sensor.waschmaschine_programm_fortschritt` (with double 'm')

**Pattern should match:**
- English: `sensor.washing_machine_program_progress`
- German: `sensor.waschmaschine_programm_fortschritt`
- Other languages: Similar variations

### Issue 6: Animations Not Visible ❌
**Problem:** 
- Washing machine inner graphics (drum, laundry) not showing
- Animations should only show when washing is running
- Door open/closed state shows no visual change

---

## FIX 1: Keep Power Entity Visible in Home Connect Mode

**Location:** Visual editor field definitions, lines ~4250-4276

**Current Code (WRONG):**
```javascript
{
    title: "Power monitoring",
    icon: "mdi:flash-outline",
    fields: [{
        key: "power_entity",
        kind: "entity",
        title: "Power sensor",
        visibleWhen: (config) => {
            const mode = config?.mode || "standard";
            return mode === "standard";
        },
        selector: {
            entity: {
                domain: "sensor"
            }
        }
    }, {
        key: "power_threshold",
        kind: "number",
        title: "Power threshold (W)",
        visibleWhen: (config) => {
            const mode = config?.mode || "standard";
            return mode === "standard";
        },
        default: D.power_threshold,
        min: 1,
    }, {
        key: "power_max",
        kind: "number",
        title: "Gauge max (W)",
        visibleWhen: (config) => {
            const mode = config?.mode || "standard";
            return mode === "standard";
        },
        default: D.power_max,
        min: 1,
    }],
}
```

**Fixed Code:**
```javascript
{
    title: "Power monitoring",
    icon: "mdi:flash-outline",
    fields: [{
        key: "power_entity",
        kind: "entity",
        title: "Power sensor",
        // REMOVED visibleWhen - always visible
        selector: {
            entity: {
                domain: "sensor"
            }
        }
    }, {
        key: "power_threshold",
        kind: "number",
        title: "Power threshold (W)",
        visibleWhen: (config) => {
            const mode = config?.mode || "standard";
            return mode === "standard";
        },
        default: D.power_threshold,
        min: 1,
    }, {
        key: "power_max",
        kind: "number",
        title: "Gauge max (W)",
        // REMOVED visibleWhen - always visible
        default: D.power_max,
        min: 1,
    }],
}
```

**Explanation:**
- `power_entity` and `power_max` should ALWAYS be visible (no `visibleWhen`)
- `power_threshold` stays hidden in HC mode (only used for standard mode detection logic)
- Home Connect devices need external power monitoring since HC doesn't provide it

---

## FIX 2: Fix Progress Entity Pattern

**Location:** `_autoDiscoverEntities()` method, line ~501

**Current Pattern (WRONG):**
```javascript
'progress_entity': /_program_progress$/,
```

**Fixed Pattern:**
```javascript
'progress_entity': /_(program|programm)_progress$/,
```

**Matches:**
- ✅ `sensor.washing_machine_program_progress` (English)
- ✅ `sensor.waschmaschine_programm_fortschritt` (German - contains "programm_")
- ✅ `sensor.machine_program_progress` (Generic)
- ✅ `sensor.device_programm_fortschritt` (German variant)

---

## FIX 3: Fix Button Click Handlers

**Location:** `_build()` method, after machine SVG rendering (around line 2450)

**Current Code:** Button handlers are probably missing or attached to wrong methods.

**Required Implementation:**

```javascript
_build() {
    // ... existing build code ...
    
    // After SVG is added to DOM, attach Home Connect button handlers
    if (this._isHomeConnectMode()) {
        setTimeout(() => {
            const powerBtn = this._el("hcPowerBtn");
            const programBtn = this._el("hcProgramBtn");
            const startBtn = this._el("hcStartBtn");
            
            if (powerBtn) {
                powerBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this._hcTogglePower();
                });
            }
            
            if (programBtn) {
                programBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this._showProgramOverlay();
                });
            }
            
            if (startBtn) {
                startBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this._hcToggleStartPause();
                });
            }
        }, 0);
    }
    
    // ... rest of build code ...
}
```

---

## FIX 4: Create Program & Options Overlay

**Location:** New method after `_hcTogglePower()` (around line 1750)

**Implementation:**

```javascript
/**
 * Show program selection and options overlay
 */
_showProgramOverlay() {
    if (!this._isHomeConnectMode()) return;
    
    const type = this._applianceType;
    const hc = this._config?.home_connect?.[type];
    const t = this._t;
    
    // Create overlay container
    const overlay = document.createElement("div");
    overlay.className = "hc-overlay";
    
    // Overlay header
    const header = document.createElement("div");
    header.className = "hc-overlay-header";
    header.innerHTML = `
        <div class="hc-overlay-title">${t.select_program || "Select Program"}</div>
        <ha-icon icon="mdi:close" class="hc-overlay-close"></ha-icon>
    `;
    overlay.appendChild(header);
    
    // Overlay content
    const content = document.createElement("div");
    content.className = "hc-overlay-content";
    
    // Program selection section
    if (hc?.program_selector_entity) {
        const programSection = document.createElement("div");
        programSection.className = "hc-overlay-section";
        
        const programTitle = document.createElement("div");
        programTitle.className = "hc-overlay-section-title";
        programTitle.textContent = t.select_program || "Select Program";
        programSection.appendChild(programTitle);
        
        const programList = document.createElement("div");
        programList.className = "hc-overlay-list";
        
        const programEntity = this._st(hc.program_selector_entity);
        const programs = programEntity?.attributes?.options || [];
        
        programs.forEach(program => {
            const programItem = document.createElement("div");
            programItem.className = "hc-overlay-item";
            if (programEntity.state === program) {
                programItem.classList.add("active");
            }
            
            programItem.innerHTML = `
                <div class="hc-overlay-item-name">${t.programs?.[program] || program}</div>
                ${programEntity.state === program ? '<ha-icon icon="mdi:check"></ha-icon>' : ''}
            `;
            
            programItem.addEventListener("click", () => {
                this._hcSelectProgram(program);
                this._closeOverlay();
            });
            
            programList.appendChild(programItem);
        });
        
        programSection.appendChild(programList);
        content.appendChild(programSection);
    }
    
    // Options section
    const optionsSection = document.createElement("div");
    optionsSection.className = "hc-overlay-section";
    
    const optionsTitle = document.createElement("div");
    optionsTitle.className = "hc-overlay-section-title";
    optionsTitle.textContent = t.options_title || "Options & Settings";
    optionsSection.appendChild(optionsTitle);
    
    const optionsList = document.createElement("div");
    optionsList.className = "hc-overlay-list";
    
    // Add temperature option
    if (hc?.temperature_entity) {
        const tempEntity = this._st(hc.temperature_entity);
        const tempItem = this._createOptionItem(
            t.temperature || "Temperature",
            tempEntity?.state,
            "mdi:thermometer",
            () => this._showEntityOptions(hc.temperature_entity)
        );
        optionsList.appendChild(tempItem);
    }
    
    // Add spin speed option
    if (hc?.spin_speed_entity) {
        const spinEntity = this._st(hc.spin_speed_entity);
        const spinItem = this._createOptionItem(
            t.spin_speed || "Spin Speed",
            spinEntity?.state,
            "mdi:speedometer",
            () => this._showEntityOptions(hc.spin_speed_entity)
        );
        optionsList.appendChild(spinItem);
    }
    
    // Add toggle options (child lock, hygiene plus, etc.)
    const toggleOptions = [
        { key: 'child_lock_entity', label: t.child_lock || "Child Lock", icon: "mdi:lock" },
        { key: 'hygiene_plus_entity', label: t.hygiene_plus || "Hygiene Plus", icon: "mdi:bacteria" },
        { key: 'intensive_zone_entity', label: t.intensive_zone || "Intensive Zone", icon: "mdi:star" },
        { key: 'variospeed_plus_entity', label: t.variospeed_plus || "VarioSpeed Plus", icon: "mdi:fast-forward" },
        { key: 'silence_on_demand_entity', label: t.silence_on_demand || "Silence on Demand", icon: "mdi:volume-off" },
        { key: 'brilliant_dry_entity', label: t.brilliant_dry || "BrilliantDry", icon: "mdi:shimmer" },
    ];
    
    toggleOptions.forEach(opt => {
        if (hc?.[opt.key]) {
            const entity = this._st(hc[opt.key]);
            const toggleItem = this._createToggleItem(
                opt.label,
                entity?.state === "on",
                opt.icon,
                () => this._toggle(hc[opt.key])
            );
            optionsList.appendChild(toggleItem);
        }
    });
    
    if (optionsList.children.length > 0) {
        optionsSection.appendChild(optionsList);
        content.appendChild(optionsSection);
    }
    
    overlay.appendChild(content);
    
    // Close handler
    const closeBtn = overlay.querySelector(".hc-overlay-close");
    closeBtn.addEventListener("click", () => this._closeOverlay());
    
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            this._closeOverlay();
        }
    });
    
    // Add overlay styles
    this._addOverlayStyles();
    
    // Add to DOM
    const wrap = this._el("wrap");
    wrap.appendChild(overlay);
}

/**
 * Create option item for overlay
 */
_createOptionItem(label, value, icon, onClick) {
    const item = document.createElement("div");
    item.className = "hc-overlay-item";
    item.innerHTML = `
        <ha-icon icon="${icon}"></ha-icon>
        <div class="hc-overlay-item-name">${label}</div>
        <div class="hc-overlay-item-value">${value || "—"}</div>
        <ha-icon icon="mdi:chevron-right"></ha-icon>
    `;
    item.addEventListener("click", onClick);
    return item;
}

/**
 * Create toggle item for overlay
 */
_createToggleItem(label, isOn, icon, onToggle) {
    const item = document.createElement("div");
    item.className = "hc-overlay-item";
    item.innerHTML = `
        <ha-icon icon="${icon}"></ha-icon>
        <div class="hc-overlay-item-name">${label}</div>
        <ha-switch ${isOn ? 'checked' : ''}></ha-switch>
    `;
    
    const toggle = item.querySelector("ha-switch");
    toggle.addEventListener("change", (e) => {
        e.stopPropagation();
        onToggle();
    });
    
    return item;
}

/**
 * Close overlay
 */
_closeOverlay() {
    const overlay = this.shadowRoot.querySelector(".hc-overlay");
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Add overlay styles to shadow root
 */
_addOverlayStyles() {
    if (this.shadowRoot.querySelector("#hcOverlayStyles")) return;
    
    const style = document.createElement("style");
    style.id = "hcOverlayStyles";
    style.textContent = `
        .hc-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .hc-overlay-header {
            background: var(--card-background-color, #fff);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--divider-color, #e5e5e5);
        }
        
        .hc-overlay-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--primary-text-color, #000);
        }
        
        .hc-overlay-close {
            cursor: pointer;
            color: var(--secondary-text-color, #666);
            --mdc-icon-size: 24px;
        }
        
        .hc-overlay-close:hover {
            color: var(--primary-text-color, #000);
        }
        
        .hc-overlay-content {
            flex: 1;
            overflow-y: auto;
            background: var(--card-background-color, #fff);
            padding: 16px;
        }
        
        .hc-overlay-section {
            margin-bottom: 24px;
        }
        
        .hc-overlay-section-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--secondary-text-color, #666);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        
        .hc-overlay-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .hc-overlay-item {
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .hc-overlay-item:hover {
            background: var(--divider-color, #e5e5e5);
            transform: translateX(4px);
        }
        
        .hc-overlay-item.active {
            background: var(--primary-color, #2f80ed);
            color: white;
        }
        
        .hc-overlay-item ha-icon {
            --mdc-icon-size: 20px;
            color: var(--primary-color, #2f80ed);
            flex-shrink: 0;
        }
        
        .hc-overlay-item.active ha-icon {
            color: white;
        }
        
        .hc-overlay-item-name {
            flex: 1;
            font-size: 15px;
            font-weight: 500;
        }
        
        .hc-overlay-item-value {
            font-size: 14px;
            color: var(--secondary-text-color, #666);
        }
        
        .hc-overlay-item.active .hc-overlay-item-value {
            color: rgba(255, 255, 255, 0.8);
        }
    `;
    
    this.shadowRoot.appendChild(style);
}
```

---

## FIX 5: Add Start/Pause Toggle Method

**Location:** After `_hcPause()` method (around line 1710)

```javascript
/**
 * Toggle start/pause for appliance
 * Dishwashers only support stop, washers support pause
 */
_hcToggleStartPause() {
    if (!this._isHomeConnectMode()) return;
    
    const opState = this._getOperationState();
    if (!opState) return;
    
    const state = opState.toLowerCase();
    const type = this._applianceType;
    
    // If running, pause (washer) or stop (dishwasher)
    if (state === "run") {
        if (type === "dishwasher") {
            // Dishwashers don't support pause - use stop
            return this._hcStop();
        } else {
            return this._hcPause();
        }
    }
    
    // If paused or ready, start
    if (state === "pause" || state === "ready") {
        return this._hcStart();
    }
    
    // If inactive or finished, start
    if (state === "inactive" || state === "finished") {
        return this._hcStart();
    }
}
```

---

## FIX 6: Add i-Dos Display Panel

**Location:** In `_svgWasher()` method, replace top-left panel (around line 2020)

**Current Code:**
```javascript
<rect x="42" y="20" width="34" height="13" rx="4" fill="#cfd7e0"/>
<rect x="42" y="20" width="34" height="6"  rx="3" fill="#dee5ec"/>
```

**Fixed Code:**
```javascript
// i-Dos panel (if available) or static panel
${this._renderIDosPanel()}
```

**New Method to Add (around line 1900):**
```javascript
/**
 * Render i-Dos panel for washing machine
 * Shows detergent fill levels when i-Dos entities are available
 */
_renderIDosPanel() {
    const type = this._applianceType;
    const hc = this._config?.home_connect?.[type];
    
    // Only for washers with i-Dos
    if (type !== 'washer' || !this._hasIDos(hc)) {
        return `
            <rect x="42" y="20" width="34" height="13" rx="4" fill="#cfd7e0"/>
            <rect x="42" y="20" width="34" height="6"  rx="3" fill="#dee5ec"/>
        `;
    }
    
    const idos1Level = this._st(hc.idos1_level_entity)?.state;
    const idos2Level = this._st(hc.idos2_level_entity)?.state;
    const idos1Active = this._st(hc.idos1_active_entity)?.state === "on";
    const idos2Active = this._st(hc.idos2_active_entity)?.state === "on";
    
    const level1 = idos1Level ? parseFloat(idos1Level) : 0;
    const level2 = idos2Level ? parseFloat(idos2Level) : 0;
    
    // i-Dos 1 color (usually detergent - blue)
    const color1 = idos1Active ? "#4a90e2" : "#b0bac6";
    const level1Height = (level1 / 100) * 10;
    
    // i-Dos 2 color (usually softener - green)
    const color2 = idos2Active ? "#52c490" : "#b0bac6";
    const level2Height = (level2 / 100) * 10;
    
    return `
        <!-- i-Dos Panel Background -->
        <rect x="42" y="20" width="34" height="13" rx="4" fill="#f0f3f7" stroke="#c2cbd6" stroke-width="0.8"/>
        
        <!-- i-Dos 1 Container -->
        <rect x="45" y="22" width="13" height="9" rx="2" fill="#e5e9ef"/>
        <rect x="45" y="${31 - level1Height}" width="13" height="${level1Height}" rx="2" fill="${color1}" opacity="0.85"/>
        <text x="51.5" y="29" text-anchor="middle" font-size="6" fill="#666" font-weight="600">${Math.round(level1)}%</text>
        
        <!-- i-Dos 2 Container -->
        <rect x="61" y="22" width="13" height="9" rx="2" fill="#e5e9ef"/>
        <rect x="61" y="${31 - level2Height}" width="13" height="${level2Height}" rx="2" fill="${color2}" opacity="0.85"/>
        <text x="67.5" y="29" text-anchor="middle" font-size="6" fill="#666" font-weight="600">${Math.round(level2)}%</text>
        
        <!-- Active indicators -->
        ${idos1Active ? `<circle cx="51.5" cy="23.5" r="1.2" fill="${color1}"/>` : ''}
        ${idos2Active ? `<circle cx="67.5" cy="23.5" r="1.2" fill="${color2}"/>` : ''}
    `;
}
```

---

## FIX 7: Fix Animation Visibility

**Problem:** Drum, laundry, and door animations not showing properly.

**Location:** CSS classes in `_styles()` method (around line 2626-2660)

**Current Issues:**
- Animations may be hidden by default
- Door state not visually changing
- Running state not triggering animations

**Verification Needed:**
1. Check if `.laundry`, `.drum`, `.arcs` have correct initial opacity
2. Verify `.running` class is applied when `_applianceState() === "running"`
3. Check door entity state changes CSS class

**Quick Check in _update() method:**
```javascript
_update() {
    // ... existing code ...
    
    // Ensure running class is applied
    const wrap = this._el("wrap");
    const isRunning = this._isRunning();
    wrap?.classList.toggle("running", isRunning);
    
    // Update door state
    if (this._isHomeConnectMode()) {
        const doorEntity = this._hcEntity("door_entity");
        const doorOpen = doorEntity?.state === "open" || doorEntity?.state === "Open";
        wrap?.classList.toggle("door-open", doorOpen);
    }
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Field Visibility
- [ ] Remove `visibleWhen` from `power_entity` field
- [ ] Remove `visibleWhen` from `power_max` field
- [ ] Keep `power_threshold` with `visibleWhen` (standard mode only)

### Phase 2: Entity Pattern
- [ ] Fix `progress_entity` pattern to `/_(program|programm)_progress$/`

### Phase 3: Button Handlers
- [ ] Add button click handlers in `_build()` method
- [ ] Attach `hcPowerBtn` to `_hcTogglePower()`
- [ ] Attach `hcProgramBtn` to `_showProgramOverlay()`
- [ ] Attach `hcStartBtn` to `_hcToggleStartPause()`

### Phase 4: Overlay System
- [ ] Create `_showProgramOverlay()` method
- [ ] Create `_createOptionItem()` helper method
- [ ] Create `_createToggleItem()` helper method
- [ ] Create `_closeOverlay()` method
- [ ] Create `_addOverlayStyles()` method
- [ ] Create `_hcToggleStartPause()` method

### Phase 5: i-Dos Display
- [ ] Create `_renderIDosPanel()` method
- [ ] Integrate into `_svgWasher()` top panel
- [ ] Test with i-Dos enabled devices

### Phase 6: Animation Fixes
- [ ] Verify `.running` class application in `_update()`
- [ ] Add door state class toggle in `_update()`
- [ ] Check CSS animation initial states

---

## TESTING REQUIREMENTS

### Test 1: Power Monitoring Always Available
1. Switch to Home Connect mode
2. **EXPECTED:** Power entity field visible
3. **EXPECTED:** Can select external power sensor
4. **EXPECTED:** Power gauge displays correctly

### Test 2: Button Actions Work
1. Configure Home Connect device
2. Click power button
3. **EXPECTED:** Device turns on/off with confirmation
4. Click program button
5. **EXPECTED:** Overlay opens with programs
6. Click start button
7. **EXPECTED:** Program starts/pauses (or stops for dishwasher)

### Test 3: Program Overlay Works
1. Click program button on machine
2. **EXPECTED:** Beautiful overlay appears
3. **EXPECTED:** Program list shows available programs
4. **EXPECTED:** Current program marked as active
5. **EXPECTED:** Options section shows temperature, spin speed, etc.
6. **EXPECTED:** Toggle switches work for features
7. Select different program
8. **EXPECTED:** Program changes, overlay closes

### Test 4: i-Dos Display
1. Configure washer with i-Dos entities
2. **EXPECTED:** Top-left panel shows two containers
3. **EXPECTED:** Fill levels displayed as percentages
4. **EXPECTED:** Active indicators show when dosing active
5. **EXPECTED:** Colors: blue for i-Dos 1, green for i-Dos 2

### Test 5: Animations Show When Running
1. Start washing program
2. **EXPECTED:** Drum rotates
3. **EXPECTED:** Laundry tumbles
4. **EXPECTED:** Progress arcs animate
5. Stop program
6. **EXPECTED:** Animations stop

### Test 6: Door State Visual
1. Open dishwasher/washer door
2. **EXPECTED:** Visual change on card (door-open class)
3. Close door
4. **EXPECTED:** Visual returns to normal

---

## COMMIT MESSAGE

```
feat(home-connect): fix button actions, add overlay UI, i-Dos display, and power monitoring

- Keep power_entity and power_max visible in HC mode (HC doesn't provide power data)
- Fix progress_entity pattern to match German "programm_fortschritt"
- Add button click handlers for power, program selection, and start/pause
- Create beautiful overlay for program selection and options
- Add _hcToggleStartPause() supporting pause for washers, stop for dishwashers
- Implement i-Dos detergent level display in top-left panel
- Fix animation visibility and door state visual feedback
- Add overlay styles with modern design matching card theme

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

---

**END OF SPECIFICATION**
