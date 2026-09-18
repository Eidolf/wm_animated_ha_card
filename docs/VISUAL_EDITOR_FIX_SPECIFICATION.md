# Visual Editor Fix Specification - Home Connect Device Picker

**Target File:** `washing-machine-card.js`  
**Branch:** `feature/hc-visual-editor-entity-picker`  
**Status:** CRITICAL FIXES REQUIRED

---

## PROBLEM ANALYSIS

### Current Behavior (BROKEN)
1. ✅ User selects "Home Connect" mode
2. ✅ Device picker appears with `integration: 'home_connect'` filter
3. ✅ User selects washing machine device
4. ✅ User saves configuration
5. ❌ **PROBLEM 1:** Setup message STILL displays after device selection
6. ❌ **PROBLEM 2:** Standard mode `status_entity` field is STILL VISIBLE in Home Connect mode

### Root Causes
1. **Setup Message Logic Error:** The setup message check is not properly evaluating device selection
2. **Field Visibility Not Implemented:** Standard mode fields are not being hidden when Home Connect mode is active
3. **Auto-Discovery Not Triggering:** Entity auto-discovery may not be executing properly after device selection

---

## REQUIRED FIXES

### FIX 1: Field Visibility System (CRITICAL)

**Location:** Visual Editor `_sections` definition (around line 4093-4356)

**Problem:** All standard mode fields are currently visible regardless of mode selection.

**Solution:** Add `visibleWhen` function to EVERY standard mode field.

#### Fields That Must Be Hidden in Home Connect Mode

```javascript
// Line ~4166: status_entity field
{
    key: "status_entity",
    kind: "entity",
    title: "Status entity (required in standard mode)",
    required: false,
    visibleWhen: (config) => {
        const mode = config?.mode || "standard";
        return mode === "standard";
    },
    selector: {
        entity: {}
    },
}

// Line ~4252: power_entity field
{
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
}

// Apply visibleWhen to ALL standard mode entity fields:
// - power_entity
// - power_threshold
// - power_max
// - plug_entity
// - confirm_plug_off
// - notify_entity
// - last_wash_entity
// - duration_entity
// - energy_entity
// - cost_entity
// - currency
```

**Implementation Pattern:**
```javascript
visibleWhen: (config) => {
    const mode = config?.mode || "standard";
    return mode === "standard";
}
```

---

### FIX 2: Device Picker Visibility (CRITICAL)

**Location:** Line 4118-4126 (device_id field definition)

**Problem:** Device picker is always visible, even in standard mode.

**Current Code:**
```javascript
{
    key: "device_id",
    kind: "device",
    title: "Home Connect Device",
    selector: {
        device: {
            integration: "home_connect",
        },
    },
}
```

**Fixed Code:**
```javascript
{
    key: "device_id",
    kind: "device",
    title: "Home Connect Device",
    visibleWhen: (config) => {
        const mode = config?.mode || "standard";
        return mode === "home_connect";
    },
    selector: {
        device: {
            integration: "home_connect",
        },
    },
}
```

---

### FIX 3: Field Rendering with Visibility Check (CRITICAL)

**Location:** `_buildField()` method (around line 4536)

**Problem:** The `_buildField()` method does NOT check `visibleWhen` before rendering fields.

**Current Code:**
```javascript
_buildField(field) {
    const wrap = document.createElement("div");
    wrap.className = "wm-field" + (field.kind === "boolean" ? " wm-field--row" : "");
    // ... rest of build logic
}
```

**Fixed Code:**
```javascript
_buildField(field) {
    // CHECK VISIBILITY FIRST
    if (field.visibleWhen && !field.visibleWhen(this._config)) {
        const hidden = document.createElement("div");
        hidden.style.display = "none";
        return hidden;
    }

    const wrap = document.createElement("div");
    wrap.className = "wm-field" + (field.kind === "boolean" ? " wm-field--row" : "");
    // ... rest of build logic (UNCHANGED)
}
```

---

### FIX 4: Dynamic Field Visibility Updates (CRITICAL)

**Location:** `_syncValues()` method (around line 4603)

**Problem:** When mode changes, fields are not hidden/shown dynamically.

**Current Code:**
```javascript
_syncValues() {
    if (!this._built)
        return;
    for (const section of WashingMachineCardEditor._sections) {
        for (const field of section.fields) {
            const el = this._fieldEls[field.key];
            if (!el)
                continue;
            // ... sync field values
        }
    }
    this._updateModeInfo();
}
```

**Fixed Code:**
```javascript
_syncValues() {
    if (!this._built)
        return;
    for (const section of WashingMachineCardEditor._sections) {
        for (const field of section.fields) {
            const el = this._fieldEls[field.key];
            if (!el)
                continue;

            // APPLY VISIBILITY LOGIC
            if (field.visibleWhen) {
                const shouldBeVisible = field.visibleWhen(this._config);
                const wrapper = el.closest('.wm-field');
                if (wrapper) {
                    wrapper.style.display = shouldBeVisible ? '' : 'none';
                }
            }

            // ... existing sync field values logic (UNCHANGED)
        }
    }
    this._updateModeInfo();
}
```

