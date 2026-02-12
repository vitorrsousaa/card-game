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

-- Simple session id (deterministic if seed provided)
local function new_session_id(seed)
  if seed and type(seed) == "number" then
    math.randomseed(seed)
  else
    math.randomseed(os.time())
  end
  return string.format("sess-%x-%d", os.time(), math.random(10000, 99999))
end

-- Build initial game state (protocol: GameState)
local function handle_init(payload)
  local seed = payload and payload.seed
  local session_id = new_session_id(seed)
  return {
    ok = true,
    state = {
      sessionId = session_id,
      turn = 1,
      phase = "play",
      players = {},
    },
    events = { { type = "game_initialized", payload = {} } },
  }
end

-- Process one step: validate and advance state (stub: echo state + one event)
local function handle_step(state, action)
  local action_type = action and action.type or "unknown"
  return {
    ok = true,
    state = state or {},
    events = { { type = "step_processed", payload = { action = action } } },
  }
end

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
    result = handle_init(input.payload)
  elseif input.type == "step" then
    result = handle_step(input.state, input.action)
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
