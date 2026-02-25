-- Deck operations module
-- Handles deck shuffling and manipulation

local M = {}

-- Embaralha array usando Fisher-Yates shuffle
function M.shuffle(deck)
  local n = #deck
  for i = n, 2, -1 do
    local j = math.random(i)
    deck[i], deck[j] = deck[j], deck[i]
  end
  return deck
end

-- Copia um deck (array de card IDs)
function M.copy(deck_ids)
  local deck = {}
  for i, card_id in ipairs(deck_ids) do
    deck[i] = card_id
  end
  return deck
end

-- Distribui cartas iniciais do deck para a mão
-- Retorna hand e remaining_deck
function M.deal_initial_hand(deck, hand_size)
  hand_size = hand_size or 6
  local hand = {}
  local remaining_deck = {}
  
  for i = 1, #deck do
    if i <= hand_size then
      hand[i] = deck[i]
    else
      remaining_deck[#remaining_deck + 1] = deck[i]
    end
  end
  
  return hand, remaining_deck
end

return M
