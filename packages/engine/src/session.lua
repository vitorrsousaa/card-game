-- Session management module
-- Handles session ID generation with deterministic seeds

local M = {}

-- Simple session id (deterministic if seed provided)
function M.new_session_id(seed)
  if seed and type(seed) == "number" then
    math.randomseed(seed)
  else
    math.randomseed(os.time())
  end
  return string.format("session-%x-%d", os.time(), math.random(10000, 99999))
end

return M
