# Visual Editor Device Picker Fix - Technical Specification

**Target File:** `washing-machine-card.js`  
**Branch:** `feature/hc-visual-editor-entity-picker`  
**Status:** CRITICAL REGRESSION FIX REQUIRED

---

## CURRENT STATE ANALYSIS

### What's Working ✅
1. Field visibility system with `visibleWhen` is implemented
2. Standard mode fields (status_entity, etc.) are hidden when Home Connect mode is active
3. Device picker has `visibleWhen` and only shows in Home Connect mode

### What's Broken ❌
1. **CRITICAL:** Device picker field is NOT rendering - user cannot select device
2. **CRITICAL:** YAML configuration message still shows (should be removed entirely)
3. Setup message on card shows simultaneously with YAML message (confusing mix)

### Root Cause
The `visibleWhen` check in `_buildField()` is evaluating BEFORE the field element is stored in `this._fieldEls`, which breaks the field rendering for fields with `visibleWhen`.

---

## REQUIRED FIXES

### FIX 1: Remove YAML Configuration Message (CRITICAL)

**Location:** `_build()` method in editor, lines ~4520-4563

**Problem:** This entire message block tells users to edit YAML manually. This is NOT what we want - we want automatic device picker.

**Action:** DELETE the entire `modeInfo` block.

**Current Code (DELETE THIS):**
```javascript
const modeInfo = document.createElement("div");
modeInfo.id = "modeInfo";
modeInfo.className = "mode-info hidden";
modeInfo.innerHTML = `
    <style>
        .mode-info {
            margin: 4px 0 12px;
            padding: 12px 16px;
            background: var(--primary-color, #2f80ed);
            color: var(--text-primary-color, #fff);
            border-radius: 8px;
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }
        .mode-info.hidden {
            display: none;
        }
        .mode-info ha-icon {
            --mdc-icon-size: 24px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .mode-info-text {
            flex: 1;
            font-size: 13px;
            line-height: 1.4;
        }
        .mode-info code {
            background: rgba(0,0,0,0.2);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
    <ha-icon icon="mdi:information-outline"></ha-icon>
    <div class="mode-info-text">
        <strong>Home Connect Mode Selected</strong><br>
        Additional configuration required. Please edit the YAML to add the 
        <code>home_connect</code> configuration object.<br>
        See example configurations in <code>test-configs/</code> directory.
    </div>
`;
editor.appendChild(modeInfo);
```

**Replace With:** NOTHING - complete deletion.

---

### FIX 2: Remove _updateModeInfo() Method (CRITICAL)

**Location:** Lines ~4596-4603

**Problem:** This method updates the YAML message visibility. Since we're deleting the message, this method is now useless.

**Current Code (DELETE THIS):**
```javascript
_updateModeInfo() {
    const mode = this._config?.mode || "standard";
    const hasDevice = !!this._config?.device_id || !!this._config?.home_connect;
    const modeInfo = this.shadowRoot?.getElementById("modeInfo");
    if (modeInfo) {
        modeInfo.classList.toggle("hidden", mode !== "home_connect" || hasDevice);
    }
}
```

**Replace With:** NOTHING - complete deletion.

---

### FIX 3: Remove _updateModeInfo() Call (CRITICAL)

**Location:** `_syncValues()` method, line ~4723

**Problem:** Calling a method that no longer exists will cause errors.

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

            // APPLY VISIBILITY LOGIC
            if (field.visibleWhen) {
                const shouldBeVisible = field.visibleWhen(this._config);
                const wrapper = el.closest('.wm-field');
                if (wrapper) {
                    wrapper.style.display = shouldBeVisible ? '' : 'none';
                }
            }

            const isNative = field.kind === "text" || field.kind === "number";
            if (!isNative)
                el.hass = this._hass;

            const raw = this._config[field.key];
            const hasValue = raw !== undefined && raw !== "";

            if (this._isChoiceField(field)) {
                let v = hasValue ? raw : field.default;
                if (field.key === "appliance_type")
                    v = WashingMachineCard.normalizeType(v);
                el.value = v;
            } else {
                el.value = hasValue ? raw : "";
                const def = field.dynamicDefault
                    ? WashingMachineCardEditor._defaultName(this._config, this._hass)
                    : field.default;
                if (def !== undefined)
                    el.placeholder = String(def);
            }
        }
    }
    this._updateModeInfo();  // <-- DELETE THIS LINE
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

            const isNative = field.kind === "text" || field.kind === "number";
            if (!isNative)
                el.hass = this._hass;

            const raw = this._config[field.key];
            const hasValue = raw !== undefined && raw !== "";

            if (this._isChoiceField(field)) {
                let v = hasValue ? raw : field.default;
                if (field.key === "appliance_type")
                    v = WashingMachineCard.normalizeType(v);
                el.value = v;
            } else {
                el.value = hasValue ? raw : "";
                const def = field.dynamicDefault
                    ? WashingMachineCardEditor._defaultName(this._config, this._hass)
                    : field.default;
                if (def !== undefined)
                    el.placeholder = String(def);
            }
        }
    }
    // _updateModeInfo() call removed - method no longer exists
}
```

---

### FIX 4: Fix _buildField() Visibility Check (CRITICAL)

**Location:** `_buildField()` method, lines ~4609-4618

**Problem:** The visibility check happens BEFORE storing the field element in `this._fieldEls`. This breaks the field completely - it returns a hidden div, but the field element is never stored, so `_syncValues()` can't find it later.

**Current Code (BROKEN):**
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
    // ... rest of build logic
}
```

