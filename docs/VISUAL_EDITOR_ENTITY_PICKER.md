# Visual Editor: Automatische Home Connect Entitätserkennung

**Branch:** `feature/hc-visual-editor-entity-picker`  
**Ziel:** Automatische Erkennung und Zuordnung von Home Connect Entitäten nach Geräteauswahl im Visual Editor

---

## PROBLEM

Aktuell zeigt die Karte nach Auswahl von `mode: home_connect` nur eine Meldung:

```
Home Connect Mode Selected
Additional configuration required. Please edit the YAML to add the home_connect configuration object.
See example configurations in test-configs/ directory.
```

**Gewünschtes Verhalten:**
1. User wählt `mode: home_connect` im Visual Editor
2. User wählt ein Home Assistant Gerät (Device) aus
3. Karte erkennt automatisch alle Home Connect Entitäten des Geräts
4. Karte ordnet die Entitäten automatisch den richtigen Config-Keys zu
5. Karte funktioniert sofort ohne manuelle YAML-Bearbeitung

---

## LÖSUNG: DEVICE-BASED AUTO-DISCOVERY

### Konzept

Home Assistant gruppiert alle Entitäten eines physischen Geräts unter einer **Device ID**. Wir nutzen das `hass.devices` und `hass.entities` Registry um:

1. Alle Entitäten eines ausgewählten Geräts zu finden
2. Entitäten anhand ihres `entity_id` Musters den Config-Keys zuzuordnen
3. Die `home_connect` Config automatisch zu generieren

---

## IMPLEMENTIERUNG

### Teil 1: Visual Editor Schema erweitern

**Datei:** `washing-machine-card.js`  
**Methode:** `static getConfigElement()`

Füge nach dem `mode` Feld ein neues `device` Feld hinzu:

```javascript
static getConfigElement() {
    // ... existing code ...
    
    const schema = [
        {
            name: 'mode',
            label: 'Mode',
            selector: {
                select: {
                    options: [
                        { value: 'standard', label: 'Standard (legacy)' },
                        { value: 'home_connect', label: 'Home Connect' },
                    ],
                },
            },
        },
        
        // NEU: Device Picker für Home Connect Mode
        {
            name: 'device_id',
            label: 'Home Connect Device',
            selector: {
                device: {
                    integration: 'home_connect',
                    multiple: false,
                },
            },
        },
        
        {
            name: 'appliance_type',
            label: 'Appliance Type',
            selector: {
                select: {
                    options: [
                        { value: 'washer', label: 'Washing Machine' },
                        { value: 'dishwasher', label: 'Dishwasher' },
                    ],
                },
            },
        },
        
        // ... rest of schema ...
    ];
    
    return { schema };
}
```

**Wichtig:** Das `device` Selector nutzt `integration: 'home_connect'` um nur Home Connect Geräte anzuzeigen.

---

### Teil 2: Entity Discovery Methode

**Neue Methode in `WashingMachineCard` class:**

