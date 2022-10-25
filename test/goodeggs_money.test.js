/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-commonjs */
const {BigNumber} = require('bignumber.js');
const {expect} = require('chai');

const Cents = require('../src');

const {fromDollars, isValid, max, min, round, isValidDollars, sum, sumDollars} = Cents;

describe('Cents', function () {
  describe('constructor', function () {
    it('can construct with int', function () {
      const cents = new Cents(1);
      expect(cents).to.have.property('value', 1);
    });

    it('can construct with string', function () {
      const cents = new Cents('1');
      expect(cents).to.have.property('value', 1);
    });

    it('can construct with BigNumber', function () {
      const cents = new Cents(new BigNumber(1));
      expect(cents).to.have.property('value', 1);
    });

    it('can construct with Cents', function () {
      const cents = new Cents(new Cents(1));
      expect(cents).to.have.property('value', 1);
    });

    it('throws if constructed with non-int number', () => expect(() => new Cents(1.01)).to.throw());

    it('throws if constructed with NaN', () => expect(() => new Cents(NaN)).to.throw());

    it('throws if constructed with Infinity', () => expect(() => new Cents(Infinity)).to.throw());

    it('throws if constructed with negative int', () => expect(() => new Cents(-1)).to.throw());
  });

  describe('.fromDollars', function () {
    it('can convert zero dollars', () => expect(fromDollars(0)).to.have.property('value', 0));

    it('can convert non-zero dollars', () =>
      expect(fromDollars(0.01)).to.have.property('value', 1));

    it('throws if converting non-dollar Number', () =>
      expect(() => fromDollars(1.000001)).to.throw());
  });

  describe('.max', function () {
    it('throws if not provided at least one value', () => expect(() => max()).to.throw());

    it('throws if provided an empty array', () => expect(() => max([])).to.throw());

    it('throws if provided an invalid splat', () => expect(() => max([1], 2, 3)).to.throw());

    it('works with a single value', () => expect(max(new Cents(3))).to.have.property('value', 3));

    it('works with multiple values', () =>
      expect(max(new Cents(2), new Cents(3), new Cents(1))).to.have.property('value', 3));

    it('works with non Cents values', () =>
      expect(max(new Cents(2), 3, '1')).to.have.property('value', 3));

    it('works with a non-empty array', () => expect(max([1, 2, 3])).to.have.property('value', 3));
  });

  describe('.min', function () {
    it('throws if not provided at least one value', () => expect(() => min()).to.throw());

    it('throws if provided an empty array', () => expect(() => min([])).to.throw());

    it('throws if provided an invalid splat', () => expect(() => min([1], 2, 3)).to.throw());

    it('works with a single value', () => expect(min(new Cents(3))).to.have.property('value', 3));

    it('works with multiple values', () =>
      expect(min(new Cents(3), new Cents(1), new Cents(2))).to.have.property('value', 1));

    it('works with non Cents values', () =>
      expect(min(new Cents(3), 1, '2')).to.have.property('value', 1));

    it('works with a non-empty array', () => expect(min([1, 2, 3])).to.have.property('value', 1));
  });

  describe('.round', function () {
    it('rounds down', () => expect(round(0.4999)).to.have.property('value', 0));

    it('rounds up', () => expect(round(0.5)).to.have.property('value', 1));

    it('rounds 0', () => expect(round(0)).to.have.property('value', 0));

    it('throws if given a negative number', () => expect(() => round(-0.1)).to.throw());
  });

  describe('.isValid', function () {
    it('is valid for Cents', () => expect(isValid(new Cents(1))).to.be.true);

    it('is valid for int string', () => expect(isValid('1')).to.be.true);

    it('is invalid for non-int string', () => expect(isValid('1.5')).to.be.false);

    it('is valid for positive int', () => expect(isValid(1)).to.be.true);

    it('is invalid for negative int', () => expect(isValid(-1)).to.be.false);

    it('is invalid for float', () => expect(isValid(1.5)).to.be.false);
  });

  describe('.isValidDollars', function () {
    it('is valid for dollar float', () => expect(isValidDollars(33.44)).to.be.true);

    it('is invalid for non-dollar float', () => expect(isValidDollars(33.444)).to.be.false);

    it('is valid for a dollar string', () => expect(isValidDollars('33.44')).to.be.true);

    it('is invalid for a non-dollar string', () => expect(isValidDollars('33.444')).to.be.false);
  });

  describe('.equals', function () {
    it('should be true if the argument is a Cents object with the same value when strict', function () {
      const cents = new Cents(5);
      expect(cents.equals(new Cents(5))).to.be.true;
      expect(cents.equals(5)).to.be.false;
    });

    it('should allow strict mode false', function () {
      expect(new Cents(5).equals(5, {strict: false})).to.be.true;
      expect(new Cents(5).equals('5', {strict: false})).to.be.true;
    });

    it('should have an is0() alias', function () {
      expect(new Cents(0).is0()).to.be.true;
      expect(new Cents(1).is0()).to.be.false;
    });

    it('should have an isnt0() alias', function () {
      expect(new Cents(0).isnt0()).to.be.false;
      expect(new Cents(1).isnt0()).to.be.true;
    });
  });

  describe('.greaterThan', function () {
    it('should work if the argument is a Cents object with the smaller value when strict', function () {
      const cents = new Cents(5);
      expect(cents.greaterThan(new Cents(10))).to.be.false;
      expect(cents.greaterThan(new Cents(4))).to.be.true;
      expect(cents.greaterThan(new Cents(5))).to.be.false;
      expect(cents.greaterThan(10)).to.be.false;
      expect(cents.greaterThan(4)).to.be.false;
      expect(cents.greaterThan(5)).to.be.false;
    });

    it('should allow strict mode false', function () {
      expect(new Cents(5).greaterThan(4, {strict: false})).to.be.true;
      expect(new Cents(5).greaterThan('4', {strict: false})).to.be.true;
    });
  });

  describe('.lessThan', function () {
    it('should work if the argument is a Cents object with the larger value when strict', function () {
      const cents = new Cents(5);
      expect(cents.lessThan(new Cents(10))).to.be.true;
      expect(cents.lessThan(new Cents(4))).to.be.false;
      expect(cents.lessThan(new Cents(5))).to.be.false;
      expect(cents.lessThan(10)).to.be.false;
      expect(cents.lessThan(4)).to.be.false;
      expect(cents.lessThan(5)).to.be.false;
    });

    it('should allow strict mode false', function () {
      expect(new Cents(5).lessThan(10, {strict: false})).to.be.true;
      expect(new Cents(5).lessThan('10', {strict: false})).to.be.true;
    });
  });

  describe('.greaterThanOrEqual', function () {
    it('should work if the argument is a Cents object with the smaller value when strict', function () {
      const cents = new Cents(5);
      expect(cents.greaterThanOrEqual(new Cents(10))).to.be.false;
      expect(cents.greaterThanOrEqual(new Cents(4))).to.be.true;
      expect(cents.greaterThanOrEqual(new Cents(5))).to.be.true;
      expect(cents.greaterThanOrEqual(10)).to.be.false;
      expect(cents.greaterThanOrEqual(4)).to.be.false;
      expect(cents.greaterThanOrEqual(5)).to.be.false;
    });

    it('should allow strict mode false', function () {
      expect(new Cents(5).greaterThanOrEqual(4, {strict: false})).to.be.true;
      expect(new Cents(5).greaterThanOrEqual('4', {strict: false})).to.be.true;
    });
  });

  describe('.lessThanOrEqual', function () {
    it('should work if the argument is a Cents object with the larger value when strict', function () {
      const cents = new Cents(5);
      expect(cents.lessThanOrEqual(new Cents(10))).to.be.true;
      expect(cents.lessThanOrEqual(new Cents(4))).to.be.false;
      expect(cents.lessThanOrEqual(new Cents(5))).to.be.true;
      expect(cents.lessThanOrEqual(10)).to.be.false;
      expect(cents.lessThanOrEqual(4)).to.be.false;
      expect(cents.lessThanOrEqual(5)).to.be.false;
    });

    it('should allow strict mode false', function () {
      expect(new Cents(5).lessThanOrEqual(10, {strict: false})).to.be.true;
      expect(new Cents(5).lessThanOrEqual('10', {strict: false})).to.be.true;
    });
  });

  describe('.sum', function () {
    it('should work with a single value splat', () => expect(sum(1)).to.have.property('value', 1));

    it('should work with a multiple value splat', () =>
      expect(sum(1, 2, 3)).to.have.property('value', 6));

    it('should work with an empty array', () => expect(sum([])).to.have.property('value', 0));

    it('should work with a non-empty array', () =>
      expect(sum([1, 2, 3])).to.have.property('value', 6));

    it('should throw an exception when passed no arguments', () => expect(() => sum()).to.throw());
  });

  describe('.sumDollars', function () {
    it('should work with a multiple value splat 100', () =>
      expect(sumDollars(1)).to.have.property('value', 100));

    it('should work with a multiple value splat 350', () =>
      expect(sumDollars(1, 2.5)).to.have.property('value', 350));

    it('should work with an empty array', () =>
      expect(sumDollars([])).to.have.property('value', 0));

    it('should work with a non-empty array', () =>
      expect(sumDollars([1, 2, 3])).to.have.property('value', 600));

    it('should throw an exception when passed no arguments', () =>
      expect(() => sumDollars()).to.throw());
  });

  describe('arithmetic', function () {
    describe('plus', function () {
      it('should a new Cents', function () {
        const zeroCents = new Cents(0);
        const newZeroCents = zeroCents.plus(0);
        expect(newZeroCents).to.be.instanceof(Cents);
        expect(newZeroCents).to.not.equal(zeroCents);
      }); // different ref

      it('should accept a Cents param and a new Cents with the correct value', () =>
        expect(new Cents(1).plus(new Cents(2))).to.have.property('value', 3));

      it('should accept a string param and a new Cents with the correct value', () =>
        expect(new Cents(1).plus('2')).to.have.property('value', 3));

      it('should allow strict mode true', function () {
        expect(() => new Cents(5).plus('5')).not.to.throw();
        expect(() => new Cents(5).plus('5', {strict: true})).to.throw();
      });
    });

    describe('minus', function () {
      it('should a new Cents with the correct amount', () =>
        expect(new Cents(3).minus(1)).to.have.property('value', 2));

      it('should throw an expection if a negative cents would be returned', () =>
        expect(() => new Cents(1).minus(2)).to.throw());

      it('should prevent underflow exception when maxZero flag is set', function () {
        const shouldBeZero = new Cents(1).minus(2, {maxZero: true});
        expect(shouldBeZero).to.have.property('value', 0);
      });

      it('should allow strict mode true', function () {
        expect(() => new Cents(5).minus('5')).not.to.throw();
        expect(() => new Cents(5).minus('5', {strict: true})).to.throw();
      });
    });

    describe('times', function () {
      it('should throw an exception if an invalid scalar is provided', function () {
        expect(() => new Cents(1).times(0.5)).to.throw();
        expect(() => new Cents(10).times(-3)).to.throw();
      });

      it('should a new Cents with the correct value', function () {
        const cents = new Cents(5);
        expect(cents.times(1)).to.have.property('value', 5);
        expect(cents.times(5)).to.have.property('value', 25);
        expect(cents.times(0.2)).to.have.property('value', 1);
        expect(cents.times(0)).to.have.property('value', 0);
      });

      it('should allow transform', function () {
        const cents = new Cents(5);
        expect(cents.times(0.5, {transform: 'round'})).to.have.property('value', 3);
        expect(cents.times(0.5, {transform: 'floor'})).to.have.property('value', 2);
      });
    });

    describe('dividedBy', function () {
      it('should throw an exception if an invalid scalar is provided', function () {
        expect(() => new Cents(1).dividedBy(0.6)).to.throw();
        expect(() => new Cents(100).dividedBy(0)).to.throw();
        expect(() => new Cents(10).dividedBy(-2)).to.throw();
      });

      it('should a new Cents with the correct value', function () {
        const cents = new Cents(10);
        expect(cents.dividedBy(2)).to.have.property('value', 5);
        expect(cents.dividedBy(5)).to.have.property('value', 2);
        expect(cents.dividedBy(0.5)).to.have.property('value', 20);
      });

      it('should allow transform', function () {
        const cents = new Cents(5);
        expect(cents.dividedBy(50, {transform: 'round'})).to.have.property('value', 0);
        expect(cents.dividedBy(50, {transform: 'ceil'})).to.have.property('value', 1);
      });
    });

    describe('percent', function () {
      it('should be equivalent to "times(percent / 100)"', function () {
        const cents1 = new Cents(10).percent(50);
        const cents2 = new Cents(10).times(50 / 100);
        expect(cents1.equals(cents2)).to.be.true;
      });

      it('should have a default transform of "round"', () =>
        expect(new Cents(3).percent(50)).to.have.property('value', 2));

      it('should avoid sig fig errors', () =>
        expect(() => new Cents(10).percent(17.3, {transform: 'round'})).not.to.throw());
    });
  });

  describe('toString', () =>
    it('should be correctly formatted', function () {
      expect(new Cents(0).toString()).to.equal('$0.00');
      expect(new Cents(1).toString()).to.equal('$0.01');
      expect(new Cents(10).toString()).to.equal('$0.10');
      expect(new Cents(100).toString()).to.equal('$1.00');
    }));
});
