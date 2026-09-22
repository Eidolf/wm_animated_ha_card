/**
 * Washing Machine Animated Card for Home Assistant
 * ================================================
 * An Oikos-style Lovelace card for a "dumb" appliance on a smart plug:
 * animated illustration (washer / dryer / dishwasher / oven / microwave), live status,
 * power gauge and last-cycle stats.
 *
 * https://github.com/sionetta/wm_animated_ha_card
 * License: MIT
 * Version: 1.3.0
 *
 * UI languages: en, ru, de, fr (auto-detected from Home Assistant, or set `language:`).
 * Appliances: washer, dryer, dishwasher, oven, microwave (`appliance_type:`).
 * Theme: follows the Home Assistant theme automatically (`theme: auto | light | dark`),
 * or `theme: ha` to adopt the colours of your active Home Assistant theme.
 *
 * Install:
 *   1. Copy to /config/www/washing-machine-card.js
 *   2. Add a dashboard resource:
 *        url: /local/washing-machine-card.js?v=5
 *        type: module
 *   3. Add the card — full example at the bottom of this file.
 *
 * Every entity option except status_entity is optional — blocks without
 * an entity are simply hidden.
 */

class WashingMachineCard extends HTMLElement {
    static APPLIANCE_TYPES = ["washer", "dryer", "dishwasher", "oven", "microwave"];

    static STRINGS = {
        en: {
            name: "Washing machine",
            badge_running: "RUNNING", badge_idle: "IDLE", badge_off: "OFF", badge_nodata: "NO DATA",
            badge_finished: "FINISHED", badge_paused: "PAUSED", badge_ready: "READY",
            badge_delayed: "DELAYED", badge_error: "ERROR", badge_action_required: "ACTION REQ.",
            state_running: "Washing", state_idle: "Idle", state_off: "Off", state_nodata: "No data",
            state_finished: "Finished", state_paused: "Paused", state_ready: "Ready",
            state_delayed: "Delayed start", state_error: "Error", state_action_required: "Action required",
            ring_running: "ELAPSED", ring_remaining: "REMAINING", ring_idle: "IDLE", ring_off: "OFF",
            ring_ready: "READY", ring_paused: "PAUSED",
            power: "Current power", current: "Current draw",
            last_cycle: "LAST CYCLE", start: "START", duration: "DURATION",
            energy: "ENERGY", cost: "COST",
            min: "min", kwh: "kWh", kw: "kW",
            today: "Today", yesterday: "Yesterday",
            tip_notify: "Finish notification", tip_plug: "Machine plug", tip_history: "History",
            confirm_plug_off: "Turn off the plug? This may interrupt the current cycle.",
            confirm_power_off: "Turn off appliance? This will stop the current program.",
            remote_control_required: "Remote control must be enabled on the appliance.\nPlease enable remote control using the appliance controls.",
            program_selection_failed: "Failed to select program. Check that remote control is enabled.",
            service_call_failed: "Action failed. Please try again.",
            select_program: "Select Program",
            close: "Close",
            tip_program_btn: "Select Program",
            tip_power_btn: "Power",
            tip_start_btn: "Start / Pause",
            options_title: "Options & Settings",
            tip_options_btn: "Options & Settings",
            temperature: "Temperature",
            spin_speed: "Spin Speed",
            child_lock: "Child Lock",
            hygiene_plus: "Hygiene Plus",
            intensive_zone: "Intensive Zone",
            variospeed_plus: "VarioSpeed Plus",
            silence_on_demand: "Silence on Demand",
            brilliant_dry: "BrilliantDry",
            no_options_available: "No options available",
            connected: "Connected",
            disconnected: "Offline",
            active_program: "Program",
            salt_low: "Salt Low",
            rinseaid_low: "Rinse Aid Low",
            setup_title: "Home Connect Setup",
            setup_message: "Please select your Home Connect device in the card settings.",
            setup_step1: "Click the pencil icon to edit this card",
            setup_step2: "Select your Home Connect device from the dropdown",
            setup_step3: "Choose appliance type (Washer or Dishwasher)",
            setup_step4: "Save - entities will be detected automatically",
            remote_start_required: "Remote start must be activated on the appliance",
            door_must_be_closed: "Please close the door",
            decimal: ".",
            types: {
                washer:     { name: "Washing machine",  state_running: "Washing" },
                dryer:      { name: "Dryer",            state_running: "Drying" },
                dishwasher: { name: "Dishwasher",       state_running: "Washing dishes" },
                oven:       { name: "Oven",             state_running: "Baking" },
                microwave:  { name: "Microwave",        state_running: "Heating" },
            },
            programs: {
                // Washer
                Cotton: "Cotton",
                EasyCare: "Easy Care",
                DelicatesSilk: "Delicates / Silk",
                Wool: "Wool",
                Sportswear: "Sportswear",
                Quick45: "Quick 45",
                Mix: "Mix",
                Spin: "Spin",
                Rinse: "Rinse",
                Eco50: "Eco 50°",
                Intensiv70: "Intensive 70°",
                Auto: "Auto",
                Kurz60: "Short 60",
                MachineCare: "Machine Care",
                NightWash: "Night Wash",
                OutdoorSports: "Outdoor Sports",
                Shirts: "Shirts",
                Towels: "Towels",
                DrumClean: "Drum Clean",
                // Dishwasher
                Auto1: "Auto",
                Auto2: "Auto Intensive",
                Auto3: "Auto Quick",
                Eco50dw: "Eco 50°",
                Intensiv70dw: "Intensive 70°",
                PreRinse: "Pre-Rinse",
                Glass40: "Delicate / Glass 40°",
                Quick45dw: "Quick 45°",
                Quick65: "Quick 65°",
                NightWashdw: "Night Wash",
                MachineCaredw: "Machine Care",
                Kurz60dw: "Short 60",
            },
        },
        ru: {
            name: "Стиральная машина",
            badge_running: "В РАБОТЕ", badge_idle: "ОЖИДАНИЕ", badge_off: "ВЫКЛ", badge_nodata: "НЕТ ДАННЫХ",
            badge_finished: "ЗАВЕРШЕНО", badge_paused: "НА ПАУЗЕ", badge_ready: "ГОТОВО",
            badge_delayed: "ОТЛОЖЕН", badge_error: "ОШИБКА", badge_action_required: "ТРЕБУЕТСЯ ДЕЙСТВИЕ",
            state_running: "Идёт стирка", state_idle: "Ожидание", state_off: "Выключено", state_nodata: "Нет данных",
            state_finished: "Завершено", state_paused: "На паузе", state_ready: "Готово",
            state_delayed: "Отложенный старт", state_error: "Ошибка", state_action_required: "Требуется действие",
            ring_running: "ПРОШЛО", ring_remaining: "ОСТАЛОСЬ", ring_idle: "ОЖИДАНИЕ", ring_off: "ВЫКЛ",
            ring_ready: "ГОТОВО", ring_paused: "ПАУЗА",
            power: "Текущая мощность", current: "Текущий ток",
            last_cycle: "ПОСЛЕДНИЙ ЦИКЛ", start: "СТАРТ", duration: "ДЛИТЕЛЬН.",
            energy: "РАСХОД", cost: "СТОИМОСТЬ",
            min: "мин", kwh: "кВт·ч", kw: "кВт",
            today: "Сегодня", yesterday: "Вчера",
            tip_notify: "Уведомление об окончании", tip_plug: "Розетка машины", tip_history: "История",
            confirm_plug_off: "Выключить розетку? Это может прервать текущий цикл.",
            confirm_power_off: "Выключить прибор? Текущая программа будет остановлена.",
            remote_control_required: "На приборе должно быть включено дистанционное управление.\nВключите его с помощью элементов управления прибора.",
            program_selection_failed: "Не удалось выбрать программу. Проверьте, включено ли дистанционное управление.",
            service_call_failed: "Действие не выполнено. Попробуйте ещё раз.",
            select_program: "Выбрать программу",
            close: "Закрыть",
            tip_program_btn: "Выбрать программу",
            tip_power_btn: "Питание",
            tip_start_btn: "Старт / Пауза",
            options_title: "Опции и настройки",
            tip_options_btn: "Опции и настройки",
            temperature: "Температура",
            spin_speed: "Скорость отжима",
            child_lock: "Защита от детей",
            hygiene_plus: "Гигиена плюс",
            intensive_zone: "Интенсивная зона",
            variospeed_plus: "VarioSpeed Plus",
            silence_on_demand: "Тихий режим",
            brilliant_dry: "Экстра сушка",
            no_options_available: "Нет доступных опций",
            connected: "Подключено",
            disconnected: "Не в сети",
            active_program: "Программа",
            salt_low: "Соль заканчивается",
            rinseaid_low: "Ополаскиватель заканчивается",
            setup_title: "Настройка Home Connect",
            setup_message: "Пожалуйста, выберите ваше устройство Home Connect в настройках карточки.",
            setup_step1: "Нажмите на иконку карандаша для редактирования карточки",
            setup_step2: "Выберите ваше устройство Home Connect из выпадающего списка",
            setup_step3: "Выберите тип устройства (Стиральная машина или Посудомоечная машина)",
            setup_step4: "Сохраните - объекты будут обнаружены автоматически",
            remote_start_required: "Необходимо активировать удалённый запуск на устройстве",
            door_must_be_closed: "Пожалуйста, закройте дверцу",
            decimal: ",",
            types: {
                washer:     { name: "Стиральная машина", state_running: "Идёт стирка" },
                dryer:      { name: "Сушилка",           state_running: "Сушка" },
                dishwasher: { name: "Посудомойка",       state_running: "Моет посуду" },
                oven:       { name: "Духовка",           state_running: "Выпечка" },
                microwave:  { name: "Микроволновка",     state_running: "Разогрев" },
            },
            programs: {
                Cotton: "Хлопок",
                EasyCare: "Лёгкий уход",
                DelicatesSilk: "Деликатные / Шёлк",
                Wool: "Шерсть",
                Sportswear: "Спортивная одежда",
                Quick45: "Быстрая 45",
                Mix: "Смешанное",
                Spin: "Отжим",
                Rinse: "Полоскание",
                Eco50: "Эко 50°",
                Intensiv70: "Интенсивная 70°",
                Auto: "Авто",
                Kurz60: "Быстрая 60",
                MachineCare: "Уход за машиной",
                NightWash: "Ночная стирка",
                OutdoorSports: "Уличная одежда",
                Shirts: "Рубашки",
                Towels: "Полотенца",
                DrumClean: "Очистка барабана",
                Auto1: "Авто",
                Auto2: "Авто интенсивный",
                Auto3: "Авто быстрый",
                Eco50dw: "Эко 50°",
                Intensiv70dw: "Интенсивный 70°",
                PreRinse: "Предварительное полоскание",
                Glass40: "Стекло 40°",
                Quick45dw: "Быстрая 45°",
                Quick65: "Быстрая 65°",
                NightWashdw: "Ночная мойка",
                MachineCaredw: "Уход за машиной",
                Kurz60dw: "Быстрая 60",
            },
        },
        de: {
            name: "Waschmaschine",
            badge_running: "LÄUFT", badge_idle: "BEREIT", badge_off: "AUS", badge_nodata: "KEINE DATEN",
            badge_finished: "FERTIG", badge_paused: "PAUSIERT", badge_ready: "BEREIT",
            badge_delayed: "VERZÖGERT", badge_error: "FEHLER", badge_action_required: "AKTION ERF.",
            state_running: "Läuft", state_idle: "Bereit", state_off: "Aus", state_nodata: "Keine Daten",
            state_finished: "Fertig", state_paused: "Pausiert", state_ready: "Bereit",
            state_delayed: "Verzögerter Start", state_error: "Fehler", state_action_required: "Aktion erforderlich",
            ring_running: "VERGANGEN", ring_remaining: "VERBLEIBEND", ring_idle: "BEREIT", ring_off: "AUS",
            ring_ready: "BEREIT", ring_paused: "PAUSE",
            power: "Aktuelle Leistung", current: "Stromaufnahme",
            last_cycle: "LETZTER DURCHGANG", start: "START", duration: "DAUER",
            energy: "VERBRAUCH", cost: "KOSTEN",
            min: "Min", kwh: "kWh", kw: "kW",
            today: "Heute", yesterday: "Gestern",
            tip_notify: "Benachrichtigung bei Ende", tip_plug: "Steckdose der Maschine", tip_history: "Verlauf",
            confirm_plug_off: "Steckdose ausschalten? Der laufende Durchgang könnte dadurch unterbrochen werden.",
            confirm_power_off: "Gerät ausschalten? Das aktuelle Programm wird gestoppt.",
            remote_control_required: "Die Fernsteuerung muss am Gerät aktiviert sein.\nBitte aktivieren Sie die Fernsteuerung über die Gerätebedienung.",
            program_selection_failed: "Programm konnte nicht gewählt werden. Prüfen Sie, ob die Fernsteuerung aktiv ist.",
            service_call_failed: "Aktion fehlgeschlagen. Bitte erneut versuchen.",
            select_program: "Programm wählen",
            close: "Schließen",
            tip_program_btn: "Programm wählen",
            tip_power_btn: "Ein/Aus",
            tip_start_btn: "Start / Pause",
            options_title: "Optionen & Einstellungen",
            tip_options_btn: "Optionen & Einstellungen",
            temperature: "Temperatur",
            spin_speed: "Schleuderdrehzahl",
            child_lock: "Kindersicherung",
            hygiene_plus: "HygienePlus",
            intensive_zone: "IntensivZone",
            variospeed_plus: "VarioSpeed Plus",
            silence_on_demand: "Silence on Demand",
            brilliant_dry: "BrilliantDry",
            no_options_available: "Keine Optionen verfügbar",
            connected: "Verbunden",
            disconnected: "Offline",
            active_program: "Programm",
            salt_low: "Salz leer",
            rinseaid_low: "Klarspüler leer",
            setup_title: "Home Connect Einrichtung",
            setup_message: "Bitte wählen Sie Ihr Home Connect Gerät in den Karteneinstellungen.",
            setup_step1: "Klicken Sie auf das Stift-Symbol um die Karte zu bearbeiten",
            setup_step2: "Wählen Sie Ihr Home Connect Gerät aus der Dropdown-Liste",
            setup_step3: "Wählen Sie den Gerätetyp (Waschmaschine oder Geschirrspüler)",
            setup_step4: "Speichern - Entitäten werden automatisch erkannt",
            remote_start_required: "Fernstart muss am Gerät aktiviert werden",
            door_must_be_closed: "Bitte Tür schließen",
            decimal: ",",
            types: {
                washer:     { name: "Waschmaschine",  state_running: "Wäsche läuft" },
                dryer:      { name: "Tumbler",         state_running: "Trocknet" },
                dishwasher: { name: "Geschirrspüler", state_running: "Spült" },
                oven:       { name: "Backofen",        state_running: "Backt" },
                microwave:  { name: "Mikrowelle",      state_running: "Erwärmt" },
            },
            programs: {
                Cotton: "Baumwolle",
                EasyCare: "Pflegeleicht",
                DelicatesSilk: "Fein / Seide",
                Wool: "Wolle",
                Sportswear: "Sportbekleidung",
                Quick45: "Schnell 45",
                Mix: "Gemischt",
                Spin: "Schleudern",
                Rinse: "Spülen",
                Eco50: "Eco 50°",
                Intensiv70: "Intensiv 70°",
                Auto: "Auto",
                Kurz60: "Kurz 60",
                MachineCare: "Maschinenpflege",
                NightWash: "Nachtwaschen",
                OutdoorSports: "Outdoor",
                Shirts: "Hemden",
                Towels: "Handtücher",
                DrumClean: "Trommelreinigung",
                Auto1: "Auto",
                Auto2: "Auto Intensiv",
                Auto3: "Auto Schnell",
                Eco50dw: "Eco 50°",
                Intensiv70dw: "Intensiv 70°",
                PreRinse: "Vorspülen",
                Glass40: "Glas 40°",
                Quick45dw: "Schnell 45°",
                Quick65: "Schnell 65°",
                NightWashdw: "Nachtspülen",
                MachineCaredw: "Maschinenpflege",
                Kurz60dw: "Kurz 60",
            },
        },
        fr: {
            name: "Lave-linge",
            badge_running: "EN MARCHE", badge_idle: "EN PAUSE", badge_off: "ÉTEINT", badge_nodata: "PAS DE DONNÉES",
            badge_finished: "TERMINÉ", badge_paused: "EN PAUSE", badge_ready: "PRÊT",
            badge_delayed: "DIFFÉRÉ", badge_error: "ERREUR", badge_action_required: "ACTION REQ.",
            state_running: "Lavage en cours", state_idle: "En pause", state_off: "Éteint", state_nodata: "Pas de données",
            state_finished: "Terminé", state_paused: "En pause", state_ready: "Prêt",
            state_delayed: "Départ différé", state_error: "Erreur", state_action_required: "Action requise",
            ring_running: "ÉCOULÉ", ring_remaining: "RESTANT", ring_idle: "PAUSE", ring_off: "ÉTEINT",
            ring_ready: "PRÊT", ring_paused: "PAUSE",
            power: "Puissance actuelle", current: "Courant instantané",
            last_cycle: "DERNIER CYCLE", start: "DÉPART", duration: "DURÉE",
            energy: "ÉNERGIE", cost: "COÛT",
            min: "min", kwh: "kWh", kw: "kW",
            today: "Aujourd'hui", yesterday: "Hier",
            tip_notify: "Notification de fin", tip_plug: "Prise machine", tip_history: "Historique",
            confirm_plug_off: "Éteindre la prise ? Cela peut interrompre le cycle en cours.",
            confirm_power_off: "Éteindre l'appareil ? Le programme en cours sera arrêté.",
            remote_control_required: "La commande à distance doit être activée sur l'appareil.\nVeuillez l'activer via les commandes de l'appareil.",
            program_selection_failed: "Impossible de sélectionner le programme. Vérifiez que la commande à distance est activée.",
            service_call_failed: "Action échouée. Veuillez réessayer.",
            select_program: "Choisir un programme",
            close: "Fermer",
            tip_program_btn: "Choisir un programme",
            tip_power_btn: "Marche/Arrêt",
            tip_start_btn: "Démarrer / Pause",
            options_title: "Options & Réglages",
            tip_options_btn: "Options & Réglages",
            temperature: "Température",
            spin_speed: "Vitesse d'essorage",
            child_lock: "Sécurité enfants",
            hygiene_plus: "Hygiène Plus",
            intensive_zone: "Zone intensive",
            variospeed_plus: "VarioSpeed Plus",
            silence_on_demand: "Silence à la demande",
            brilliant_dry: "Séchage brillant",
            no_options_available: "Aucune option disponible",
            connected: "Connecté",
            disconnected: "Hors ligne",
            active_program: "Programme",
            salt_low: "Sel bas",
            rinseaid_low: "Liquide de rinçage bas",
            setup_title: "Configuration Home Connect",
            setup_message: "Veuillez sélectionner votre appareil Home Connect dans les paramètres de la carte.",
            setup_step1: "Cliquez sur l'icône crayon pour modifier cette carte",
            setup_step2: "Sélectionnez votre appareil Home Connect dans la liste déroulante",
            setup_step3: "Choisissez le type d'appareil (Lave-linge ou Lave-vaisselle)",
            setup_step4: "Enregistrez - les entités seront détectées automatiquement",
            remote_start_required: "Le démarrage à distance doit être activé sur l'appareil",
            door_must_be_closed: "Veuillez fermer la porte",
            decimal: ",",
            types: {
                washer:     { name: "Lave-linge",      state_running: "Lavage en cours" },
                dryer:      { name: "Sèche-linge",     state_running: "Séchage en cours" },
                dishwasher: { name: "Lave-vaisselle",  state_running: "Lavage vaisselle" },
                oven:       { name: "Four",             state_running: "Cuisson" },
                microwave:  { name: "Micro-ondes",     state_running: "Chauffage" },
            },
            programs: {
                Cotton: "Coton",
                EasyCare: "Entretien facile",
                DelicatesSilk: "Délicat / Soie",
                Wool: "Laine",
                Sportswear: "Sportswear",
                Quick45: "Rapide 45",
                Mix: "Mixte",
                Spin: "Essorage",
                Rinse: "Rinçage",
                Eco50: "Éco 50°",
                Intensiv70: "Intensif 70°",
                Auto: "Auto",
                Kurz60: "Court 60",
                MachineCare: "Entretien machine",
                NightWash: "Lavage nuit",
                OutdoorSports: "Outdoor",
                Shirts: "Chemises",
                Towels: "Serviettes",
                DrumClean: "Nettoyage tambour",
                Auto1: "Auto",
                Auto2: "Auto intensif",
                Auto3: "Auto rapide",
                Eco50dw: "Éco 50°",
                Intensiv70dw: "Intensif 70°",
                PreRinse: "Pré-rinçage",
                Glass40: "Verre 40°",
                Quick45dw: "Rapide 45°",
                Quick65: "Rapide 65°",
                NightWashdw: "Lavage nuit",
                MachineCaredw: "Entretien machine",
                Kurz60dw: "Court 60",
            },
        },
    };

    static DEFAULTS = {
        appliance_type: "washer",
        language: "auto",
        theme: "auto",
        currency: "€",
		running_states: [
			// English
			"washing", "running", "run", "wash", "on", "spin", "rinse",
			"drying", "dry", "tumble",
			"baking", "bake", "cooking", "cook", "heating", "heat", "microwave", "oven",
			// Russian
			"стирка", "отжим", "полоскание",
			// German
			"waschen", "läuft", "schleudern", "spülen", "trocknen",
			"backen", "heizen", "erwärmen",
			// French
			"lavage", "en cours", "essorage", "rincage", "rinçage",
			"cuisson", "chauffage",
		],
        power_threshold: 10,
        power_max: 2500,
        hide_status_panel: false,
        confirm_plug_off: true,
        duration_format: "minutes",
        mode: "standard",
        home_connect: null,
    };

    static normalizeType(value) {
        const raw = String(value || "washer").toLowerCase().trim();
        if (raw === "tumbler" || raw === "tumble_dryer" || raw === "tumble-dryer")
            return "dryer";
        if (raw === "washing_machine" || raw === "washing-machine")
            return "washer";
        if (raw === "backofen" || raw === "bakeoven" || raw === "bake-oven")
            return "oven";
        if (raw === "mikrowelle" || raw === "micro-wave" || raw === "micro_wave")
            return "microwave";
        if (WashingMachineCard.APPLIANCE_TYPES.includes(raw))
            return raw;
        return "washer";
    }