```javascript
/**
 * Auto-discover Home Connect entities from device
 * Scans all entities belonging to a device and maps them to config keys
 * 
 * @param {string} deviceId - Home Assistant device ID
 * @returns {object|null} Auto-generated home_connect config or null
 */
_autoDiscoverEntities(deviceId) {
    if (!this._hass || !deviceId) return null;
    
    const applianceType = this.config.appliance_type || 'washer';
    const entities = {};
    
    // Get all entities for this device
    const deviceEntities = Object.values(this._hass.states).filter(entity => {
        const deviceId = this._hass.entities[entity.entity_id]?.device_id;
        return deviceId === this.config.device_id;
    });
    
    // Entity pattern mapping for Washer
    const washerPatterns = {
        // Status entities
        'operation_state_entity': /_operation_state$/,
        'active_program_entity': /_active_program$/,
        'selected_program_entity': /_selected_program$/,
        'progress_entity': /_program_progress$/,
        'remaining_time_entity': /_remaining_time$/,
        'end_time_entity': /_(finish_time|end_time)$/,
        
        // Control entities
        'power_entity': /_power$/,
        'remote_control_entity': /_remote_control$/,
        'remote_start_entity': /_remote_start$/,
        'program_selector_entity': /_(program|active_program)$/,
        
        // Options
        'temperature_entity': /_temperature$/,
        'spin_speed_entity': /_spin_speed$/,
        
        // Door & Safety
        'door_entity': /_door$/,
        'child_lock_entity': /_child_lock$/,
        
        // Connectivity
        'connectivity_entity': /_connection_state$/,
        'local_control_entity': /_local_control$/,
        
        // i-Dos (Bosch/Siemens)
        'idos1_active_entity': /_idos1_dosing_active$/,
        'idos1_level_entity': /_idos1_fill_level$/,
        'idos2_active_entity': /_idos2_dosing_active$/,
        'idos2_level_entity': /_idos2_fill_level$/,
        'idos1_low_entity': /_idos1_low_fill$/,
        'idos2_low_entity': /_idos2_low_fill$/,
        
        // Features
        'hygiene_plus_entity': /_hygiene_plus$/,
        'prewash_entity': /_prewash$/,
        'extra_rinse_entity': /_extra_rinse$/,
        'vario_speed_entity': /_(vario_speed|speed_perfect)$/,
        'silence_entity': /_(silence|quiet)$/,
    };
    
    // Entity pattern mapping for Dishwasher
    const dishwasherPatterns = {
        // Status entities (same as washer)
        'operation_state_entity': /_operation_state$/,
        'active_program_entity': /_active_program$/,
        'selected_program_entity': /_selected_program$/,
        'progress_entity': /_program_progress$/,
        'remaining_time_entity': /_remaining_time$/,
        'end_time_entity': /_(finish_time|end_time)$/,
        
        // Control entities
        'power_entity': /_power$/,
        'remote_control_entity': /_remote_control$/,
        'remote_start_entity': /_remote_start$/,
        'program_selector_entity': /_(program|active_program)$/,
        
        // Door
        'door_entity': /_door$/,
        
        // Connectivity
        'connectivity_entity': /_connection_state$/,
        'local_control_entity': /_local_control$/,
        
        // Consumables (dishwasher-specific)
        'salt_low_entity': /_salt_low$/,
        'rinse_aid_low_entity': /_(rinse_aid_low|rinseaid_low)$/,
        
        // Features
        'hygiene_plus_entity': /_hygiene_plus$/,
        'intensive_zone_entity': /_(intensive_zone|extra_dry)$/,
        'vario_speed_entity': /_(vario_speed|speed_perfect)$/,
        'silence_entity': /_(silence|quiet)$/,
        'brilliant_dry_entity': /_brilliant_dry$/,
        'extra_dry_entity': /_extra_dry$/,
        'half_load_entity': /_half_load$/,
    };
    
    const patterns = applianceType === 'dishwasher' ? dishwasherPatterns : washerPatterns;
    
    // Match entities to patterns
    deviceEntities.forEach(entity => {
        const entityId = entity.entity_id;
        
        for (const [configKey, pattern] of Object.entries(patterns)) {
            if (pattern.test(entityId)) {
                entities[configKey] = entityId;
                break; // First match wins
            }
        }
    });
    
    // Return config object if we found essential entities
    const hasEssentials = entities.operation_state_entity || entities.power_entity;
    if (!hasEssentials) {
        console.warn('Auto-discovery: No essential Home Connect entities found');
        return null;
    }
    
    return entities;
}
```

---

### Teil 3: setConfig erweitern

**Erweitere die `setConfig()` Methode:**

