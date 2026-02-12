-- Minimal JSON encode/decode for engine protocol (pure Lua, no deps).
-- Handles: objects, arrays, strings, numbers, booleans, null.

local M = {}

-- Encode
local function escape(s)
  return (s:gsub("[%c\"\\]", function(c)
    if c == "\"" then return "\\\"" end
    if c == "\\" then return "\\\\" end
    if c == "\n" then return "\\n" end
    if c == "\r" then return "\\r" end
    if c == "\t" then return "\\t" end
    return string.format("\\u%04x", c:byte())
  end))
end

local function encode(val)
  local t = type(val)
  if t == "nil" then return "null" end
  if t == "boolean" then return val and "true" or "false" end
  if t == "number" then return tostring(val) end
  if t == "string" then return "\"" .. escape(val) .. "\"" end
  if t == "table" then
    local is_array = #val > 0 or (next(val) == nil)
    for k in pairs(val) do
      if type(k) ~= "number" or k ~= math.floor(k) or k < 1 then
        is_array = false
        break
      end
    end
    if is_array and #val >= 0 then
      local parts = {}
      for i = 1, #val do
        parts[i] = encode(val[i])
      end
      return "[" .. table.concat(parts, ",") .. "]"
    end
    local parts = {}
    for k, v in pairs(val) do
      if type(k) == "string" then
        parts[#parts + 1] = encode(k) .. ":" .. encode(v)
      end
    end
    return "{" .. table.concat(parts, ",") .. "}"
  end
  error("unsupported type: " .. t)
end

function M.encode(val)
  return encode(val)
end

-- Decode (simplified: one value per string)
local function skip_ws(s, i)
  while i <= #s and s:sub(i, i):match("%s") do i = i + 1 end
  return i
end

local function decode_string(s, i)
  if s:sub(i, i) ~= "\"" then return nil, i end
  i = i + 1
  local res = {}
  while i <= #s do
    local c = s:sub(i, i)
    if c == "\"" then return table.concat(res), i + 1 end
    if c == "\\" then
      i = i + 1
      local e = s:sub(i, i)
      if e == "n" then res[#res + 1] = "\n"
      elseif e == "r" then res[#res + 1] = "\r"
      elseif e == "t" then res[#res + 1] = "\t"
      elseif e == "\"" then res[#res + 1] = "\""
      elseif e == "\\" then res[#res + 1] = "\\"
      else res[#res + 1] = e
      end
      i = i + 1
    else
      res[#res + 1] = c
      i = i + 1
    end
  end
  error("unterminated string")
end

local function decode_number(s, i)
  local j = i
  if s:sub(i, i) == "-" then j = j + 1 end
  while j <= #s and s:sub(j, j):match("[%d.eE%+%-]") do j = j + 1 end
  local n = tonumber(s:sub(i, j - 1))
  if not n then error("invalid number at " .. i) end
  return n, j
end

local function decode_literal(s, i, lit, val)
  local sub = s:sub(i, i + #lit - 1)
  if sub == lit then return val, i + #lit end
  error("expected " .. lit)
end

local decode -- forward

local function decode_array(s, i)
  if s:sub(i, i) ~= "[" then return nil, i end
  i = skip_ws(s, i + 1)
  local arr = {}
  if s:sub(i, i) == "]" then return arr, i + 1 end
  while true do
    local v
    v, i = decode(s, skip_ws(s, i))
    arr[#arr + 1] = v
    i = skip_ws(s, i)
    local c = s:sub(i, i)
    if c == "]" then return arr, i + 1 end
    if c ~= "," then error("expected , or ] at " .. i) end
    i = i + 1
  end
end

local function decode_object(s, i)
  if s:sub(i, i) ~= "{" then return nil, i end
  i = skip_ws(s, i + 1)
  local obj = {}
  if s:sub(i, i) == "}" then return obj, i + 1 end
  while true do
    local k
    k, i = decode_string(s, skip_ws(s, i))
    if not k then error("expected string key at " .. i) end
    i = skip_ws(s, i)
    if s:sub(i, i) ~= ":" then error("expected : at " .. i) end
    i = skip_ws(s, i + 1)
    local v
    v, i = decode(s, i)
    obj[k] = v
    i = skip_ws(s, i)
    local c = s:sub(i, i)
    if c == "}" then return obj, i + 1 end
    if c ~= "," then error("expected , or } at " .. i) end
    i = i + 1
  end
end

decode = function(s, i)
  i = i or 1
  i = skip_ws(s, i)
  if i > #s then error("unexpected end of input") end
  local c = s:sub(i, i)
  if c == "\"" then return decode_string(s, i) end
  if c == "[" then return decode_array(s, i) end
  if c == "{" then return decode_object(s, i) end
  if c == "t" then return decode_literal(s, i, "true", true) end
  if c == "f" then return decode_literal(s, i, "false", false) end
  if c == "n" then return decode_literal(s, i, "null", nil) end
  if c == "-" or c:match("%d") then return decode_number(s, i) end
  error("unexpected character at " .. i .. ": " .. c)
end

function M.decode(str)
  if type(str) ~= "string" then
    error("expected string, got " .. type(str))
  end
  local res, idx = decode(str, 1)
  idx = skip_ws(str, idx)
  if idx <= #str then error("trailing garbage after JSON") end
  return res
end

return M
