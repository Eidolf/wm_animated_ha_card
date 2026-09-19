# CRITICAL BUG FIXES - IMPLEMENTATION INSTRUCTION FOR CODER KI

## STRICT RULES FOR CODER KI
1. Execute EXACTLY what is specified below - NO additional changes
2. Do NOT refactor, optimize, or improve anything not explicitly mentioned
3. Do NOT add comments, documentation, or explanations
4. Do NOT change variable names, function names, or code structure
5. Make ONLY the specified changes at the specified locations

---

## PROBLEM 1: Animations Not Visible (Laundry, Drum, Arcs)

**Root Cause:** SVG elements exist but have wrong initial opacity or missing from rendered output

**Location:** `_svgWasher()` method, line ~2154-2166

**CURRENT CODE:**
```javascript
<!-- Laundry (inside drum) -->
<g class="laundry">
  <circle cx="100" cy="124" r="14"   fill="#ea4335"/>
  <circle cx="119" cy="131" r="13.2" fill="#4285f4"/>
  <circle cx="110" cy="115" r="11"   fill="#fbbc05"/>
  <circle cx="103" cy="135" r="8"    fill="#f28b82" opacity=".9"/>
</g>

<!-- Progress arcs -->
<g class="arcs">
  <circle cx="110" cy="128" r="53" fill="none" stroke="#2f80ed" stroke-width="5.5"
          stroke-linecap="round" stroke-dasharray="104 62.5" opacity=".95"/>
</g>
```

**REQUIRED CHANGE:**
These elements must be placed INSIDE the door group, BEFORE the glass circle, so they appear behind the door glass:

**NEW CODE:** (Insert at line ~2172, BEFORE the glass circle)
```javascript
        <!-- Door group with transform origin at left hinge point (80px 128px) -->
        <g class="door-group" id="doorGroup">
          <circle cx="110" cy="128" r="58" fill="url(#${u}-ring)"/>
          <circle cx="110" cy="128" r="58" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
          <circle cx="110" cy="128" r="47" fill="#e3e9f0"/>
          
          <!-- Drum (rotating drum pattern) -->
          <g class="drum">
            <circle cx="110" cy="128" r="36" fill="none" stroke="#8a7a6a" stroke-width="1.2" opacity=".55"/>
            <g fill="#c4b5a5" opacity=".55">
              <circle cx="92" cy="112" r="1.6"/><circle cx="104" cy="108" r="1.6"/>
              <circle cx="116" cy="108" r="1.6"/><circle cx="128" cy="112" r="1.6"/>
              <circle cx="88" cy="124" r="1.6"/><circle cx="132" cy="124" r="1.6"/>
              <circle cx="90" cy="138" r="1.6"/><circle cx="130" cy="138" r="1.6"/>
              <circle cx="100" cy="146" r="1.6"/><circle cx="120" cy="146" r="1.6"/>
              <circle cx="110" cy="150" r="1.6"/>
            </g>
          </g>
          
          <!-- Laundry (tumbling clothes inside drum) -->
          <g class="laundry">
            <ellipse cx="102" cy="126" rx="15" ry="10" fill="#7aa2e3" transform="rotate(-18 102 126)"/>
            <ellipse cx="120" cy="134" rx="13" ry="9" fill="#e8e0d4" transform="rotate(22 120 134)"/>
            <ellipse cx="112" cy="118" rx="10" ry="7" fill="#d4a574" transform="rotate(-8 112 118)"/>
          </g>
          
          <!-- Progress arcs (spinning around drum) -->
          <g class="arcs">
            <circle cx="110" cy="128" r="53" fill="none" stroke="#f0a04b" stroke-width="5.5"
                    stroke-linecap="round" stroke-dasharray="104 62.5" opacity=".95"/>
          </g>
          
          <circle cx="110" cy="128" r="42" fill="url(#${u}-glass)"/>
```

**DELETE:** Remove the OLD standalone `<g class="laundry">` and `<g class="arcs">` sections (lines ~2154-2166)

---

## PROBLEM 2: i-Dos Panel NOT Showing in Washer Top-Left

**Root Cause:** `_renderIDosPanel()` method not checking Home Connect mode properly

**Location:** `_renderIDosPanel()` method, line ~1903

**CURRENT CODE (line ~1903-1912):**
```javascript
_renderIDosPanel() {
    const type = this._applianceType;
    const hc = this._config?.home_connect?.[type];
    
    // Only for washers with i-Dos
    if (type !== 'washer' || !this._hasIDos(hc)) {
        return `
      <rect x="42" y="20" width="34" height="13" rx="4" fill="#cfd7e0"/>
      <rect x="42" y="20" width="34" height="6"  rx="3" fill="#dee5ec"/>`;
    }
```

**REQUIRED CHANGE:**
```javascript
_renderIDosPanel() {
    const mode = this._getMode();
    const isHc = mode === "home_connect";
    const type = this._applianceType;
    const hc = this._config?.home_connect?.[type];
    
    // Only for washers with i-Dos IN HOME CONNECT MODE
    if (!isHc || type !== 'washer' || !this._hasIDos(hc)) {
        return `
      <rect x="42" y="20" width="34" height="13" rx="4" fill="#cfd7e0"/>
      <rect x="42" y="20" width="34" height="6"  rx="3" fill="#dee5ec"/>`;
    }
```

