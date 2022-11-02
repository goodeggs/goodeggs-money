import {BigNumber} from 'bignumber.js';

interface Params {
  transform: string;
}

// http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
const isInt = (maybeInt) => maybeInt % 1 === 0;

const compareCentsFunction = (comparator, Class) =>
  function (val, options) {
    if (options == null) {
      options = {};
    }

    const cents = this;

    if (options.strict == null) {
      options.strict = true;
    }

    if (options.strict) {
      return val instanceof Class && comparator(cents, val);
    }

    const otherCents = new Class(val);
    return comparator(cents, otherCents);
  };

const comparators = {
  equals(cents, otherCents) {
    return cents.toNumber() === otherCents.toNumber();
  },

  lessThan(cents, otherCents) {
    return cents.toNumber() < otherCents.toNumber();
  },

  lessThanOrEqual(cents, otherCents) {
    return cents.toNumber() <= otherCents.toNumber();
  },

  greaterThan(cents, otherCents) {
    return cents.toNumber() > otherCents.toNumber();
  },

  greaterThanOrEqual(cents, otherCents) {
    return cents.toNumber() >= otherCents.toNumber();
  },
};

// This method supports static method calls of the form:
//   Cents.staticMethod(...)
//
// The ... must include at least one argument.
//
// Case 1: ... => single argument array
//   There must be no other arguments and each value in the array must "pass" the
//   validator (boolean) predicate function. Returns the array.
// Case 2: ... => multiple argument values
//   Each value must "pass" the validator predicate function. Returns an array of the values.
const arrayifySplat = function (splat, validator) {
  if (!(splat.length > 0)) {
    throw new Error('Expect at least one argument');
  }

  if (Array.isArray(splat[0])) {
    if (splat.length !== 1) {
      throw new Error('Expect a single array argument');
    }

    splat = splat[0];
  }

  if (validator != null) {
    splat.forEach(function (val) {
      if (!validator(val)) {
        throw new Error(`Unexpected value ${val}`);
      }
    });
  }

  return splat;
};

class Cents {
  constructor(value) {
    this.equals = compareCentsFunction(comparators.equals, Cents);
    this.lessThan = compareCentsFunction(comparators.lessThan, Cents);
    this.lt = this.lessThan;
    this.lessThanOrEqual = compareCentsFunction(comparators.lessThanOrEqual, Cents);
    this.lte = this.lessThanOrEqual;
    this.greaterThan = compareCentsFunction(comparators.greaterThan, Cents);
    this.gt = this.greaterThan;
    this.greaterThanOrEqual = compareCentsFunction(comparators.greaterThanOrEqual, Cents);
    this.gte = this.greaterThanOrEqual;
    this.value = value;

    if ((this.value != null ? this.value.toNumber : undefined) != null) {
      // Could be instanceof BigNumber or Cents.
      this.value = this.value.toNumber();
    }

    if (typeof this.value === 'string') {
      this.value = Number(this.value);
    }

    if (typeof this.value !== 'number') {
      throw new Error(`${this.value} must be a Number`);
    }

    if (isNaN(this.value)) {
      throw new Error(`${this.value} must not be NaN`);
    }

    if (!isInt(this.value)) {
      throw new Error(`${this.value} must be an int`);
    }

    if (this.value < 0) {
      throw new Error(`${this.value} must not be negative`);
    }
  }

  toBigNumber(): BigNumber {
    return new BigNumber(this.value);
  }

  toDollars(): number {
    return this.toBigNumber().dividedBy(100).toNumber();
  }

  toNumber(): number {
    return this.value;
  }

  plus(cents: Cents, param?: {strict: boolean}): Cents {
    if (param == null) {
      param = {
        strict: false,
      };
    }

    const {strict} = param;

    if (!strict) {
      cents = new Cents(cents);
    }

    return new Cents(this.toBigNumber().plus(cents.toNumber()));
  }

  minus(cents: Cents, param: {strict: boolean; maxZero: boolean}): Cents {
    if (param == null) {
      param = {
        strict: false,
        maxZero: false,
      };
    }

    const {strict, maxZero} = param;

    if (!strict) {
      cents = new Cents(cents);
    }

    const result = this.toBigNumber().minus(cents.toNumber()).toNumber(); // Number; may be negative

    if (maxZero) {
      return new Cents(Math.max(0, result));
    }

    return new Cents(result); // will throw if negative
  }

