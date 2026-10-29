-- Reactive client state.
--   EvoLib.state.get(key)            current value (nil when unset)
--   EvoLib.state.set(key, value)     change a value, listeners run when it actually changes
--   EvoLib.state.on(key, fn)         fn(new, old); returns a listener id
--   EvoLib.state.off(id)
--   EvoLib.state.all()               copy of every value
-- Built-in keys refreshed every 100 ms: ped, vehicle, seat, weapon (false when none), playerId, serverId.
-- The server writes keys with EvoLib.state.push(src, key, value). Each change is also fired as the
-- local event 'evo-lib:state:<key>' (new, old) for resources that prefer plain events.

local values = {}
local listeners = {}   -- [key] = { [id] = fn }
local listenerKey = {} -- [id] = key
local nextListener = 0

local state = {}

function state.get(key)
    return values[key]
end

function state.set(key, value)
    if type(key) ~= 'string' then return end
    local old = values[key]
    if old == value then return end
    values[key] = value

    if EvoConfig.Debug and key ~= 'ped' then
        Core.trace('state %s: %s -> %s', key, tostring(old), tostring(value))
    end

    TriggerEvent('evo-lib:state:' .. key, value, old)
    for _, fn in pairs(listeners[key] or {}) do
        CreateThread(function()
            local ok, err = pcall(fn, value, old)
            if not ok then Core.warn('state listener for "%s" failed: %s', key, tostring(err)) end
        end)
    end
end

---@return number listener id
function state.on(key, fn)
    if type(key) ~= 'string' or (type(fn) ~= 'function' and type(fn) ~= 'table') then return nil end
    nextListener = nextListener + 1
    local id = nextListener
    listeners[key] = listeners[key] or {}
    listeners[key][id] = fn
    listenerKey[id] = key
    Core.own(Core.caller(), function() state.off(id) end)
    return id
end

function state.off(id)
    local key = listenerKey[id]
    if not key then return end
    listenerKey[id] = nil
    if listeners[key] then listeners[key][id] = nil end
end

function state.all()
    local copy = {}
    for key, value in pairs(values) do copy[key] = value end
    return copy
end

EvoLib.state = state

RegisterNetEvent('evo-lib:state:push', function(key, value)
    if type(key) ~= 'string' then return end
    state.set(key, value)
end)

CreateThread(function()
    local playerId = PlayerId()
    state.set('playerId', playerId)
    state.set('serverId', GetPlayerServerId(playerId))

    while true do
        local ped = PlayerPedId()
        state.set('ped', ped)

        local vehicle = GetVehiclePedIsIn(ped, false)
        if vehicle ~= 0 then
            state.set('vehicle', vehicle)
            local seat = values.seat
            if not seat or GetPedInVehicleSeat(vehicle, seat) ~= ped then
                seat = false
                for index = -1, GetVehicleMaxNumberOfPassengers(vehicle) - 1 do
                    if GetPedInVehicleSeat(vehicle, index) == ped then
                        seat = index
                        break
                    end
                end
                state.set('seat', seat)
            end
        else
            state.set('vehicle', false)
            state.set('seat', false)
        end

        local armed, weapon = GetCurrentPedWeapon(ped, true)
        state.set('weapon', armed and weapon or false)

        Wait(100)
    end
end)