    static detectLanguage(hass) {
        const S = WashingMachineCard.STRINGS;
        const haLang = String(hass?.locale?.language || hass?.language || "en").toLowerCase();
        if (S[haLang])
            return haLang;
        const short = haLang.split(/[-_]/)[0];
        if (S[short])
            return short;
        return "en";
    }

    static languageDisplayName(code) {
        try {
            const dn = new Intl.DisplayNames([code], {
                type: "language"
            });
            const name = dn.of(code);
            if (name)
                return name.charAt(0).toUpperCase() + name.slice(1);
        } catch (e) {
            // Intl.DisplayNames unsupported, or code not recognized — fall through.
        }
        return code.toUpperCase();
    }

    /**
     * Auto-discover Home Connect entities from device
     * Scans all entities belonging to a device and maps them to config keys
     * 
     * @param {string} deviceId - Home Assistant device ID
     * @returns {object|null} Auto-generated home_connect config or null
     */
    _autoDiscoverEntities(deviceId) {
        if (!this._hass || !deviceId) return null;

        const applianceType = this._config?.appliance_type || 'washer';
        const entities = {};

        // Get all entities for this device
        const states = this._hass.states ? Object.values(this._hass.states) : [];

        // Debug: Log available hass structure
        console.log('Auto-discovery debug:', {
            deviceId,
            hasEntities: !!this._hass.entities,
            hasDevices: !!this._hass.devices,
            entityCount: states.length,
            sampleEntity: states[0]?.entity_id
        });

        const deviceEntities = states.filter(entity => {
            if (!entity?.entity_id) return false;

            // Try multiple ways to find device_id
            let regDeviceId = null;

            // Method 1: entity registry in hass.entities
            if (this._hass.entities && this._hass.entities[entity.entity_id]) {
                regDeviceId = this._hass.entities[entity.entity_id].device_id;
            }

            // Method 2: devices registry lookup
            if (!regDeviceId && this._hass.devices && this._hass.devices[deviceId]) {
                if (this._hass.devices[deviceId].entities &&
                    this._hass.devices[deviceId].entities.includes(entity.entity_id)) {
                    regDeviceId = deviceId;
                }
            }

            // Method 3: entity.attributes.device_id
            if (!regDeviceId && entity.attributes?.device_id) {
                regDeviceId = entity.attributes.device_id;
            }

            // Method 4: direct entity.device_id
            if (!regDeviceId && entity.device_id) {
                regDeviceId = entity.device_id;
            }

            const matches = regDeviceId === deviceId;
            if (matches) {
                console.log('Matched entity:', entity.entity_id);
            }

            return matches;
        });

        // Entity pattern mapping for Washer (English and German)
        const washerPatterns = {
            // Status entities
            'operation_state_entity': /_(operation_state|betriebszustand)$/,
            'active_program_entity': /_(active_program|aktives_programm)$/,
            'selected_program_entity': /_(selected_program|ausgewahltes_programm)$/,
            'progress_entity': /_(program|programm)_(progress|fortschritt)$/,
            'remaining_time_entity': /_(remaining|verbleibende)(_program)?_(time|zeit)$/,
            'end_time_entity': /_(finish_time|end_time|programm_endzeit)$/,

            // Control entities
            'power_entity': /_(power|einschalter)$/,
            'remote_control_entity': /_(remote_control|fernsteuerung)$/,
            'remote_start_entity': /_(remote_start|fernstart)$/,
            'active_program_entity': /_(active_program|aktives_programm)$/,
            'selected_program_entity': /_(selected_program|ausgewahltes_programm)$/,
            'program_selector_entity': /_(selected_program|ausgewahltes_programm)$/,

            // Options
            'temperature_entity': /_(temperature|temperatur)$/,
            'spin_speed_entity': /_(spin_speed|schleuderdrehzahl)$/,

            // Door & Safety
            'door_entity': /_(door|tur)$/,
            'child_lock_entity': /_(child_lock|kindersicherung)$/,

            // Connectivity
            'connectivity_entity': /_(connection_state|konnektivitat)$/,
            'local_control_entity': /_(local_control|lokale_steuerung)$/,

            // i-Dos (Bosch/Siemens)
            'idos1_active_entity': /_(idos1_dosing_active|i_dos_1_aktiv)$/,
            'idos1_level_entity': /_(idos1_fill_level|i_dos_1_basisstufe|i_dos_1_fullstand)$/,
            'idos2_active_entity': /_(idos2_dosing_active|i_dos_2_aktiv)$/,
            'idos2_level_entity': /_(idos2_fill_level|i_dos_2_basisstufe|i_dos_2_fullstand)$/,
            'idos1_low_entity': /_(idos1_low_fill|niedriger_fullstand_von_i_dos_1)$/,
            'idos2_low_entity': /_(idos2_low_fill|niedriger_fullstand_von_i_dos_2)$/,

            // Features
            'hygiene_plus_entity': /_hygiene_plus$/,
            'prewash_entity': /_(prewash|vorwasche)$/,
            'extra_rinse_entity': /_(extra_rinse|extra_spulen)$/,
            'vario_speed_entity': /_(vario_speed|speed_perfect)$/,
            'silence_entity': /_(silence|quiet|leise)$/,
        };

        // Entity pattern mapping for Dishwasher (English and German)
        const dishwasherPatterns = {
            // Status entities (same as washer)
            'operation_state_entity': /_(operation_state|betriebszustand)$/,
            'active_program_entity': /_(active_program|aktives_programm)$/,
            'selected_program_entity': /_(selected_program|ausgewahltes_programm)$/,
            'progress_entity': /_(program|programm)_(progress|fortschritt)$/,
            'remaining_time_entity': /_(remaining|verbleibende)(_program)?_(time|zeit)$/,
            'end_time_entity': /_(finish_time|end_time|programm_endzeit)$/,

            // Control entities
            'power_entity': /_(power|einschalter)$/,
            'remote_control_entity': /_(remote_control|fernsteuerung)$/,
            'remote_start_entity': /_(remote_start|fernstart)$/,
            'active_program_entity': /_(active_program|aktives_programm)$/,
            'selected_program_entity': /_(selected_program|ausgewahltes_programm)$/,
            'program_selector_entity': /_(selected_program|ausgewahltes_programm)$/,

            // Door
            'door_entity': /_(door|tur)$/,

            // Connectivity
            'connectivity_entity': /_(connection_state|konnektivitat)$/,
            'local_control_entity': /_(local_control|lokale_steuerung)$/,

            // Consumables (dishwasher-specific)
            'salt_low_entity': /_(salt_low|salz_niedrig)$/,
            'rinse_aid_low_entity': /_(rinse_aid_low|rinseaid_low|klarspuler_niedrig)$/,

            // Features
            'hygiene_plus_entity': /_hygiene_plus$/,
            'intensive_zone_entity': /_(intensive_zone|extra_dry|intensiv_zone|extra_trocken)$/,
            'vario_speed_entity': /_(vario_speed|speed_perfect)$/,
            'silence_entity': /_(silence|quiet|leise)$/,
            'brilliant_dry_entity': /_(brilliant_dry|glanzen_trocken)$/,
            'extra_dry_entity': /_(extra_dry|extra_trocken)$/,
            'half_load_entity': /_(half_load|halbe_beladung)$/,
        };

        const patterns = applianceType === 'dishwasher' ? dishwasherPatterns : washerPatterns;

        console.log('Auto-discovery: Found', deviceEntities.length, 'entities for device', deviceId);
        console.log('Entity IDs:', deviceEntities.map(e => e.entity_id));

        // Match entities to patterns
        deviceEntities.forEach(entity => {
            const entityId = entity.entity_id;

            for (const [configKey, pattern] of Object.entries(patterns)) {
                if (pattern.test(entityId)) {
                    if (!entities[configKey]) {
                        entities[configKey] = entityId;
                        console.log('Mapped', entityId, 'to', configKey);
                    }
                    break; // First match wins
                }
            }
        });

        console.log('Auto-discovery result:', entities);

        // Ensure program_selector_entity is set from selected_program_entity if not already set
        if (!entities.program_selector_entity && entities.selected_program_entity) {
            entities.program_selector_entity = entities.selected_program_entity;
            console.log('Auto-discovery: Set program_selector_entity from selected_program_entity');
        }

        // Return config object if we found essential entities
        const hasEssentials = entities.operation_state_entity || entities.power_entity;
        if (!hasEssentials) {
            console.warn('Auto-discovery: No essential Home Connect entities found');
            console.warn('Found entities:', Object.keys(entities));
            return null;
        }

        return entities;
    }

