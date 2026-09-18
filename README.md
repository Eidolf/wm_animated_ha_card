# 🏠 Animated Appliance Card for Home Assistant

**English** | [Русский](README_RU.md) | [Deutsch](README_DE.md) | [Français](README_FR.md)

An Oikos-inspired Lovelace card that turns a *dumb* washer, dryer, dishwasher, oven or microwave on a smart plug into a beautiful, animated dashboard widget — or connects natively to a **Home Connect** smart appliance (Bosch, Siemens, Neff, Gaggenau) for program selection, remote control and live status.

![Demo](media/demo_en.gif)

<sub>Same card in other UI languages: [Русский](media/demo_ru.gif) · [Deutsch](media/demo_de.gif) · [Français](media/demo_fr.gif)</sub>

## ✨ Features

- **Five appliances, one card** — `washer`, `dryer`, `dishwasher`, `oven` and `microwave`, each with its own illustration, icon and wording. Switch with a single line: `appliance_type: dryer`.
- **Animated while running** — laundry tumbles behind the glass, dishwasher jets sweep, the oven glows, the microwave turntable turns. All animation is pure CSS/SVG, no external assets, and it respects `prefers-reduced-motion`.
- **🏠 Home Connect mode** — set `mode: home_connect` for native integration with Bosch/Siemens/Neff/Gaggenau appliances: program selector, remote start/pause/stop, door animation, connectivity indicator, feature chips (i-Dos, HygienePlus, etc.) and options dialog.
- **Light and dark themes** — the card follows your Home Assistant theme automatically, or you can pin it with `theme: light | dark`. A fourth value, `theme: ha`, drops the card's own palette and uses the colours of your active Home Assistant theme.
- **Live status** — a pulsing "RUNNING / IDLE" badge, an elapsed-time ring and a power gauge with automatic unit handling (`1950 W` is shown as `1.95 kW`; an ampere sensor is labelled "Current draw" automatically).
- **Last cycle summary** — start time ("Today, 09:55"), duration, energy and cost, each column tappable for more-info.
- **Quick actions** — header buttons toggle the smart plug and the finish-notification automation, and open the power history.
- **Four languages** — English, Russian, German and French labels out of the box. The language follows your Home Assistant profile, or set `language: en | ru | de | fr` explicitly.
- **Visual editor** — the card ships a config form, so it can be set up from the UI without touching YAML.
- **Zero dependencies** — a single vanilla-JS file with Shadow DOM. Every entity option except `status_entity` (standard mode) is optional: blocks without an entity are simply hidden. Responsive via CSS container queries.

## 🌗 Light and dark

![Light and dark theme](media/themes_en.jpg)

`theme: auto` (the default) follows Home Assistant: switch your dashboard to a dark theme and the card follows on the next render. `theme: light` and `theme: dark` pin it regardless of the dashboard. `theme: ha` works differently: instead of the card's own palette it takes the colours of whichever Home Assistant theme is active, so the card blends into a custom theme.

## 📦 Installation

Two steps: first the card itself, then the entities it displays.

### Step 1 — the card

**Manual**

1. Copy [`washing-machine-card.js`](washing-machine-card.js) to `/config/www/`.
2. Add a dashboard resource (Settings → Dashboards → Resources, or `lovelace: resources:` in YAML mode):

   ```yaml
   url: /local/washing-machine-card.js?v=5
   type: module
   ```

   Bump `?v=` after every update to bust the browser cache.

**HACS**

Add `https://github.com/sionetta/wm_animated_ha_card` as a **custom repository** (type: Dashboard), then install *Washing Machine Animated Card*.

### Step 2 — the appliance entities

The card only displays data, and `status_entity` is required, so this step cannot be skipped.

**A smart appliance** (Home Connect, Miele@home, LG ThinQ, SmartHQ) already reports its own state — go straight to "Using it with a smart appliance" below.

**An ordinary appliance on a smart plug** — the ready-made package creates everything:

1. Find your plug's sensors in Developer tools → States: power (W) and cumulative energy (kWh), e.g. `sensor.washer_plug_power` and `sensor.washer_plug_energy`.

