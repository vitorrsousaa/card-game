-- Command handlers module
-- Handles init and step commands

local session = require("session")
local player = require("player")

local M = {}

-- Build initial game state (protocol: GameState)
function M.handle_init(payload)
  local seed = payload and payload.seed
  local session_id = session.new_session_id(seed)

  -- Extrair options do payload
  local options = payload and payload.options or {}
  local catalog = options.catalog or {}
  local deck_ids = options.deckIds or {}
  local enemy_deck_ids = options.enemyDeckIds or {}

  -- Validar que temos dados mínimos
  if not catalog or type(catalog) ~= "table" or next(catalog) == nil then
    return {
      ok = false,
      error = "Missing required options: catalog",
      code = "ENGINE_INIT_MISSING_CATALOG"
    }
  end

  if not deck_ids or type(deck_ids) ~= "table" or #deck_ids == 0 then
    return {
      ok = false,
      error = "Missing required options: deckIds",
      code = "ENGINE_INIT_MISSING_DECK"
    }
  end

  if not enemy_deck_ids or type(enemy_deck_ids) ~= "table" or #enemy_deck_ids == 0 then
    return {
      ok = false,
      error = "Missing required options: enemyDeckIds",
      code = "ENGINE_INIT_MISSING_ENEMY_DECK"
    }
  end

  -- Criar players
  local players = {}
  players[0] = player.create(deck_ids, catalog)
  players[1] = player.create(enemy_deck_ids, catalog)

  return {
    ok = true,
    state = {
      sessionId = session_id,
      turn = 1,
      phase = "play",
      players = players
    },
    events = { { type = "game_initialized", payload = {} } }
  }
end

-- Process one step: validate and advance state (stub: echo state + one event)
function M.handle_step(state, action)
  local action_type = action and action.type or "unknown"
  return {
    ok = true,
    state = state or {},
    events = { { type = "step_processed", payload = { action = action } } },
  }
end

return M