    setConfig(config) {
        if (!config) {
            throw new Error('washing-machine-card: Invalid configuration');
        }

        const mode = config.mode || "standard";
        if (mode !== "standard" && mode !== "home_connect") {
            throw new Error(`washing-machine-card: Unsupported mode "${mode}"`);
        }
        if (mode === "standard") {
            if (!config.status_entity) {
                throw new Error("washing-machine-card: status_entity is required in standard mode");
            }
            this._showSetupMessage = false;
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

        this._config = {
            ...WashingMachineCard.DEFAULTS,
            ...config,
            appliance_type: WashingMachineCard.normalizeType(config.appliance_type),
        };
        this._uid = `a${Math.random().toString(36).slice(2, 9)}`;
        this._built = false;
    }

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

    getCardSize() {
        return 6;
    }

    static getConfigElement() {
        return document.createElement("washing-machine-card-editor");
    }

    static getStubConfig() {
        return {
            status_entity: "binary_sensor.washing_in_progress",
        };
    }

    _observeWidth() {
        if (this._ro || typeof ResizeObserver === "undefined")
            return;
        this._ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect?.width;
            if (!w || !this._built)
                return;
            const wrap = this._el("wrap");
            if (!wrap)
                return;
            wrap.classList.toggle("narrow", w <= 430);
            wrap.classList.toggle("xnarrow", w <= 320);
        });
        this._ro.observe(this);
    }

    connectedCallback() {
        this._observeWidth();
        if (this._timer)
            clearInterval(this._timer);
        this._timer = setInterval(() => {
            if (this._hass && this._built && this._applianceState() !== "off")
                this._update();
        }, 3000);
    }

    disconnectedCallback() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        if (this._ro) {
            this._ro.disconnect();
            this._ro = null;
        }
    }

    _getMode() {
        const mode = this._config?.mode;
        if (!mode || mode === "standard") return "standard";
        if (mode === "home_connect") return "home_connect";

        console.warn(`Unknown mode "${mode}", defaulting to standard`);
        return "standard";
    }

    _isHomeConnectMode() {
        return this._getMode() === "home_connect";
    }

    _isStandardMode() {
        return this._getMode() === "standard";
    }

    _getApplianceCapabilities() {
        const mode = this._getMode();
        const type = this._applianceType;

        if (mode === "standard") {
            return {
                mode: "standard",
                type: type,
                hasPrograms: false,
                hasDoor: false,
                hasInteractiveControls: false,
                hasConnectivity: false,
                hasOptions: false,
                hasFeatures: false,
                hasIDos: false,
                hasConsumables: false,
                hasRemoteControl: false,
                hasRemoteStart: false,
            };
        }

        // Home Connect mode
        const hc = this._config?.home_connect?.[type] || {};

        return {
            mode: "home_connect",
            type: type,
            hasPrograms: !!(hc.program_selector_entity || hc.active_program_entity),
            hasDoor: !!hc.door_entity,
            hasInteractiveControls: !!(hc.power_entity || hc.program_selector_entity),
            hasConnectivity: !!hc.connectivity_entity,
            hasOptions: !!(hc.temperature_entity || hc.spin_speed_entity),
            hasFeatures: this._hasAnyFeature(hc),
            hasIDos: this._hasIDos(hc),
            hasConsumables: !!(hc.salt_low_entity || hc.rinseaid_low_entity),
            hasRemoteControl: !!hc.remote_control_entity,
            hasRemoteStart: !!hc.remote_start_entity,
        };
    }

    _hasAnyFeature(hc) {
        return !!(
            hc?.hygiene_plus_entity ||
            hc?.intensive_zone_entity ||
            hc?.variospeed_plus_entity ||
            hc?.silence_on_demand_entity ||
            hc?.brilliant_dry_entity
        );
    }

    _hasIDos(hc) {
        return !!(
            hc?.idos1_active_entity ||
            hc?.idos2_active_entity ||
            hc?.idos1_level_entity ||
            hc?.idos2_level_entity
        );
    }

    get _applianceType() {
        return WashingMachineCard.normalizeType(this._config?.appliance_type);
    }

    get _t() {
        const S = WashingMachineCard.STRINGS;
        const cfg = this._config?.language;
        const isAuto = !cfg || cfg === WashingMachineCardEditor.AUTO_LANGUAGE;
        const lang = !isAuto && S[cfg] ? cfg : WashingMachineCard.detectLanguage(this._hass);
        const base = S[lang];
        const typeStrings = base.types?.[this._applianceType] || {};
        return {
            ...base,
            ...typeStrings,
            locale: this._hass?.locale?.language || lang
        };
    }

    _st(entityId) {
        return entityId ? this._hass?.states?.[entityId] : undefined;
    }

    /*
     * ============================================================
     * HOME CONNECT ENTITY CONFIGURATION REFERENCE
     * ============================================================
     * This section documents all supported Home Connect entities
     * for each appliance type. All entities are optional unless
     * marked as required.
     * ============================================================
     */

    /*
     * WASHER ENTITY CONFIGURATION
     * ===========================
     * 
     * Configuration structure:
     * ------------------------
     * home_connect:
     *   washer:
     *     # Status entities (what's happening)
     *     operation_state_entity: sensor.*_operation_state
     *       Values: Inactive, Ready, DelayedStart, Run, Pause,
     *               ActionRequired, Finished, Error, Aborting
     *     
     *     active_program_entity: sensor.*_active_program
     *       Currently running program name
     *     
     *     selected_program_entity: sensor.*_selected_program
     *       Program selected but not yet started
     *     
     *     progress_entity: sensor.*_program_progress
     *       Percentage complete (0-100)
     *     
     *     remaining_time_entity: sensor.*_remaining_time
     *       Time remaining (may be ISO duration PT1H30M)
     *     
     *     end_time_entity: sensor.*_program_finish_time
     *       Estimated completion datetime
     *     
     *     # Control entities (user actions)
     *     power_entity: switch.*_power
     *       Turn appliance on/off
     *     
     *     remote_start_entity: binary_sensor.*_remote_start
     *       Indicates if remote start is available
     *     
     *     remote_control_entity: binary_sensor.*_remote_control
     *       Indicates if remote control is enabled
     *     
     *     start_entity: switch.*_start_program (optional)
     *       Start program (if separate from remote_start)
     *     
     *     pause_entity: switch.*_pause_program (optional)
     *       Pause running program
     *     
     *     stop_entity: button.*_stop_program (optional)
     *       Stop/abort program
     *     
     *     # Program selection
     *     program_selector_entity: select.*_active_program
     *       Select program to run
     *     
     *     available_programs: [list] (optional)
     *       Filter/order programs shown in selection UI
     *       Example: ["Cotton", "EasyCare", "DelicatesSilk"]
     *       If omitted, shows all options from select entity
     *     
     *     # Options (washing parameters)
     *     temperature_entity: select.*_temperature
     *       Water temperature selection
     *     
     *     spin_speed_entity: select.*_spin_speed
     *       Spin speed selection
     *     
     *     # Safety & status
     *     door_entity: binary_sensor.*_door
     *       Door open/closed (on=open, off=closed)
     *     
     *     child_lock_entity: switch.*_child_lock
     *       Child lock on/off
     *     
     *     # Connectivity
     *     connectivity_entity: binary_sensor.*_connection_state
     *       Connected to cloud (on=connected, off=disconnected)
     *     
     *     local_control_entity: binary_sensor.*_local_control
     *       Local control active (may disable remote control)
     *     
     *     # i-Dos (Bosch/Siemens automatic dosing)
     *     idos1_active_entity: binary_sensor.*_idos1_dosing_active
     *       i-Dos 1 active for this cycle
     *     
     *     idos1_level_entity: sensor.*_idos1_fill_level
     *       i-Dos 1 fill level percentage
     *     
     *     idos2_active_entity: binary_sensor.*_idos2_dosing_active
     *       i-Dos 2 active for this cycle
     *     
     *     idos2_level_entity: sensor.*_idos2_fill_level
     *       i-Dos 2 fill level percentage
     *     
     *     idos1_low_entity: binary_sensor.*_idos1_low_fill
     *       i-Dos 1 needs refilling
     *     
     *     idos2_low_entity: binary_sensor.*_idos2_low_fill
     *       i-Dos 2 needs refilling
     * 
     * Example minimal configuration:
     * ------------------------------
     * home_connect:
     *   washer:
     *     operation_state_entity: sensor.washer_operation_state
     * 
     * Example full configuration:
     * --------------------------
     * See test-configs/04-hc-washer-full.yaml
     */

    /*
     * DISHWASHER ENTITY CONFIGURATION
     * ================================
     * 
     * Configuration structure:
     * ------------------------
     * home_connect:
     *   dishwasher:
     *     # Status entities
     *     operation_state_entity: sensor.*_operation_state
     *       Values: Inactive, Ready, DelayedStart, Run,
     *               Finished, Error, Aborting
     *     
     *     active_program_entity: sensor.*_active_program
     *       Currently running program name
     *     
     *     selected_program_entity: sensor.*_selected_program
     *       Program selected but not yet started
     *     
     *     progress_entity: sensor.*_program_progress
     *       Percentage complete (0-100)
     *     
     *     end_time_entity: sensor.*_finish_time
     *       Estimated completion datetime
     *     
     *     delayed_start_entity: sensor.*_delayed_start_time
     *       Scheduled start time for delayed start
     *     
     *     # Control entities
     *     power_entity: switch.*_power
     *       Turn appliance on/off
     *     
     *     remote_start_entity: binary_sensor.*_remote_start
     *       Indicates if remote start is available
     *     
     *     remote_control_entity: binary_sensor.*_remote_control
     *       Indicates if remote control is enabled
     *     
     *     stop_entity: button.*_stop_program
     *       Stop/abort program
     *     
     *     # Program selection
     *     program_selector_entity: select.*_active_program
     *       Select program to run
     *     
     *     available_programs: [list] (optional)
     *       Filter/order programs shown in selection UI
     *       Example: ["Auto1", "Eco50", "Intensiv70", "Quick45"]
     *     
     *     # Door
     *     door_entity: binary_sensor.*_door
     *       Door open/closed (on=open, off=closed)
     *     
     *     # Connectivity
     *     connectivity_entity: binary_sensor.*_connection_state
     *       Connected to cloud
     *     
     *     # Features (Bosch/Siemens specific options)
     *     hygiene_plus_entity: switch.*_hygiene_plus
     *       Extra hygiene mode
     *     
     *     intensive_zone_entity: switch.*_intensive_zone
     *       Intensive cleaning in bottom rack
     *     
     *     variospeed_plus_entity: switch.*_variospeed_plus
     *       Faster washing
     *     
     *     silence_on_demand_entity: switch.*_silence_on_demand
     *       Quiet mode
     *     
     *     brilliant_dry_entity: switch.*_brilliant_dry
     *       Enhanced drying
     *     
     *     # Consumables
     *     salt_low_entity: binary_sensor.*_salt_lack
     *       Salt needs refilling
     *     
     *     rinseaid_low_entity: binary_sensor.*_rinse_aid_lack
     *       Rinse aid needs refilling
     * 
     * Example minimal configuration:
     * ------------------------------
     * home_connect:
     *   dishwasher:
     *     operation_state_entity: sensor.dishwasher_operation_state
     * 
     * Example full configuration:
     * --------------------------
     * See test-configs/05-hc-dishwasher-full.yaml
     */

    /**
     * Home Connect Entity Accessor
     * ============================
     * Retrieves Home Connect entities from the nested home_connect configuration.
     * Returns undefined in standard mode.
     * 
     * @param {string} entityKey - Key from home_connect.{type} configuration
     * @returns {object|undefined} Entity state object or undefined
     */
    _hcEntity(entityKey) {
        if (!this._isHomeConnectMode()) return undefined;

        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type];
        if (!hc) return undefined;

        const entityId = hc[entityKey];
        return this._st(entityId);
    }

    // ========================================
    // HOME CONNECT CONVENIENCE ACCESSORS
    // ========================================
    // These methods provide quick access to commonly used Home Connect entities.
    // All return appropriate values or null when entity not configured.
    // ========================================

    /**
     * Get current operation state (Run, Pause, Ready, etc.)
     * @returns {string|null}
     */
    _getOperationState() {
        return this._hcEntity("operation_state_entity")?.state || null;
    }

    /**
     * Get active (running) program name
     * @returns {string|null}
     */
    _getActiveProgram() {
        return this._hcEntity("active_program_entity")?.state || null;
    }

    /**
     * Get selected (queued) program name
     * @returns {string|null}
     */
    _getSelectedProgram() {
        return this._hcEntity("selected_program_entity")?.state || null;
    }

    /**
     * Get door state (open/closed)
     * @returns {string|null} "open", "closed", or null
     */
    _getDoorState() {
        const door = this._hcEntity("door_entity");
        if (!door) return null;
        return door.state === "on" ? "open" : "closed";
    }

    /**
     * Get program progress percentage
     * @returns {number|null}
     */
    _getProgress() {
        const progress = this._hcEntity("progress_entity")?.state;
        if (progress === undefined || progress === null) return null;
        const val = parseFloat(progress);
        return isNaN(val) ? null : val;
    }

    /**
     * Get remaining time (may be ISO duration string)
     * @returns {string|null}
     */
    _getRemainingTime() {
        return this._hcEntity("remaining_time_entity")?.state || null;
    }

    /**
     * Get estimated end time (datetime)
     * @returns {string|null}
     */
    _getEndTime() {
        return this._hcEntity("end_time_entity")?.state || null;
    }

    /**
     * Get connectivity state
     * @returns {string|null} "connected", "disconnected", or null
     */
    _getConnectivityState() {
        const conn = this._hcEntity("connectivity_entity");
        if (!conn) return null;
        return conn.state === "on" ? "connected" : "disconnected";
    }

    /**
     * Get remote control enabled state
     * @returns {boolean}
     */
    _getRemoteControlState() {
        const rc = this._hcEntity("remote_control_entity");
        return rc?.state === "on";
    }

    /**
     * Get remote start enabled state
     * @returns {boolean}
     */
    _getRemoteStartState() {
        const rs = this._hcEntity("remote_start_entity");
        return rs?.state === "on";
    }

    /**
     * Get child lock state
     * @returns {boolean}
     */
    _getChildLockState() {
        const cl = this._hcEntity("child_lock_entity");
        return cl?.state === "on";
    }

    _computeApplianceState() {
        const mode = this._getMode();

        if (mode === "standard") {
            if (this._isRunning())
                return "running";
            const c = this._config;
            if (c.power_entity) {
                const p = parseFloat(this._st(c.power_entity)?.state);
                if (!isNaN(p) && p >= 1)
                    return "idle";
            }
            return "off";
        }

        // Home Connect mode
        const opState = this._getOperationState();
        if (!opState)
            return "unknown";

        const state = opState.toLowerCase();

        // Map Home Connect states to card states
        if (state === "run") return "running";
        if (state === "pause") return "paused";
        if (state === "ready") return "ready";
        if (state === "delayedstart") return "delayed";
        if (state === "finished") return "finished";
        if (state === "error") return "error";
        if (state === "actionrequired") return "action_required";
        if (state === "inactive") return "off";
        if (state === "aborting") return "aborting";

        return "idle";
    }

    _isRunning() {
        const mode = this._getMode();

        if (mode === "standard") {
            const c = this._config;
            const status = this._st(c.status_entity);
            const byStatus =
                status && c.running_states.includes(String(status.state).toLowerCase());
            let byPower = false;
            if (c.power_entity) {
                const p = parseFloat(this._st(c.power_entity)?.state);
                byPower = !isNaN(p) && p > c.power_threshold;
            }
            return byStatus || byPower;
        }

        // Home Connect mode
        return this._computeApplianceState() === "running";
    }

    _applianceState() {
        return this._computeApplianceState();
    }

    _parseDate(state) {
        if (!state || ["unknown", "unavailable", "none"].includes(String(state).toLowerCase()))
            return null;
        const d = new Date(String(state).replace(" ", "T"));
        return isNaN(d) ? null : d;
    }

    _hour12() {
      const tf = this._hass?.locale?.time_format; // "12" | "24" | "language" | "system"
      if (tf === "12") return true;
      if (tf === "24") return false;
    
      const testLocale = tf === "system" ? undefined : this._t.locale;
    
      return new Date(2023, 0, 1, 22, 0, 0)
        .toLocaleTimeString(testLocale)
        .includes("10");
    }

    _fmtDateTime(state) {
        const t = this._t;
        const d = this._parseDate(state);
        if (!d)
            return "—";
        const now = new Date();
        const sameDay = d.toDateString() === now.toDateString();
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        const time = d.toLocaleTimeString(t.locale, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: this._hour12(),
        });
        if (sameDay)
            return `${t.today}, ${time}`;
        if (d.toDateString() === yest.toDateString())
            return `${t.yesterday}, ${time}`;
        return d.toLocaleDateString(t.locale, {
            day: "numeric",
            month: "short"
        }) + `, ${time}`;
    }

    _fmtClock(fromDate) {
        const s = Math.max(0, Math.floor((Date.now() - fromDate.getTime()) / 1000));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return `${h}:${String(m).padStart(2, "0")}`;
    }

    _fmtNum(value, digits = 2) {
        const n = parseFloat(value);
        if (isNaN(n))
            return null;
        let s = n.toFixed(digits);
        if (digits > 0)
            s = s.replace(/0+$/, "").replace(/\.$/, "");
        return s.replace(".", this._t.decimal);
    }

    _fmtDuration(state) {
        const t = this._t;
        const n = parseFloat(state);
        if (isNaN(n))
            return null;
        if (this._config.duration_format === "hhmm" && n >= 60) {
            const h = Math.floor(n / 60);
            const m = Math.round(n % 60);
            return {
                value: `${h}h${String(m).padStart(2, "0")}`,
                unit: ""
            };
        }
        return {
            value: this._fmtNum(n, 0),
            unit: t.min
        };
    }

    _startDate() {
        const c = this._config;
        const status = this._st(c.status_entity);
        return (
            (c.last_wash_entity && this._parseDate(this._st(c.last_wash_entity)?.state)) ||
            (status && this._parseDate(status.last_changed)) ||
            null);
    }

    _moreInfo(entityId) {
        this.dispatchEvent(
            new CustomEvent("hass-more-info", {
                detail: {
                    entityId
                },
                bubbles: true,
                composed: true,
            }));
    }

    _toggle(entityId) {
        const domain = entityId.split(".")[0];
        const svcDomain = ["switch", "light", "input_boolean", "fan", "automation"].includes(domain)
         ? domain
         : "homeassistant";
        this._hass.callService(svcDomain, "toggle", {
            entity_id: entityId
        });
    }

    _confirmTogglePlug() {
        const c = this._config;
        const t = this._t;
        const isOn = this._st(c.plug_entity)?.state === "on";
        if (isOn && c.confirm_plug_off !== false && !window.confirm(t.confirm_plug_off))
            return;
        this._toggle(c.plug_entity);
    }

    /**
     * Base Service Call Method
     * ========================
     * Central method for all Home Assistant service calls.
     * Provides consistent error handling and logging.
     * 
     * @param {string} domain - Service domain (e.g., "switch", "select")
     * @param {string} service - Service name (e.g., "turn_on", "select_option")
     * @param {object} data - Service data (e.g., { entity_id: "...", option: "..." })
     * @returns {Promise} Service call promise
     */
    _callService(domain, service, data) {
        if (!this._hass) {
            console.warn(`Cannot call ${domain}.${service}: hass not available`);
            return Promise.reject(new Error("hass not available"));
        }

        console.log(`Calling service: ${domain}.${service}`, data);
        return this._hass.callService(domain, service, data);
    }

    // ========================================
    // SERVICE TYPE ABSTRACTIONS
    // ========================================
    // Wrapper methods for different Home Assistant service types.
    // Provide consistent interface for service calls with validation.
    // ========================================

    /**
     * Select an option from a select entity
     * Used for: program selection, temperature, spin speed
     * 
     * @param {string} entityId - Select entity ID
     * @param {string} option - Option to select
     * @returns {Promise}
     */
    _selectOption(entityId, option) {
        if (!entityId || !option) {
            console.warn("selectOption: missing entityId or option");
            return Promise.reject(new Error("Missing parameters"));
        }
        return this._callService("select", "select_option", {
            entity_id: entityId,
            option: option,
        });
    }

    /**
     * Set value on a number entity
     * Used for: numeric settings (rare in Home Connect)
     * 
     * @param {string} entityId - Number entity ID
     * @param {number} value - Value to set
     * @returns {Promise}
     */
    _setValue(entityId, value) {
        if (!entityId || value === undefined) {
            console.warn("setValue: missing entityId or value");
            return Promise.reject(new Error("Missing parameters"));
        }
        return this._callService("number", "set_value", {
            entity_id: entityId,
            value: value,
        });
    }

    /**
     * Press a button entity
     * Used for: stop program, machine care, etc.
     * 
     * @param {string} entityId - Button entity ID
     * @returns {Promise}
     */
    _pressButton(entityId) {
        if (!entityId) {
            console.warn("pressButton: missing entityId");
            return Promise.reject(new Error("Missing entityId"));
        }
        return this._callService("button", "press", {
            entity_id: entityId,
        });
    }

    /**
     * Turn on a switch entity
     * 
     * @param {string} entityId - Switch entity ID
     * @returns {Promise}
     */
    _turnOn(entityId) {
        if (!entityId) {
            console.warn("turnOn: missing entityId");
            return Promise.reject(new Error("Missing entityId"));
        }
        const domain = entityId.split(".")[0];
        return this._callService(domain, "turn_on", {
            entity_id: entityId,
        });
    }

    /**
     * Turn off a switch entity
     * 
     * @param {string} entityId - Switch entity ID
     * @returns {Promise}
     */
    _turnOff(entityId) {
        if (!entityId) {
            console.warn("turnOff: missing entityId");
            return Promise.reject(new Error("Missing entityId"));
        }
        const domain = entityId.split(".")[0];
        return this._callService(domain, "turn_off", {
            entity_id: entityId,
        });
    }

    // ========================================
    // HOME CONNECT ACTION METHODS
    // ========================================
    // High-level methods for common Home Connect actions.
    // These use the service abstractions above and add HC-specific logic.
    // ========================================

    // ----------------
    // POWER CONTROL
    // ----------------

    /**
     * Turn appliance power on
     * @returns {Promise|undefined}
     */
    _hcPowerOn() {
        if (!this._isHomeConnectMode()) return;

        const entity = this._hcEntity("power_entity");
        if (!entity) {
            console.warn("No power_entity configured");
            return;
        }

        return this._turnOn(entity.entity_id);
    }

    /**
     * Turn appliance power off
     * @returns {Promise|undefined}
     */
    _hcPowerOff() {
        if (!this._isHomeConnectMode()) return;

        const entity = this._hcEntity("power_entity");
        if (!entity) {
            console.warn("No power_entity configured");
            return;
        }

        return this._turnOff(entity.entity_id);
    }

    /**
     * Toggle appliance power with confirmation
     * Shows confirmation dialog when turning off
     * @returns {Promise|undefined}
     */
    _hcTogglePower() {
        if (!this._isHomeConnectMode()) return;

        const entity = this._hcEntity("power_entity");
        if (!entity) {
            console.warn("No power_entity configured");
            return;
        }

        if (entity.state === "on") {
            const t = this._t;
            const message = t.confirm_power_off ||
                           "Turn off appliance? This will stop the current program.";

            if (!window.confirm(message)) {
                return Promise.resolve();
            }

            return this._hcPowerOff();
        } else {
            return this._hcPowerOn();
        }
    }

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
        const msg = String(error?.message || '');
        if (msg.includes('Remote control')) {
            errorMessage = t.remote_control_required || 
                          'Remote control must be enabled on the appliance';
        } else if (msg.includes('Remote start')) {
            errorMessage = t.remote_start_required || 
                          'Remote start must be activated on the appliance display';
        } else if (msg.toLowerCase().includes('door')) {
            errorMessage = t.door_must_be_closed || 
                          'Door must be closed';
        }

        const timestamp = Date.now();
        // Store error state
        this._errorState = {
            message: errorMessage,
            timestamp: timestamp,
            action: action,
        };

        // Auto-clear error after 5 seconds
        setTimeout(() => {
            if (this._errorState && this._errorState.timestamp === timestamp) {
                this._errorState = null;
                this._update();
            }
        }, 5000);

        // Trigger card update to show error
        this._update();

        // Also log to console for debugging
        console.error(`Home Connect ${action} failed:`, error);
    }

    // ----------------
    // PROGRAM SELECTION
    // ----------------

    /**
     * Select a program to run
     * Validates remote control state before selection
     * 
     * @param {string} programName - Program name (e.g., "Cotton", "Eco50")
     * @returns {Promise|undefined}
     */
    _hcSelectProgram(programName) {
        if (!this._isHomeConnectMode()) return;

        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type];

        if (!hc?.program_selector_entity) {
            console.warn("No program_selector_entity configured");
            return;
        }

        if (!this._getRemoteControlState()) {
            const err = new Error("Remote control not enabled");
            this._handleServiceError(err, "select_program");
            const t = this._t;
            const message = t.remote_control_required ||
                           "Remote control must be enabled on the appliance.\n" +
                           "Please enable remote control using the appliance controls.";
            if (typeof alert === "function") {
                alert(message);
            }
            return Promise.reject(err);
        }

        return this._selectOption(hc.program_selector_entity, programName)
            .catch(error => {
                this._handleServiceError(error, "select_program");
                return Promise.reject(error);
            });
    }

    // ----------------
    // START / PAUSE / STOP
    // ----------------

    /**
     * Start the appliance program
     * Uses start_entity if configured, otherwise remote_start_entity
     * @returns {Promise|undefined}
     */
    _hcStart() {
        if (!this._isHomeConnectMode()) return;

        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type];

        const hasRemoteStart = !!this._hcEntity("remote_start_entity");
        if (hasRemoteStart && !this._getRemoteStartState()) {
            const err = new Error("Remote start not enabled");
            this._handleServiceError(err, "start_program");
            return Promise.reject(err);
        }

        let p;
        if (hc?.start_entity) {
            p = this._turnOn(hc.start_entity);
        } else if (hc?.remote_start_entity) {
            const entity = this._hcEntity("remote_start_entity");
            if (entity) {
                p = this._toggle(entity.entity_id);
            }
        }

        if (!p) {
            console.warn("No start_entity or remote_start_entity configured");
            return;
        }

        return p.catch(error => {
            this._handleServiceError(error, "start_program");
            return Promise.reject(error);
        });
    }

    /**
     * Pause the running program
     * @returns {Promise|undefined}
     */
    _hcPause() {
        if (!this._isHomeConnectMode()) return;

        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type];

        if (!hc?.pause_entity) {
            console.warn("No pause_entity configured");
            return;
        }

        return this._turnOn(hc.pause_entity)
            .catch(error => {
                this._handleServiceError(error, "pause_program");
                return Promise.reject(error);
            });
    }

    /**
     * Stop/abort the program
     * @returns {Promise|undefined}
     */
    _hcStop() {
        if (!this._isHomeConnectMode()) return;

        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type];

        if (!hc?.stop_entity) {
            console.warn("No stop_entity configured");
            return;
        }

        return this._pressButton(hc.stop_entity)
            .catch(error => {
                this._handleServiceError(error, "stop_program");
                return Promise.reject(error);
            });
    }

    /**
     * Intelligent start/pause toggle
     * - If running → pause
     * - If paused or ready → start
     * 
     * @returns {Promise|undefined}
     */
    _hcToggleStartPause() {
        if (!this._isHomeConnectMode()) return;

        const opState = this._getOperationState();
        if (!opState) {
            console.warn("Cannot determine operation state");
            return;
        }

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

        console.warn(`Cannot start/pause from state: ${opState}`);
        return;
    }

    /**
     * Show program selection and options overlay (alias for dialog selector)
     */
    _showProgramOverlay() {
        return this._openProgramSelector();
    }

    // ----------------
    // FEATURE TOGGLES
    // ----------------

    /**
     * Toggle a feature on/off
     * Generic method for any feature switch entity
     * 
     * @param {string} featureKey - Key from home_connect config (e.g., "hygiene_plus_entity")
     * @returns {Promise|undefined}
     */
    _hcToggleFeature(featureKey) {
        if (!this._isHomeConnectMode()) return;

        const entity = this._hcEntity(featureKey);
        if (!entity) {
            console.warn(`Feature not configured: ${featureKey}`);
            return;
        }

        return Promise.resolve(this._toggle(entity.entity_id))
            .catch(error => {
                this._handleServiceError(error, `toggle_${featureKey}`);
                return Promise.reject(error);
            });
    }

    /**
     * Toggle child lock
     * @returns {Promise|undefined}
     */
    _hcToggleChildLock() {
        return this._hcToggleFeature("child_lock_entity");
    }

    /**
     * Toggle hygiene plus (dishwasher)
     * @returns {Promise|undefined}
     */
    _hcToggleHygienePlus() {
        return this._hcToggleFeature("hygiene_plus_entity");
    }

    /**
     * Toggle intensive zone (dishwasher)
     * @returns {Promise|undefined}
     */
    _hcToggleIntensiveZone() {
        return this._hcToggleFeature("intensive_zone_entity");
    }

    /**
     * Toggle variospeed plus (dishwasher)
     * @returns {Promise|undefined}
     */
    _hcToggleVariospeedPlus() {
        return this._hcToggleFeature("variospeed_plus_entity");
    }

    /**
     * Toggle silence on demand (dishwasher)
     * @returns {Promise|undefined}
     */
    _hcToggleSilenceOnDemand() {
        return this._hcToggleFeature("silence_on_demand_entity");
    }

    /**
     * Toggle brilliant dry (dishwasher)
     * @returns {Promise|undefined}
     */
    _hcToggleBrilliantDry() {
        return this._hcToggleFeature("brilliant_dry_entity");
    }

    // ----------------
    // OPTIONS CONTROL
    // ----------------

    /**
     * Set wash temperature
     * 
     * @param {string} temperature - Temperature option (e.g., "Cold", "40°C", "60°C")
     * @returns {Promise|undefined}
     */
    _hcSetTemperature(temperature) {
        if (!this._isHomeConnectMode()) return;

        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type];

        if (!hc?.temperature_entity) {
            console.warn("No temperature_entity configured");
            return;
        }

        if (!this._getRemoteControlState()) {
            const err = new Error("Remote control not enabled");
            this._handleServiceError(err, "set_temperature");
            const t = this._t;
            const message = t.remote_control_required ||
                           "Remote control must be enabled on the appliance.\n" +
                           "Please enable remote control using the appliance controls.";
            if (typeof alert === "function") {
                alert(message);
            }
            return Promise.reject(err);
        }

        return this._selectOption(hc.temperature_entity, temperature)
            .catch(error => {
                this._handleServiceError(error, "set_temperature");
                return Promise.reject(error);
            });
    }

    /**
     * Set spin speed
     *
     * @param {string} speed - Speed option (e.g., "800", "1200", "1400")
     * @returns {Promise|undefined}
     */
    _hcSetSpinSpeed(speed) {
        if (!this._isHomeConnectMode()) return;

        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type];

        if (!hc?.spin_speed_entity) {
            console.warn("No spin_speed_entity configured");
            return;
        }

        if (!this._getRemoteControlState()) {
            const err = new Error("Remote control not enabled");
            this._handleServiceError(err, "set_spin_speed");
            const t = this._t;
            const message = t.remote_control_required ||
                           "Remote control must be enabled on the appliance.\n" +
                           "Please enable remote control using the appliance controls.";
            if (typeof alert === "function") {
                alert(message);
            }
            return Promise.reject(err);
        }

        return this._selectOption(hc.spin_speed_entity, speed)
            .catch(error => {
                this._handleServiceError(error, "set_spin_speed");
                return Promise.reject(error);
            });
    }

    /**
     * Render i-Dos panel for washing machine
     * Shows detergent fill levels when i-Dos entities are available
     */
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
    }

    _headerIcon() {
        const type = this._applianceType;
        if (type === "dryer") {
            return `
        <svg viewBox="0 0 24 24" fill="none" stroke="#2f80ed" stroke-width="1.9"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="3.2" y="2.8" width="17.6" height="18.4" rx="3.4"/>
          <circle cx="12" cy="12.2" r="4.4"/>
          <circle cx="12" cy="12.2" r="1.5" fill="#f0a04b" stroke="none"/>
          <line x1="7.2" y1="19.2" x2="16.8" y2="19.2"/>
          <line x1="8" y1="20.4" x2="16" y2="20.4"/>
        </svg>`;
        }
        if (type === "dishwasher") {
            return `
        <svg viewBox="0 0 24 24" fill="none" stroke="#2f80ed" stroke-width="1.9"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="3.2" y="2.8" width="17.6" height="18.4" rx="3.4"/>
          <rect x="6" y="7.2" width="12" height="10.5" rx="1.8"/>
          <line x1="8" y1="4.6" x2="16" y2="4.6"/>
          <line x1="9" y1="19.4" x2="15" y2="19.4"/>
        </svg>`;
        }
        if (type === "oven") {
            return `
        <svg viewBox="0 0 24 24" fill="none" stroke="#2f80ed" stroke-width="1.9"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="3.2" y="2.8" width="17.6" height="18.4" rx="3.4"/>
          <rect x="6" y="8" width="12" height="9.5" rx="1.5"/>
          <circle cx="17.2" cy="5.4" r="1.3" fill="#f0a04b" stroke="none"/>
          <line x1="8" y1="19.6" x2="16" y2="19.6"/>
        </svg>`;
        }
        if (type === "microwave") {
            return `
        <svg viewBox="0 0 24 24" fill="none" stroke="#2f80ed" stroke-width="1.9"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.6"/>
          <rect x="5" y="7.4" width="10.2" height="9.2" rx="1.4"/>
          <circle cx="18.2" cy="9" r="1.2"/>
          <line x1="17.2" y1="12.2" x2="19.2" y2="12.2"/>
          <line x1="17.2" y1="14.4" x2="19.2" y2="14.4"/>
        </svg>`;
        }
        return `
      <svg viewBox="0 0 24 24" fill="none" stroke="#2f80ed" stroke-width="1.9"
           stroke-linecap="round" stroke-linejoin="round">
        <rect x="3.2" y="2.8" width="17.6" height="18.4" rx="3.4"/>
        <circle cx="12" cy="13" r="4.6"/>
        <circle cx="12" cy="13" r="1.6" fill="#2f80ed" stroke="none"/>
        <circle cx="7"  cy="6.2" r="1.05" fill="#2f80ed" stroke="none"/>
      </svg>`;
    }

    /**
     * Render setup message when device not selected
     * @returns {string} HTML string for setup container
     */
    _renderSetupMessage() {
        const t = this._t;
        return `
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
        `;
    }

    _machineSvg() {
        const type = this._applianceType;
        const u = this._uid;
        let svg;
        if (type === "dryer")
            svg = this._svgDryer(u);
        else if (type === "dishwasher")
            svg = this._svgDishwasher(u);
        else if (type === "oven")
            svg = this._svgOven(u);
        else if (type === "microwave")
            svg = this._svgMicrowave(u);
        else
            svg = this._svgWasher(u);

        if (this._errorState && this._isHomeConnectMode()) {
            const overlay = `
            <g id="errorOverlay">
                <!-- Semi-transparent background -->
                <rect x="0" y="0" width="220" height="232" 
                      fill="rgba(0,0,0,0.7)" rx="16" />
                
                <!-- Error icon -->
                <circle cx="110" cy="80" r="20" 
                        fill="var(--error-color, #ff5252)" />
                <text x="110" y="88" 
                      text-anchor="middle" 
                      font-size="24" 
                      fill="white" 
                      font-weight="bold">!</text>
                
                <!-- Error message -->
                <foreignObject x="20" y="110" width="180" height="90">
                    <div xmlns="http://www.w3.org/1999/xhtml" 
                         style="
                             color: white;
                             font-size: 13px;
                             text-align: center;
                             line-height: 1.4;
                             padding: 0 10px;
                         ">
                        ${this._errorState.message}
                    </div>
                </foreignObject>
            </g>`;
            svg = svg.replace("</svg>", `${overlay}\n      </svg>`);
        }

        return svg;
    }

    _svgChassis(u, opts = {}) {
        const top = opts.topPanel || `
      <rect x="42" y="20" width="34" height="13" rx="4" fill="#cfd7e0"/>
      <rect x="42" y="20" width="34" height="6"  rx="3" fill="#dee5ec"/>
      <rect x="88" y="18" width="70" height="18" rx="9" fill="#0d1526"/>
      <text id="dispTime" x="116" y="31" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', Consolas, monospace"
            font-size="11.5" font-weight="700" fill="#e8f1ff" letter-spacing="1">--:--</text>
      <circle id="dispDot" cx="149" cy="27" r="2.4" fill="#22b263"/>
      <circle cx="176" cy="27" r="10" fill="#e9edf3" stroke="#c2cbd6" stroke-width="1.3"/>
      <circle cx="176" cy="27" r="3.2" fill="#31415a"/>
      <rect x="175.1" y="18.5" width="1.8" height="6.5" rx=".9" fill="#31415a"/>`;
        return `
      <ellipse cx="110" cy="222" rx="76" ry="8" fill="#20304a" opacity=".16"/>
      <rect x="30" y="8" width="160" height="204" rx="18" fill="url(#${u}-body)"/>
      <rect x="30" y="8" width="160" height="204" rx="18" fill="none" stroke="#c7cfda" stroke-width="1.4"/>
      <rect x="48"  y="210" width="10" height="7" rx="3" fill="#9aa6b4"/>
      <rect x="162" y="210" width="10" height="7" rx="3" fill="#9aa6b4"/>
      ${top}`;
    }

    _svgWasher(u) {
        const mode = this._getMode();
        const isHc = mode === "home_connect";
        const interactiveClass = isHc ? "hc-interactive" : "";
        const t = this._t;

        return `
      <svg class="machine ${interactiveClass}" id="machine" viewBox="0 0 220 232" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${u}-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".55" stop-color="#f2f5f9"/>
            <stop offset="1" stop-color="#d9e0e9"/>
          </linearGradient>
          <radialGradient id="${u}-glass" cx=".38" cy=".32" r=".95">
            <stop offset="0" stop-color="#31456e"/>
            <stop offset=".6" stop-color="#1e2c4d"/>
            <stop offset="1" stop-color="#131d36"/>
          </radialGradient>
          <linearGradient id="${u}-ring" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#d5dce5"/>
          </linearGradient>
        </defs>
        ${this._svgChassis(u, {
            topPanel: `
      ${this._renderIDosPanel()}
      <rect x="88" y="18" width="70" height="18" rx="9" fill="#0d1526"/>
      <text id="dispTime" x="116" y="31" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', Consolas, monospace"
            font-size="11.5" font-weight="700" fill="#e8f1ff" letter-spacing="1">--:--</text>
      <circle id="dispDot" cx="149" cy="27" r="2.4" fill="#22b263"/>
      <circle cx="176" cy="27" r="10" fill="#e9edf3" stroke="#c2cbd6" stroke-width="1.3"/>
      <circle cx="176" cy="27" r="3.2" fill="#31415a"/>
      <rect x="175.1" y="18.5" width="1.8" height="6.5" rx=".9" fill="#31415a"/>`
        })}

        <circle cx="110" cy="128" r="58" fill="url(#${u}-ring)"/>
        <circle cx="110" cy="128" r="58" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
        <circle cx="110" cy="128" r="47" fill="#e3e9f0"/>
        <circle cx="110" cy="128" r="42" fill="url(#${u}-glass)"/>
        <g class="laundry">
          <circle cx="100" cy="124" r="14"   fill="#ea4335"/>
          <circle cx="119" cy="131" r="13.2" fill="#4285f4"/>
          <circle cx="110" cy="115" r="11"   fill="#fbbc05"/>
          <circle cx="103" cy="135" r="8"    fill="#f28b82" opacity=".9"/>
        </g>
        <ellipse cx="94" cy="106" rx="22" ry="13" fill="#ffffff" opacity=".14"
                 transform="rotate(-24 94 106)"/>
        <circle cx="110" cy="128" r="42" fill="none" stroke="#0d1526" stroke-width="2" opacity=".35"/>
        <g class="arcs">
          <circle cx="110" cy="128" r="53" fill="none" stroke="#2f80ed" stroke-width="5.5"
                  stroke-linecap="round" stroke-dasharray="104 62.5" opacity=".95"/>
        </g>

        ${isHc ? `
          <!-- Home Connect Interactive Overlays - Waschmaschine 3 Felder -->
          <rect class="hc-control" id="hcIdosBtn" x="40" y="18" width="42" height="20" rx="4"
                fill="rgba(47,128,237,0.01)" cursor="pointer">
            <title>${t.tip_idos_btn || "i-Dos Settings"}</title>
          </rect>
          <rect class="hc-control" id="hcProgramBtn" x="86" y="16" width="76" height="24" rx="9"
                fill="rgba(47,128,237,0.01)" cursor="pointer">
            <title>${t.tip_program_btn || "Select Program"}</title>
          </rect>
          <circle class="hc-control" id="hcPowerBtn" cx="176" cy="27" r="13"
                  fill="rgba(47,128,237,0.01)" cursor="pointer">
            <title>${t.tip_power_btn || "Power"}</title>
          </circle>
        ` : ''}
      </svg>`;
    }

    _svgDryer(u) {
        const top = `
      <rect x="42" y="20" width="34" height="13" rx="4" fill="#cfd7e0"/>
      <rect x="46" y="23" width="26" height="3.2" rx="1.4" fill="#9aa6b4"/>
      <rect x="46" y="28" width="18" height="2.4" rx="1.1" fill="#b7c0cb"/>
      <rect x="88" y="18" width="70" height="18" rx="9" fill="#0d1526"/>
      <text id="dispTime" x="116" y="31" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', Consolas, monospace"
            font-size="11.5" font-weight="700" fill="#e8f1ff" letter-spacing="1">--:--</text>
      <circle id="dispDot" cx="149" cy="27" r="2.4" fill="#22b263"/>
      <circle cx="176" cy="27" r="10" fill="#e9edf3" stroke="#c2cbd6" stroke-width="1.3"/>
      <circle cx="176" cy="27" r="3.2" fill="#31415a"/>
      <rect x="175.1" y="18.5" width="1.8" height="6.5" rx=".9" fill="#31415a"/>`;
        return `
      <svg class="machine" id="machine" viewBox="0 0 220 232" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${u}-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".55" stop-color="#f2f5f9"/>
            <stop offset="1" stop-color="#d9e0e9"/>
          </linearGradient>
          <radialGradient id="${u}-glass" cx=".38" cy=".32" r=".95">
            <stop offset="0" stop-color="#4a3a2e"/>
            <stop offset=".55" stop-color="#2a211c"/>
            <stop offset="1" stop-color="#16110e"/>
          </radialGradient>
          <linearGradient id="${u}-ring" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#d5dce5"/>
          </linearGradient>
          <radialGradient id="${u}-heat" cx=".5" cy=".55" r=".7">
            <stop offset="0" stop-color="#ffb347" stop-opacity=".55"/>
            <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
          </radialGradient>
        </defs>
        ${this._svgChassis(u, {
            topPanel: top
        })}
        <circle cx="110" cy="128" r="58" fill="url(#${u}-ring)"/>
        <circle cx="110" cy="128" r="58" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
        <circle cx="110" cy="128" r="47" fill="#e3e9f0"/>
        <circle cx="110" cy="128" r="42" fill="url(#${u}-glass)"/>
        <circle class="heat" cx="110" cy="128" r="40" fill="url(#${u}-heat)" opacity=".35"/>
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
          <ellipse cx="102" cy="126" rx="15" ry="10" fill="#7aa2e3" transform="rotate(-18 102 126)"/>
          <ellipse cx="120" cy="134" rx="13" ry="9" fill="#e8e0d4" transform="rotate(22 120 134)"/>
          <ellipse cx="112" cy="118" rx="10" ry="7" fill="#d4a574" transform="rotate(-8 112 118)"/>
        </g>
        <ellipse cx="94" cy="106" rx="22" ry="13" fill="#ffffff" opacity=".12" transform="rotate(-24 94 106)"/>
        <circle cx="110" cy="128" r="42" fill="none" stroke="#0d1526" stroke-width="2" opacity=".35"/>
        <g class="arcs">
          <circle cx="110" cy="128" r="53" fill="none" stroke="#f0a04b" stroke-width="5.5"
                  stroke-linecap="round" stroke-dasharray="104 62.5" opacity=".95"/>
        </g>
        <rect x="72" y="194" width="76" height="12" rx="4" fill="#dfe5ec" stroke="#c2cbd6" stroke-width="1"/>
        <g stroke="#b0bac6" stroke-width="1.3" stroke-linecap="round">
          <line x1="80" y1="198" x2="140" y2="198"/>
          <line x1="80" y1="202" x2="140" y2="202"/>
          <line x1="80" y1="206" x2="140" y2="206"/>
        </g>
      </svg>`;
    }

    _svgDishwasher(u) {
        const mode = this._getMode();
        const isHc = mode === "home_connect";
        const interactiveClass = isHc ? "hc-interactive" : "";
        const t = this._t;

        const top = `
      <rect x="42" y="18" width="136" height="22" rx="8" fill="#0d1526"/>
      <text id="dispTime" x="100" y="33" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', Consolas, monospace"
            font-size="11.5" font-weight="700" fill="#e8f1ff" letter-spacing="1">--:--</text>
      <circle id="dispDot" cx="148" cy="29" r="2.4" fill="#22b263"/>
      <circle cx="162" cy="29" r="5.5" fill="#e9edf3" stroke="#c2cbd6" stroke-width="1"/>
      <circle cx="162" cy="29" r="1.8" fill="#31415a"/>`;
        return `
      <svg class="machine ${interactiveClass}" id="machine" viewBox="0 0 220 232" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${u}-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".55" stop-color="#f2f5f9"/>
            <stop offset="1" stop-color="#d9e0e9"/>
          </linearGradient>
          <radialGradient id="${u}-glass" cx=".4" cy=".28" r="1">
            <stop offset="0" stop-color="#2f4a6e"/>
            <stop offset=".6" stop-color="#1a2d4a"/>
            <stop offset="1" stop-color="#101b2e"/>
          </radialGradient>
          <linearGradient id="${u}-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#d5dce5"/>
          </linearGradient>
          <linearGradient id="${u}-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#7eb6ff" stop-opacity="0"/>
            <stop offset=".45" stop-color="#7eb6ff" stop-opacity=".55"/>
            <stop offset="1" stop-color="#7eb6ff" stop-opacity=".15"/>
          </linearGradient>
          <clipPath id="${u}-clip">
            <rect x="56" y="60" width="108" height="120" rx="8"/>
          </clipPath>
        </defs>
        ${this._svgChassis(u, {
            topPanel: top
        })}
        <rect x="48" y="52" width="124" height="148" rx="12" fill="url(#${u}-frame)"/>
        <rect x="48" y="52" width="124" height="148" rx="12" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
        <rect x="56" y="60" width="108" height="120" rx="8" fill="url(#${u}-glass)"/>
        <g clip-path="url(#${u}-clip)">
          <g class="dw-dishes" opacity=".98">
            <line x1="64" y1="92" x2="156" y2="92" stroke="#8fa0b5" stroke-width="1.6" opacity=".75"/>
            <line x1="64" y1="92" x2="64" y2="86" stroke="#8fa0b5" stroke-width="1.4" opacity=".55"/>
            <line x1="156" y1="92" x2="156" y2="86" stroke="#8fa0b5" stroke-width="1.4" opacity=".55"/>
            <path d="M70 72 v14 c0 5 4 8 8 8 s8-3 8-8 V72 Z" fill="none" stroke="#e8f0fa" stroke-width="1.8"/>
            <line x1="70" y1="72" x2="86" y2="72" stroke="#e8f0fa" stroke-width="1.8"/>
            <path d="M90 70 v16 c0 5 3.5 7.5 7 7.5 s7-2.5 7-7.5 V70 Z" fill="none" stroke="#d7e3f4" stroke-width="1.8"/>
            <line x1="90" y1="70" x2="104" y2="70" stroke="#d7e3f4" stroke-width="1.8"/>
            <path d="M112 78 c0 8 5 12 12 12 s12-4 12-12" fill="none" stroke="#c9d7ea" stroke-width="2"/>
            <ellipse cx="124" cy="78" rx="12" ry="3.2" fill="none" stroke="#c9d7ea" stroke-width="1.7"/>
            <rect x="142" y="72" width="12" height="16" rx="2.5" fill="none" stroke="#e8f0fa" stroke-width="1.8"/>
            <path d="M154 76 c4 0 5 3 5 5 s-1 5-5 5" fill="none" stroke="#e8f0fa" stroke-width="1.7"/>
            <line x1="64" y1="138" x2="156" y2="138" stroke="#8fa0b5" stroke-width="1.6" opacity=".75"/>
            <ellipse cx="80" cy="124" rx="14" ry="5.5" fill="none" stroke="#e8f0fa" stroke-width="2"/>
            <ellipse cx="80" cy="128" rx="14" ry="5.5" fill="none" stroke="#d0dced" stroke-width="1.7" opacity=".85"/>
            <ellipse cx="80" cy="132" rx="14" ry="5.5" fill="none" stroke="#b9c8dc" stroke-width="1.5" opacity=".7"/>
            <ellipse cx="112" cy="126" rx="15" ry="5.8" fill="none" stroke="#e8f0fa" stroke-width="2"/>
            <ellipse cx="112" cy="130" rx="15" ry="5.8" fill="none" stroke="#d0dced" stroke-width="1.7" opacity=".85"/>
            <path d="M132 120 c0 10 6 15 14 15 s14-5 14-15" fill="none" stroke="#d7e3f4" stroke-width="2"/>
            <ellipse cx="146" cy="120" rx="14" ry="3.4" fill="none" stroke="#d7e3f4" stroke-width="1.7"/>
          </g>
          <rect class="dw-wash" x="56" y="60" width="108" height="120" fill="url(#${u}-mist)"/>
          <g stroke="#9fd0ff" stroke-width="1.6" stroke-linecap="round" opacity=".75">
            <line class="dw-stream" x1="74" y1="64" x2="74" y2="172"/>
            <line class="dw-stream" x1="92" y1="64" x2="92" y2="172"/>
            <line class="dw-stream" x1="110" y1="64" x2="110" y2="172"/>
            <line class="dw-stream" x1="128" y1="64" x2="128" y2="172"/>
            <line class="dw-stream" x1="146" y1="64" x2="146" y2="172"/>
          </g>
          <g class="dw-arm">
            <line x1="72" y1="166" x2="148" y2="166" stroke="#8ec2ff" stroke-width="3.2" stroke-linecap="round"/>
            <circle cx="110" cy="166" r="3.4" fill="#b7dbff"/>
            <g class="dw-jet" stroke="#a8d6ff" stroke-width="1.5" stroke-linecap="round">
              <line x1="86" y1="166" x2="82" y2="148"/>
              <line x1="86" y1="166" x2="90" y2="146"/>
            </g>
            <g class="dw-jet" stroke="#a8d6ff" stroke-width="1.5" stroke-linecap="round">
              <line x1="134" y1="166" x2="130" y2="146"/>
              <line x1="134" y1="166" x2="138" y2="148"/>
            </g>
          </g>
          <g fill="#9fd0ff">
            <circle class="dw-drop" cx="78" cy="96" r="1.8"/>
            <circle class="dw-drop" cx="118" cy="90" r="2"/>
            <circle class="dw-drop" cx="140" cy="102" r="1.6"/>
            <circle class="dw-drop" cx="98" cy="108" r="1.7"/>
          </g>
        </g>
        <rect x="62" y="66" width="36" height="18" rx="6" fill="#ffffff" opacity=".12"
              transform="rotate(-12 80 75)"/>
        <rect x="56" y="60" width="108" height="120" rx="8" fill="none" stroke="#0d1526" stroke-width="2" opacity=".3"/>
        <rect class="dw-frame" x="52" y="56" width="116" height="140" rx="10" fill="none"
              stroke="#2f80ed" stroke-width="4" stroke-linecap="round"
              stroke-dasharray="90 70" opacity=".9"/>
        <rect x="78" y="188" width="64" height="7" rx="3.5" fill="#cfd7e0" stroke="#b4bec9" stroke-width="1"/>

        ${isHc ? `
          <!-- Home Connect Interactive Overlays - Geschirrspüler 2 Felder -->
          <rect class="hc-control" id="hcProgramBtn" x="40" y="16" width="122" height="26" rx="8"
                fill="rgba(47,128,237,0.01)" cursor="pointer">
            <title>${t.tip_program_btn || "Select Program"}</title>
          </rect>
          <circle class="hc-control" id="hcPowerBtn" cx="162" cy="29" r="11"
                  fill="rgba(47,128,237,0.01)" cursor="pointer">
            <title>${t.tip_power_btn || "Power"}</title>
          </circle>
        ` : ''}
      </svg>`;
    }

    _svgOven(u) {
        const top = `
      <rect x="42" y="40" width="88" height="22" rx="8" fill="#0d1526"/>
      <text id="dispTime" x="78" y="55" text-anchor="middle"
            font-family="ui-monospace, 'SF Mono', Consolas, monospace"
            font-size="11.5" font-weight="700" fill="#e8f1ff" letter-spacing="1">--:--</text>
      <circle id="dispDot" cx="148" cy="51" r="2.4" fill="#22b263"/>
      <circle cx="172" cy="51" r="11" fill="#e9edf3" stroke="#c2cbd6" stroke-width="1.3"/>
      <circle cx="172" cy="51" r="3.4" fill="#31415a"/>
      <rect x="171" y="41.5" width="2" height="7" rx="1" fill="#f0a04b"/>`;
        return `
      <svg class="machine" id="machine" viewBox="0 0 220 232" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${u}-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".55" stop-color="#f2f5f9"/>
            <stop offset="1" stop-color="#d9e0e9"/>
          </linearGradient>
          <radialGradient id="${u}-glass" cx=".4" cy=".28" r="1">
            <stop offset="0" stop-color="#4a3428"/>
            <stop offset=".55" stop-color="#2a1c16"/>
            <stop offset="1" stop-color="#140e0b"/>
          </radialGradient>
          <linearGradient id="${u}-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#d5dce5"/>
          </linearGradient>
          <radialGradient id="${u}-heat" cx=".5" cy=".75" r=".85">
            <stop offset="0" stop-color="#ff8a3d" stop-opacity=".7"/>
            <stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/>
          </radialGradient>
          <clipPath id="${u}-clip">
            <rect x="52" y="80" width="116" height="102" rx="8"/>
          </clipPath>
        </defs>
        <ellipse cx="110" cy="222" rx="76" ry="8" fill="#20304a" opacity=".16"/>
        <rect x="30" y="30" width="160" height="182" rx="18" fill="url(#${u}-body)"/>
        <rect x="30" y="30" width="160" height="182" rx="18" fill="none" stroke="#c7cfda" stroke-width="1.4"/>
        <rect x="48" y="210" width="10" height="7" rx="3" fill="#9aa6b4"/>
        <rect x="162" y="210" width="10" height="7" rx="3" fill="#9aa6b4"/>
        ${top}
        <rect x="44" y="72" width="132" height="128" rx="12" fill="url(#${u}-frame)"/>
        <rect x="44" y="72" width="132" height="128" rx="12" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
        <rect x="52" y="80" width="116" height="102" rx="8" fill="url(#${u}-glass)"/>
        <g clip-path="url(#${u}-clip)">
          <g opacity=".7" stroke="#8a7a6a" stroke-width="1.5">
            <line x1="60" y1="104" x2="160" y2="104"/>
            <line x1="60" y1="138" x2="160" y2="138"/>
            <line x1="60" y1="164" x2="160" y2="164"/>
          </g>
          <g class="ov-food">
            <ellipse cx="110" cy="134" rx="28" ry="7" fill="#c4783a"/>
            <ellipse cx="110" cy="131" rx="28" ry="7" fill="#e8a45a"/>
            <circle cx="98" cy="129" r="3.2" fill="#d4552a" opacity=".85"/>
            <circle cx="116" cy="127" r="2.6" fill="#d4552a" opacity=".75"/>
            <circle cx="124" cy="131" r="2.2" fill="#b83f1c" opacity=".7"/>
            <ellipse cx="110" cy="131" rx="10" ry="3" fill="#f2c48a" opacity=".55"/>
          </g>
          <rect class="ov-glow" x="52" y="80" width="116" height="102" fill="url(#${u}-heat)"/>
          <g stroke="#ffb070" stroke-width="1.4" stroke-linecap="round">
            <line class="ov-shimmer" x1="70" y1="84" x2="70" y2="174"/>
            <line class="ov-shimmer" x1="110" y1="84" x2="110" y2="174"/>
            <line class="ov-shimmer" x1="150" y1="84" x2="150" y2="174"/>
          </g>
          <g class="ov-flame" fill="#ff8a3d">
            <ellipse cx="88" cy="174" rx="10" ry="4" opacity=".5"/>
            <ellipse cx="110" cy="175" rx="14" ry="5" opacity=".55"/>
            <ellipse cx="132" cy="174" rx="10" ry="4" opacity=".5"/>
          </g>
        </g>
        <rect x="58" y="86" width="34" height="16" rx="5" fill="#ffffff" opacity=".1"
              transform="rotate(-10 75 94)"/>
        <rect x="52" y="80" width="116" height="102" rx="8" fill="none" stroke="#0d1526" stroke-width="2" opacity=".3"/>
        <rect class="ov-frame" x="48" y="76" width="124" height="120" rx="10" fill="none"
              stroke="#f0a04b" stroke-width="4" stroke-linecap="round"
              stroke-dasharray="90 70" opacity=".9"/>
        <rect x="78" y="188" width="64" height="8" rx="4" fill="#cfd7e0" stroke="#b4bec9" stroke-width="1"/>
      </svg>`;
    }

    _svgMicrowave(u) {
        return `
      <svg class="machine" id="machine" viewBox="0 0 220 232" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${u}-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".55" stop-color="#f2f5f9"/>
            <stop offset="1" stop-color="#d9e0e9"/>
          </linearGradient>
          <radialGradient id="${u}-glass" cx=".38" cy=".3" r="1">
            <stop offset="0" stop-color="#2a3a52"/>
            <stop offset=".55" stop-color="#172233"/>
            <stop offset="1" stop-color="#0c121c"/>
          </radialGradient>
          <linearGradient id="${u}-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#d5dce5"/>
          </linearGradient>
          <radialGradient id="${u}-heat" cx=".45" cy=".55" r=".75">
            <stop offset="0" stop-color="#ff8a3d" stop-opacity=".55"/>
            <stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/>
          </radialGradient>
          <clipPath id="${u}-clip">
            <rect x="46" y="110" width="100" height="78" rx="8"/>
          </clipPath>
        </defs>
        <ellipse cx="110" cy="222" rx="76" ry="8" fill="#20304a" opacity=".16"/>
        <rect x="30" y="70" width="160" height="142" rx="16" fill="url(#${u}-body)"/>
        <rect x="30" y="70" width="160" height="142" rx="16" fill="none" stroke="#c7cfda" stroke-width="1.4"/>
        <rect x="48" y="210" width="10" height="7" rx="3" fill="#9aa6b4"/>
        <rect x="162" y="210" width="10" height="7" rx="3" fill="#9aa6b4"/>
        <rect x="42" y="80" width="100" height="18" rx="9" fill="#0d1526"/>
        <text id="dispTime" x="84" y="93" text-anchor="middle"
              font-family="ui-monospace, 'SF Mono', Consolas, monospace"
              font-size="11.5" font-weight="700" fill="#e8f1ff" letter-spacing="1">--:--</text>
        <circle id="dispDot" cx="128" cy="89" r="2.4" fill="#22b263"/>
        <rect x="156" y="80" width="28" height="120" rx="8" fill="#e9edf3" stroke="#c2cbd6" stroke-width="1.2"/>
        <circle cx="170" cy="98" r="8" fill="#fff" stroke="#c2cbd6" stroke-width="1.2"/>
        <circle cx="170" cy="98" r="2.6" fill="#31415a"/>
        <rect x="170" y="91" width="1.6" height="5" rx=".8" fill="#f0a04b"/>
        <g class="mw-dots" fill="#9aa6b4">
          <circle cx="163" cy="120" r="2.2"/><circle cx="170" cy="120" r="2.2"/><circle cx="177" cy="120" r="2.2"/>
          <circle cx="163" cy="132" r="2.2"/><circle cx="170" cy="132" r="2.2"/><circle cx="177" cy="132" r="2.2"/>
          <circle cx="163" cy="144" r="2.2"/><circle cx="170" cy="144" r="2.2"/><circle cx="177" cy="144" r="2.2"/>
        </g>
        <rect x="160" y="160" width="20" height="10" rx="3" fill="#dfe5ec" stroke="#c2cbd6" stroke-width="1"/>
        <rect x="160" y="174" width="20" height="10" rx="3" fill="#dfe5ec" stroke="#c2cbd6" stroke-width="1"/>
        <rect x="160" y="188" width="20" height="10" rx="3" fill="#f0a04b" opacity=".9"/>
        <rect x="38" y="102" width="112" height="98" rx="12" fill="url(#${u}-frame)"/>
        <rect x="38" y="102" width="112" height="98" rx="12" fill="none" stroke="#c2cbd6" stroke-width="1.4"/>
        <rect x="46" y="110" width="100" height="78" rx="8" fill="url(#${u}-glass)"/>
        <g clip-path="url(#${u}-clip)">
          <rect class="mw-glow" x="46" y="110" width="100" height="78" fill="url(#${u}-heat)"/>
          <g fill="none" stroke="#ffb070" stroke-width="1.5" stroke-linecap="round" opacity=".7">
            <path class="mw-wave" d="M58 122 Q96 116 134 124"/>
            <path class="mw-wave" d="M56 138 Q96 130 136 140"/>
            <path class="mw-wave" d="M58 154 Q96 146 134 156"/>
          </g>
          <ellipse cx="100" cy="178" rx="34" ry="8" fill="#3a4a60" opacity=".5"/>
          <ellipse cx="100" cy="170" rx="28" ry="8" fill="#e8eef6" opacity=".95"/>
          <ellipse class="mw-rim" cx="100" cy="170" rx="28" ry="8" fill="none"
                  stroke="#f0a04b" stroke-width="2.2"/>
          <ellipse cx="100" cy="169" rx="14" ry="3.5" fill="#d5dde8" opacity=".65"/>
          <g class="mw-mug">
            <ellipse cx="108" cy="171" rx="2.4" ry="1.5" fill="#e25b2a" opacity=".9"/>
            <ellipse cx="100" cy="170" rx="7" ry="2" fill="#2a3648" opacity=".3"/>
            <rect x="93" y="152" width="14" height="16" rx="2.5" fill="#1a2433" opacity=".35"/>
            <rect x="93" y="152" width="14" height="16" rx="2.5" fill="none" stroke="#f5ebe0" stroke-width="1.9"/>
            <path d="M107 156 c4.5 0 5.5 2.6 5.5 5 s-1 5-5.5 5" fill="none" stroke="#f5ebe0" stroke-width="1.7"/>
            <ellipse cx="100" cy="152" rx="7" ry="2" fill="none" stroke="#f5ebe0" stroke-width="1.5"/>
            <ellipse cx="100" cy="159" rx="4.5" ry="1.4" fill="#ffb070" opacity=".4"/>
          </g>
        </g>
        <rect x="52" y="116" width="28" height="14" rx="5" fill="#ffffff" opacity=".1"
              transform="rotate(-12 66 123)"/>
        <rect x="46" y="110" width="100" height="78" rx="8" fill="none" stroke="#0d1526" stroke-width="2" opacity=".3"/>
        <rect class="mw-frame" x="42" y="106" width="108" height="86" rx="10" fill="none"
              stroke="#f0a04b" stroke-width="4" stroke-linecap="round"
              stroke-dasharray="70 55" opacity=".9"/>
        <rect x="42" y="130" width="6" height="36" rx="3" fill="#cfd7e0" stroke="#b4bec9" stroke-width="1"/>
      </svg>`;
    }

    _build() {
        const c = this._config;
        const t = this._t;
        const root = this.shadowRoot || this.attachShadow({
            mode: "open"
        });
        root.innerHTML = `
      <style>
        :host {
          display: block;
          --wm-grad: linear-gradient(180deg, #edf3fb 0%, #e4edf8 55%, #dfe9f6 100%);
          --wm-text: #1c2733;
          --wm-muted: #7d8894;
          --wm-label: #8a95a3;
          --wm-accent: #2f80ed;
          --wm-icon-bg: #ffffff;
          --wm-icon-shadow: 0 3px 10px rgba(47,128,237,.18);
          --wm-icon-border: transparent;
          --wm-badge-bg: #e3e8ee;
          --wm-badge-fg: #6b7684;
          --wm-badge-dot: #9aa5b1;
          --wm-badge-run-bg: #d9f2e2;
          --wm-badge-run-fg: #1c9a55;
          --wm-badge-idle-bg: #fbf1d3;
          --wm-badge-idle-fg: #b8923a;
          --wm-btn-bg: rgba(255,255,255,.75);
          --wm-btn-border: #d8e0ea;
          --wm-btn-on-bg: #eaf3fe;
          --wm-btn-on-border: #b9d4f6;
          --wm-panel-bg: rgba(255,255,255,.72);
          --wm-panel-border: rgba(255,255,255,.9);
          --wm-panel-shadow: 0 2px 10px rgba(38,63,97,.05);
          --wm-card-shadow: 0 6px 20px rgba(38,63,97,.10);
          --wm-ring-track: #dde5ee;
          --wm-bar-bg: #e2e9f1;
          --wm-bar-idle: #c4cdd8;
          --wm-divider: #e2e8f0;
          --wm-appliance-dim: 1;
        }
        :host(.wm-dark) {
          --wm-grad: linear-gradient(180deg, #1d2634 0%, #18212f 55%, #141c29 100%);
          --wm-text: #e8eef7;
          --wm-muted: #9aa7b8;
          --wm-label: #8593a6;
          --wm-accent: #6fb0ff;
          --wm-icon-bg: #232e3f;
          --wm-icon-shadow: 0 3px 10px rgba(0,0,0,.38);
          --wm-icon-border: transparent;
          --wm-badge-bg: #2a3547;
          --wm-badge-fg: #a5b2c4;
          --wm-badge-dot: #6b7a8d;
          --wm-badge-run-bg: rgba(34,178,99,.20);
          --wm-badge-run-fg: #4ad489;
          --wm-badge-idle-bg: rgba(240,192,72,.16);
          --wm-badge-idle-fg: #e0b559;
          --wm-btn-bg: rgba(255,255,255,.06);
          --wm-btn-border: rgba(255,255,255,.13);
          --wm-btn-on-bg: rgba(47,128,237,.20);
          --wm-btn-on-border: rgba(111,176,255,.45);
          --wm-panel-bg: rgba(255,255,255,.05);
          --wm-panel-border: rgba(255,255,255,.08);
          --wm-panel-shadow: 0 2px 10px rgba(0,0,0,.28);
          --wm-card-shadow: 0 6px 20px rgba(0,0,0,.38);
          --wm-ring-track: #313e52;
          --wm-bar-bg: #2c3849;
          --wm-bar-idle: #4a5769;
          --wm-divider: rgba(255,255,255,.09);
          --wm-appliance-dim: .93;
        }
        :host(.wm-native) {
          --wm-grad: var(--ha-card-background, var(--card-background-color, #fff));
          --wm-text: var(--primary-text-color, #1c2733);
          --wm-muted: var(--secondary-text-color, #727272);
          --wm-label: var(--secondary-text-color, #727272);
          --wm-accent: var(--primary-color, #2f80ed);
          --wm-icon-bg: var(--secondary-background-color, rgba(0,0,0,.04));
          --wm-icon-shadow: 0 1px 3px rgba(0,0,0,.12);
          --wm-icon-border: var(--divider-color, rgba(0,0,0,.12));
          --wm-badge-bg: var(--secondary-background-color, rgba(0,0,0,.06));
          --wm-badge-fg: var(--secondary-text-color, #727272);
          --wm-badge-dot: var(--disabled-text-color, #bdbdbd);
          --wm-badge-run-bg: rgba(var(--rgb-success-color, 76,175,80), .16);
          --wm-badge-run-fg: var(--success-color, #21c15e);
          --wm-badge-idle-bg: rgba(var(--rgb-warning-color, 255,193,7), .16);
          --wm-badge-idle-fg: var(--warning-color, #c79100);
          --wm-btn-bg: var(--secondary-background-color, rgba(0,0,0,.04));
          --wm-btn-border: var(--divider-color, #e0e0e0);
          --wm-btn-on-bg: rgba(var(--rgb-primary-color, 47,128,237), .12);
          --wm-btn-on-border: var(--primary-color, #2f80ed);
          --wm-panel-bg: var(--secondary-background-color, rgba(0,0,0,.03));
          --wm-panel-border: var(--divider-color, #e0e0e0);
          --wm-panel-shadow: none;
          --wm-card-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,.1));
          --wm-ring-track: var(--divider-color, #e0e0e0);
          --wm-bar-bg: var(--divider-color, #e0e0e0);
          --wm-bar-idle: var(--disabled-text-color, #bdbdbd);
          --wm-divider: var(--divider-color, #e0e0e0);
          --wm-appliance-dim: 1;
        }
        :host(.wm-native:not(.wm-native-dark)) {
          --wm-icon-bg: #f4f6f8;
          --wm-badge-bg: #eef1f4;
          --wm-btn-bg: #f4f6f8;
          --wm-panel-bg: #f6f8fa;
        }
        :host(.wm-native-dark) {
          --wm-icon-shadow: 0 2px 6px rgba(0,0,0,.45);
        }
        :host(.wm-native) ha-card::before {
          display: none;
        }
        :host(.wm-native) ha-card {
          box-shadow: none;
        }
        ha-card {
          display: block;
          border-radius: 24px;
          padding: 16px 16px 14px;
          overflow: hidden;
          position: relative;
          background: var(--wm-grad);
          color: var(--wm-text);
          font-family: var(--paper-font-body1_-_font-family, inherit);
          box-shadow: var(--ha-card-box-shadow, var(--wm-card-shadow));
        }
        ha-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 5px;
          background: linear-gradient(90deg, #2f80ed, #56a8ff);
        }
        .header { display: flex; align-items: center; gap: 10px; }
        .h-icon {
          width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
          background: var(--wm-icon-bg); box-shadow: var(--wm-icon-shadow);
          border: 1px solid var(--wm-icon-border, transparent);
          display: flex; align-items: center; justify-content: center;
        }
        .h-icon svg { width: 27px; height: 27px; }
        .h-title {
          font-size: 17.5px; font-weight: 700; letter-spacing: .2px;
          flex: 0 1 auto; min-width: 56px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .badge {
          display: flex; align-items: center; gap: 7px; flex-shrink: 0;
          font-size: 11px; font-weight: 700; letter-spacing: .7px;
          padding: 6px 11px; border-radius: 999px;
          background: var(--wm-badge-bg); color: var(--wm-badge-fg); white-space: nowrap;
        }
        .wrap.narrow #badgeText { display: none; }
        .wrap.narrow .badge { padding: 6px 8px; }
        .wrap.narrow .header { gap: 8px; }
        .wrap.narrow .h-title { font-size: 15.5px; }
        .badge .b-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--wm-badge-dot); }
        .running .badge { background: var(--wm-badge-run-bg); color: var(--wm-badge-run-fg); }
        .state-idle .badge { background: var(--wm-badge-idle-bg); color: var(--wm-badge-idle-fg); }
        .state-idle .badge .b-dot { background: var(--wm-badge-idle-fg); }
        .running .badge .b-dot { background: #22b263; animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,178,99,.45); }
          50%      { box-shadow: 0 0 0 5px rgba(34,178,99,0); }
        }
        .h-spacer { flex: 1; }
        .h-btn {
          width: 35px; height: 35px; border-radius: 12px; flex-shrink: 0;
          background: var(--wm-btn-bg); border: 1px solid var(--wm-btn-border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--wm-muted); transition: transform .12s ease;
        }
        .h-btn:active { transform: scale(.94); }
        .h-btn ha-icon { --mdc-icon-size: 19px; }
        .h-btn.on { color: var(--wm-accent); border-color: var(--wm-btn-on-border); background: var(--wm-btn-on-bg); }

        .hero { display: flex; justify-content: center; padding: 14px 0 6px; }
        .machine { width: 210px; max-width: 62%; filter: brightness(var(--wm-appliance-dim)); }

        .laundry, .drum, .arcs {
          transform-box: view-box;
          transform-origin: 110px 128px;
          will-change: transform;
        }
        .running .arcs    { animation: spin 3s linear infinite; }
        .running .laundry { animation: tumble 3s ease-in-out infinite; }
        .running .drum    { animation: spin 2.4s linear infinite; }
        .running .heat    { animation: heatPulse 2s ease-in-out infinite; will-change: opacity; }

        .dw-stream, .dw-wash, .dw-drop, .dw-jet { opacity: 0; }
        .dw-dishes { opacity: .98; }
        .running .dw-wash { animation: washPulse 2.4s ease-in-out infinite; }
        .running .dw-stream {
          opacity: .75;
          stroke-dasharray: 6 18;
          animation: streamFall 1.1s linear infinite;
        }
        .running .dw-stream:nth-child(2) { animation-delay: .15s; }
        .running .dw-stream:nth-child(3) { animation-delay: .35s; }
        .running .dw-stream:nth-child(4) { animation-delay: .55s; }
        .running .dw-stream:nth-child(5) { animation-delay: .25s; }
        .running .dw-jet {
          transform-box: view-box;
          transform-origin: 110px 166px;
          animation: jetPulse 1.6s ease-in-out infinite;
        }
        .running .dw-jet:nth-child(2) { animation-delay: .4s; }
        .running .dw-drop { animation: dropFall 1.8s ease-in infinite; }
        .running .dw-drop:nth-child(2) { animation-delay: .4s; }
        .running .dw-drop:nth-child(3) { animation-delay: .9s; }
        .running .dw-drop:nth-child(4) { animation-delay: 1.3s; }
        .running .dw-arm {
          transform-box: view-box;
          transform-origin: 110px 166px;
          animation: armSweep 3.2s ease-in-out infinite;
        }
        .running .dw-frame { animation: dash-crawl 2.4s linear infinite; }

        .ov-glow, .ov-shimmer, .ov-flame, .ov-food { opacity: 0; }
        .running .ov-food {
          opacity: .95;
          transform-box: view-box;
          transform-origin: 110px 134px;
          animation: foodSway 3.6s ease-in-out infinite;
        }
        .running .ov-glow { animation: heatPulse 2s ease-in-out infinite; }
        .running .ov-shimmer {
          opacity: .55;
          stroke-dasharray: 8 14;
          animation: streamFall 1.4s linear infinite;
        }
        .running .ov-flame { animation: flameFlicker 1.1s ease-in-out infinite; }
        .running .ov-frame { animation: dash-crawl 2.4s linear infinite; }

        .mw-wave, .mw-glow { opacity: 0; }
        .running .mw-glow { animation: heatPulse 2.2s ease-in-out infinite; }
        .running .mw-wave {
          opacity: .55;
          stroke-dasharray: 6 12;
          animation: streamFall 2.2s linear infinite;
        }
        .running .mw-wave:nth-child(2) { animation-delay: .35s; }
        .running .mw-wave:nth-child(3) { animation-delay: .7s; }
        .running .mw-rim {
          stroke-dasharray: 7 6;
          animation: dash-crawl 12s linear infinite;
        }
        .running .mw-mug {
          transform-box: view-box;
          transform-origin: 100px 170px;
          animation: mugOrbit 12s linear infinite;
        }
        .running .mw-frame { animation: dash-crawl 3.2s linear infinite; }
        .running .mw-dots { animation: heatPulse 1.4s ease-in-out infinite; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes tumble {
          0%, 100% { transform: rotate(-14deg); }
          50%      { transform: rotate(16deg); }
        }
        @keyframes heatPulse {
          0%, 100% { opacity: .2; }
          50% { opacity: .55; }
        }
        @keyframes washPulse {
          0%, 100% { opacity: .12; }
          50% { opacity: .34; }
        }
        @keyframes streamFall { to { stroke-dashoffset: -24; } }
        @keyframes jetPulse {
          0%, 100% { opacity: .25; }
          50% { opacity: .9; }
        }
        @keyframes dropFall {
          0%   { opacity: 0; transform: translateY(0); }
          15%  { opacity: .9; }
          85%  { opacity: .55; }
          100% { opacity: 0; transform: translateY(28px); }
        }
        @keyframes armSweep {
          0%, 100% { transform: rotate(-18deg); }
          50%      { transform: rotate(18deg); }
        }
        @keyframes dash-crawl { to { stroke-dashoffset: -160; } }
        @keyframes flameFlicker {
          0%, 100% { opacity: .25; transform: scaleY(1); }
          40% { opacity: .7; transform: scaleY(1.08); }
          70% { opacity: .4; transform: scaleY(.96); }
        }
        @keyframes foodSway {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes mugOrbit {
          0%   { transform: translate(14px, 0px); }
          12.5%{ transform: translate(10px, 4px); }
          25%  { transform: translate(0px, 5.5px); }
          37.5%{ transform: translate(-10px, 4px); }
          50%  { transform: translate(-14px, 0px); }
          62.5%{ transform: translate(-10px, -3.5px); }
          75%  { transform: translate(0px, -5px); }
          87.5%{ transform: translate(10px, -3.5px); }
          100% { transform: translate(14px, 0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .running .arcs, .running .laundry, .running .drum, .running .heat,
          .running .dw-wash, .running .dw-stream, .running .dw-jet,
          .running .dw-drop, .running .dw-arm, .running .dw-frame,
          .running .ov-glow, .running .ov-shimmer, .running .ov-flame,
          .running .ov-frame, .running .ov-food,
          .running .mw-glow, .running .mw-wave, .running .mw-rim,
          .running .mw-mug, .running .mw-frame, .running .mw-dots,
          .running .badge .b-dot, .running .ring-anim { animation: none; }
          .door-group { transition: none !important; }
        }

        .door-group {
          transform-box: view-box;
          transform-origin: 80px 128px;
          transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .door-group.door-open {
          transform: rotate(-85deg);
        }
        .door-group.door-closed {
          transform: rotate(0deg);
        }
        .drum-interior {
          transition: opacity 0.4s ease-in-out;
          opacity: 0;
        }
        .door-open .drum-interior,
        .door-group.door-open ~ .drum-interior,
        #doorGroup.door-open ~ #drumInterior,
        .door-group.door-open + .drum-interior {
          opacity: 1;
        }

        .panel {
          background: var(--wm-panel-bg);
          border: 1px solid var(--wm-panel-border);
          border-radius: 18px; padding: 14px 16px; margin-top: 12px;
          box-shadow: var(--wm-panel-shadow);
        }
        .status-panel { display: flex; align-items: center; gap: 16px; }
        .ring-box { position: relative; width: 96px; height: 96px; flex-shrink: 0; cursor: pointer; }
        .ring-box svg { width: 100%; height: 100%; }
        .ring-track { stroke: var(--wm-ring-track); }
        .ring-arc   { stroke: var(--wm-accent); stroke-linecap: round; }
        .ring-anim  { transform-origin: 48px 48px; }
        .running .ring-anim { animation: spin 1.8s linear infinite; }
        .ring-center {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
        }
        .ring-time { font-size: 19px; font-weight: 800; line-height: 1; }
        .ring-label {
          font-size: 8px; font-weight: 700; letter-spacing: .8px; color: var(--wm-label);
          margin-top: 3px; max-width: 58px; overflow: hidden; white-space: nowrap;
        }
        .st-col { flex: 1; min-width: 0; }
        .st-state { font-size: 16.5px; font-weight: 700; }
        .st-row {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-top: 9px; gap: 8px;
        }
        .st-power-label { font-size: 13px; color: var(--wm-muted); }
        .st-power { font-size: 18px; font-weight: 800; white-space: nowrap; cursor: pointer; }
        .st-elapsed-label { font-size: 13px; color: var(--wm-muted); }
        .st-elapsed { font-size: 16px; font-weight: 700; white-space: nowrap; }
        .bar {
          height: 10px; border-radius: 6px; background: var(--wm-bar-bg);
          margin-top: 8px; overflow: hidden;
        }
        .bar-fill {
          height: 100%; border-radius: 6px; width: 0%;
          min-width: 3px;
          background: linear-gradient(90deg, #ff6a5e, #d93025);
          transition: width .6s ease;
        }
        .idle .bar-fill { background: var(--wm-bar-idle); }
        .lc-title {
          font-size: 11px; font-weight: 800; letter-spacing: 1.4px; color: var(--wm-label);
          margin-bottom: 10px;
        }
        .lc-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .lc-item { padding: 0 12px; border-left: 1px solid var(--wm-divider); min-width: 0; cursor: pointer; }
        .lc-item:first-child { border-left: none; padding-left: 0; }
        .lc-label { font-size: 10px; font-weight: 700; letter-spacing: .8px; color: var(--wm-label); }
        .lc-value { font-size: 14.5px; font-weight: 800; margin-top: 5px; overflow-wrap: break-word; }
        .lc-unit { font-size: 11px; font-weight: 700; color: var(--wm-accent); }
        .hidden { display: none !important; }

        /* Home Connect interactive controls */
        .hc-interactive .hc-control {
          transition: opacity 0.2s, fill 0.2s;
          pointer-events: all;
          cursor: pointer;
        }
        .hc-interactive .hc-control:hover {
          fill: rgba(47, 128, 237, 0.25) !important;
          stroke: var(--wm-accent);
          stroke-width: 1.5;
        }

        /* Modal Dialog */
        .hc-dialog {
          border: none;
          border-radius: 20px;
          padding: 0;
          width: 90%;
          max-width: 440px;
          max-height: 80vh;
          background: var(--wm-grad, #fff);
          color: var(--wm-text, #1c2733);
          box-shadow: 0 10px 40px rgba(0,0,0,.3);
        }
        .hc-dialog::backdrop {
          background: rgba(0, 0, 0, .55);
          backdrop-filter: blur(4px);
        }
        .hc-dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--wm-divider, #e2e8f0);
        }
        .hc-dialog-title {
          font-size: 16px;
          font-weight: 700;
        }
        .hc-dialog-close {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: none;
          background: var(--wm-btn-bg, rgba(0,0,0,0.06));
          color: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }
        .hc-dialog-body {
          padding: 16px 20px 20px;
          overflow-y: auto;
          max-height: 60vh;
        }
        .hc-program-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 12px;
        }
        .hc-program-item {
          padding: 14px 8px;
          border-radius: 12px;
          background: var(--wm-panel-bg, rgba(255,255,255,.6));
          border: 1.5px solid var(--wm-panel-border, #d8e0ea);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          position: relative;
        }
        .hc-program-item:hover {
          background: var(--wm-btn-on-bg, #eaf3fe);
          border-color: var(--wm-accent, #2f80ed);
          transform: translateY(-2px);
        }
        .hc-program-item.selected {
          background: var(--wm-btn-on-bg, #eaf3fe);
          border-color: var(--wm-accent, #2f80ed);
          border-width: 2.5px;
        }
        .hc-program-item.active {
          background: #d4edda;
          border-color: #22b263;
          border-width: 2.5px;
        }
        .hc-program-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          font-size: 14px;
          line-height: 1;
        }
        .hc-program-icon {
          font-size: 26px;
          line-height: 1;
        }
        .hc-program-name {
          font-size: 12px;
          font-weight: 700;
          word-break: break-word;
        }

        /* Home Connect Options Dialog */
        .hc-options-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .hc-option-section {
          background: var(--wm-panel-bg, rgba(255,255,255,.5));
          border: 1px solid var(--wm-panel-border, #e2e8f0);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .hc-option-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .hc-option-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hc-pill-btn {
          border: 1.5px solid var(--wm-panel-border, #cbd5e1);
          background: var(--wm-card-bg, #fff);
          color: var(--wm-text, inherit);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .hc-pill-btn:hover {
          border-color: var(--wm-accent, #2f80ed);
          background: var(--wm-btn-on-bg, #eaf3fe);
        }
        .hc-pill-btn.selected {
          border-color: var(--wm-accent, #2f80ed);
          background: var(--wm-accent, #2f80ed);
          color: #fff;
        }
        .hc-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .hc-start-btn {
          background: var(--wm-accent, #22b263);
          color: #fff;
        }
        .hc-start-btn:hover {
          background: #1a8e4f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 178, 99, 0.3);
        }
        .hc-pause-btn {
          background: #f0a04b;
          color: #fff;
        }
        .hc-pause-btn:hover {
          background: #d88a35;
          transform: translateY(-2px);
        }
        .hc-stop-btn {
          background: #e74c3c;
          color: #fff;
        }
        .hc-stop-btn:hover {
          background: #c0392b;
          transform: translateY(-2px);
        }
        .hc-btn-icon {
          font-size: 16px;
          line-height: 1;
        }
        .hc-feature-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--wm-divider, #e2e8f0);
        }
        .hc-feature-row:last-child {
          border-bottom: none;
        }
        .hc-feature-label {
          font-size: 13px;
          font-weight: 600;
        }
        .hc-idos-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--wm-divider, #e2e8f0);
        }
        .hc-idos-row:last-child {
          border-bottom: none;
        }
        .hc-idos-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hc-idos-label {
          font-size: 13px;
          font-weight: 600;
        }
        .hc-idos-level {
          font-size: 11px;
          color: var(--wm-muted, #718096);
        }
        .hc-toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          cursor: pointer;
        }
        .hc-toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .hc-toggle-slider {
          position: absolute;
          inset: 0;
          background: var(--wm-bar-bg, #cbd5e1);
          border-radius: 24px;
          transition: .3s;
        }
        .hc-toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: #fff;
          border-radius: 50%;
          transition: .3s;
        }
        input:checked + .hc-toggle-slider {
          background: var(--wm-accent, #2f80ed);
        }
        input:checked + .hc-toggle-slider:before {
          transform: translateX(20px);
        }
        .hc-empty-options {
          padding: 24px 16px;
          text-align: center;
          color: var(--wm-muted, #718096);
          font-size: 13px;
        }

        /* Phase 8: Connectivity indicator */
        .hc-connectivity {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
          background: var(--wm-panel-bg);
          border: 1px solid var(--wm-panel-border);
          white-space: nowrap;
        }
        .hc-conn-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .hc-conn-dot.connected {
          background: #22b263;
          box-shadow: 0 0 0 2px rgba(34, 178, 99, 0.22);
          animation: hc-pulse 2.5s ease-in-out infinite;
        }
        .hc-conn-dot.disconnected {
          background: #d93025;
          box-shadow: 0 0 0 2px rgba(217, 48, 37, 0.22);
        }
        .hc-conn-dot.unknown {
          background: #8a95a3;
        }
        .hc-conn-label { color: var(--wm-muted); }
        @keyframes hc-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(34,178,99,0.22); }
          50% { box-shadow: 0 0 0 5px rgba(34,178,99,0.08); }
        }

        /* Phase 8: Program display panel */
        .hc-program-panel {
          margin-top: 10px;
          padding: 10px 12px;
          background: var(--wm-panel-bg);
          border: 1px solid var(--wm-panel-border);
          border-radius: 12px;
        }
        .hc-program-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 12px;
        }
        .hc-program-label {
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--wm-label);
          text-transform: uppercase;
          font-size: 10px;
        }
        .hc-program-value {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hc-program-progress {
          height: 4px;
          border-radius: 3px;
          background: var(--wm-bar-bg);
          margin-top: 8px;
          overflow: hidden;
        }
        .hc-progress-fill {
          height: 100%;
          border-radius: 3px;
          background: var(--wm-accent);
          transition: width 0.6s ease;
        }

        /* Phase 8: Feature chips */
        .hc-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .hc-chip {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--wm-badge-bg, rgba(47,128,237,0.1));
          color: var(--wm-badge-fg, #2f80ed);
          white-space: nowrap;
          border: 1px solid rgba(47,128,237,0.2);
          transition: opacity 0.3s;
        }
        .hc-chip.warning {
          background: rgba(217,144,48,0.13);
          color: #b87800;
          border-color: rgba(217,144,48,0.25);
        }
        .hc-chip.active {
          background: rgba(34,178,99,0.13);
          color: #1a8f50;
          border-color: rgba(34,178,99,0.25);
        }

        /* Setup message container */
        .setup-container {
          padding: 48px 24px;
          text-align: center;
          color: var(--wm-text, var(--primary-text-color));
        }
        .setup-icon {
          margin-bottom: 16px;
        }
        .setup-icon ha-icon {
          --mdc-icon-size: 64px;
          width: 64px;
          height: 64px;
          color: var(--wm-accent, var(--primary-color));
        }
        .setup-title {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .setup-message {
          font-size: 16px;
          color: var(--wm-muted, var(--secondary-text-color));
          margin-bottom: 24px;
        }
        .setup-steps {
          max-width: 400px;
          margin: 0 auto;
          text-align: left;
        }
        .setup-steps ol {
          padding-left: 20px;
          margin: 0;
        }
        .setup-steps li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
      </style>

      <ha-card>
        <div class="wrap idle" id="wrap">
          <div class="header">
            <div class="h-icon" id="hIcon">${this._headerIcon()}</div>
            <div class="h-title" id="name"></div>
            <div class="badge"><span class="b-dot"></span><span id="badgeText"></span></div>
            <div class="h-spacer"></div>
            <div class="hc-connectivity hidden" id="hcConnectivity">
              <div class="hc-conn-dot unknown" id="hcConnDot"></div>
              <span class="hc-conn-label" id="hcConnLabel"></span>
            </div>
            <div class="h-btn hidden" id="optionsBtn" title="${t.tip_options_btn}">
              <ha-icon icon="mdi:tune-variant"></ha-icon>
            </div>
            <div class="h-btn hidden" id="notifyBtn" title="${t.tip_notify}">
              <ha-icon icon="mdi:bell-ring-outline"></ha-icon>
            </div>
            <div class="h-btn hidden" id="plugBtn" title="${t.tip_plug}">
              <ha-icon icon="mdi:power-socket-eu"></ha-icon>
            </div>
            <div class="h-btn" id="chartBtn" title="${t.tip_history}">
              <ha-icon icon="mdi:chart-bar"></ha-icon>
            </div>
          </div>

          <div class="hero" id="hero">${this._machineSvg()}</div>

          <div class="panel status-panel" id="statusPanel">
            <div class="ring-box" id="ringBox">
              <svg viewBox="0 0 96 96">
                <circle class="ring-track" cx="48" cy="48" r="39" fill="none" stroke-width="8"/>
                <g class="ring-anim" id="ringAnim">
                  <circle class="ring-arc" id="ringArc" cx="48" cy="48" r="39" fill="none"
                          stroke-width="8" stroke-dasharray="160 85" transform="rotate(-90 48 48)"/>
                </g>
              </svg>
              <div class="ring-center">
                <div class="ring-time" id="ringTime">—</div>
                <div class="ring-label" id="ringLabel"></div>
              </div>
            </div>
            <div class="st-col">
              <div class="st-state" id="stState"></div>
              <div class="st-row hidden" id="powerRow">
                <span class="st-power-label" id="powerLabel"></span>
                <span class="st-power" id="powerValue">—</span>
              </div>
              <div class="st-row hidden" id="elapsedRow">
                <span class="st-elapsed-label" id="elapsedLabel">Elapsed</span>
                <span class="st-elapsed" id="elapsedValue">—</span>
              </div>
              <div class="bar hidden" id="bar"><div class="bar-fill" id="barFill"></div></div>
              <div class="hc-program-panel hidden" id="hcProgramPanel">
                <div class="hc-program-row">
                  <span class="hc-program-label" id="hcProgramLabel"></span>
                  <span class="hc-program-value" id="hcProgramValue">—</span>
                </div>
                <div class="hc-program-progress hidden" id="hcProgressBar">
                  <div class="hc-progress-fill" id="hcProgressFill"></div>
                </div>
              </div>
              <div class="hc-features hidden" id="hcFeatures"></div>
            </div>
          </div>

          <div class="panel hidden" id="lastCycle">
            <div class="lc-title">${t.last_cycle}</div>
            <div class="lc-grid">
              <div class="lc-item hidden" id="lcStart">
                <div class="lc-label">${t.start}</div>
                <div class="lc-value" id="lcStartV">—</div>
              </div>
              <div class="lc-item hidden" id="lcDuration">
                <div class="lc-label">${t.duration}</div>
                <div class="lc-value" id="lcDurationV">—</div>
              </div>
              <div class="lc-item hidden" id="lcEnergy">
                <div class="lc-label">${t.energy}</div>
                <div class="lc-value" id="lcEnergyV">—</div>
              </div>
              <div class="lc-item hidden" id="lcCost">
                <div class="lc-label">${t.cost}</div>
                <div class="lc-value" id="lcCostV">—</div>
              </div>
            </div>
          </div>
        </div>
        <div class="setup-container hidden" id="setupContainer">
          <div class="setup-icon">
            <ha-icon icon="mdi:washing-machine"></ha-icon>
          </div>
          <div class="setup-title" id="setupTitle">
            ${t.setup_title || 'Home Connect Setup'}
          </div>
          <div class="setup-message" id="setupMessage">
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
        <dialog class="hc-dialog" id="hcDialog"></dialog>
      </ha-card>
    `;

        this._el = (id) => root.getElementById(id);

        const mi = (ent) => () => this._moreInfo(ent);
        this._el("chartBtn").addEventListener("click", mi(c.power_entity || c.status_entity));
        this._el("ringBox").addEventListener("click", mi(c.last_wash_entity || c.status_entity));
        this._el("optionsBtn")?.addEventListener("click", () => this._openOptionsDialog());
        if (c.power_entity)
            this._el("powerValue").addEventListener("click", mi(c.power_entity));
        if (c.notify_entity)
            this._el("notifyBtn").addEventListener("click", () => this._toggle(c.notify_entity));
        if (c.plug_entity)
            this._el("plugBtn").addEventListener("click", () => this._confirmTogglePlug());
        if (c.last_wash_entity)
            this._el("lcStart").addEventListener("click", mi(c.last_wash_entity));
        if (c.duration_entity)
            this._el("lcDuration").addEventListener("click", mi(c.duration_entity));
        if (c.energy_entity)
            this._el("lcEnergy").addEventListener("click", mi(c.energy_entity));
        if (c.cost_entity)
            this._el("lcCost").addEventListener("click", mi(c.cost_entity));

        this._built = true;
        this._attachSVGInteractions();
        this._observeWidth();
        const w0 = this.getBoundingClientRect().width;
        if (w0) {
            const wrap = this._el("wrap");
            wrap.classList.toggle("narrow", w0 <= 430);
            wrap.classList.toggle("xnarrow", w0 <= 320);
        }
    }

    _updateTheme() {
        if (!this.classList) return;
        const c = this._config;
        const themeCfg = String(c.theme || "auto").toLowerCase();
        const isNative = themeCfg === "ha";
        const haIsDark = !!this._hass?.themes?.darkMode;
        this.classList.toggle("wm-native", isNative);
        this.classList.toggle("wm-native-dark", isNative && haIsDark);
        const dark = !isNative && (themeCfg === "dark" || (themeCfg !== "light" && haIsDark));
        this.classList.toggle("wm-dark", dark);
    }

    _formatTime(timeStr) {
        if (!timeStr) return "--:--";
        const str = String(timeStr).trim();

        // ISO 8601 Duration (e.g. PT1H30M, PT45M, PT20S)
        if (str.startsWith("PT") || str.startsWith("P")) {
            const hMatch = str.match(/(\d+)H/i);
            const mMatch = str.match(/(\d+)M/i);
            const sMatch = str.match(/(\d+)S/i);
            const h = hMatch ? parseInt(hMatch[1], 10) : 0;
            const m = mMatch ? parseInt(mMatch[1], 10) : 0;
            const s = sMatch ? parseInt(sMatch[1], 10) : 0;

            if (h > 0) {
                return `${h}:${String(m).padStart(2, "0")}`;
            }
            return `${m}:${String(s).padStart(2, "0")}`;
        }

        // Numeric seconds (e.g. 5400)
        const num = parseFloat(str);
        if (!isNaN(num) && !str.includes(":")) {
            const h = Math.floor(num / 3600);
            const m = Math.floor((num % 3600) / 60);
            if (h > 0) {
                return `${h}:${String(m).padStart(2, "0")}`;
            }
            return `${m}:${String(Math.floor(num % 60)).padStart(2, "0")}`;
        }

        // Timestamp / Date string
        if (str.includes("T") || str.includes("-")) {
            const d = this._parseDate(str);
            if (d) {
                return d.toLocaleTimeString(this._t.locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: this._hour12(),
                });
            }
        }

        return str;
    }

    _parseTimeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const str = String(timeStr).trim();

        // ISO 8601 Duration (e.g. PT1H30M, PT45M, PT20S)
        if (str.startsWith("PT") || str.startsWith("P")) {
            const hMatch = str.match(/(\d+)H/i);
            const mMatch = str.match(/(\d+)M/i);
            const sMatch = str.match(/(\d+)S/i);
            const h = hMatch ? parseInt(hMatch[1], 10) : 0;
            const m = mMatch ? parseInt(mMatch[1], 10) : 0;
            const s = sMatch ? parseInt(sMatch[1], 10) : 0;
            return (h * 60) + m + Math.round(s / 60);
        }

        // Numeric seconds (e.g. 5400)
        const num = parseFloat(str);
        if (!isNaN(num) && !str.includes(":")) {
            return Math.floor(num / 60);
        }

        // H:MM format (e.g. "1:30")
        if (str.includes(":")) {
            const parts = str.split(":");
            if (parts.length === 2) {
                const h = parseInt(parts[0], 10) || 0;
                const m = parseInt(parts[1], 10) || 0;
                return (h * 60) + m;
            }
        }

        return 0;
    }

    _translateProgram(programName) {
        if (!programName) return "";
        // Strip Home Connect API prefix, e.g. "LaundryCare.Washer.Program.Cotton" → "Cotton"
        const parts = programName.split(".");
        const cleanName = parts[parts.length - 1] || programName;
        // Look up in the locale's programs map first
        const programs = this._t?.programs || {};
        if (programs[cleanName]) return programs[cleanName];
        // Fallback: split CamelCase into words (e.g. "EasyCare" → "Easy Care")
        return cleanName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
    }

    _getProgramIcon(programName) {
        const name = String(programName || "").toLowerCase();
        if (name.includes("cotton") || name.includes("baumwolle")) return "👕";
        if (name.includes("easy") || name.includes("pflegeleicht") || name.includes("mix")) return "👔";
        if (name.includes("glass") || name.includes("glas")) return "🍷";
        if (name.includes("delicate") || name.includes("silk") || name.includes("seide") || name.includes("fein")) return "🧵";
        if (name.includes("wool") || name.includes("wolle")) return "🧶";
        if (name.includes("sport")) return "🏃";
        if (name.includes("quick") || name.includes("kurz") || name.includes("speed") || name.includes("express") || name.includes("super")) return "⚡";
        if (name.includes("eco")) return "🌿";
        if (name.includes("intensive") || name.includes("intensiv") || name.includes("pots") || name.includes("pans")) return "🍲";
        if (name.includes("spin") || name.includes("schleudern")) return "🌀";
        if (name.includes("rinse") || name.includes("spülen") || name.includes("prerinse")) return "💧";
        if (name.includes("auto")) return "🤖";
        if (name.includes("night") || name.includes("silence") || name.includes("quiet")) return "🌙";
        if (name.includes("clean") || name.includes("care") || name.includes("drum") || name.includes("machinecare")) return "✨";
        if (name.includes("hygiene") || name.includes("sanitize")) return "🧴";
        if (name.includes("dish") || name.includes("geschirr") || name.includes("normal")) return "🍽️";
        return "🔄";
    }

    _openProgramSelector() {
        const dialog = this.shadowRoot?.getElementById("hcDialog");
        if (!dialog) return;

        const t = this._t;
        const type = this._applianceType;
        const hc = this._config?.home_connect?.[type] || {};

        // Available programs: explicit list > select options > defaults
        const selectorEntity = this._hcEntity("program_selector_entity");
        const defaultPrograms = type === "dishwasher"
            ? ["Auto1", "Auto2", "Eco50", "Intensiv70", "Quick45", "PreRinse", "NightWash", "MachineCare"]
            : ["Cotton", "EasyCare", "DelicatesSilk", "Sportswear", "Quick45", "Mix", "Spin", "Rinse"];
        const availablePrograms = hc.available_programs ||
                                  selectorEntity?.attributes?.options ||
                                  defaultPrograms;

        const selectedProgram = this._getSelectedProgram();
        const activeProgram = this._getActiveProgram();

        // Check if remote control is enabled
        const remoteControlEnabled = this._getRemoteControlState();
        const remoteStartEnabled = this._getRemoteStartState();

        dialog.innerHTML = `
            <div class="hc-dialog-header">
                <div class="hc-dialog-title">${t.select_program || "Select Program"}</div>
                <button class="hc-dialog-close" id="closeHcDialog" title="${t.close || "Close"}">✕</button>
            </div>
            <div class="hc-dialog-body">
                ${!remoteControlEnabled ? `
                    <div class="hc-warning" style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-bottom: 16px; color: #856404; font-size: 13px;">
                        ⚠️ ${t.remote_control_required || "Remote control must be enabled on the appliance"}
                    </div>
                ` : ''}
                ${remoteControlEnabled && !remoteStartEnabled ? `
                    <div class="hc-info" style="background: #d1ecf1; padding: 12px; border-radius: 8px; margin-bottom: 16px; color: #0c5460; font-size: 13px;">
                        ℹ️ ${t.remote_start_required || "Remote start must be activated on the appliance"}
                    </div>
                ` : ''}
                <div class="hc-program-grid" id="hcProgramGrid">
                    ${availablePrograms.map(prog => {
                        const isSelected = prog === selectedProgram;
                        const isActive = prog === activeProgram;
                        const classes = ['hc-program-item'];
                        if (isSelected) classes.push('selected');
                        if (isActive) classes.push('active');

                        return `
                        <div class="${classes.join(' ')}" data-program="${prog}">
                            <div class="hc-program-icon">${this._getProgramIcon(prog)}</div>
                            <div class="hc-program-name">${this._translateProgram(prog)}</div>
                            ${isActive ? '<div class="hc-program-badge">▶</div>' : ''}
                            ${isSelected && !isActive ? '<div class="hc-program-badge">✓</div>' : ''}
                        </div>
                    `;
                    }).join('')}
                </div>
                ${selectedProgram && selectedProgram !== activeProgram ? `
                    <div class="hc-program-actions" style="margin-top: 16px; display: flex; gap: 8px; justify-content: center;">
                        <button class="hc-action-btn hc-start-btn" id="startProgramBtn">
                            <span class="hc-btn-icon">▶</span>
                            <span>${t.start_program || "Start Program"}</span>
                        </button>
                    </div>
                ` : ''}
                <div class="hc-dialog-footer" style="margin-top: 16px; padding: 12px; background: #f5f7fa; border-radius: 8px; font-size: 12px; color: #6c757d;">
                    <div><strong>Workflow:</strong></div>
                    <div>1. Select program (✓) → 2. Set options → 3. Click Start button (▶)</div>
                </div>
            </div>
        `;

        dialog.querySelector("#closeHcDialog")?.addEventListener("click", () => dialog.close());

        // Bind start program button
        const startBtn = dialog.querySelector("#startProgramBtn");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                if (selectedProgram) {
                    const activeEntity = this._hcEntity("active_program_entity");
                    if (activeEntity) {
                        this._selectOption(activeEntity.entity_id, selectedProgram)
                            .catch(error => {
                                this._handleServiceError(error, "start_program");
                            });
                    }
                }
                dialog.close();
            });
        }

        const items = dialog.querySelectorAll(".hc-program-item");
        items.forEach(item => {
            item.addEventListener("click", () => {
                const program = item.dataset.program;
                dialog.close();
                if (program) {
                    // Just select the program (don't start)
                    this._hcSelectProgram(program);
                }
            });
        });

        if (typeof dialog.showModal === "function") {
            dialog.showModal();
        } else {
            dialog.setAttribute("open", "");
        }
    }

    _openOptionsDialog() {
        const dialog = this.shadowRoot?.getElementById("hcDialog");
        if (!dialog) return;

        const t = this._t;
        const type = this._applianceType;

        const tempEntity = this._hcEntity("temperature_entity");
        const spinEntity = this._hcEntity("spin_speed_entity");

        // i-Dos entities (washer only)
        const idos1ActiveEntity = type === 'washer' ? this._hcEntity("idos1_active_entity") : null;
        const idos2ActiveEntity = type === 'washer' ? this._hcEntity("idos2_active_entity") : null;
        const idos1LevelEntity = type === 'washer' ? this._hcEntity("idos1_level_entity") : null;
        const idos2LevelEntity = type === 'washer' ? this._hcEntity("idos2_level_entity") : null;

        const features = [
            { key: "child_lock_entity", label: t.child_lock || "Child Lock", toggleFn: () => this._hcToggleChildLock() },
            { key: "hygiene_plus_entity", label: t.hygiene_plus || "Hygiene Plus", toggleFn: () => this._hcToggleHygienePlus() },
            { key: "intensive_zone_entity", label: t.intensive_zone || "Intensive Zone", toggleFn: () => this._hcToggleIntensiveZone() },
            { key: "variospeed_plus_entity", label: t.variospeed_plus || "VarioSpeed Plus", toggleFn: () => this._hcToggleVariospeedPlus() },
            { key: "silence_on_demand_entity", label: t.silence_on_demand || "Silence on Demand", toggleFn: () => this._hcToggleSilenceOnDemand() },
            { key: "brilliant_dry_entity", label: t.brilliant_dry || "BrilliantDry", toggleFn: () => this._hcToggleBrilliantDry() },
        ].filter(f => !!this._hcEntity(f.key));

        const hasAny = !!tempEntity || !!spinEntity || features.length > 0 || !!idos1ActiveEntity || !!idos2ActiveEntity;

        let contentHtml = '';
        if (!hasAny) {
            contentHtml = `<div class="hc-empty-options">${t.no_options_available || "No options available"}</div>`;
        } else {
            contentHtml = `<div class="hc-options-container">`;

            // i-Dos Section
            if (idos1ActiveEntity || idos2ActiveEntity) {
                contentHtml += `<div class="hc-option-section" id="idosOptionSection">`;
                contentHtml += `<div class="hc-option-header"><span>${t.idos_settings || "i-Dos Settings"}</span></div>`;

                if (idos1ActiveEntity) {
                    const idos1Active = idos1ActiveEntity.state === "on";
                    const idos1Level = idos1LevelEntity ? parseFloat(idos1LevelEntity.state) || 0 : 0;
                    contentHtml += `
                        <div class="hc-idos-row">
                            <div class="hc-idos-info">
                                <span class="hc-idos-label">i-Dos 1 (Detergent)</span>
                                ${idos1LevelEntity ? `<span class="hc-idos-level">Level: ${idos1Level}</span>` : ''}
                            </div>
                            <label class="hc-toggle-switch">
                                <input type="checkbox" data-idos="idos1" ${idos1Active ? 'checked' : ''}>
                                <span class="hc-toggle-slider"></span>
                            </label>
                        </div>
                    `;
                }

                if (idos2ActiveEntity) {
                    const idos2Active = idos2ActiveEntity.state === "on";
                    const idos2Level = idos2LevelEntity ? parseFloat(idos2LevelEntity.state) || 0 : 0;
                    contentHtml += `
                        <div class="hc-idos-row">
                            <div class="hc-idos-info">
                                <span class="hc-idos-label">i-Dos 2 (Softener)</span>
                                ${idos2LevelEntity ? `<span class="hc-idos-level">Level: ${idos2Level}</span>` : ''}
                            </div>
                            <label class="hc-toggle-switch">
                                <input type="checkbox" data-idos="idos2" ${idos2Active ? 'checked' : ''}>
                                <span class="hc-toggle-slider"></span>
                            </label>
                        </div>
                    `;
                }

                contentHtml += `</div>`;
            }

            if (tempEntity) {
                const currentTemp = String(tempEntity.state || "");
                const tempOptions = tempEntity.attributes?.options || ["Cold", "20°C", "30°C", "40°C", "60°C", "90°C"];
                contentHtml += `
                    <div class="hc-option-section" id="tempOptionSection">
                        <div class="hc-option-header">
                            <span>${t.temperature || "Temperature"}</span>
                            <span class="lc-unit">${currentTemp || "—"}</span>
                        </div>
                        <div class="hc-option-pills">
                            ${tempOptions.map(opt => `
                                <button class="hc-pill-btn ${opt === currentTemp ? 'selected' : ''}" data-temp="${opt}">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            if (spinEntity) {
                const currentSpin = String(spinEntity.state || "");
                const spinOptions = spinEntity.attributes?.options || ["0", "400", "800", "1200", "1400", "1600"];
                contentHtml += `
                    <div class="hc-option-section" id="spinOptionSection">
                        <div class="hc-option-header">
                            <span>${t.spin_speed || "Spin Speed"}</span>
                            <span class="lc-unit">${currentSpin || "—"}</span>
                        </div>
                        <div class="hc-option-pills">
                            ${spinOptions.map(opt => `
                                <button class="hc-pill-btn ${opt === currentSpin ? 'selected' : ''}" data-spin="${opt}">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            if (features.length > 0) {
                contentHtml += `
                    <div class="hc-option-section" id="featuresOptionSection">
                        ${features.map(f => {
                            const ent = this._hcEntity(f.key);
                            const isOn = ent?.state === "on";
                            return `
                                <div class="hc-feature-row">
                                    <span class="hc-feature-label">${f.label}</span>
                                    <label class="hc-toggle-switch">
                                        <input type="checkbox" data-feature="${f.key}" ${isOn ? 'checked' : ''}>
                                        <span class="hc-toggle-slider"></span>
                                    </label>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            contentHtml += `</div>`;
        }

        dialog.innerHTML = `
            <div class="hc-dialog-header">
                <div class="hc-dialog-title">${t.options_title || "Options & Settings"}</div>
                <button class="hc-dialog-close" id="closeHcDialog" title="${t.close || "Close"}">✕</button>
            </div>
            <div class="hc-dialog-body">
                ${contentHtml}
            </div>
        `;

        dialog.querySelector("#closeHcDialog")?.addEventListener("click", () => dialog.close());

        // Bind i-Dos toggles
        dialog.querySelectorAll("input[data-idos]").forEach(input => {
            input.addEventListener("change", () => {
                const idosNum = input.dataset.idos;
                const isChecked = input.checked;
                if (idosNum === "idos1") {
                    const entity = this._hcEntity("idos1_active_entity");
                    if (entity) {
                        if (isChecked) {
                            this._callService("switch", "turn_on", { entity_id: entity.entity_id });
                        } else {
                            this._callService("switch", "turn_off", { entity_id: entity.entity_id });
                        }
                    }
                } else if (idosNum === "idos2") {
                    const entity = this._hcEntity("idos2_active_entity");
                    if (entity) {
                        if (isChecked) {
                            this._callService("switch", "turn_on", { entity_id: entity.entity_id });
                        } else {
                            this._callService("switch", "turn_off", { entity_id: entity.entity_id });
                        }
                    }
                }
            });
        });

        // Bind temperature pill buttons
        dialog.querySelectorAll("button[data-temp]").forEach(btn => {
            btn.addEventListener("click", () => {
                const val = btn.dataset.temp;
                if (val) {
                    this._hcSetTemperature(val);
                }
                dialog.close();
            });
        });

        // Bind spin speed pill buttons
        dialog.querySelectorAll("button[data-spin]").forEach(btn => {
            btn.addEventListener("click", () => {
                const val = btn.dataset.spin;
                if (val) {
                    this._hcSetSpinSpeed(val);
                }
                dialog.close();
            });
        });

        // Bind feature toggles
        dialog.querySelectorAll("input[data-feature]").forEach(input => {
            input.addEventListener("change", () => {
                const fKey = input.dataset.feature;
                const feat = features.find(f => f.key === fKey);
                if (feat && feat.toggleFn) {
                    feat.toggleFn();
                }
            });
        });

        if (typeof dialog.showModal === "function") {
            dialog.showModal();
        } else {
            dialog.setAttribute("open", "");
        }
    }

    _attachSVGInteractions() {
        if (!this._isHomeConnectMode()) return;

        const idosBtn = this._el("hcIdosBtn");
        const programBtn = this._el("hcProgramBtn");
        const powerBtn = this._el("hcPowerBtn");

        if (idosBtn) {
            idosBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                // Open options dialog for i-Dos settings
                this._openOptionsDialog();
            });
        }

        if (programBtn) {
            programBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this._openProgramSelector();
            });
        }

        if (powerBtn) {
            powerBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this._hcTogglePower();
            });
        }
    }

    _update() {
        if (typeof this._el !== "function") return;
        this._updateTheme();
        const wrap = this._el("wrap");
        const setupContainer = this._el("setupContainer");

        if (this._showSetupMessage && this._isHomeConnectMode()) {
            if (wrap) wrap.classList.add("hidden");
            if (setupContainer) setupContainer.classList.remove("hidden");
            return;
        }

        if (setupContainer) setupContainer.classList.add("hidden");
        if (wrap) wrap.classList.remove("hidden");

        const hero = this._el("hero");
        if (hero) {
            hero.innerHTML = this._machineSvg();
            this._attachSVGInteractions();
        }

        if (this._isHomeConnectMode()) {
            this._updateHomeConnect();
        } else {
            this._updateStandard();
        }
    }

    _updateStandard() {
        const c = this._config;
        const t = this._t;
        const wrap = this._el("wrap");

        const running = this._isRunning();
        wrap.classList.toggle("running", running);
        this._el("name").textContent = c.name || t.name;
        const status = this._st(c.status_entity);
        const noData = !status || ["unknown", "unavailable"].includes(status.state);
        const applianceState = noData ? "nodata" : this._applianceState();
        const displayState = (applianceState === "off" && !c.power_entity) ? "idle" : applianceState;
        this._el("badgeText").textContent = t[`badge_${displayState}`] || displayState.toUpperCase();
        wrap.classList.toggle("state-idle", applianceState === "idle");
        const active = applianceState === "running" || applianceState === "idle";
        wrap.classList.toggle("idle", !active);
        const start = active ? this._startDate() : null;
        const clock = start ? this._fmtClock(start) : null;
        this._el("dispTime").textContent = active ? (clock || "0:00") : "--:--";
        this._el("dispDot").setAttribute("fill", running ? "#22b263" : "#4a5871");
        this._el("ringTime").textContent = active ? (clock || "…") : "—";
        const ringState = displayState === "running" ? "running" : displayState === "idle" ? "idle" : "off";
        this._el("ringLabel").textContent = t[`ring_${ringState}`] || ringState.toUpperCase();
        this._el("ringArc").style.display = active ? "" : "none";
        this._el("stState").textContent = t[`state_${displayState}`] || displayState;
        const hideStatus = !!c.hide_status_panel && !active;
        this._el("statusPanel").classList.toggle("hidden", hideStatus);

        if (c.power_entity) {
            const ps = this._st(c.power_entity);
            const p = parseFloat(ps?.state);
            const unit = ps?.attributes?.unit_of_measurement || "W";
            this._el("powerRow").classList.remove("hidden");
            this._el("bar").classList.remove("hidden");
            const unitL = String(unit).toLowerCase();
            this._el("powerLabel").textContent =
                ["a", "а"].includes(unitL) ? t.current : t.power;
            let disp;
            if (isNaN(p))
                disp = "—";
            else if (["w", "вт"].includes(unitL) && Math.abs(p) >= 1000)
                disp = `${this._fmtNum(p / 1000, 2)} ${t.kw}`;
            else
                disp = `${Math.abs(p) >= 10 ? Math.round(p) : this._fmtNum(p, 2)} ${unit}`;
            this._el("powerValue").textContent = disp;
            const frac = isNaN(p) ? 0 : Math.min(1, Math.max(0, p / (c.power_max || 1)));
            this._el("barFill").style.width = `${frac * 100}%`;
        }

        let anyLc = false;
        if (c.last_wash_entity) {
            const s = this._st(c.last_wash_entity);
            this._el("lcStart").classList.remove("hidden");
            this._el("lcStartV").textContent = s ? this._fmtDateTime(s.state) : "—";
            anyLc = true;
        }
        if (c.duration_entity) {
            const s = this._st(c.duration_entity);
            const d = this._fmtDuration(s?.state);
            this._el("lcDuration").classList.remove("hidden");
            this._el("lcDurationV").innerHTML = d
                 ? (d.unit ? `${d.value} <span class="lc-unit">${d.unit}</span>` : d.value)
                 : "—";
            anyLc = true;
        }
        if (c.energy_entity) {
            const s = this._st(c.energy_entity);
            const v = this._fmtNum(s?.state, 2);
            this._el("lcEnergy").classList.remove("hidden");
            this._el("lcEnergyV").innerHTML =
                v !== null ? `${v} <span class="lc-unit">${t.kwh}</span>` : "—";
            anyLc = true;
        }
        if (c.cost_entity) {
            const s = this._st(c.cost_entity);
            const v = this._fmtNum(s?.state, 2);
            this._el("lcCost").classList.remove("hidden");
            this._el("lcCostV").innerHTML =
                v !== null ? `${v} <span class="lc-unit">${c.currency}</span>` : "—";
            anyLc = true;
        }
        if (anyLc)
            this._el("lastCycle").classList.remove("hidden");

        if (c.notify_entity) {
            const on = this._st(c.notify_entity)?.state === "on";
            this._el("notifyBtn").classList.remove("hidden");
            this._el("notifyBtn").classList.toggle("on", on);
        }
        if (c.plug_entity) {
            const on = this._st(c.plug_entity)?.state === "on";
            this._el("plugBtn").classList.remove("hidden");
            this._el("plugBtn").classList.toggle("on", on);
        }
    }

    _updateHomeConnect() {
        const c = this._config;
        const t = this._t;
        const wrap = this._el("wrap");

        const state = this._computeApplianceState();
        const running = state === "running";

        wrap.classList.toggle("running", running);

        // Door state visualization
        const type = this._applianceType;
        const hc = c?.home_connect?.[type];
        if (hc?.door_entity) {
            const doorEntity = this._st(hc.door_entity);
            const doorOpen = doorEntity?.state === "on" || doorEntity?.state === "open" || doorEntity?.state === "Open";
            wrap.classList.toggle("door-open", doorOpen);
        }

        this._el("name").textContent = c.name || t.name;

        // Badge display
        let badgeText = t[`badge_${state}`];
        if (!badgeText) {
            if (state === "running") badgeText = t.badge_running;
            else if (state === "off") badgeText = t.badge_off;
            else if (state === "finished") badgeText = t.badge_finished || "FINISHED";
            else if (state === "paused") badgeText = t.badge_paused || "PAUSED";
            else if (state === "ready") badgeText = t.badge_ready || "READY";
            else if (state === "delayed") badgeText = t.badge_delayed || "DELAYED";
            else if (state === "error") badgeText = t.badge_error || "ERROR";
            else if (state === "action_required") badgeText = t.badge_action_required || "ACTION REQ.";
            else badgeText = t.badge_idle || "IDLE";
        }
        this._el("badgeText").textContent = badgeText;

        const active = running || state === "ready" || state === "paused" || state === "delayed";
        wrap.classList.toggle("state-idle", state === "ready" || state === "idle");
        wrap.classList.toggle("idle", !active && state !== "finished");

        // Display & Ring times
        const activeProgram = this._getActiveProgram() || this._getSelectedProgram();
        const progress = this._getProgress();
        const remainingTime = this._getRemainingTime();
        const endTime = this._getEndTime();

        if (running && (remainingTime || endTime)) {
            // Alternate between countdown and calculated remaining time every 3 seconds
            const now = Date.now();
            const showCountdown = Math.floor(now / 3000) % 2 === 0;

            if (showCountdown && remainingTime) {
                // Show countdown timer (remaining time from sensor)
                const formatted = this._formatTime(remainingTime);
                this._el("dispTime").textContent = formatted;
                this._el("ringTime").textContent = formatted;
            } else if (endTime) {
                // Calculate and show remaining time until end time
                const endDate = new Date(endTime);
                if (!isNaN(endDate.getTime())) {
                    const currentTime = new Date();
                    const diffMs = endDate.getTime() - currentTime.getTime();

                    if (diffMs > 0) {
                        // Calculate remaining hours and minutes
                        const totalMinutes = Math.floor(diffMs / 60000);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        const formatted = hours > 0
                            ? `${hours}:${minutes.toString().padStart(2, '0')}`
                            : `0:${minutes.toString().padStart(2, '0')}`;
                        this._el("dispTime").textContent = formatted;
                        this._el("ringTime").textContent = formatted;
                    } else {
                        // End time passed, show end time as clock time
                        const hours = endDate.getHours();
                        const minutes = endDate.getMinutes();
                        const formatted = `${hours}:${minutes.toString().padStart(2, '0')}`;
                        this._el("dispTime").textContent = formatted;
                        this._el("ringTime").textContent = formatted;
                    }
                } else if (remainingTime) {
                    const formatted = this._formatTime(remainingTime);
                    this._el("dispTime").textContent = formatted;
                    this._el("ringTime").textContent = formatted;
                } else {
                    this._el("dispTime").textContent = "0:00";
                    this._el("ringTime").textContent = "…";
                }
            } else if (remainingTime) {
                const formatted = this._formatTime(remainingTime);
                this._el("dispTime").textContent = formatted;
                this._el("ringTime").textContent = formatted;
            } else {
                this._el("dispTime").textContent = "0:00";
                this._el("ringTime").textContent = "…";
            }
        } else if (state === "delayed" && endTime) {
            const formatted = this._formatTime(endTime);
            this._el("dispTime").textContent = formatted;
            this._el("ringTime").textContent = formatted;
        } else {
            this._el("dispTime").textContent = active ? "0:00" : "--:--";
            this._el("ringTime").textContent = active ? "…" : "—";
        }

        this._el("dispDot").setAttribute("fill", running ? "#22b263" : (active ? "#f0a04b" : "#4a5871"));

        // Elapsed Time - calculate from progress and remaining time
        if (running && progress !== null && remainingTime) {
            const remainingMinutes = this._parseTimeToMinutes(remainingTime);
            if (remainingMinutes > 0 && progress > 0 && progress < 100) {
                // Calculate total duration from progress and remaining time
                const totalMinutes = Math.round(remainingMinutes / (1 - (progress / 100)));
                const elapsedMinutes = totalMinutes - remainingMinutes;

                if (elapsedMinutes >= 0) {
                    const hours = Math.floor(elapsedMinutes / 60);
                    const minutes = elapsedMinutes % 60;
                    const formatted = hours > 0
                        ? `${hours}:${minutes.toString().padStart(2, '0')}`
                        : `0:${minutes.toString().padStart(2, '0')}`;
                    this._el("elapsedRow").classList.remove("hidden");
                    this._el("elapsedValue").textContent = formatted;
                } else {
                    this._el("elapsedRow").classList.add("hidden");
                }
            } else {
                this._el("elapsedRow").classList.add("hidden");
            }
        } else if (running && endTime && remainingTime) {
            // Alternative: calculate elapsed from end time and remaining time
            const remainingMinutes = this._parseTimeToMinutes(remainingTime);
            const endDate = new Date(endTime);
            if (!isNaN(endDate.getTime()) && remainingMinutes > 0) {
                const startTime = new Date(endDate.getTime() - (remainingMinutes * 60000));
                const currentTime = new Date();
                const elapsedMs = currentTime.getTime() - startTime.getTime();

                if (elapsedMs >= 0) {
                    const elapsedMinutes = Math.floor(elapsedMs / 60000);
                    const hours = Math.floor(elapsedMinutes / 60);
                    const minutes = elapsedMinutes % 60;
                    const formatted = hours > 0
                        ? `${hours}:${minutes.toString().padStart(2, '0')}`
                        : `0:${minutes.toString().padStart(2, '0')}`;
                    this._el("elapsedRow").classList.remove("hidden");
                    this._el("elapsedValue").textContent = formatted;
                } else {
                    this._el("elapsedRow").classList.add("hidden");
                }
            } else {
                this._el("elapsedRow").classList.add("hidden");
            }
        } else {
            this._el("elapsedRow").classList.add("hidden");
        }

        // Ring Label - show REMAINING for Home Connect mode
        let ringLabel = t.ring_idle;
        if (state === "running") {
            ringLabel = t.ring_remaining || "REMAINING";
        } else if (state === "ready") {
            ringLabel = t.ring_ready || "READY";
        } else if (state === "paused") {
            ringLabel = t.ring_paused || "PAUSED";
        } else if (state === "off") {
            ringLabel = t.ring_off;
        }
        this._el("ringLabel").textContent = ringLabel;

        // Progress Arc
        if (progress !== null && running) {
            this._el("ringArc").style.display = "";
            const dasharray = (Math.max(0, Math.min(100, progress)) / 100) * 245;
            this._el("ringArc").setAttribute("stroke-dasharray", `${dasharray} 245`);
        } else {
            this._el("ringArc").style.display = active ? "" : "none";
            if (!active) {
                this._el("ringArc").style.display = "none";
            }
        }

        // Status text
        let stateText = t[`state_${state}`];
        if (!stateText) {
            if (state === "running") {
                stateText = activeProgram ? this._translateProgram(activeProgram) : t.state_running;
            } else if (state === "ready") {
                stateText = activeProgram ? `${t.state_ready || "Ready"}: ${this._translateProgram(activeProgram)}` : (t.state_ready || "Ready");
            } else if (state === "finished") {
                stateText = t.state_finished || "Finished";
            } else if (state === "paused") {
                stateText = t.state_paused || "Paused";
            } else if (state === "off") {
                stateText = t.state_off;
            } else {
                stateText = t.state_idle;
            }
        } else if (state === "running" && activeProgram) {
            stateText = this._translateProgram(activeProgram);
        }
        this._el("stState").textContent = stateText;

        const hideStatus = !!c.hide_status_panel && !active && state !== "finished";
        this._el("statusPanel").classList.toggle("hidden", hideStatus);

        // Power gauge / last cycle / extra entity buttons if standard entities also configured in HC mode
        if (c.power_entity) {
            const ps = this._st(c.power_entity);
            const p = parseFloat(ps?.state);
            const unit = ps?.attributes?.unit_of_measurement || "W";
            this._el("powerRow").classList.remove("hidden");
            this._el("bar").classList.remove("hidden");
            const unitL = String(unit).toLowerCase();
            this._el("powerLabel").textContent =
                ["a", "а"].includes(unitL) ? t.current : t.power;
            let disp;
            if (isNaN(p))
                disp = "—";
            else if (["w", "вт"].includes(unitL) && Math.abs(p) >= 1000)
                disp = `${this._fmtNum(p / 1000, 2)} ${t.kw}`;
            else
                disp = `${Math.abs(p) >= 10 ? Math.round(p) : this._fmtNum(p, 2)} ${unit}`;
            this._el("powerValue").textContent = disp;
            const frac = isNaN(p) ? 0 : Math.min(1, Math.max(0, p / (c.power_max || 1)));
            this._el("barFill").style.width = `${frac * 100}%`;
        }

        if (this._el("optionsBtn")) {
            const hasOptions = !!(
                this._hcEntity("temperature_entity") ||
                this._hcEntity("spin_speed_entity") ||
                this._hcEntity("child_lock_entity") ||
                this._hcEntity("hygiene_plus_entity") ||
                this._hcEntity("intensive_zone_entity") ||
                this._hcEntity("variospeed_plus_entity") ||
                this._hcEntity("silence_on_demand_entity") ||
                this._hcEntity("brilliant_dry_entity")
            );
            this._el("optionsBtn").classList.toggle("hidden", !hasOptions);
        }

        if (c.notify_entity) {
            const on = this._st(c.notify_entity)?.state === "on";
            this._el("notifyBtn").classList.remove("hidden");
            this._el("notifyBtn").classList.toggle("on", on);
        }
        if (c.plug_entity) {
            const on = this._st(c.plug_entity)?.state === "on";
            this._el("plugBtn").classList.remove("hidden");
            this._el("plugBtn").classList.toggle("on", on);
        }

        // Animate door state
        this._updateDoorAnimation();

        // Phase 8: Status indicators
        this._updateStatusIndicators();
    }

    /**
     * Phase 8: Update connectivity indicator in header
     */
    _updateConnectivity() {
        const connectivity = this._el("hcConnectivity");
        const dot = this._el("hcConnDot");
        const label = this._el("hcConnLabel");
        if (!connectivity) return;

        const caps = this._getApplianceCapabilities();
        if (!caps.hasConnectivity) {
            connectivity.classList.add("hidden");
            return;
        }

        connectivity.classList.remove("hidden");
        const connState = this._getConnectivityState();
        const t = this._t;

        if (connState === "connected") {
            dot.className = "hc-conn-dot connected";
            label.textContent = t.connected || "Connected";
        } else if (connState === "disconnected") {
            dot.className = "hc-conn-dot disconnected";
            label.textContent = t.disconnected || "Offline";
        } else {
            dot.className = "hc-conn-dot unknown";
            label.textContent = "";
        }
    }

    /**
     * Phase 8: Update active program display panel
     */
    _updateProgramDisplay() {
        const panel = this._el("hcProgramPanel");
        if (!panel) return;

        const activeProgram = this._getActiveProgram();
        if (!activeProgram) {
            panel.classList.add("hidden");
            return;
        }

        panel.classList.remove("hidden");
        const label = this._el("hcProgramLabel");
        const value = this._el("hcProgramValue");
        const progressBar = this._el("hcProgressBar");
        const progressFill = this._el("hcProgressFill");

        if (label) label.textContent = this._t.active_program || "Program";
        if (value) value.textContent = this._translateProgram(activeProgram);

        const progress = this._getProgress();
        if (progressBar && progressFill) {
            if (progress !== null) {
                progressBar.classList.remove("hidden");
                progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
            } else {
                progressBar.classList.add("hidden");
            }
        }
    }

    /**
     * Phase 8: Update feature chips (i-Dos, consumables, active options)
     */
    _updateFeatureChips() {
        const container = this._el("hcFeatures");
        if (!container) return;

        const t = this._t;
        const chips = [];

        // i-Dos indicators (washer)
        const idos1Active = this._hcEntity("idos1_active_entity")?.state === "on";
        const idos1Low = this._hcEntity("idos1_low_entity")?.state === "on";
        const idos2Active = this._hcEntity("idos2_active_entity")?.state === "on";
        const idos2Low = this._hcEntity("idos2_low_entity")?.state === "on";

        if (idos1Active)
            chips.push(`<div class="hc-chip ${idos1Low ? "warning" : "active"}">i-Dos 1${idos1Low ? " ⚠" : ""}</div>`);
        if (idos2Active)
            chips.push(`<div class="hc-chip ${idos2Low ? "warning" : "active"}">i-Dos 2${idos2Low ? " ⚠" : ""}</div>`);

        // Dishwasher consumables
        const saltLow = this._hcEntity("salt_low_entity")?.state === "on";
        const rinseaidLow = this._hcEntity("rinseaid_low_entity")?.state === "on";
        if (saltLow)
            chips.push(`<div class="hc-chip warning">🧂 ${t.salt_low || "Salt Low"}</div>`);
        if (rinseaidLow)
            chips.push(`<div class="hc-chip warning">💧 ${t.rinseaid_low || "Rinse Aid Low"}</div>`);

        // Active feature options
        const featureMap = [
            ["hygiene_plus_entity",       "🦠 " + (t.hygiene_plus      || "Hygiene+")],
            ["intensive_zone_entity",     "💪 " + (t.intensive_zone    || "Intensive")],
            ["variospeed_plus_entity",    "⚡ " + (t.variospeed_plus   || "Vario+")],
            ["silence_on_demand_entity",  "🔇 " + (t.silence_on_demand || "Silence")],
            ["brilliant_dry_entity",      "✨ " + (t.brilliant_dry     || "BrilliantDry")],
        ];
        for (const [key, label] of featureMap) {
            if (this._hcEntity(key)?.state === "on")
                chips.push(`<div class="hc-chip active">${label}</div>`);
        }

        container.innerHTML = chips.join("");
        container.classList.toggle("hidden", chips.length === 0);
    }

    /**
     * Phase 8: Orchestrate all HC status indicator updates
     */
    _updateStatusIndicators() {
        if (!this._isHomeConnectMode()) return;
        this._updateConnectivity();
        this._updateProgramDisplay();
        this._updateFeatureChips();
    }

    _updateDoorAnimation() {
        if (!this._isHomeConnectMode()) return;
        const doorGroup = this._el("doorGroup");
        const drumInterior = this._el("drumInterior");
        const wrap = this._el("wrap");
        if (!doorGroup) return;

        const doorState = this._getDoorState();
        const isOpen = doorState === "open";

        doorGroup.classList.toggle("door-open", isOpen);
        doorGroup.classList.toggle("door-closed", !isOpen);
        wrap?.classList.toggle("door-open", isOpen);
        wrap?.classList.toggle("door-closed", !isOpen);

        if (drumInterior) {
            drumInterior.style.opacity = isOpen ? "1" : "0";
        }
    }
}

