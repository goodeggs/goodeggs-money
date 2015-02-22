BigNumber = require 'bignumber.js'
Cents = require '../src/'
{expect} = require 'chai'

describe 'Cents', ->
  it 'can construct with int', ->
    cents = new Cents(1)
    expect(cents.value).to.equal 1

  it 'can construct with string', ->
    cents = new Cents('1')
    expect(cents.value).to.equal 1

  it 'can construct with BigNumber', ->
    cents = new Cents(new BigNumber(0))
    expect(cents.value).to.equal 0

  it 'can construct with Cents', ->
    cents = new Cents(new Cents(1))
    expect(cents.value).to.equal 1

  it 'throws if constructed with non-int number', ->
    expect(-> new Cents(1.01)).to.throw()

  it 'throws if constructed with NaN', ->
    expect(-> new Cents(NaN)).to.throw()

  it 'throws if constructed with negative int', ->
    expect(-> new Cents(-1)).to.throw()

  it 'has a toString method that is human readable', ->
    expect(new Cents(0)  .toString()).to.equal '$0.00'
    expect(new Cents(1)  .toString()).to.equal '$0.01'
    expect(new Cents(10) .toString()).to.equal '$0.10'
    expect(new Cents(100).toString()).to.equal '$1.00'

  it 'has a static method to convert dollars', ->
    expect(Cents.fromDollars(0.01)).to.have.property('value', 1)
    expect(Cents.fromDollars(1.01)).to.have.property('value', 101)
    expect(-> Cents.fromDollars(1.000001)).to.throw()

  it 'has a static method to max cents', ->
    expect(-> Cents.max()).to.throw()
    expect(Cents.max(new Cents(3))).to.have.property('value', 3)
    expect(Cents.max(new Cents(2), new Cents(3), new Cents(1))).to.have.property('value', 3)

  it 'has a static method to min cents', ->
    expect(-> Cents.min()).to.throw()
    expect(Cents.min(new Cents(3))).to.have.property('value', 3)
    expect(Cents.min(new Cents(3), new Cents(1), new Cents(2))).to.have.property('value', 1)

  it 'has a static method to round to Cents', ->
    expect(Cents.round(.4999)).to.have.property('value', 0)
    expect(Cents.round(.5)).to.have.property('value', 1)

  describe '.equals', ->

    it 'should be true if the argument is a Cents object with the same value when strict', ->
      cents = new Cents(5)
      expect(cents.equals(new Cents(5))).to.be.true
      expect(cents.equals(5)).to.be.false

    it 'should allow strict mode false', ->
      expect(new Cents(5).equals(5, strict: false)).to.be.true
      expect(new Cents(5).equals('5', strict: false)).to.be.true

    it 'should have an is0() alias', ->
      expect((new Cents(0)).is0()).to.be.true
      expect((new Cents(1)).is0()).to.be.false

    it 'should have an isnt0() alias', ->
      expect((new Cents(0)).isnt0()).to.be.false
      expect((new Cents(1)).isnt0()).to.be.true

  describe 'arithmetic', ->

    describe 'plus', ->

      it 'should return a new Cents', ->
        zeroCents = new Cents(0)
        newZeroCents = zeroCents.plus(0)
        expect(newZeroCents).to.be.instanceof(Cents)
        expect(newZeroCents).to.not.equal zeroCents # different ref

      it 'should accept a Cents param and return a new Cents with the correct value', ->
        expect(new Cents(1).plus(new Cents(2))).to.have.property('value', 3)

      it 'should accept a string param and return a new Cents with the correct value', ->
        expect(new Cents(1).plus('2')).to.have.property('value', 3)

      it 'should allow strict mode true', ->
        expect(-> new Cents(5).plus('5')).not.to.throw()
        expect(-> new Cents(5).plus('5', strict: true)).to.throw()

    describe 'minus', ->

      it 'should return a new Cents with the correct amount', ->
        expect(new Cents(3).minus(1)).to.have.property('value', 2)

      it 'should throw an expection if a negative cents would be returned', ->
        expect(-> new Cents(1).minus(2)).to.throw()

      it 'should prevent underflow exception when maxZero flag is set', ->
        shouldBeZero = new Cents(1).minus(2, maxZero: true)
        expect(shouldBeZero).to.have.property('value', 0)

      it 'should allow strict mode true', ->
        expect(-> new Cents(5).minus('5')).not.to.throw()
        expect(-> new Cents(5).minus('5', strict: true)).to.throw()

    describe 'times', ->

      it 'should throw an exception if an invalid scalar is provided', ->
        expect(-> new Cents(1).times(0.5)).to.throw()
        expect(-> new Cents(10).times(-3)).to.throw()

      it 'should return a new Cents with the correct value', ->
        cents = new Cents(5)
        expect(cents.times(1)).to.have.property('value', 5)
        expect(cents.times(5)).to.have.property('value', 25)
        expect(cents.times(0.2)).to.have.property('value', 1)
        expect(cents.times(0)).to.have.property('value', 0)

      it 'should allow transform', ->
        cents = new Cents(5)
        expect(cents.times(0.5, transform: 'round')).to.have.property('value', 3)
        expect(cents.times(0.5, transform: 'floor')).to.have.property('value', 2)

    describe 'dividedBy', ->

      it 'should throw an exception if an invalid scalar is provided', ->
        expect(-> new Cents(1).dividedBy(0.6)).to.throw()
        expect(-> new Cents(100).dividedBy(0)).to.throw()
        expect(-> new Cents(10).dividedBy(-2)).to.throw()

      it 'should return a new Cents with the correct value', ->
        cents = new Cents(10)
        expect(cents.dividedBy(2)).to.have.property('value', 5)
        expect(cents.dividedBy(5)).to.have.property('value', 2)
        expect(cents.dividedBy(0.5)).to.have.property('value', 20)

      it 'should allow transform', ->
        cents = new Cents(5)
        expect(cents.dividedBy(50, transform: 'round')).to.have.property('value', 0)
        expect(cents.dividedBy(50, transform: 'ceil')).to.have.property('value', 1)

