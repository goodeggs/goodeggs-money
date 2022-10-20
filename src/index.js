/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let Cents;
const { BigNumber } = require("bignumber.js");

// http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
const isInt = (maybeInt) => maybeInt % 1 === 0;

module.exports =
  Cents =
  Cents =
    (function () {
      let compareCentsFunction = undefined;
      let comparators = undefined;
      Cents = class Cents {
        static initClass() {
          compareCentsFunction = (comparator) =>
            function (val, options) {
              if (options == null) {
                options = {};
              }
              const cents = this;
              if (options.strict == null) {
                options.strict = true;
              }
              if (options.strict) {
                return val instanceof Cents && comparator(cents, val);
              } else {
                const otherCents = new Cents(val); // wrap first
                return comparator(cents, otherCents);
              }
            };

          // TODO(serhalp) use built-in BigNumber.js comparator methods? Perhaps these didn't exist
          // when this was first written...?
          comparators = {
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

          this.prototype.equals = compareCentsFunction(comparators.equals);
          this.prototype.lessThan = compareCentsFunction(comparators.lessThan);
          this.prototype.lessThanOrEqual = compareCentsFunction(
            comparators.lessThanOrEqual
          );
          this.prototype.greaterThan = compareCentsFunction(
            comparators.greaterThan
          );
          this.prototype.greaterThanOrEqual = compareCentsFunction(
            comparators.greaterThanOrEqual
          );
        }

        constructor(value) {
          this.value = value;
          if ((this.value != null ? this.value.toNumber : undefined) != null) {
            // Could be instanceof BigNumber or Cents.
            this.value = this.value.toNumber();
          }

          if (typeof this.value === "string") {
            this.value = Number(this.value);
          }
          if (typeof this.value !== "number") {
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

        toBigNumber() {
          return new BigNumber(this.value);
        }
        toDollars() {
          return this.toBigNumber().dividedBy(100).toNumber();
        }
        toNumber() {
          return this.value;
        }

        plus(cents, param) {
          if (param == null) {
            param = { strict: false };
          }
          const { strict } = param;
          if (!strict) {
            cents = new Cents(cents);
          }
          return new Cents(this.toBigNumber().plus(cents.toNumber()));
        }

        minus(cents, param) {
          if (param == null) {
            param = { strict: false, maxZero: false };
          }
          const { strict, maxZero } = param;
          if (!strict) {
            cents = new Cents(cents);
          }
          const result = this.toBigNumber().minus(cents.toNumber()).toNumber(); // Number; may be negative

          if (maxZero) {
            return new Cents(Math.max(0, result));
          } else {
            return new Cents(result); // will throw if negative
          }
        }

        times(scalar, param) {
          // Transform can be any no-arg BigNumber function and should produce a valid Cents value.
          // e.g. 'ceil', 'round'
          if (param == null) {
            param = {};
          }
          const { transform } = param;
          let result = this.toBigNumber().times(scalar);
          if (transform != null) {
            result = this._applyBackwardsCompatibleTransform(result, transform);
          }
          return new Cents(result);
        }

        dividedBy(scalar, param) {
          // Transform can be any no-arg BigNumber function and should produce a valid Cents value.
          // e.g. 'ceil', 'round'
          if (param == null) {
            param = {};
          }
          const { transform } = param;
          let result = this.toBigNumber().dividedBy(scalar);
          if (transform != null) {
            result = this._applyBackwardsCompatibleTransform(result, transform);
          }
          return new Cents(result);
        }

        percent(percent, param) {
          // Is equivalent to @times(percent / 100, {transform})
          // but avoids (percent / 100) returning too many sig figs for BigNumber.
          // TODO(serhalp) this is no longer an issue since BigNumber.js@7.0.0:
          // https://github.com/MikeMcl/bignumber.js/blob/master/CHANGELOG.md#700. Simplify?
          if (param == null) {
            param = { transform: "round" };
          }
          const { transform } = param;
          const scalar = new BigNumber(percent).dividedBy(100).toNumber();
          return this.times(scalar, { transform });
        }

        // Handy aliases.
        is0() {
          return this.equals(new Cents(0));
        }
        isnt0() {
          return !this.is0();
        }

        toString() {
          return `$${new BigNumber(this.toDollars()).toFixed(2)}`;
        } // always show 2 decimal places

        // BigNumber.js removed `round()`, `ceil()`, and `floor()` in in v6.0.0. Previously this library
        // allowed magically calling through to underlying BigNumber.js methods. This is a shim to
        // continue to transparently continue to support the frequently used `round` "transform" without
        // breaking backwards compatibility.
        _applyBackwardsCompatibleTransform(bigNumber, transform) {
          if (transform === "round") {
            return bigNumber.integerValue(BigNumber.ROUND_HALF_UP);
          } else if (transform === "floor") {
            return bigNumber.integerValue(BigNumber.ROUND_FLOOR);
          } else if (transform === "ceil") {
            return bigNumber.integerValue(BigNumber.ROUND_CEIL);
          } else if (typeof bigNumber[transform] !== "function") {
            throw new TypeError(
              `Cannot apply transform '${transform}', is not a supported BigNumber.js method`
            );
          } else {
            return bigNumber[transform]();
          }
        }
      };
      Cents.initClass();
      return Cents;
    })();

Cents.prototype.lt = Cents.prototype.lessThan;
Cents.prototype.lte = Cents.prototype.lessThanOrEqual;
Cents.prototype.gt = Cents.prototype.greaterThan;
Cents.prototype.gte = Cents.prototype.greaterThanOrEqual;

Cents.isValid = function (maybeCents) {
  let threw = false;
  try {
    new Cents(maybeCents);
  } catch (error) {
    threw = true;
  }
  return !threw;
};

Cents.isValidDollars = function (maybeDollars) {
  let threw = false;
  try {
    Cents.fromDollars(maybeDollars);
  } catch (error) {
    threw = true;
  }
  return !threw;
};

Cents.fromDollars = (
  dollars // dollars should be a Number like xx.yy
) => new Cents(new BigNumber(dollars).times(100));

Cents.round = function (maybeInt) {
  if (!(maybeInt >= 0)) {
    throw new Error(`${maybeInt} must be positive to round to cents`);
  }
  return new Cents(
    new BigNumber(maybeInt).integerValue(BigNumber.ROUND_HALF_UP)
  );
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
    throw new Error("Expect at least one argument");
  }

  if (Array.isArray(splat[0])) {
    if (splat.length !== 1) {
      throw new Error("Expect a single array argument");
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

Cents.min = function (...cents) {
  cents = arrayifySplat(cents, Cents.isValid);
  cents = cents.map((cent) => new Cents(cent).toNumber());
  const min = Math.min(...Array.from(cents || []));
  return new Cents(min);
};

Cents.max = function (...cents) {
  cents = arrayifySplat(cents, Cents.isValid);
  cents = cents.map((cent) => new Cents(cent).toNumber());
  const max = Math.max(...Array.from(cents || []));
  return new Cents(max);
};

Cents.sum = function (...cents) {
  cents = arrayifySplat(cents, Cents.isValid);
  return cents.reduce((memo, val) => memo.plus(val), new Cents(0));
};

Cents.sumDollars = function (...dollars) {
  dollars = arrayifySplat(dollars, Cents.isValidDollars);
  return dollars.reduce(
    (memo, val) => memo.plus(Cents.fromDollars(val)),
    new Cents(0)
  );
};