if (!customElements.get("washing-machine-card")) {
    customElements.define("washing-machine-card", WashingMachineCard);
}

/**
 * Custom visual editor
 */
 
class WashingMachineCardEditor extends HTMLElement {
    static AUTO_LANGUAGE = "auto";
    static _defaultName(config, hass) {
        const S = WashingMachineCard.STRINGS;
        const cfgLang = config?.language;
        const isAuto = !cfgLang || cfgLang === WashingMachineCardEditor.AUTO_LANGUAGE;
        const lang = (!isAuto && S[cfgLang]) ? cfgLang : WashingMachineCard.detectLanguage(hass);
        const type = WashingMachineCard.normalizeType(config?.appliance_type);
        const base = S[lang] || S.en;
        return base.types?.[type]?.name || base.name;
    }

    constructor() {
        super();
        this._config = {};
        this._built = false;
        this._fieldEls = {};
    }

    setConfig(config) {
        this._config = {
            ...config
        };
        if (this._built)
            this._syncValues();
    }

    set hass(hass) {
        this._hass = hass;
        if (!this._built)
            this._build();
        else
            this._syncValues();
    }

    get hass() {
        return this._hass;
    }

    static get _sections() {
        const D = WashingMachineCard.DEFAULTS;
        return [{
                title: "Operating Mode",
                icon: "mdi:cog-outline",
                expanded: true,
                fields: [{
                    key: "mode",
                    kind: "select",
                    title: "Mode",
                    description: "Standard mode for basic appliances, Home Connect for smart appliances",
                    default: "standard",
                    selector: {
                        select: {
                            mode: "dropdown",
                            options: [{
                                value: "standard",
                                label: "Standard (current functionality)"
                            }, {
                                value: "home_connect",
                                label: "Home Connect (smart appliance features)"
                            }],
                        },
                    },
                }, {
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
                }],
            }, {
                title: "General",
                icon: "mdi:tune-variant",
                expanded: true,
                fields: [{
                        key: "name",
                        kind: "text",
                        title: "Card name",
                        dynamicDefault: true,
                    }, {
                        key: "appliance_type",
                        kind: "select",
                        title: "Appliance type",
                        required: true,
                    default:
                        D.appliance_type,
                        selector: {
                            select: {
                                mode: "dropdown",
                                options: [{
                                        value: "washer",
                                        label: "Washer"
                                    }, {
                                        value: "dryer",
                                        label: "Dryer / Tumbler"
                                    }, {
                                        value: "dishwasher",
                                        label: "Dishwasher"
                                    }, {
                                        value: "oven",
                                        label: "Oven"
                                    }, {
                                        value: "microwave",
                                        label: "Microwave"
                                    },
                                ],
                            },
                        },
                    }, {
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
                    },
                ],
            }, {
                title: "Appearance & language",
                icon: "mdi:palette-outline",
                fields: [{
                        key: "language",
                        kind: "select",
                        title: "Language",
                        required: true,
                    default:
                        WashingMachineCardEditor.AUTO_LANGUAGE,
                        selector: {
                            select: {
                                mode: "dropdown",
                                options: WashingMachineCardEditor._languageOptions(),
                            },
                        },
                    }, {
                        key: "theme",
                        kind: "select",
                        title: "Theme",
                        required: true,
                    default:
                        D.theme,
                        selector: {
                            select: {
                                mode: "dropdown",
                                options: [{
                                        value: "auto",
                                        label: "Auto (follow Home Assistant)"
                                    }, {
                                        value: "light",
                                        label: "Light"
                                    }, {
                                        value: "dark",
                                        label: "Dark"
                                    }, {
                                        value: "ha",
                                        label: "Home Assistant (native colours)"
                                    },
                                ],
                            },
                        },
                    }, {
                        key: "duration_format",
                        kind: "select",
                        title: "Duration time format",
                        required: true,
                    default:
                        D.duration_format,
                        selector: {
                            select: {
                                mode: "dropdown",
                                options: [{
                                        value: "minutes",
                                        label: "Raw minutes"
                                    }, {
                                        value: "hhmm",
                                        label: "Human-readable"
                                    },
                                ],
                            },
                        },
                    }, {
                        key: "hide_status_panel",
                        kind: "boolean",
                        title: "Hide status panel",
                        description: "Hide status panel only when appliance is off.",
                    default:
                        D.hide_status_panel,
                        selector: {
                            boolean: {}
                        },
                    },
                ],
            }, {
                title: "Power monitoring",
                icon: "mdi:flash-outline",
                fields: [{
                        key: "power_entity",
                        kind: "entity",
                        title: "Power sensor",
                        selector: {
                            entity: {
                                domain: "sensor"
                            }
                        },
                    }, {
                        key: "power_threshold",
                        kind: "number",
                        title: "Running threshold (W)",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                    default:
                        D.power_threshold,
                        min: 0,
                    }, {
                        key: "power_max",
                        kind: "number",
                        title: "Gauge max (W)",
                    default:
                        D.power_max,
                        min: 1,
                    },
                ],
            }, {
                title: "Controls & notifications",
                icon: "mdi:tune-variant",
                fields: [{
                        key: "plug_entity",
                        kind: "entity",
                        title: "Plug / switch entity",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                        selector: {
                            entity: {
                                domain: ["switch", "input_boolean"]
                            }
                        },
                    }, {
                        key: "confirm_plug_off",
                        kind: "boolean",
                        title: "Confirm before turning off plug",
                        description: "Show a confirmation popup when turning off the plug entity.",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                    default:
                        D.confirm_plug_off,
                        selector: {
                            boolean: {}
                        },
                    }, {
                        key: "notify_entity",
                        kind: "entity",
                        title: "Notification entity",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                        selector: {
                            entity: {}
                        },
                    },
                ],
            }, {
                title: "Last cycle stats",
                icon: "mdi:history",
                fields: [{
                        key: "last_wash_entity",
                        kind: "entity",
                        title: "Last start time entity",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                        selector: {
                            entity: {
                                domain: "input_datetime"
                            }
                        },
                    }, {
                        key: "duration_entity",
                        kind: "entity",
                        title: "Duration entity",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                        selector: {
                            entity: {
                                domain: "input_number"
                            }
                        },
                    }, {
                        key: "energy_entity",
                        kind: "entity",
                        title: "Energy entity",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                        selector: {
                            entity: {
                                domain: "input_number"
                            }
                        },
                    }, {
                        key: "cost_entity",
                        kind: "entity",
                        title: "Cost entity",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                        selector: {
                            entity: {
                                domain: "input_number"
                            }
                        },
                    }, {
                        key: "currency",
                        kind: "text",
                        title: "Currency symbol",
                        visibleWhen: (config) => {
                            const mode = config?.mode || "standard";
                            return mode === "standard";
                        },
                    default:
                        D.currency,
                    },
                ],
            },
        ];
    }

