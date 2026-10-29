-- Callbacks (client side).
--   EvoLib.callback.await(name, payload, timeoutMs) -> values returned by the server handler (blocking)
--   EvoLib.callback.trigger(name, payload, cb)      -> non-blocking, cb(...) receives the values
--   EvoLib.callback.register(name, fn)              -> client handler answered to EvoLib.callback.awaitClient

local waiting = {}
local nextRequest = 0
local handlers = {}

local callback = {}

---Blocking server callback. Call it from a thread (event handler / CreateThread).
---@return ... handler results, nothing on timeout or error
function callback.await(name, payload, timeoutMs)
    if type(name) ~= 'string' then error('EvoLib.callback.await expects a callback name', 2) end

    nextRequest = nextRequest + 1
    local requestId = nextRequest
    local answer = promise.new()
    waiting[requestId] = answer

    SetTimeout(tonumber(timeoutMs) or 15000, function()
        if waiting[requestId] then
            waiting[requestId] = nil
            answer:resolve(false)
            Core.trace('callback "%s" timed out', name)
        end
    end)

    TriggerServerEvent('evo-lib:cb:req', name, requestId, payload)

    local packed = Citizen.Await(answer)
    if type(packed) ~= 'table' then return nil end
    return table.unpack(packed, 1, packed.n or #packed)
end

---Non-blocking server callback.
function callback.trigger(name, payload, cb, timeoutMs)
    CreateThread(function()
        local packed = table.pack(callback.await(name, payload, timeoutMs))
        if cb then cb(table.unpack(packed, 1, packed.n)) end
    end)
end

RegisterNetEvent('evo-lib:cb:res', function(requestId, ok, packed)
    local answer = waiting[requestId]
    if not answer then return end
    waiting[requestId] = nil
    answer:resolve(ok == true and type(packed) == 'table' and packed or false)
end)

---Registers a client handler the server can ask with EvoLib.callback.awaitClient(src, name, payload).
function callback.register(name, fn)
    if type(name) ~= 'string' or type(fn) ~= 'function' and type(fn) ~= 'table' then
        error('EvoLib.callback.register expects (name: string, fn: function)', 2)
    end
    handlers[name] = fn
    local owner = Core.caller()
    Core.own(owner, function()
        if handlers[name] == fn then handlers[name] = nil end
    end)
end

function callback.unregister(name)
    handlers[name] = nil
end

RegisterNetEvent('evo-lib:cb:ask', function(name, requestId, payload)
    local fn = handlers[name]
    if not fn then
        TriggerServerEvent('evo-lib:cb:answer', requestId, false)
        return
    end
    local result = table.pack(pcall(fn, payload))
    if not result[1] then
        Core.warn('client callback "%s" failed: %s', name, tostring(result[2]))
        TriggerServerEvent('evo-lib:cb:answer', requestId, false)
        return
    end
    TriggerServerEvent('evo-lib:cb:answer', requestId, true, { n = result.n - 1, table.unpack(result, 2, result.n) })
end)

EvoLib.callback = callback
