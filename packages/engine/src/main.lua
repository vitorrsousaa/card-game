#!/usr/bin/env lua
-- Card game engine (pure Lua).
-- Reads one JSON line from stdin, writes one JSON line to stdout.
-- Protocol: init | step (see apps/game src/app/interfaces/engine-protocol.ts)

-- Ensure we can require "json" when run as "lua src/main.lua" from package root
local script_dir = (arg[0] or "main.lua"):match("(.*)/") or "."
if script_dir == "src" then
  package.path = "src/?.lua;" .. package.path
elseif script_dir ~= "" then
  package.path = script_dir .. "/?.lua;" .. package.path
end

local json = require("json")
local handlers = require("handlers")

-- Main: one line in -> one line out
local function main()
  local line = io.read("*l")
  if not line or line == "" then
    io.stderr:write("engine: no input\n")
    os.exit(1)
  end

  local ok, input = pcall(json.decode, line)
  if not ok then
    io.write(json.encode({
      ok = false,
      error = "Invalid JSON: " .. tostring(input),
      code = "ENGINE_PARSE_ERROR",
    }) .. "\n")
    io.flush()
    return
  end

  local result
  if input.type == "init" then
    result = handlers.handle_init(input.payload)
  elseif input.type == "step" then
    result = handlers.handle_step(input.state, input.action)
  else
    result = {
      ok = false,
      error = "Unknown command type: " .. tostring(input.type),
      code = "ENGINE_UNKNOWN_COMMAND",
    }
  end

  io.write(json.encode(result) .. "\n")
  io.flush()
end

main()