    static _languageOptions() {
        const codes = Object.keys(WashingMachineCard.STRINGS);
        return [{
                value: WashingMachineCardEditor.AUTO_LANGUAGE,
                label: "Auto (Home Assistant language)"
            },
            ...codes.map((code) => ({
                    value: code,
                    label: WashingMachineCard.languageDisplayName(code),
                })),
        ];
    }

    _build() {
        const root = this.shadowRoot || this.attachShadow({
            mode: "open"
        });
        root.innerHTML = `
      <style>
        :host { display: block; }
        .wm-editor { display: flex; flex-direction: column; gap: 16px; padding: 4px 0 8px; }

        .wm-field { display: flex; flex-direction: column; gap: 6px; }
        .wm-field-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--secondary-text-color, #6b7684);
          padding: 0 2px;
        }

        .wm-field-title--primary {
          color: var(--primary-text-color, #1c2733);
        }

        .wm-native-input {
          box-sizing: border-box;
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          color: var(--primary-text-color, #1c2733);
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #c2cbd6);
          border-radius: 4px;
          outline: none;
        }
        .wm-native-input:focus {
          border-color: var(--primary-color, #2f80ed);
          box-shadow: 0 0 0 1px var(--primary-color, #2f80ed);
        }
        .wm-native-input::placeholder {
          color: var(--secondary-text-color, #8a95a3);
          opacity: .75;
        }

        .wm-field--row {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .wm-field--row .wm-field-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .wm-field--row .wm-field-title { padding: 0; }
        .wm-field-desc {
          font-size: 11px;
          color: var(--secondary-text-color, #8a95a3);
        }
        .wm-field--row ha-selector { flex-shrink: 0; }

        ha-expansion-panel { border-radius: 8px; }
        .wm-section-body { display: flex; flex-direction: column; gap: 16px; padding: 12px; }
        .wm-section-header { display: flex; align-items: center; gap: 8px; }
        .wm-section-header ha-icon {
          color: var(--secondary-text-color, #6b7684);
          --mdc-icon-size: 20px;
        }
      </style>
      <div class="wm-editor" id="editor"></div>
    `;

        const editor = root.getElementById("editor");

        const sections = WashingMachineCardEditor._sections;

        sections.forEach((section) => {
            const panel = document.createElement("ha-expansion-panel");
            panel.outlined = true;
            if (section.expanded)
                panel.expanded = true;

            const header = document.createElement("div");
            header.slot = "header";
            header.className = "wm-section-header";
            const icon = document.createElement("ha-icon");
            icon.icon = section.icon;
            header.appendChild(icon);
            const span = document.createElement("span");
            span.textContent = section.title;
            header.appendChild(span);
            panel.appendChild(header);

            const body = document.createElement("div");
            body.className = "wm-section-body";
            section.fields.forEach((f) => body.appendChild(this._buildField(f)));
            panel.appendChild(body);

            editor.appendChild(panel);
        });

        this._built = true;
        this._syncValues();
    }

