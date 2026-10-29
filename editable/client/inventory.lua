--[[
    INVENTORY HOOKS - CLIENT
    EvoEditable.inventory is used when EvoConfig.Inventory = 'custom' (return nil to fall back to the
    framework's player data). EvoEditable.inventoryPatch overrides single functions on any inventory.
]]

EvoEditable = EvoEditable or {}

EvoEditable.inventory = {
    ---@return number|nil
    count = function(name)
        return nil
    end,

    ---@return table|nil list of { name, count, metadata, slot }
    list = function()
        return nil
    end,
}

EvoEditable.inventoryPatch = {}
