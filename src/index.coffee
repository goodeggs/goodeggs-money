BigNumber = require 'bignumber.js'

# http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
isInt = (maybeInt) -> maybeInt % 1 is 0

module.exports = Cents = class Cents
  constructor: (@value) ->
    @value = @value.toNumber() if @value instanceof BigNumber
    @value = @value.toNumber() if @value instanceof Cents
    @value = Number(@value) if typeof(@value) is 'string'
    throw new Error "#{@value} must be a Number"     unless typeof(@value) is 'number'
    throw new Error "#{@value} must not be NaN"      if isNaN(@value)
    throw new Error "#{@value} must be an int"       unless isInt(@value)
    throw new Error "#{@value} must not be negative" if @value < 0

  toBigNumber: -> new BigNumber(@value)
  toDollars: -> @toBigNumber().dividedBy(100).toNumber()
  toNumber: -> @value

  plus: (cents, {strict} = {strict: false}) ->
    cents = new Cents(cents) unless strict
    new Cents(@toBigNumber().plus(cents.toNumber()))

  minus: (cents, {strict, maxZero} = {strict: false, maxZero: false}) ->
    cents = new Cents(cents) unless strict
    result = @toBigNumber().minus(cents.toNumber()).toNumber() # Number; may be negative

    if maxZero
      new Cents(Math.max(0, result))
    else
      new Cents(result) # will throw if negative

  times: (scalar, {transform} = {}) ->
    # Transform can be any no-arg BigNumber function and should produce a valid Cents value.
    # e.g. 'ceil', 'round'
    result = @toBigNumber().times(scalar)
    result = result[transform]() if transform?
    new Cents(result)

  dividedBy: (scalar, {transform} = {}) ->
    # Transform can be any no-arg BigNumber function and should produce a valid Cents value.
    # e.g. 'ceil', 'round'
    result = @toBigNumber().dividedBy(scalar)
    result = result[transform]() if transform?
    new Cents(result)

  equals: (otherCents, {strict} = {strict: true}) ->
    centsEqual = => @toNumber() is otherCents.toNumber() # assumes otherCents is a Cents
    if strict
      (otherCents instanceof Cents) and centsEqual()
    else
      otherCents = new Cents(otherCents) # wrap first
      centsEqual()

  # Handy aliases.
  is0: -> @equals(new Cents(0))
  isnt0: -> !@is0()

  toString: -> "$#{new BigNumber(@toDollars()).toFixed(2)}" # always show 2 decimal places

Cents.isValid = (maybeCents) ->
  threw = false
  try
    new Cents(maybeCents)
  catch
    threw = true
  !threw

Cents.isValidDollars = (maybeDollars) ->
  threw = false
  try
    Cents.fromDollars(maybeDollars)
  catch
    threw = true
  !threw

Cents.fromDollars = (dollars) ->
  # dollars should be a Number like xx.yy
  new Cents(new BigNumber(dollars).times(100))

Cents.round = (maybeInt) ->
  throw new Error "#{maybeInt} must be positive to round to cents" unless maybeInt > 0
  new Cents(new BigNumber(maybeInt).round())

# This method supports static method calls of the form:
#   Cents.staticMethod(...)
#
# The ... must include at least one argument.
#
# Case 1: ... => single argument array
#   There must be no other arguments and each value in the array must "pass" the
#   validator (boolean) predicate function. Returns the array.
# Case 2: ... => multiple argument values
#   Each value must "pass" the validator predicate function. Returns an array of the values.
arrayifySplat = (splat, validator) ->
  throw new Error 'Expect at least one argument' unless splat.length > 0

  if Array.isArray(splat[0])
    unless splat.length is 1
      throw new Error 'Expect a single array argument'
    splat = splat[0]

  if validator?
    splat.forEach (val) ->
      unless validator(val)
        throw new Error "Unexpected value #{val}"

  splat

Cents.min = (cents...) ->
  cents = arrayifySplat(cents, Cents.isValid)
  cents = cents.map (cent) -> new Cents(cent).toNumber()
  min = Math.min(cents...)
  new Cents(min)

Cents.max = (cents...) ->
  cents = arrayifySplat(cents, Cents.isValid)
  cents = cents.map (cent) -> new Cents(cent).toNumber()
  max = Math.max(cents...)
  new Cents(max)

Cents.sum = (cents...) ->
  cents = arrayifySplat(cents, Cents.isValid)
  cents.reduce ((memo, val) -> memo.plus(val)), new Cents(0)

Cents.sumDollars = (dollars...) ->
  dollars = arrayifySplat(dollars, Cents.isValidDollars)
  dollars.reduce ((memo, val) -> memo.plus(Cents.fromDollars(val))), new Cents(0)