    _isChoiceField(field) {
        return field.kind === "select" || field.kind === "boolean";
    }

    _buildField(field) {
        const wrap = document.createElement("div");
        wrap.className = "wm-field" + (field.kind === "boolean" ? " wm-field--row" : "");

        // Apply initial visibility
        if (field.visibleWhen && !field.visibleWhen(this._config)) {
            wrap.style.display = "none";
        }

        if (field.kind === "boolean") {
            const textCol = document.createElement("div");
            textCol.className = "wm-field-text";
            const title = document.createElement("div");
            title.className = "wm-field-title wm-field-title--primary";
            title.textContent = field.title;
            textCol.appendChild(title);
            if (field.description) {
                const desc = document.createElement("div");
                desc.className = "wm-field-desc";
                desc.textContent = field.description;
                textCol.appendChild(desc);
            }
            wrap.appendChild(textCol);

            const sel = document.createElement("ha-selector");
            sel.label = "";
            sel.selector = field.selector;
            if (this._hass)
                sel.hass = this._hass;
            sel.addEventListener("value-changed", (ev) => {
                ev.stopPropagation();
                this._valueChanged(field, ev.detail.value);
            });
            wrap.appendChild(sel);
            this._fieldEls[field.key] = sel;
            return wrap;
        }

        const title = document.createElement("div");
        title.className = "wm-field-title";
        title.textContent = field.title;
        wrap.appendChild(title);

        if (field.kind === "text" || field.kind === "number") {
            const input = document.createElement("input");
            input.className = "wm-native-input";
            input.type = field.kind === "number" ? "number" : "text";
            if (field.kind === "number" && field.min !== undefined)
                input.min = String(field.min);
            input.addEventListener("input", () => {
                this._nativeValueChanged(field, input.value);
            });
            wrap.appendChild(input);
            this._fieldEls[field.key] = input;
            return wrap;
        }

        const sel = document.createElement("ha-selector");
        sel.label = "";
        sel.selector = field.selector;
        sel.required = !!field.required;
        if (this._hass)
            sel.hass = this._hass;
        sel.addEventListener("value-changed", (ev) => {
            ev.stopPropagation();
            this._valueChanged(field, ev.detail.value);
        });
        wrap.appendChild(sel);
        this._fieldEls[field.key] = sel;
        return wrap;
    }

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
    }

    _valueChanged(field, value) {
        if (!this._hass)
            return;
        let v = value;
        if (this._isChoiceField(field) && (v === undefined || v === "") && field.default !== undefined) {
            v = field.default;
        }
        if (field.key === "appliance_type")
            v = WashingMachineCard.normalizeType(v);
        this._commit(field, v);
    }

    _nativeValueChanged(field, rawValue) {
        const trimmed = String(rawValue ?? "").trim();
        let v;
        if (trimmed === "") {
            v = undefined;
        } else if (field.kind === "number") {
            const n = parseFloat(trimmed);
            v = isNaN(n) ? undefined : n;
        } else {
            v = trimmed;
        }
        this._commit(field, v);
    }

    _commit(field, v) {
        const newConfig = {
            ...this._config
        };
        if (v === undefined || v === "") {
            delete newConfig[field.key];
        } else {
            newConfig[field.key] = v;
        }
        this._config = newConfig;

        this.dispatchEvent(
            new CustomEvent("config-changed", {
                detail: {
                    config: this._config
                },
                bubbles: true,
                composed: true,
            }));
    }
}

