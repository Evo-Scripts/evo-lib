-- Notifications (server).
-- EvoLib.notify(src, { title, description, type, duration, tag, position })
-- `src` may be -1 for everybody. Aliases accepted: desc / message / text, label, time.

local QB_TYPES = { success = 'success', error = 'error', warning = 'primary', info = 'primary' }

function EvoLib.notify(src, data)
    src = tonumber(src)
    if not src then return end
    data = Core.notifyData(data)
    local backend = EvoConfig.Notify

    if backend == 'esx' then
        TriggerClientEvent('esx:showNotification', src, data.description or data.title, data.type, data.duration, data.title)
    elseif backend == 'qb' then
        TriggerClientEvent('QBCore:Notify', src, data.description or data.title, QB_TYPES[data.type], data.duration)
    elseif backend == 'ox' then
        TriggerClientEvent('ox_lib:notify', src, {
            title = data.title, description = data.description, duration = data.duration,
            type = data.type == 'info' and 'inform' or data.type,
        })
    elseif backend == 'custom' and type(EvoEditable and EvoEditable.notify) == 'function' then
        Core.safe(EvoEditable.notify, src, data)
    else
        TriggerClientEvent('evo-lib:notify', src, data)
    end
end

exports('notify', EvoLib.notify)
