BigNumber = require 'bignumber.js'
Cents = require '../src/'
{expect} = require 'chai'

describe 'Cents', ->

  describe 'constructor', ->
    it 'can construct with int', ->
      cents = new Cents(1)
      expect(cents).to.have.property('value', 1)

    it 'can construct with string', ->
      cents = new Cents('1')
      expect(cents).to.have.property('value', 1)

    it 'can construct with BigNumber', ->
      cents = new Cents(new BigNumber(1))
      expect(cents).to.have.property('value', 1)

    it 'can construct with Cents', ->
      cents = new Cents(new Cents(1))
      expect(cents).to.have.property('value', 1)

    it 'throws if constructed with non-int number', ->
      expect(-> new Cents(1.01)).to.throw()

    it 'throws if constructed with NaN', ->
      expect(-> new Cents(NaN)).to.throw()

    it 'throws if constructed with Infinity', ->
      expect(-> new Cents(Infinity)).to.throw()

    it 'throws if constructed with negative int', ->
      expect(-> new Cents(-1)).to.throw()


  describe '.fromDollars', ->

    it 'can convert zero dollars', ->
      expect(Cents.fromDollars(0)).to.have.property('value', 0)

    it 'can convert non-zero dollars', ->
      expect(Cents.fromDollars(0.01)).to.have.property('value', 1)

    it 'throws if converting non-dollar Number', ->
      expect(-> Cents.fromDollars(1.000001)).to.throw()

  describe '.max', ->

    it 'throws if not provided at least one value', ->
      expect(-> Cents.max()).to.throw()

    it 'throws if provided an empty array', ->
      expect(-> Cents.max([])).to.throw()

    it 'throws if provided an invalid splat', ->
      expect(-> Cents.max([1], 2, 3)).to.throw()

    it 'works with a single value', ->
      expect(Cents.max(new Cents(3))).to.have.property('value', 3)

    it 'works with multiple values', ->
      expect(Cents.max(new Cents(2), new Cents(3), new Cents(1))).to.have.property('value', 3)

    it 'works with non Cents values', ->
      expect(Cents.max(new Cents(2), 3, '1')).to.have.property('value', 3)

    it 'works with a non-empty array', ->
      expect(Cents.max([1, 2, 3])).to.have.property('value', 3)

  describe '.min', ->

    it 'throws if not provided at least one value', ->
      expect(-> Cents.min()).to.throw()

    it 'throws if provided an empty array', ->
      expect(-> Cents.min([])).to.throw()

    it 'throws if provided an invalid splat', ->
      expect(-> Cents.min([1], 2, 3)).to.throw()

    it 'works with a single value', ->
      expect(Cents.min(new Cents(3))).to.have.property('value', 3)

    it 'works with multiple values', ->
      expect(Cents.min(new Cents(3), new Cents(1), new Cents(2))).to.have.property('value', 1)

    it 'works with non Cents values', ->
      expect(Cents.min(new Cents(3), 1, '2')).to.have.property('value', 1)

    it 'works with a non-empty array', ->
      expect(Cents.min([1, 2, 3])).to.have.property('value', 1)

  describe '.round', ->

    it 'rounds down', ->
      expect(Cents.round(.4999)).to.have.property('value', 0)

    it 'rounds up', ->
      expect(Cents.round(.5)).to.have.property('value', 1)

    it 'throws if given a negative number', ->
      expect(-> Cents.round(-0.1)).to.throw()

  describe '.isValid', ->

    it 'is valid for Cents', ->
      expect(Cents.isValid(new Cents(1))).to.be.true

    it 'is valid for int string', ->
      expect(Cents.isValid('1')).to.be.true

    it 'is invalid for non-int string', ->
      expect(Cents.isValid('1.5')).to.be.false

    it 'is valid for positive int', ->
      expect(Cents.isValid(1)).to.be.true

    it 'is invalid for negative int', ->
      expect(Cents.isValid(-1)).to.be.false

    it 'is invalid for float', ->
      expect(Cents.isValid(1.5)).to.be.false

  describe '.isValidDollars', ->

    it 'is valid for dollar float', ->
      expect(Cents.isValidDollars(33.44)).to.be.true

    it 'is invalid for non-dollar float', ->
      expect(Cents.isValidDollars(33.444)).to.be.false

    it 'is valid for a dollar string', ->
      expect(Cents.isValidDollars('33.44')).to.be.true

    it 'is invalid for a non-dollar string', ->
      expect(Cents.isValidDollars('33.444')).to.be.false

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

  describe '.sum', ->

    it 'should work with a single value splat', ->
      expect(Cents.sum(1)).to.have.property('value', 1)

    it 'should work with a multiple value splat', ->
      expect(Cents.sum(1, 2, 3)).to.have.property('value', 6)

    it 'should work with an empty array', ->
      expect(Cents.sum([])).to.have.property('value', 0)

    it 'should work with a non-empty array', ->
      expect(Cents.sum([1, 2, 3])).to.have.property('value', 6)

    it 'should throw an exception when passed no arguments', ->
      expect(-> Cents.sum()).to.throw()

  describe '.sumDollars', ->

    it 'should work with a multiple value splat', ->
      expect(Cents.sumDollars(1)).to.have.property('value', 100)

    it 'should work with a multiple value splat', ->
      expect(Cents.sumDollars(1, 2.5)).to.have.property('value', 350)

    it 'should work with an empty array', ->
      expect(Cents.sumDollars([])).to.have.property('value', 0)

    it 'should work with a non-empty array', ->
      expect(Cents.sumDollars([1, 2, 3])).to.have.property('value', 600)

    it 'should throw an exception when passed no arguments', ->
      expect(-> Cents.sumDollars()).to.throw()

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

  describe 'toString', ->

    it 'should be correctly formatted', ->
      expect(new Cents(0)  .toString()).to.equal '$0.00'
      expect(new Cents(1)  .toString()).to.equal '$0.01'
      expect(new Cents(10) .toString()).to.equal '$0.10'
      expect(new Cents(100).toString()).to.equal '$1.00'
