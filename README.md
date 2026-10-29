<h1 align="center">evo-lib</h1>

<p align="center"><code>S C R I P T S</code></p>

<p align="center">
  <a href="https://github.com/Evo-Scripts/evo-lib/releases"><img src="https://img.shields.io/github/v/release/Evo-Scripts/evo-lib?style=for-the-badge&color=19D3F5&labelColor=0B0D11&label=RELEASE" alt="Release"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/LICENSE-GPL--3.0-19D3F5?style=for-the-badge&labelColor=0B0D11" alt="GPL-3.0"></a>
  <img src="https://img.shields.io/badge/FIVEM-LUA%205.4-19D3F5?style=for-the-badge&labelColor=0B0D11" alt="FiveM Lua 5.4">
  <img src="https://img.shields.io/badge/ESX%20%2F%20QBCORE%20%2F%20QBX-READY-19D3F5?style=for-the-badge&labelColor=0B0D11" alt="ESX, QBCore, QBX">
  <a href="https://discord.gg/evoscripts"><img src="https://img.shields.io/badge/DISCORD-JOIN-19D3F5?style=for-the-badge&labelColor=0B0D11" alt="Discord"></a>
</p>

<h3 align="center">Write it once. Run it on any server.</h3>

<p align="center">
  evo-lib is the shared core of every Evo resource. Framework, inventory, banking, target, clothing,<br>
  vehicle keys and fuel sit behind one API, next to a built-in UI for notifications, progress and key hints.<br>
  It detects what your server runs on start; everything you might want to change lives in one folder.
</p>

<p align="center">
  <a href="#installation"><b>Install</b></a> &nbsp;/&nbsp;
  <a href="#configuration"><b>Config</b></a> &nbsp;/&nbsp;
  <a href="#the-ui"><b>UI</b></a> &nbsp;/&nbsp;
  <a href="#api-reference-server"><b>Server API</b></a> &nbsp;/&nbsp;
  <a href="#api-reference-client"><b>Client API</b></a> &nbsp;/&nbsp;
  <a href="#custom-framework-or-inventory"><b>Custom framework</b></a> &nbsp;/&nbsp;
  <a href="https://evo-scripts.tebex.io"><b>Store</b></a>
</p>

<br>

**Server**: give a bonus to on-duty police

```lua
if EvoLib.job.is(source, 'police')
   and EvoLib.items.has(source, 'handcuffs') then
    EvoLib.money.add(source, 500, 'bank', 'arrest bonus')
    EvoLib.notify(source, {
        title = 'Bonus',
        description = 'You received **$500**.',
        type = 'success',
    })
end
```

**Client**: progress bar, 3D sound and text UI

```lua
local done = EvoLib.ui.progress({
    label = 'Picking the lock',
    duration = 5000,
    anim = { dict = 'mp_arresting', clip = 'a_uncuff' },
    cancelable = true,
})
if done then
    EvoLib.sound.playAt(GetEntityCoords(PlayerPedId()), 'unlock', { range = 8.0 })
    EvoLib.ui.showText({ key = 'E', label = 'Open door' })
end
```

<table>
<tr>
<td width="33%" valign="top">

#### Zero setup
Framework, inventory, banking, target, clothing, keys and fuel are detected on start. Force or disable any of them in `config.lua`.

</td>
<td width="33%" valign="top">

#### Safe by default
Item and money writes check balances first. Stash moves are validated and rolled back on the server. Callbacks only accept the player that was asked.

</td>
<td width="33%" valign="top">

#### Cleans up after you
Callbacks, usable items, points, target zones, keybinds, DUIs and state listeners are removed when your resource stops.

</td>
</tr>
<tr>
<td valign="top">

#### Patch, don't fork
Replace one framework or inventory function from `editable/` without touching the library.

</td>
<td valign="top">

#### UI included
Slant notification cards, a segmented progress bar and key-cap hints, tinted by one accent colour.

</td>
<td valign="top">

#### 3D sounds
NUI sound engine with live distance falloff, or xsound when it is running.

</td>
</tr>
</table>

<br>

<a id="features"></a>
## Features