---

## PROBLEM 3: Interactive Overlays Too Small (Program & Start Buttons)

**Root Cause:** SVG overlay rectangles only cover the visible elements, not the entire dark panel

**Location:** `_svgWasher()` method, line ~2182-2196

**CURRENT CODE:**
```javascript
${isHc ? `
  <!-- Home Connect Interactive Overlays -->
  <rect class="hc-control" id="hcProgramBtn" x="42" y="20" width="34" height="13" rx="4"
        fill="rgba(47,128,237,0.01)" cursor="pointer">
    <title>${t.tip_program_btn || "Select Program"}</title>
  </rect>
  <rect class="hc-control" id="hcStartBtn" x="88" y="18" width="70" height="18" rx="9"
        fill="rgba(47,128,237,0.01)" cursor="pointer">
    <title>${t.tip_start_btn || "Start / Pause"}</title>
  </rect>
  <circle class="hc-control" id="hcPowerBtn" cx="176" cy="27" r="10"
          fill="rgba(47,128,237,0.01)" cursor="pointer">
    <title>${t.tip_power_btn || "Power"}</title>
  </circle>
` : ''}
```

**REQUIRED CHANGE:**
```javascript
${isHc ? `
  <!-- Home Connect Interactive Overlays - ENLARGED for entire panel areas -->
  <rect class="hc-control" id="hcProgramBtn" x="40" y="18" width="40" height="20" rx="4"
        fill="rgba(47,128,237,0.01)" cursor="pointer">
    <title>${t.tip_program_btn || "Select Program"}</title>
  </rect>
  <rect class="hc-control" id="hcStartBtn" x="85" y="15" width="78" height="24" rx="9"
        fill="rgba(47,128,237,0.01)" cursor="pointer">
    <title>${t.tip_start_btn || "Start / Pause"}</title>
  </rect>
  <circle class="hc-control" id="hcPowerBtn" cx="176" cy="27" r="13"
          fill="rgba(47,128,237,0.01)" cursor="pointer">
    <title>${t.tip_power_btn || "Power"}</title>
  </circle>
` : ''}
```

**EXPLANATION:**
- Program button: x=40 (instead of 42), width=40 (instead of 34), height=20 (instead of 13)
- Start button: x=85 (instead of 88), width=78 (instead of 70), height=24 (instead of 18), y=15 (instead of 18)
- Power button: radius=13 (instead of 10)

---

## PROBLEM 4: Time Display Shows Wrong Data (Shows Progress Instead of Remaining Time)

**Root Cause:** Display time logic uses wrong entity or wrong calculation

**Location:** `_updateHomeConnect()` method, line ~3902-3913

**CURRENT CODE:**
```javascript
if (running && remainingTime) {
    const formatted = this._formatTime(remainingTime);
    this._el("dispTime").textContent = formatted;
    this._el("ringTime").textContent = formatted;
} else if (state === "delayed" && endTime) {
    const formatted = this._formatTime(endTime);
    this._el("dispTime").textContent = formatted;
    this._el("ringTime").textContent = formatted;
} else {
    this._el("dispTime").textContent = active ? "0:00" : "--:--";
    this._el("ringTime").textContent = active ? "…" : "—";
}
```

**DIAGNOSIS:**
The `_formatTime()` method should already handle ISO 8601 durations properly. The problem is likely that `remainingTime` is not being retrieved correctly.

**REQUIRED CHANGE:**
Verify `_getRemainingTime()` method returns the correct entity state. No code change needed if entity pattern is correct. The display logic is already correct.

**VERIFY:** Check that `remaining_time_entity` pattern in auto-discovery (line ~502) is:
```javascript
'remaining_time_entity': /_remaining(_program)?_time$/,
```

This pattern should match:
- `sensor.geschirrspuler_remaining_program_time` ✓
- `sensor.waschmaschine_remaining_time` ✓

**IF NOT MATCHING:** Update pattern to:
```javascript
'remaining_time_entity': /_(remaining|verbleibende)(_program)?_(time|zeit)$/,
```

---

## IMPLEMENTATION CHECKLIST

Execute changes in this exact order:

1. ✅ Fix animation visibility: Move laundry, drum, arcs INTO door-group (before glass)
2. ✅ Delete old standalone laundry and arcs sections
3. ✅ Fix i-Dos panel: Add mode check in `_renderIDosPanel()`
4. ✅ Enlarge interactive overlays: Update dimensions for hcProgramBtn and hcStartBtn
5. ✅ Verify remaining_time_entity pattern includes `_remaining(_program)?_time`

## VALIDATION

After implementation:
1. Washer running → should see laundry tumbling, drum rotating, arcs spinning
2. Washer with i-Dos → top-left shows colored fill level bars
3. Click anywhere on dark program panel → opens program selector
4. Click anywhere on dark time display → triggers start/pause
5. Display shows remaining time in MM:SS or HH:MM format

---

## CRITICAL: NO ADDITIONAL CHANGES

Do NOT:
- Add error handling
- Add comments
- Refactor other code
- Change CSS
- Modify other methods
- Add console.log statements
- Change variable names
- Optimize anything

ONLY make the 4 changes specified above.

---

**END OF INSTRUCTION**