---

### FIX 5: Setup Message Display Logic (CRITICAL)

**Location:** Main card `setConfig()` method (around line 616-640)

**Problem:** Setup message flag logic is incorrect.

**Current Code (BROKEN):**
```javascript
} else if (mode === "home_connect") {
    // Auto-discovery for Home Connect Mode
    if (config.device_id && !config.home_connect) {
        const discovered = this._autoDiscoverEntities(config.device_id);
        if (discovered) {
            const applianceType = config.appliance_type || 'washer';
            config = {
                ...config,
                home_connect: {
                    [applianceType]: discovered,
                },
            };
            console.log('Home Connect entities auto-discovered:', discovered);
        }
    }

    if (!config.home_connect) {
        this._showSetupMessage = true;  // WRONG: Should also check device_id
    } else {
        this._showSetupMessage = false;
        const type = WashingMachineCard.normalizeType(config.appliance_type);
        if (!config.home_connect[type]) {
            console.warn(`washing-machine-card: No ${type} configuration in home_connect object`);
        }
    }
}
```

**Fixed Code:**
```javascript
} else if (mode === "home_connect") {
    // Auto-discovery for Home Connect Mode
    if (config.device_id && !config.home_connect) {
        const discovered = this._autoDiscoverEntities(config.device_id);
        if (discovered) {
            const applianceType = config.appliance_type || 'washer';
            config = {
                ...config,
                home_connect: {
                    [applianceType]: discovered,
                },
            };
            console.log('Home Connect entities auto-discovered:', discovered);
        }
    }

    // FIXED: Show setup message ONLY if NO device_id AND NO home_connect config
    if (!config.device_id && !config.home_connect) {
        this._showSetupMessage = true;
    } else {
        this._showSetupMessage = false;
        
        // If device selected but no entities discovered, warn user
        if (config.device_id && !config.home_connect) {
            console.warn('Home Connect device selected but no entities discovered');
        }
        
        const type = WashingMachineCard.normalizeType(config.appliance_type);
        if (config.home_connect && !config.home_connect[type]) {
            console.warn(`washing-machine-card: No ${type} configuration in home_connect object`);
        }
    }
}
```

---

### FIX 6: Auto-Discovery Trigger in Setter (CRITICAL)

**Location:** Main card `set hass()` method (around line 652-672)

**Problem:** Auto-discovery logic needs proper condition check.

**Current Code:**
```javascript
set hass(hass) {
    this._hass = hass;
    const c = this._config;
    if (c && (c.mode || "standard") === "home_connect" && c.device_id && !c.home_connect) {
        const discovered = this._autoDiscoverEntities(c.device_id);
        if (discovered) {
            const applianceType = c.appliance_type || 'washer';
            this._config = {
                ...c,
                home_connect: {
                    [applianceType]: discovered,
                },
            };
            this._showSetupMessage = false;
            console.log('Home Connect entities auto-discovered:', discovered);
        }
    }
    if (!this._built)
        this._build();
    this._update();
}
```