| Area | Supported |
| --- | --- |
| Frameworks | ESX Legacy, QBCore, QBX, custom (`editable/`) |
| Inventories | ox_inventory, qb-inventory (v2 and v1), ps-inventory, lj-inventory, codem-inventory, jaksam_inventory, custom, framework items |
| Banking (society) | Renewed-Banking, okokBanking, qb-banking, qb-management, esx_society |
| Target | ox_target, qb-target |
| Clothing | evo-appearance, illenium-appearance, fivem-appearance, qb-clothing, esx_skin / skinchanger |
| Vehicle keys | qbx_vehiclekeys, qb-vehiclekeys, wasabi_carlock, mk_vehiclekeys |
| Fuel | ox_fuel, LegacyFuel, cdn-fuel, ps-fuel, lc_fuel, native |
| Notifications | built-in, ESX, QBCore, ox_lib, custom |
| Sounds | built-in NUI player (live distance falloff), xsound |

Everything is detected automatically and every integration can be forced or turned off in the config.

<br>

<a id="installation"></a>
## Installation

1. Download the latest release from [Releases](https://github.com/Evo-Scripts/evo-lib/releases).
   Release zips contain the built UI. If you cloned the repository, build the UI first
   (see [Building the UI](#building-the-ui)).
2. Put the folder in your resources as **`evo-lib`** (the name matters, other scripts look it up by it).
3. Start it after your framework, inventory and `oxmysql`, and before any script that uses it:

   ```cfg
   ensure oxmysql
   ensure es_extended      # or qb-core / qbx_core
   ensure ox_inventory     # or your inventory
   ensure evo-lib
   ensure evo-whatever     # scripts that use evo-lib
   ```

Requirements: FiveM server artifact with Lua 5.4 support, [oxmysql](https://github.com/overextended/oxmysql).

<br>

<a id="configuration"></a>
## Configuration

Server owners only touch the `editable/` folder:

| File | Purpose |
| --- | --- |
| `editable/shared/config.lua` | All settings (`EvoConfig`). Shared with clients: no secrets here. |
| `editable/server/webhooks.lua` | Discord webhook urls (server only). |
| `editable/server/framework.lua`, `editable/client/framework.lua` | Custom framework functions and per-function patches. |
| `editable/server/inventory.lua`, `editable/client/inventory.lua` | Custom inventory functions and per-function patches. |
| `editable/server/notify.lua`, `editable/client/notify.lua` | Custom notification backend. |

The most used settings:

```lua
EvoConfig.Locale = 'en'            -- 'en' | 'pl'
EvoConfig.Framework = 'auto'       -- 'auto' | 'esx' | 'qb' | 'qbx' | 'custom'
EvoConfig.Inventory = 'auto'       -- 'auto' | 'ox_inventory' | 'qb-inventory' | 'codem-inventory' | 'jaksam_inventory' | 'custom'
EvoConfig.Notify = 'evo'           -- 'evo' (built-in) | 'esx' | 'qb' | 'ox' | 'custom'

EvoConfig.Integrations = {
    Banking = 'auto', VehicleKeys = 'auto', Target = 'auto',
    Clothing = 'auto', Fuel = 'auto', Sound = 'auto',
}

EvoConfig.UI = {
    Accent = '#19D3F5',                              -- any hex colour
    Notify = { Position = 'top-right', Duration = 5000, MaxVisible = 5 },
    Progress = { Offset = 14, CancelKey = 73, CancelLabel = 'X' },
    TextUI = { Position = 'left' },
}
```

See the comments in `config.lua` for the rest (admin checks, police jobs, plates, stash fallback,
database tables, item images, developer tools).

<br>

## Using evo-lib in your resource

Add the import to your `fxmanifest.lua`:

```lua
shared_script '@evo-lib/init.lua'
```

and use the global `EvoLib` anywhere. Without the import:

```lua
local EvoLib = exports['evo-lib']:get()
```

Server and client get different modules under the same names where it makes sense (`EvoLib.items` reads
your own items on the client and edits anyone's items on the server).

Notes:

- Functions that wait for the server (`callback.await`, `money.get`, `license.has`, `ui.progress`, ...)
  must run inside a thread or an event handler.
- Things you register (callbacks, usable items, points, target zones, keybinds, DUIs, state listeners)
  are removed automatically when your resource stops.
- `EvoLib.framework` and `EvoLib.inventory` tell you what was detected.

<br>

<a id="the-ui"></a>
## The UI

The built-in UI is drawn on the 12 degree slant that runs through every Evo resource.

| Piece | Where | What it looks like |
| --- | --- | --- |
| Notifications | top-right stack (configurable) | Slanted cards that slide in from the edge, a coloured slash per type (success, error, warning, info), a lifetime bar along the bottom and a counter when the same message repeats |
| Progress bar | bottom centre | Archivo title over a twelve-segment skewed track with a moving hatch, a percentage, the time left and the cancel key |
| Text UI | left edge, middle (configurable) | A glowing key cap next to a slanted label chip |

The accent (`EvoConfig.UI.Accent`, or `EvoLib.ui.setAccent` at runtime) recolours fills, key caps and
highlights; lighter and darker shades are derived from it. Fonts (Archivo, Inter Tight, IBM Plex Mono)
ship inside the resource, so the UI works on servers without internet access.

<br>

<a id="api-reference-server"></a>
## API reference: server

### Callbacks

```lua
-- Handler returns its answer (multiple values are fine) and may yield.
EvoLib.callback.register('my_script:getPrice', function(source, itemName)
    return Prices[itemName] or 0
end)

EvoLib.callback.unregister('my_script:getPrice')
EvoLib.callback.call('my_script:getPrice', source, 'water')   -- run a handler directly

-- Ask a client handler (registered on the client) and wait for the answer.
local heading = EvoLib.callback.awaitClient(source, 'my_script:heading', nil, 5000)
```

Each player can have at most 32 requests in flight; answers to `awaitClient` are only accepted from the
player that was asked.

### Players

```lua
EvoLib.player.get(source)                -- xPlayer / QBCore Player / custom object
EvoLib.player.list()                     -- { 1, 4, 7 }
EvoLib.player.identifier(source)         -- ESX identifier / citizenid
EvoLib.player.name(source)               -- 'John Smith'
EvoLib.player.group(source)              -- 'admin'
EvoLib.player.gender(source)             -- 'male' | 'female'
EvoLib.player.fromIdentifier('ABC123')   -- source or nil
EvoLib.player.isAdmin(source)            -- ACE, identifiers, groups from EvoConfig.Admin
EvoLib.player.isAdmin(source, { ace = 'myscript.admin', groups = { 'god' }, identifiers = { 'discord:123' } })
```

### Jobs

```lua
local job = EvoLib.job.get(source)       -- { name, label, grade, gradeLabel, onDuty }
EvoLib.job.is(source, 'police')          -- also accepts { 'police', 'sheriff' } or { police = true }
EvoLib.job.set(source, 'mechanic', 2)
EvoLib.job.setOffline('ABC123', 'unemployed', 0)   -- goes through job.set when the character is online
EvoLib.job.setDuty(source, true)
EvoLib.job.all()                         -- { police = { label, type, grades = { [0] = { label, payment, isboss } } } }
EvoLib.job.copsOnline()                  -- jobs from EvoConfig.PoliceJobs (optionally on duty only)
```

### Money

Accounts: `'cash'` (default), `'bank'`, `'black'` or any account name your framework knows.

```lua
EvoLib.money.get(source, 'bank')
EvoLib.money.add(source, 250, 'cash', 'job payout')
EvoLib.money.remove(source, 100, 'bank', 'fine')   -- false when the balance is too low
EvoLib.money.has(source, 1000, 'cash')
```

### License

evo-lib is free software under the [GNU General Public License v3.0](LICENSE).

<br>

<p align="center">
  <a href="https://evo-scripts.tebex.io"><img src="https://img.shields.io/badge/MADE%20BY-EVO%20SCRIPTS-19D3F5?style=for-the-badge&labelColor=0B0D11" alt="Made by Evo Scripts"></a>
</p>