  times(scalar: number, param: Params | Record<string, undefined>): Cents {
    // Transform can be any no-arg BigNumber function and should produce a valid Cents value.
    // e.g. 'ceil', 'round'
    if (param == null) {
      param = {};
    }

    const {transform} = param;
    let result = this.toBigNumber().times(scalar);

    if (transform != null) {
      result = this._applyBackwardsCompatibleTransform(result, transform);
    }

    return new Cents(result);
  }

  dividedBy(scalar: number, param: Params | Record<string, undefined>): Cents {
    // Transform can be any no-arg BigNumber function and should produce a valid Cents value.
    // e.g. 'ceil', 'round'
    if (param == null) {
      param = {};
    }

    const {transform} = param;
    let result = this.toBigNumber().dividedBy(scalar);

    if (transform != null) {
      result = this._applyBackwardsCompatibleTransform(result, transform);
    }

    return new Cents(result);
  }

  percent(percent: number, param: Params): Cents {
    // Is equivalent to @times(percent / 100, {transform})
    // but avoids (percent / 100) returning too many sig figs for BigNumber.
    // TODO(serhalp) this is no longer an issue since BigNumber.js@7.0.0:
    // https://github.com/MikeMcl/bignumber.js/blob/master/CHANGELOG.md#700. Simplify?
    if (param == null) {
      param = {
        transform: 'round',
      };
    }

    const {transform} = param;
    const scalar = new BigNumber(percent).dividedBy(100).toNumber();
    return this.times(scalar, {
      transform,
    });
  }

  // Handy aliases.
  is0(): boolean {
    return this.equals(new Cents(0));
  }

  isnt0(): boolean {
    return !this.is0();
  }

  toString(): string {
    return `$${new BigNumber(this.toDollars()).toFixed(2)}`;
  }

  // always show 2 decimal places
  // BigNumber.js removed `round()`, `ceil()`, and `floor()` in in v6.0.0. Previously this library
  // allowed magically calling through to underlying BigNumber.js methods. This is a shim to
  // continue to transparently continue to support the frequently used `round` "transform" without
  // breaking backwards compatibility.
  _applyBackwardsCompatibleTransform(bigNumber: BigNumber, transform: string): BigNumber {
    if (transform === 'round') {
      return bigNumber.integerValue(BigNumber.ROUND_HALF_UP);
    } else if (transform === 'floor') {
      return bigNumber.integerValue(BigNumber.ROUND_FLOOR);
    } else if (transform === 'ceil') {
      return bigNumber.integerValue(BigNumber.ROUND_CEIL);
    } else if (typeof bigNumber[transform] !== 'function') {
      throw new TypeError(
        `Cannot apply transform '${transform}', is not a supported BigNumber.js method`,
      );
    } else {
      return bigNumber[transform]();
    }
  }

  static isValid(maybeCents: Cents): boolean {
    let centsInstance;

    try {
      centsInstance = new Cents(maybeCents);
    } catch {
      centsInstance = new Error('invalid');
    }

    return centsInstance instanceof Cents;
  }

  static isValidDollars(maybeDollars: number): boolean {
    let threw = false;

    try {
      Cents.fromDollars(maybeDollars);
    } catch {
      threw = true;
    }

    return !threw;
  }

  static fromDollars = (
    dollars: number, // dollars should be a Number like xx.yy
  ): Cents => new Cents(new BigNumber(dollars).times(100));

  static round(maybeInt: number): Cents {
    if (!(maybeInt >= 0)) {
      throw new Error(`${maybeInt} must be positive to round to cents`);
    }

    return new Cents(new BigNumber(maybeInt).integerValue(BigNumber.ROUND_HALF_UP));
  }

  static min(...cents: Cents[]): Cents {
    cents = arrayifySplat(cents, Cents.isValid);
    const centsNumber = cents.map((cent) => new Cents(cent).toNumber());
    const min = Math.min(...centsNumber);
    return new Cents(min);
  }

  static max(...cents: Cents[]): Cents {
    cents = arrayifySplat(cents, Cents.isValid);
    const centsNumber = cents.map((cent) => new Cents(cent).toNumber());
    const max = Math.max(...centsNumber);
    return new Cents(max);
  }

  static sum(...cents: Cents[]): Cents {
    cents = arrayifySplat(cents, Cents.isValid);
    return cents.reduce((memo, val) => memo.plus(val), new Cents(0));
  }

  static sumDollars(...dollars: number[]): Cents {
    dollars = arrayifySplat(dollars, Cents.isValidDollars);
    return dollars.reduce((memo, val) => memo.plus(Cents.fromDollars(val)), new Cents(0));
  }
}

export default Cents;
