-- evo-lib import.
-- Add `shared_script '@evo-lib/init.lua'` to your fxmanifest and the global `EvoLib` is ready on both sides.

if GetResourceState('evo-lib') ~= 'started' and GetResourceState('evo-lib') ~= 'starting' then
    error('^1[evo-lib] evo-lib must be started before ' .. GetCurrentResourceName() .. '^0', 0)
end

EvoLib = exports['evo-lib']:get()
