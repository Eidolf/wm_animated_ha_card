# CRITICAL BUG FIXES V2 - STRICT IMPLEMENTATION FOR CODER KI

## ABSOLUTE RULES FOR CODER KI
1. Execute EXACTLY what is written below - NOTHING ELSE
2. Do NOT think, optimize, refactor, or improve
3. Do NOT add comments, logs, or documentation
4. Make ONLY the changes at EXACTLY the line numbers specified
5. Copy-paste code blocks EXACTLY as written

---

## PROBLEM 1: i-Dos Panel in Wrong Location (Shows on Program Button Instead of Middle Panel)

**Issue:** i-Dos panel appears at x="42" (left side, program button area) instead of x="88" (middle panel)

**Location:** `_renderIDosPanel()` method, line ~1930-1946

**CURRENT CODE (WRONG):**
```javascript
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
```

**REQUIRED CODE (CORRECT - MOVE TO MIDDLE PANEL):**
```javascript
return `
  <!-- i-Dos Panel Background -->
  <rect x="42" y="20" width="34" height="13" rx="4" fill="#cfd7e0"/>
  <rect x="42" y="20" width="34" height="6"  rx="3" fill="#dee5ec"/>
  
  <!-- i-Dos Display in Middle Panel (above time display) -->
  <rect x="88" y="8" width="70" height="8" rx="3" fill="#f0f3f7" stroke="#c2cbd6" stroke-width="0.5"/>
  
  <!-- i-Dos 1 Container (left half) -->
  <rect x="91" y="9.5" width="30" height="5" rx="1.5" fill="#e5e9ef"/>
  <rect x="91" y="${14.5 - level1Height * 0.05}" width="30" height="${level1Height * 0.05}" rx="1.5" fill="${color1}" opacity="0.85"/>
  <text x="106" y="13" text-anchor="middle" font-size="5" fill="#666" font-weight="600">${Math.round(level1)}%</text>
  
  <!-- i-Dos 2 Container (right half) -->
  <rect x="126" y="9.5" width="30" height="5" rx="1.5" fill="#e5e9ef"/>
  <rect x="126" y="${14.5 - level2Height * 0.05}" width="30" height="${level2Height * 0.05}" rx="1.5" fill="${color2}" opacity="0.85"/>
  <text x="141" y="13" text-anchor="middle" font-size="5" fill="#666" font-weight="600">${Math.round(level2)}%</text>
  
  <!-- Active indicators -->
  ${idos1Active ? `<circle cx="106" cy="10.5" r="0.8" fill="${color1}"/>` : ''}
  ${idos2Active ? `<circle cx="141" cy="10.5" r="0.8" fill="${color2}"/>` : ''}`;
```

**EXPLANATION:**
- Left panel (x="42") stays static gray for program button
- i-Dos display moves to middle panel (x="88") ABOVE the time display
- New position: y="8" (above time), height="8"
- Two horizontal bars side-by-side instead of vertical containers

---

## PROBLEM 2: Animation Jerky/Stuttering on Dishwasher (and Possibly Washer)

**Issue:** CSS animations have `transform-origin` conflicts or missing initial states

**Location:** CSS styles in `_build()` method, line ~2700-2750

**FIND these animation definitions:**
```css
.laundry, .drum, .arcs {
  transform-box: view-box;
  transform-origin: 110px 128px;
}
```

**REPLACE WITH:**
```css
.laundry, .drum, .arcs {
  transform-box: fill-box;
  transform-origin: center;
}
```

**FIND:**
```css
.running .arcs    { animation: spin 3s linear infinite; }
.running .laundry { animation: tumble 3s ease-in-out infinite; }
.running .drum    { animation: spin 2.4s linear infinite; }
```

**REPLACE WITH:**
```css
.running .arcs    { animation: spin 3s linear infinite; will-change: transform; }
.running .laundry { animation: tumble 3s ease-in-out infinite; will-change: transform; }
.running .drum    { animation: spin 2.4s linear infinite; will-change: transform; }
```

**ADD after the animation keyframes (line ~2700):**
```css
.laundry, .drum, .arcs {
  transform-box: fill-box;
  transform-origin: center;
}
```

---

## PROBLEM 3: Feature - Alternating Time Display (End Time ↔ Countdown Timer)

**Issue:** Display only shows end time. Should alternate between end time and countdown every 3 seconds.

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