2. Enable packages in `configuration.yaml` (if a `homeassistant:` block already exists, add the line to it):

   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```

3. Copy [`examples/washing_machine_package.yaml`](examples/washing_machine_package.yaml) to `/config/packages/washing_machine.yaml`.

4. Replace `sensor.YOUR_PLUG_power` and `sensor.YOUR_PLUG_energy` in it with your own.

5. Restart Home Assistant.

6. Set your electricity price in `input_number.el_tarif` — it defaults to zero, and without a tariff the cycle cost will always be `0.00`.

7. Check that the entities appeared:

   | Entity | Purpose |
   |---|---|
   | `binary_sensor.washing_in_progress` | for `status_entity` |
   | `input_datetime.wm_last_start` | cycle start |
   | `input_number.wm_last_duration` | duration |
   | `input_number.wm_last_energy` | energy |
   | `input_number.wm_last_cost` | cost |
   | `input_number.el_tarif` | your tariff (step 6) |
   | `input_number.wm_energy_start` | internal |

8. Add the card to your dashboard — see "Configuration" below.

> The notification arrives as a `persistent_notification`. For your phone, replace the last block of the automation with your own `notify.mobile_app_...`.
>
> For a dryer, dishwasher, oven or microwave, copy the package under a different name with different entity prefixes, and set the matching `appliance_type` on the card.
>
> Without packages: the same helpers can be created in the Home Assistant UI, and the automations pasted into the automation editor (⋮ → Edit in YAML).

## ⚙️ Configuration

```yaml
type: custom:washing-machine-card
appliance_type: washer                             # washer | dryer | dishwasher | oven | microwave
name: Washing machine
status_entity: binary_sensor.washing_in_progress   # REQUIRED
plug_entity: switch.washing_machine_plug           # plug button, tap = toggle
notify_entity: automation.washing_finished         # notification button, tap = toggle
power_entity: sensor.washing_machine_power         # gauge + running detection
power_threshold: 10                                # running above this value
power_max: 2500                                    # gauge maximum
last_wash_entity: input_datetime.wm_last_start     # cycle start timestamp
duration_entity: input_number.wm_last_duration     # cycle duration, minutes
energy_entity: input_number.wm_last_energy         # kWh per cycle
cost_entity: input_number.wm_last_cost             # cost per cycle
hide_status_panel: true                            # Hide status panel only when idle (Default: false)
duration_format: minutes                           # minutes / hhmm
confirm_plug_off: true                             # displays a confirmation popup before turning off the `plug_entity`
currency: "€"
language: en                                       # auto / en / ru / de / fr (auto = follow Home Assistant)
theme: auto                                        # auto / light / dark / ha
```

| Option | Required | Default | Description |
|---|---|---|---|
| `status_entity` | **yes** | — | Entity whose state marks a running cycle. A template `binary_sensor` on the plug's power/current works great; textual states (`washing`, `spin`, …) are matched via `running_states`. |
| `appliance_type` | no | `washer` | Visual + labels: `washer`, `dryer` (alias `tumbler`), `dishwasher`, `oven` or `microwave`. |
| `name` | no | localized | Card title (defaults depend on `appliance_type`). |
| `plug_entity` | no | — | Smart plug switch; shown as a header button, tap toggles it. |
| `notify_entity` | no | — | Automation/switch/input_boolean for the "cycle finished" notification; tap toggles it. |
| `power_entity` | no | — | Power (W) or current (A) sensor: red gauge, value display and a second "running" detector. |
| `power_threshold` | no | `10` | Above this value the appliance counts as running. |
| `power_max` | no | `2500` | Gauge maximum, in `power_entity` units. |
| `last_wash_entity` | no | — | `input_datetime` with the cycle start; also the source of the elapsed time. |
| `duration_entity` | no | — | Last cycle duration in minutes. |
| `energy_entity` | no | — | Energy per cycle, kWh. |
| `cost_entity` | no | — | Cost per cycle. |
| `currency` | no | `€` | Currency symbol for the cost column. |
| `running_states` | no | on, washing, run, spin, rinse, … | States of `status_entity` treated as "running" (English, Russian, German and French states are recognised). |
| `hide_status_panel` | no | false | Hide status panel only when idle. |
| `duration_format` | no | minutes | `minutes`, `hhmm`. Formats the last cycle duration. When `duration_format` is set to `hhmm` and the duration is 60 minutes or longer, the value is displayed in HHhMM format (for example, 1h05). |
| `confirm_plug_off` | no | true | Displays a confirmation popup before turning off the `plug_entity`. |
| `language` | no | `auto` | `auto`, `en`, `ru`, `de` or `fr`. |
| `theme` | no | `auto` | `auto`, `light` and `dark` use the card's own styling. `ha` adopts your Home Assistant theme colors instead. |

## 🧺 Appliance types

| `appliance_type` | Default title | Running label |
|---|---|---|
| `washer` | Washing machine | Washing |
| `dryer` (alias `tumbler`) | Dryer | Drying |
| `dishwasher` | Dishwasher | Washing dishes |
| `oven` | Oven | Baking |
| `microwave` | Microwave | Heating |

Titles and labels are translated into all four languages; `name` overrides the title.

## 🔌 Standard mode — dumb appliance on a smart plug

If your appliance has no Wi-Fi, everything is derived from a smart plug with power monitoring:

- a template `binary_sensor` (power above a threshold, with `delay_off` of a few minutes) drives the status;
- a small automation stores the cycle start into `input_datetime`, and on finish writes duration, energy and cost into `input_number` helpers the card shows as the "Last cycle" panel.

The ready-made package that creates all of this is installed in step 2 above.

## 🏠 Home Connect mode

Set `mode: home_connect` to connect the card natively to a **Bosch, Siemens, Neff or Gaggenau** appliance via the [Home Connect integration](https://www.home-assistant.io/integrations/home_connect/).

No helpers, no automations, no template sensors. Point each entity key at the corresponding entity from the integration and the card handles the rest.

### Minimal washer config

```yaml
type: custom:washing-machine-card
mode: home_connect
appliance_type: washer
home_connect:
  washer:
    operation_state_entity: sensor.washer_operation_state
    active_program_entity: sensor.washer_active_program
    progress_entity: sensor.washer_program_progress
    remaining_time_entity: sensor.washer_remaining_program_time
    connectivity_entity: binary_sensor.washer_connectivity
    door_entity: binary_sensor.washer_door
    power_entity: switch.washer_power
    remote_start_entity: binary_sensor.washer_remote_start
    remote_control_entity: binary_sensor.washer_remote_control
    program_selector_entity: select.washer_active_program
    temperature_entity: select.washer_temperature
    spin_speed_entity: select.washer_spin_speed
    child_lock_entity: switch.washer_child_lock
