-- Loaded last on each side: hands the finished EvoLib table to other resources.

exports('get', function()
    return EvoLib
end)

AddEventHandler('evo-lib:get', function(cb)
    if type(cb) == 'function' then cb(EvoLib) end
end)

Core.trace('ready on %s (framework: %s, inventory: %s)', EvoLib.side, EvoLib.framework, EvoLib.inventory)