**REPLACE WITH:**
```javascript
if (running && remainingTime) {
    // Alternate between countdown and end time every 3 seconds
    const now = Date.now();
    const showCountdown = Math.floor(now / 3000) % 2 === 0;
    
    if (showCountdown) {
        // Show countdown timer (remaining time)
        const formatted = this._formatTime(remainingTime);
        this._el("dispTime").textContent = formatted;
        this._el("ringTime").textContent = formatted;
    } else if (endTime) {
        // Show end time (clock time)
        const endDate = new Date(endTime);
        if (!isNaN(endDate.getTime())) {
            const hours = endDate.getHours();
            const minutes = endDate.getMinutes();
            const formatted = `${hours}:${minutes.toString().padStart(2, '0')}`;
            this._el("dispTime").textContent = formatted;
            this._el("ringTime").textContent = formatted;
        } else {
            const formatted = this._formatTime(remainingTime);
            this._el("dispTime").textContent = formatted;
            this._el("ringTime").textContent = formatted;
        }
    } else {
        const formatted = this._formatTime(remainingTime);
        this._el("dispTime").textContent = formatted;
        this._el("ringTime").textContent = formatted;
    }
} else if (state === "delayed" && endTime) {
    const formatted = this._formatTime(endTime);
    this._el("dispTime").textContent = formatted;
    this._el("ringTime").textContent = formatted;
} else {
    this._el("dispTime").textContent = active ? "0:00" : "--:--";
    this._el("ringTime").textContent = active ? "…" : "—";
}
```

**ADD:** Ensure update interval is fast enough to switch display. In `connectedCallback()` (line ~704), verify timer is set:
```javascript
this._timer = setInterval(() => {
    if (this._hass && this._built && this._applianceState() !== "off")
        this._update();
}, 3000);  // Changed from 30000 to 3000 for display switching
```

---

## PROBLEM 4: Ring Box Label Should Show "Countdown" in Home Connect Mode

**Issue:** Ring box (below machine) shows elapsed time label. Should show "REMAINING" or countdown label in HC mode.

**Location:** `_updateHomeConnect()` method, line ~3917-3923

**CURRENT CODE:**
```javascript
// Ring Label
let ringLabel = t.ring_idle;
if (state === "running") ringLabel = t.ring_running;
else if (state === "ready") ringLabel = t.ring_ready || "READY";
else if (state === "paused") ringLabel = t.ring_paused || "PAUSED";
else if (state === "off") ringLabel = t.ring_off;
this._el("ringLabel").textContent = ringLabel;
```

**REPLACE WITH:**
```javascript
// Ring Label - show REMAINING for Home Connect mode
let ringLabel = t.ring_idle;
if (state === "running") {
    ringLabel = "REMAINING";  // Changed from t.ring_running to show countdown context
} else if (state === "ready") {
    ringLabel = t.ring_ready || "READY";
} else if (state === "paused") {
    ringLabel = t.ring_paused || "PAUSED";
} else if (state === "off") {
    ringLabel = t.ring_off;
}
this._el("ringLabel").textContent = ringLabel;
```

**ADD TO STRINGS:** In the language strings (line ~30-100), add:
```javascript
en: {
    // ... existing strings ...
    ring_remaining: "REMAINING",
```

Then use it:
```javascript
if (state === "running") {
    ringLabel = t.ring_remaining || "REMAINING";
}
```

**DO THE SAME FOR:** de, ru, fr language strings:
```javascript
de: {
    ring_remaining: "VERBLEIBEND",
ru: {
    ring_remaining: "ОСТАЛОСЬ",
fr: {
    ring_remaining: "RESTANT",
```

---

## IMPLEMENTATION CHECKLIST

Execute in this EXACT order:

1. ✅ Fix i-Dos panel position: Move from x="42" to middle panel x="88", y="8"
2. ✅ Fix animation stuttering: Change transform-origin to "center" and add will-change
3. ✅ Add alternating display: Countdown ↔ End time every 3 seconds
4. ✅ Change timer interval: 30000 → 3000 in connectedCallback()
5. ✅ Change ring label: Show "REMAINING" instead of "RUNNING" in HC mode
6. ✅ Add ring_remaining strings: EN, DE, RU, FR

---

## VALIDATION

After implementation:
1. Washer with i-Dos → middle panel shows two horizontal bars with fill levels
2. Running washer/dishwasher → animations smooth, no stuttering
3. Running program → display alternates every 3 seconds between "2:35" and "14:30"
4. Ring box label → shows "REMAINING" instead of "ELAPSED"

---

## CRITICAL: EXACT CHANGES ONLY

Do NOT:
- Change anything else
- Add logging
- Refactor
- Optimize
- Add comments
- Think about improvements

ONLY execute the 6 changes above.

---

**END OF INSTRUCTION**