if (!customElements.get("washing-machine-card-editor")) {
    customElements.define("washing-machine-card-editor", WashingMachineCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: "washing-machine-card",
    name: "Washing Machine Animated Card",
    description:
    "Oikos-style animated appliance card (washer / dryer / dishwasher / oven / microwave): live status, power gauge, last-cycle stats, light and dark theme",
	preview: true,
	documentationURL: "https://github.com/sionetta/wm_animated_ha_card",
});

/* ============================================================
Example configuration:

type: custom:washing-machine-card
appliance_type: washer                      # washer | dryer | dishwasher | oven | microwave
name: Washing machine
status_entity: binary_sensor.washing_in_progress
plug_entity: switch.washing_machine_plug
notify_entity: automation.washing_finished
power_entity: sensor.washing_machine_power
power_threshold: 10
power_max: 2500
last_wash_entity: input_datetime.wm_last_start
duration_entity: input_number.wm_last_duration
duration_format: minutes                    # minutes | hhmm (e.g. "1h05" once it reaches 60 min)
energy_entity: input_number.wm_last_energy
cost_entity: input_number.wm_last_cost
currency: "€"
language: auto                              # auto | en | ru | de | fr (auto = match Home Assistant's language)
theme: auto                                 # auto | light | dark | ha (ha = native Home Assistant colours)
hide_status_panel: false                    # true hides the status panel while idle
confirm_plug_off: true                      # true displays a confirmation popup before turning off the `plug_entity`.

# Other appliances — same config, one line changed:
# appliance_type: dryer        (alias: tumbler)
# appliance_type: dishwasher
# appliance_type: oven
# appliance_type: microwave
============================================================ */