**Fixed Code:**
```javascript
_buildField(field) {
    const wrap = document.createElement("div");
    wrap.className = "wm-field" + (field.kind === "boolean" ? " wm-field--row" : "");
    
    // Apply initial visibility
    if (field.visibleWhen && !field.visibleWhen(this._config)) {
        wrap.style.display = "none";
    }
    
    // ... rest of build logic (UNCHANGED)
```

**Explanation:**
- ALWAYS create the field wrapper
- Store the field element in `this._fieldEls` (happens later in the method)
- Apply visibility with `wrap.style.display = "none"` instead of returning early
- This way `_syncValues()` can find the element later and toggle visibility dynamically

---

## IMPLEMENTATION INSTRUCTIONS

### Step 1: Delete YAML Message Block
1. Locate line ~4520 in `washing-machine-card.js`
2. Find `const modeInfo = document.createElement("div");`
3. Delete from that line through `editor.appendChild(modeInfo);` (approximately 43 lines)
4. DO NOT delete the `const sections = WashingMachineCardEditor._sections;` line that comes after

### Step 2: Delete _updateModeInfo() Method
1. Locate line ~4596 in `washing-machine-card.js`
2. Find the `_updateModeInfo() {` method
3. Delete the entire method (approximately 8 lines)

### Step 3: Remove _updateModeInfo() Call
1. Locate line ~4723 in `washing-machine-card.js` (inside `_syncValues()` method)
2. Find the line `this._updateModeInfo();`
3. Delete that single line
4. Optionally add a comment: `// _updateModeInfo() call removed - method no longer exists`

### Step 4: Fix _buildField() Visibility Logic
1. Locate line ~4609 in `washing-machine-card.js`
2. Find the `_buildField(field) {` method
3. Replace the visibility check at the start:

