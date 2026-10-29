--[[
    DISCORD WEBHOOKS (server only - these urls never reach clients)
    Use them with EvoLib.log('name', { title = '...', message = '...' }).
    A raw https url can also be passed instead of a name.
]]

EvoWebhooks = {
    main = '',
    vehicles = '',
}

-- Shown in the footer / as the sender of every embed.
EvoWebhookStyle = {
    username = 'Evo Scripts',
    avatar = nil,
    color = 0x19D3F5,
}
