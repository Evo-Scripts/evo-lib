--[[
    NOTIFY HOOK - SERVER
    Used when EvoConfig.Notify = 'custom'.

    data = { title, description, type = 'success'|'error'|'warning'|'info', duration (ms), tag, position }
]]

EvoEditable = EvoEditable or {}

EvoEditable.notify = function(src, data)
    -- Example: TriggerClientEvent('my_notify:show', src, data.title, data.description, data.type)
    TriggerClientEvent('evo-lib:notify', src, data)
end
