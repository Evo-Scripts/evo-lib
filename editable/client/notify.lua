--[[
    NOTIFY HOOK - CLIENT
    Used when EvoConfig.Notify = 'custom'.

    data = { title, description, type = 'success'|'error'|'warning'|'info', duration (ms), tag, position }
]]

EvoEditable = EvoEditable or {}

EvoEditable.notify = function(data)
    -- Example: exports['my_notify']:Show(data.title, data.description, data.type, data.duration)
    print(('[notify] %s: %s'):format(data.title or '', data.description or ''))
end