```javascript
setConfig(config) {
    if (!config) {
        throw new Error('Invalid configuration');
    }
    
    const mode = config.mode || WashingMachineCard.DEFAULTS.mode;
    
    // Auto-discovery für Home Connect Mode
    if (mode === 'home_connect' && config.device_id && !config.home_connect) {
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
    
    // Validation: Home Connect mode requirements
    if (mode === 'home_connect') {
        if (!config.home_connect) {
            // Show setup message if no device selected yet
            this._showSetupMessage = true;
        } else {
            this._showSetupMessage = false;
        }
    }
    
    // ... rest of existing validation ...
    
    this.config = config;
    this._updateCard();
}
```

---

### Teil 4: Setup Message anzeigen

**Neue Methode für Setup UI:**

```javascript
/**
 * Render setup message when device not selected
 * @returns {TemplateResult}
 */
_renderSetupMessage() {
    const t = this._t;
    
    return html`
        <ha-card>
            <div class="setup-container">
                <div class="setup-icon">
                    <ha-icon icon="mdi:washing-machine"></ha-icon>
                </div>
                <div class="setup-title">
                    ${t.setup_title || 'Home Connect Setup'}
                </div>
                <div class="setup-message">
                    ${t.setup_message || 'Please select your Home Connect device in the card settings.'}
                </div>
                <div class="setup-steps">
                    <ol>
                        <li>${t.setup_step1 || 'Click the pencil icon to edit this card'}</li>
                        <li>${t.setup_step2 || 'Select your Home Connect device from the dropdown'}</li>
                        <li>${t.setup_step3 || 'Choose appliance type (Washer or Dishwasher)'}</li>
                        <li>${t.setup_step4 || 'Save - entities will be detected automatically'}</li>
                    </ol>
                </div>
            </div>
        </ha-card>
    `;
}
```

**CSS für Setup Message:**

```css
.setup-container {
    padding: 48px 24px;
    text-align: center;
    color: var(--primary-text-color);
}

.setup-icon {
    margin-bottom: 16px;
}

.setup-icon ha-icon {
    width: 64px;
    height: 64px;
    color: var(--primary-color);
}

.setup-title {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 8px;
}

.setup-message {
    font-size: 16px;
    color: var(--secondary-text-color);
    margin-bottom: 24px;
}

.setup-steps {
    max-width: 400px;
    margin: 0 auto;
    text-align: left;
}

.setup-steps ol {
    padding-left: 20px;
}

.setup-steps li {
    margin-bottom: 8px;
    line-height: 1.5;
}
```

---

### Teil 5: Render Logic anpassen

**In der `render()` Methode:**

```javascript
render() {
    if (!this._hass || !this.config) {
        return html``;
    }
    
    // Show setup message if Home Connect device not selected
    if (this._showSetupMessage) {
        return this._renderSetupMessage();
    }
    
    // ... existing render logic ...
}
```

---

### Teil 6: Localization Strings

**Füge zu allen Sprachen (EN, DE, RU, FR) hinzu:**

```javascript
// English
setup_title: 'Home Connect Setup',
setup_message: 'Please select your Home Connect device in the card settings.',
setup_step1: 'Click the pencil icon to edit this card',
setup_step2: 'Select your Home Connect device from the dropdown',
setup_step3: 'Choose appliance type (Washer or Dishwasher)',
setup_step4: 'Save - entities will be detected automatically',

// German
setup_title: 'Home Connect Einrichtung',
setup_message: 'Bitte wählen Sie Ihr Home Connect Gerät in den Karteneinstellungen.',
setup_step1: 'Klicken Sie auf das Stift-Symbol um die Karte zu bearbeiten',
setup_step2: 'Wählen Sie Ihr Home Connect Gerät aus der Dropdown-Liste',
setup_step3: 'Wählen Sie den Gerätetyp (Waschmaschine oder Geschirrspüler)',
setup_step4: 'Speichern - Entitäten werden automatisch erkannt',

// Russian
setup_title: 'Настройка Home Connect',
setup_message: 'Пожалуйста, выберите ваше устройство Home Connect в настройках карточки.',
setup_step1: 'Нажмите на иконку карандаша для редактирования карточки',
setup_step2: 'Выберите ваше устройство Home Connect из выпадающего списка',
setup_step3: 'Выберите тип устройства (Стиральная машина или Посудомоечная машина)',
setup_step4: 'Сохраните - объекты будут обнаружены автоматически',

// French
setup_title: 'Configuration Home Connect',
setup_message: 'Veuillez sélectionner votre appareil Home Connect dans les paramètres de la carte.',
setup_step1: 'Cliquez sur l\'icône crayon pour modifier cette carte',
setup_step2: 'Sélectionnez votre appareil Home Connect dans la liste déroulante',
setup_step3: 'Choisissez le type d\'appareil (Lave-linge ou Lave-vaisselle)',
setup_step4: 'Enregistrez - les entités seront détectées automatiquement',
```

