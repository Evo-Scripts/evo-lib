--[[
    FRAMEWORK HOOKS - CLIENT
    EvoEditable.framework is used when EvoConfig.Framework = 'custom'.
    EvoEditable.frameworkPatch overrides single functions on top of any framework.
]]

EvoEditable = EvoEditable or {}

EvoEditable.framework = {
    ---@return table local player data
    playerData = function()
        return {}
    end,

    ---@return table|nil { name, label, grade, gradeLabel, onDuty }
    job = function()
        return nil
    end,

    ---@return 'male'|'female'|nil
    gender = function()
        return nil
    end,
}

EvoEditable.frameworkPatch = {
    -- job = function() return { name = 'police', label = 'Police', grade = 0, gradeLabel = '', onDuty = true } end,
}
