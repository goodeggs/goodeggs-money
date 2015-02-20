BigNumber = require 'bignumber.js'

# http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
isInt = (maybeInt) -> maybeInt % 1 is 0

isCents = (maybeCents) -> maybeCents instanceof Cents

unwrapCents = (maybeCents) ->
  if isCents(maybeCents) then maybeCents.value
  else unwrapCents(new Cents maybeCents) # validate then unwrap

validateCentsScalar = (scalar) ->
  unless typeof(scalar) is 'number' and isInt(scalar) and scalar > 0
    throw new Error "#{scalar} must be a positive number"

module.exports = Cents = class Cents
  constructor: (@value) ->
    @value = @value.toNumber() if @value instanceof BigNumber
    @value = Number(@value) if typeof(@value) is 'string'
    throw new Error "#{@value} must be a Number"     unless typeof(@value) is 'number'
    throw new Error "#{@value} must not be NaN"      if isNaN(@value)
    throw new Error "#{@value} must be an int"       unless isInt(@value)
    throw new Error "#{@value} must not be negative" if @value < 0

  toBigNumber: -> new BigNumber(@value)
  toDollars: -> @toBigNumber().dividedBy(100).toNumber()
  toNumber: -> @value

  plus: (cents) -> new Cents(@toBigNumber().plus(unwrapCents(cents)))
  minus: (cents, {maxZero} = {maxZero: false}) ->
    result = @toBigNumber().minus(unwrapCents(cents)).toNumber()
    if maxZero then new Cents(Math.max(0, result)) else new Cents(result)

  times: (scalar) ->
    validateCentsScalar(scalar)
    new Cents(@toBigNumber().times(scalar))

  dividedBy: (scalar) ->
    validateCentsScalar(scalar)
    new Cents(@toBigNumber().dividedBy(scalar))

  toString: -> "$#{new BigNumber(@toDollars()).toFixed(2)}" # always show 2 decimal places

Cents.fromDollars = (dollars) ->
  # dollars should be a Number like xx.yy
  new Cents(new BigNumber(dollars).times(100))
