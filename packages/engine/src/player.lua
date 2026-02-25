-- Player management module
-- Handles player creation and state management

local deck = require("deck")

local M = {}

-- Constantes de inicialização
local INITIAL_LIFE = 30
local INITIAL_MANA = 1
local INITIAL_HAND_SIZE = 6

-- Cria estrutura completa de um player
function M.create(deck_ids, catalog)
  -- Copiar deck para não modificar o original
  local deck_copy = deck.copy(deck_ids)
  
  -- Embaralhar deck
  deck.shuffle(deck_copy)
  
  -- Distribuir 6 cartas iniciais para a mão
  local hand, remaining_deck = deck.deal_initial_hand(deck_copy, INITIAL_HAND_SIZE)
  
  return {
    life = INITIAL_LIFE,
    maxLife = INITIAL_LIFE,
    mana = INITIAL_MANA,
    maxMana = INITIAL_MANA,
    hand = hand,
    deck = remaining_deck,
    board = {}
  }
end

return M