---

## TEIL 7: REMOTE-START FEHLERBEHANDLUNG

### Problem

Home Connect Waschmaschinen haben **keine dauerhafte Remote-Start-Erlaubnis**. Die Erlaubnis muss am Gerät manuell für jede Session aktiviert werden. Wenn ein User versucht, ein Programm zu starten ohne diese Erlaubnis, schlägt der Service Call fehl.

### Lösung: Error State Display

**Neue Methode zur Fehlerbehandlung:**

```javascript
/**
 * Handle Home Connect service call errors
 * Displays error message on card for 5 seconds
 * 
 * @param {Error} error - The error object
 * @param {string} action - The action that failed (e.g., "start_program", "select_program")
 */
_handleServiceError(error, action) {
    const t = this._t;
    
    // Map error types to user messages
    let errorMessage = t.service_call_failed || 'Service call failed';
    
    // Check for specific Home Connect errors
    if (error.message && error.message.includes('Remote control')) {
        errorMessage = t.remote_control_required || 
                      'Remote control must be enabled on the appliance';
    } else if (error.message && error.message.includes('Remote start')) {
        errorMessage = t.remote_start_required || 
                      'Remote start must be activated on the appliance display';
    } else if (error.message && error.message.includes('door')) {
        errorMessage = t.door_must_be_closed || 
                      'Door must be closed';
    }
    
    // Store error state
    this._errorState = {
        message: errorMessage,
        timestamp: Date.now(),
        action: action,
    };
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
        if (this._errorState && this._errorState.timestamp === timestamp) {
            this._errorState = null;
            this._updateCard();
        }
    }, 5000);
    
    // Trigger card update to show error
    this._updateCard();
    
    // Also log to console for debugging
    console.error(`Home Connect ${action} failed:`, error);
}
```

**Erweitere Service Call Methoden mit Error Handling:**

```javascript
// Beispiel: _hcSelectProgram mit Error Handling
_hcSelectProgram(programName) {
    if (!this._isHomeConnectMode()) return;
    
    const entity = this._hcEntity("program_selector_entity");
    if (!entity) {
        console.warn("No program_selector_entity configured");
        return;
    }
    
    // Check remote control state
    const remoteControl = this._getRemoteControlState();
    if (remoteControl === 'off' || remoteControl === false) {
        this._handleServiceError(
            new Error('Remote control not enabled'),
            'select_program'
        );
        return;
    }
    
    return this._selectOption(entity.entity_id, programName)
        .catch(error => {
            this._handleServiceError(error, 'select_program');
        });
}

// Beispiel: _hcStart mit Error Handling
_hcStart() {
    if (!this._isHomeConnectMode()) return;
    
    const entity = this._hcEntity("power_entity");
    if (!entity) return;
    
    // Check remote start state
    const remoteStart = this._getRemoteStartState();
    if (remoteStart === 'off' || remoteStart === false) {
        this._handleServiceError(
            new Error('Remote start not enabled'),
            'start_program'
        );
        return;
    }
    
    return this._turnOn(entity.entity_id)
        .catch(error => {
            this._handleServiceError(error, 'start_program');
        });
}
```