```

### Minimal dishwasher config

```yaml
type: custom:washing-machine-card
mode: home_connect
appliance_type: dishwasher
home_connect:
  dishwasher:
    operation_state_entity: sensor.dishwasher_operation_state
    active_program_entity: sensor.dishwasher_active_program
    progress_entity: sensor.dishwasher_program_progress
    connectivity_entity: binary_sensor.dishwasher_connectivity
    door_entity: binary_sensor.dishwasher_door
    power_entity: switch.dishwasher_power
    remote_start_entity: binary_sensor.dishwasher_remote_start
    remote_control_entity: binary_sensor.dishwasher_remote_control
    program_selector_entity: select.dishwasher_active_program
    hygiene_plus_entity: switch.dishwasher_hygiene_plus
    intensive_zone_entity: switch.dishwasher_intensive_zone
    variospeed_plus_entity: switch.dishwasher_variospeed_plus
    salt_low_entity: binary_sensor.dishwasher_salt_nearly_empty
    rinseaid_low_entity: binary_sensor.dishwasher_rinse_aid_nearly_empty
```

### HC entity reference — washer

| Key | Entity type | Purpose |
|---|---|---|
| `operation_state_entity` | `sensor` | Core state: `Inactive` `Ready` `DelayedStart` `Run` `Pause` `Finished` `Error` |
| `active_program_entity` | `sensor` | Currently running program |
| `selected_program_entity` | `sensor` | Program selected but not yet started |
| `progress_entity` | `sensor` | Completion percentage 0–100 |
| `remaining_time_entity` | `sensor` | Time remaining (ISO 8601 or seconds) |
| `end_time_entity` | `sensor` | Estimated finish datetime |
| `connectivity_entity` | `binary_sensor` | Online/offline indicator in header |
| `door_entity` | `binary_sensor` | Animates drum door open/closed |
| `power_entity` | `switch` | Appliance on/off; header button |
| `remote_start_entity` | `binary_sensor` | Remote start permission |
| `remote_control_entity` | `binary_sensor` | Remote control permission |
| `program_selector_entity` | `select` | Opens program selector dialog |
| `start_entity` | `switch` | Start program |
| `pause_entity` | `switch` | Pause program |
| `stop_entity` | `button` | Stop/abort program |
| `temperature_entity` | `select` | Washing temperature option |
| `spin_speed_entity` | `select` | Spin speed option |
| `child_lock_entity` | `switch` | Child lock toggle |
| `idos1_active_entity` | `binary_sensor` | i-Dos 1 active indicator |
| `idos1_low_entity` | `binary_sensor` | i-Dos 1 low level warning |
| `idos2_active_entity` | `binary_sensor` | i-Dos 2 active indicator |
| `idos2_low_entity` | `binary_sensor` | i-Dos 2 low level warning |

### HC entity reference — dishwasher

| Key | Entity type | Purpose |
|---|---|---|
| `operation_state_entity` | `sensor` | Core state (same values as washer) |
| `active_program_entity` | `sensor` | Currently running program |
| `selected_program_entity` | `sensor` | Program selected but not yet started |
| `progress_entity` | `sensor` | Completion percentage 0–100 |
| `remaining_time_entity` | `sensor` | Time remaining |
| `end_time_entity` | `sensor` | Estimated finish datetime |
| `connectivity_entity` | `binary_sensor` | Online/offline indicator |
| `door_entity` | `binary_sensor` | Animates door fold-down |
| `power_entity` | `switch` | Appliance on/off |
| `remote_start_entity` | `binary_sensor` | Remote start permission |
| `remote_control_entity` | `binary_sensor` | Remote control permission |
| `program_selector_entity` | `select` | Opens program selector dialog |
| `start_entity` | `switch` | Start program |
| `pause_entity` | `switch` | Pause program |
| `stop_entity` | `button` | Stop/abort program |
| `child_lock_entity` | `switch` | Child lock toggle |
| `hygiene_plus_entity` | `switch` | HygienePlus feature chip + toggle |
| `intensive_zone_entity` | `switch` | IntensiveZone feature chip + toggle |
| `variospeed_plus_entity` | `switch` | VarioSpeed Plus feature chip + toggle |
| `silence_on_demand_entity` | `switch` | Silence on Demand feature chip + toggle |
| `brilliant_dry_entity` | `switch` | BrilliantDry feature chip + toggle |
| `salt_low_entity` | `binary_sensor` | Salt low warning chip |
| `rinseaid_low_entity` | `binary_sensor` | Rinse aid low warning chip |

### HC mode UI overview

| Area | What appears |
|---|---|
| **Header** | Connectivity dot, Options (⚙) button, Power button |
| **Hero** | SVG with animated door (open/close) and optional SVG controls |
| **Status panel** | State text, active program name, progress bar, feature chips |
| **Dialog** | Program selector grid or Options sheet (temperature, spin, feature toggles) |

### Migration — standard → home_connect

Your existing standard-mode config continues to work unchanged. To upgrade:

1. Add `mode: home_connect` at the top level.
2. Add a `home_connect:` block under your `appliance_type`.
3. Remove `status_entity` (it is no longer required).
4. Optionally keep `power_entity`, `energy_entity`, `cost_entity`, `currency` — they still work alongside HC entities.

Full examples: [`examples/hc_washer.yaml`](examples/hc_washer.yaml) · [`examples/hc_dishwasher.yaml`](examples/hc_dishwasher.yaml)

> **Note:** Home Connect appliances drop to `unavailable` when powered off at the mains or when they lose Wi-Fi. This is expected — all entities return once the appliance is powered on again.

## 🧺 Appliance types

| `appliance_type` | Default title | Running label |
|---|---|---|
| `washer` | Washing machine | Washing |
| `dryer` (alias `tumbler`) | Dryer | Drying |
| `dishwasher` | Dishwasher | Washing dishes |
| `oven` | Oven | Baking |
| `microwave` | Microwave | Heating |

Titles and labels are translated into all four languages; `name` overrides the title.

## 🧠 How it works with a dumb appliance

The appliance itself reports nothing — everything is derived from a smart plug with power monitoring:

- a template `binary_sensor` (power above a threshold, with `delay_off` of a few minutes so inter-cycle pauses don't count as "finished") drives the status;
- a small automation stores the cycle start into `input_datetime`, and on finish writes duration, energy and cost into `input_number` helpers which the card displays as the "Last cycle" panel.

The ready-made package that creates all of this is installed in step 2 above.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the release history.

## 📄 License

[MIT](LICENSE) © 2026 [Eidolf](https://github.com/Eidolf)