**Fixed Code:**
```javascript
set hass(hass) {
    this._hass = hass;
    const c = this._config;
    if (c && (c.mode || "standard") === "home_connect" && c.device_id && !c.home_connect) {
        const discovered = this._autoDiscoverEntities(c.device_id);
        if (discovered) {
            const applianceType = c.appliance_type || 'washer';
            this._config = {
                ...c,
                home_connect: {
                    [applianceType]: discovered,
                },
            };
            this._showSetupMessage = false;
            console.log('Home Connect entities auto-discovered:', discovered);
        } else {
            // NO ENTITIES FOUND - hide setup message but log warning
            this._showSetupMessage = false;
            console.warn(`No Home Connect entities found for device: ${c.device_id}`);
        }
    }
    
    // Update setup message flag based on current config state
    if (c && (c.mode || "standard") === "home_connect") {
        if (!c.device_id && !c.home_connect) {
            this._showSetupMessage = true;
        } else {
            this._showSetupMessage = false;
        }
    }
    
    if (!this._built)
        this._build();
    this._update();
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Field Visibility System
- [ ] Add `visibleWhen` function to `device_id` field (line ~4118)
- [ ] Add `visibleWhen` function to `status_entity` field (line ~4166)
- [ ] Add `visibleWhen` function to `power_entity` field (line ~4252)
- [ ] Add `visibleWhen` function to `power_threshold` field
- [ ] Add `visibleWhen` function to `power_max` field
- [ ] Add `visibleWhen` function to `plug_entity` field (line ~4281)
- [ ] Add `visibleWhen` function to `confirm_plug_off` field (line ~4290)
- [ ] Add `visibleWhen` function to `notify_entity` field (line ~4300)
- [ ] Add `visibleWhen` function to `last_wash_entity` field (line ~4312)
- [ ] Add `visibleWhen` function to `duration_entity` field (line ~4321)
- [ ] Add `visibleWhen` function to `energy_entity` field (line ~4330)
- [ ] Add `visibleWhen` function to `cost_entity` field (line ~4339)
- [ ] Add `visibleWhen` function to `currency` field (line ~4348)

### Phase 2: Rendering Logic
- [ ] Update `_buildField()` to check `visibleWhen` before rendering (line ~4536)
- [ ] Update `_syncValues()` to dynamically show/hide fields (line ~4603)

### Phase 3: Setup Message Logic
- [ ] Fix `setConfig()` setup message condition (line ~632)
- [ ] Fix `set hass()` setup message condition (line ~652)

### Phase 4: Testing
- [ ] Test: Select Home Connect mode → device picker appears
- [ ] Test: Select device → save → setup message DISAPPEARS
- [ ] Test: After device selection, standard mode fields are HIDDEN
- [ ] Test: Switch back to standard mode → standard fields reappear
- [ ] Test: Auto-discovery creates `home_connect` config object
- [ ] Test: Card renders normally after device selection (no setup message)

---

## VALIDATION REQUIREMENTS

### Test Case 1: Home Connect Mode Activation
1. Open visual editor
2. Select "Home Connect" mode
3. **EXPECTED:** Device picker appears, ALL standard mode fields hidden
4. **EXPECTED:** Setup message displays

### Test Case 2: Device Selection
1. Continue from Test Case 1
2. Select washing machine from device picker
3. Click "Save"
4. **EXPECTED:** Setup message DISAPPEARS
5. **EXPECTED:** Card shows washing machine with auto-discovered entities
6. **EXPECTED:** Console log shows: "Home Connect entities auto-discovered: {...}"

### Test Case 3: Mode Switching
1. Open visual editor with Home Connect mode active
2. Switch to "Standard" mode
3. **EXPECTED:** Device picker HIDDEN
4. **EXPECTED:** Standard mode fields (status_entity, power_entity, etc.) VISIBLE
5. Switch back to "Home Connect" mode
6. **EXPECTED:** Device picker VISIBLE
7. **EXPECTED:** Standard mode fields HIDDEN

### Test Case 4: Persistence
1. Configure Home Connect device
2. Save card
3. Reload Home Assistant dashboard
4. **EXPECTED:** Card loads with Home Connect configuration
5. **EXPECTED:** No setup message
6. **EXPECTED:** Auto-discovered entities working

---

## CRITICAL NOTES FOR CODER KI

### ⚠️ DO NOT DO THESE THINGS:

1. **DO NOT** create new methods or helper functions
2. **DO NOT** refactor existing code structure
3. **DO NOT** add comments explaining what you're doing
4. **DO NOT** add JSDoc documentation
5. **DO NOT** modify any logic outside the specified locations
6. **DO NOT** change variable names or formatting
7. **DO NOT** add error handling beyond what's specified
8. **DO NOT** create test files
9. **DO NOT** modify the `_autoDiscoverEntities()` method
10. **DO NOT** touch the render logic in `_build()` method

### ✅ ONLY DO THESE THINGS:

1. **ADD** `visibleWhen` function to field definitions (exact pattern provided)
2. **ADD** visibility check at START of `_buildField()` (exact code provided)
3. **ADD** dynamic visibility logic in `_syncValues()` (exact code provided)
4. **REPLACE** setup message condition in `setConfig()` (exact code provided)
5. **REPLACE** setup message condition in `set hass()` (exact code provided)

### Implementation Order
**Execute fixes in this EXACT order:**
1. Fix 2 (device_id visibility)
2. Fix 1 (all standard mode field visibility)
3. Fix 3 (_buildField visibility check)
4. Fix 4 (_syncValues dynamic visibility)
5. Fix 5 (setConfig setup message logic)
6. Fix 6 (set hass setup message logic)

### After Implementation
1. Verify ALL standard mode fields have `visibleWhen`
2. Verify `_buildField()` has visibility check at the START
3. Verify `_syncValues()` has dynamic visibility logic
4. Verify setup message only shows when NO device_id AND NO home_connect
5. Test with browser developer tools open to see console logs

---

## COMMIT MESSAGE

```
fix(visual-editor): hide standard mode fields in Home Connect mode and fix setup message logic

- Add visibleWhen to all standard mode fields (status_entity, power_entity, etc.)
- Add visibleWhen to device_id field (only show in Home Connect mode)
- Implement visibility checking in _buildField() method
- Implement dynamic visibility updates in _syncValues() method
- Fix setup message condition: only show when NO device_id AND NO home_connect
- Fix set hass() to properly update setup message flag after auto-discovery

Fixes issue where standard mode fields remained visible in Home Connect mode
and setup message displayed even after device selection.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

---

**END OF SPECIFICATION**