**Error Display im SVG (über der Waschmaschine):**

```javascript
// In _generateSVG() Methode, nach dem SVG Content
_generateSVG() {
    // ... existing SVG generation ...
    
    // Error overlay (shown when error state exists)
    if (this._errorState && this._isHomeConnectMode()) {
        svg += `
            <g id="errorOverlay">
                <!-- Semi-transparent background -->
                <rect x="0" y="0" width="200" height="200" 
                      fill="rgba(0,0,0,0.7)" />
                
                <!-- Error icon -->
                <circle cx="100" cy="80" r="20" 
                        fill="var(--error-color, #ff5252)" />
                <text x="100" y="90" 
                      text-anchor="middle" 
                      font-size="24" 
                      fill="white" 
                      font-weight="bold">!</text>
                
                <!-- Error message -->
                <foreignObject x="20" y="110" width="160" height="70">
                    <div xmlns="http://www.w3.org/1999/xhtml" 
                         style="
                             color: white;
                             font-size: 14px;
                             text-align: center;
                             line-height: 1.4;
                             padding: 0 10px;
                         ">
                        ${this._errorState.message}
                    </div>
                </foreignObject>
            </g>
        `;
    }
    
    return svg;
}
```

**Localization Strings für Fehler (alle 4 Sprachen):**

```javascript
// English
remote_start_required: 'Remote start must be activated on the appliance',
remote_control_required: 'Remote control must be enabled on the appliance',
door_must_be_closed: 'Please close the door',
service_call_failed: 'Action failed. Please try again.',

// German
remote_start_required: 'Fernstart muss am Gerät aktiviert werden',
remote_control_required: 'Fernbedienung muss am Gerät aktiviert werden',
door_must_be_closed: 'Bitte Tür schließen',
service_call_failed: 'Aktion fehlgeschlagen. Bitte erneut versuchen.',

// Russian
remote_start_required: 'Необходимо активировать удалённый запуск на устройстве',
remote_control_required: 'Необходимо включить удалённое управление на устройстве',
door_must_be_closed: 'Пожалуйста, закройте дверцу',
service_call_failed: 'Действие не выполнено. Попробуйте ещё раз.',

// French
remote_start_required: 'Le démarrage à distance doit être activé sur l\'appareil',
remote_control_required: 'La commande à distance doit être activée sur l\'appareil',
door_must_be_closed: 'Veuillez fermer la porte',
service_call_failed: 'Action échouée. Veuillez réessayer.',
```

### Integration in bestehende Methoden

**Alle HC Action Methods müssen erweitert werden:**

1. `_hcSelectProgram()` - prüft `remote_control_entity`
2. `_hcStart()` - prüft `remote_start_entity`
3. `_hcPause()` - prüft `remote_control_entity`
4. `_hcStop()` - prüft `remote_control_entity`
5. `_hcSetTemperature()` - prüft `remote_control_entity`
6. `_hcSetSpinSpeed()` - prüft `remote_control_entity`
7. `_hcToggleFeature()` - prüft `remote_control_entity`

**Pattern für alle Methoden:**

```javascript
_hcSomeAction() {
    if (!this._isHomeConnectMode()) return;
    
    // 1. Check required entity exists
    const entity = this._hcEntity("some_entity");
    if (!entity) return;
    
    // 2. Check remote control/start state
    const remoteControl = this._getRemoteControlState();
    if (remoteControl === 'off' || remoteControl === false) {
        this._handleServiceError(
            new Error('Remote control not enabled'),
            'action_name'
        );
        return;
    }
    
    // 3. Execute action with error handling
    return this._someServiceCall(entity.entity_id)
        .catch(error => {
            this._handleServiceError(error, 'action_name');
        });
}
```

---

## TESTING

### Test 1: Device Selection
1. Erstelle eine neue Washing Machine Card
2. Wähle Mode: `home_connect`
3. **Erwartung:** Setup-Message wird angezeigt