**OLD CODE:**
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
```

**NEW CODE:**
```javascript
_buildField(field) {
    const wrap = document.createElement("div");
    wrap.className = "wm-field" + (field.kind === "boolean" ? " wm-field--row" : "");
    
    // Apply initial visibility
    if (field.visibleWhen && !field.visibleWhen(this._config)) {
        wrap.style.display = "none";
    }
```

---

## VERIFICATION CHECKLIST

After implementing all fixes, verify:

### Test 1: Device Picker Appears
1. Open visual editor
2. Select "Home Connect" mode
3. **EXPECTED:** Device picker field is visible and functional
4. **EXPECTED:** No YAML configuration message appears
5. **EXPECTED:** Standard mode fields (status_entity, etc.) are hidden

### Test 2: Device Selection Works
1. Continue from Test 1
2. Click on device picker
3. **EXPECTED:** Dropdown shows Home Connect devices
4. Select washing machine
5. Click "Save"
6. **EXPECTED:** Card renders with setup message (from card, not editor)
7. **EXPECTED:** No YAML message

### Test 3: Mode Switching Works
1. Open visual editor with Home Connect mode
2. Switch to "Standard" mode
3. **EXPECTED:** Device picker disappears
4. **EXPECTED:** Standard mode fields appear (status_entity, power_entity, etc.)
5. Switch back to "Home Connect"
6. **EXPECTED:** Device picker reappears
7. **EXPECTED:** Standard mode fields disappear

### Test 4: Dynamic Visibility Works
1. Configure device in Home Connect mode
2. Open visual editor again
3. **EXPECTED:** Device picker shows selected device
4. Change to Standard mode
5. **EXPECTED:** Device picker hidden immediately (no refresh needed)
6. **EXPECTED:** Standard fields visible immediately

---

## CRITICAL RULES FOR CODER KI

### ⚠️ DO NOT:
1. DO NOT modify any other methods
2. DO NOT add new methods or helper functions
3. DO NOT add comments beyond what's specified
4. DO NOT refactor existing code
5. DO NOT change the visibility logic in `_syncValues()` - it's correct
6. DO NOT modify field definitions - they already have correct `visibleWhen`
7. DO NOT touch the main card class (WashingMachineCard)
8. DO NOT modify `_autoDiscoverEntities()` method

### ✅ ONLY DO:
1. DELETE the entire `modeInfo` block (lines ~4520-4563)
2. DELETE the entire `_updateModeInfo()` method (lines ~4596-4603)
3. DELETE the `this._updateModeInfo();` call in `_syncValues()` (line ~4723)
4. REPLACE the early return in `_buildField()` with inline visibility (lines ~4609-4615)

### Implementation Order:
1. Fix 4 first (_buildField visibility logic) - THIS IS THE CRITICAL FIX
2. Fix 1 (delete modeInfo block)
3. Fix 2 (delete _updateModeInfo method)
4. Fix 3 (remove _updateModeInfo call)

---

## EXPECTED BEHAVIOR AFTER FIX

### Visual Editor in Home Connect Mode:
```
┌─────────────────────────────────────────┐
│ Operating Mode                          │
│ ┌─────────────────────────────────────┐ │
│ │ Mode: Home Connect                  │ │
│ │ Home Connect Device: [Dropdown ▼]   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ General                                 │
│ ┌─────────────────────────────────────┐ │
│ │ Card name: [                    ]   │ │
│ │ Appliance type: [Washer        ▼]   │ │
│ │ (status_entity is HIDDEN)           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Appearance & language                   │
│ (all fields visible)                    │
│                                         │
│ Power monitoring                        │
│ (all fields HIDDEN)                     │
└─────────────────────────────────────────┘
```

### Visual Editor in Standard Mode:
```
┌─────────────────────────────────────────┐
│ Operating Mode                          │
│ ┌─────────────────────────────────────┐ │
│ │ Mode: Standard                      │ │
│ │ (device picker is HIDDEN)           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ General                                 │
│ ┌─────────────────────────────────────┐ │
│ │ Card name: [                    ]   │ │
│ │ Appliance type: [Washer        ▼]   │ │
│ │ Status entity: [sensor.washing  ▼]  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Appearance & language                   │
│ (all fields visible)                    │
│                                         │
│ Power monitoring                        │
│ (all fields VISIBLE)                    │
└─────────────────────────────────────────┘
```

---

## WHY THIS FIX WORKS

### Problem with Current Implementation:
```javascript
_buildField(field) {
    if (field.visibleWhen && !field.visibleWhen(this._config)) {
        return hiddenDiv;  // ❌ EXITS EARLY - field never gets stored
    }
    // ... field element created and stored in this._fieldEls
}
```

The early return means:
1. Field element is never created
2. Field element is never stored in `this._fieldEls[field.key]`
3. `_syncValues()` can't find the field later
4. Dynamic visibility toggle fails

### Solution:
```javascript
_buildField(field) {
    const wrap = createElement();
    if (field.visibleWhen && !field.visibleWhen(this._config)) {
        wrap.style.display = "none";  // ✅ Hide with CSS
    }
    // ... field element gets created and stored in this._fieldEls
    // ... later, _syncValues() can find it and toggle visibility
    return wrap;
}
```

Now:
1. Field element is always created
2. Field element is always stored in `this._fieldEls[field.key]`
3. Initial visibility is applied with CSS
4. `_syncValues()` can find the field and toggle visibility dynamically

---

## COMMIT MESSAGE

```
fix(visual-editor): restore device picker rendering and remove YAML message

- Fix _buildField() early return that prevented device picker from rendering
- Remove YAML configuration message block (users should use device picker)
- Remove _updateModeInfo() method (no longer needed)
- Apply initial visibility with CSS instead of early return
- Preserve field element storage in this._fieldEls for dynamic visibility

Device picker now renders correctly and users can select Home Connect devices.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

---

**END OF SPECIFICATION**