### Test 2: Auto-Discovery
1. Im Visual Editor: Wähle ein Home Connect Device
2. Wähle Appliance Type: `washer`
3. Speichern
4. **Erwartung:** 
   - Karte zeigt sofort Waschmaschine mit erkannten Entitäten
   - Console Log: "Home Connect entities auto-discovered: {...}"

### Test 3: Manual Override
1. Konfiguriere Karte via YAML mit `device_id` UND `home_connect` Config
2. **Erwartung:** Manuelle Config hat Vorrang (Auto-Discovery wird übersprungen)

### Test 4: Missing Integration
1. Konfiguriere `mode: home_connect` ohne Home Connect Integration installiert
2. **Erwartung:** Setup-Message oder Fehlermeldung

### Test 5: Dishwasher
1. Wähle Device mit Appliance Type: `dishwasher`
2. **Erwartung:** Dishwasher-spezifische Entitäten werden erkannt (salt_low, rinse_aid_low, etc.)

---

## EDGE CASES

### Fall 1: Entität nicht gefunden
- **Problem:** Device hat ungewöhnliche Entity IDs
- **Lösung:** User kann manuell im YAML nachbessern (Fallback)

### Fall 2: Mehrere Geräte gleichen Typs
- **Problem:** User hat 2 Waschmaschinen
- **Lösung:** Device Picker zeigt beide mit Namen/Area an

### Fall 3: Partielle Entity-Liste
- **Problem:** Gerät hat nur einige der erwarteten Entitäten
- **Lösung:** Auto-Discovery füllt was vorhanden ist, Rest bleibt leer (Feature Chips verstecken sich automatisch)

### Fall 4: Device gelöscht
- **Problem:** User löscht Home Connect Device aus HA
- **Lösung:** Karte zeigt "Device not found" message

---

## VALIDATION

Nach Implementierung muss geprüft werden:

- [ ] Device Picker zeigt nur Home Connect Devices
- [ ] Auto-Discovery erkennt min. 10 Standard-Entitäten bei Bosch Waschmaschine
- [ ] Setup-Message wird korrekt angezeigt/versteckt
- [ ] Manuelle YAML-Config überschreibt Auto-Discovery
- [ ] Alle 4 Sprachen haben Setup-Strings
- [ ] Console Warnings bei fehlenden essentiellen Entitäten
- [ ] Backward Compatibility: Bestehende YAML-Configs funktionieren unverändert

---

## COMMIT MESSAGE

```
feat(hc): add visual editor device picker with auto-discovery

- Add device selector to visual editor for Home Connect mode
- Implement _autoDiscoverEntities() for automatic entity mapping
- Add setup message UI for first-time configuration
- Support washer and dishwasher entity patterns
- Add localization strings (EN, DE, RU, FR) for setup flow

Users can now select a Home Connect device in the visual editor
and all entities are automatically detected and mapped, eliminating
the need for manual YAML configuration.

Closes #XX
```

---

## ABHÄNGIGKEITEN

**Voraussetzungen:**
- Home Connect Integration muss in Home Assistant installiert sein
- Phase 0-10 müssen implementiert sein (Entity Mapping, Service Calls, etc.)

**Optional:**
- Area-Namen für bessere Device-Beschriftungen im Picker

---

## FILE SIZE IMPACT

**Geschätzte Zeilen:**
- `_autoDiscoverEntities()`: ~80 Zeilen
- `_renderSetupMessage()`: ~30 Zeilen
- Setup CSS: ~40 Zeilen
- Localization Strings: ~20 Zeilen (alle Sprachen)
- Visual Editor Schema: ~15 Zeilen
- setConfig Erweiterung: ~20 Zeilen

**Total:** ~205 Zeilen zusätzlich

**Neue File Size:** ~4,485 Zeilen (aktuell 4,280)

---

**Ende der Anweisung**
