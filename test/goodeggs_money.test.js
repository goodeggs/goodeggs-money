/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const { BigNumber } = require("bignumber.js");
const { expect } = require("chai");

const Cents = require("../src/");

describe("Cents", function () {
  describe("constructor", function () {
    it("can construct with int", function () {
      const cents = new Cents(1);
      return expect(cents).to.have.property("value", 1);
    });

    it("can construct with string", function () {
      const cents = new Cents("1");
      return expect(cents).to.have.property("value", 1);
    });

    it("can construct with BigNumber", function () {
      const cents = new Cents(new BigNumber(1));
      return expect(cents).to.have.property("value", 1);
    });

    it("can construct with Cents", function () {
      const cents = new Cents(new Cents(1));
      return expect(cents).to.have.property("value", 1);
    });

    it("throws if constructed with non-int number", () =>
      expect(() => new Cents(1.01)).to.throw());

    it("throws if constructed with NaN", () =>
      expect(() => new Cents(NaN)).to.throw());

    it("throws if constructed with Infinity", () =>
      expect(() => new Cents(Infinity)).to.throw());

    return it("throws if constructed with negative int", () =>
      expect(() => new Cents(-1)).to.throw());
  });

  describe(".fromDollars", function () {
    it("can convert zero dollars", () =>
      expect(Cents.fromDollars(0)).to.have.property("value", 0));

    it("can convert non-zero dollars", () =>
      expect(Cents.fromDollars(0.01)).to.have.property("value", 1));

    return it("throws if converting non-dollar Number", () =>
      expect(() => Cents.fromDollars(1.000001)).to.throw());
  });

  describe(".max", function () {
    it("throws if not provided at least one value", () =>
      expect(() => Cents.max()).to.throw());

    it("throws if provided an empty array", () =>
      expect(() => Cents.max([])).to.throw());

    it("throws if provided an invalid splat", () =>
      expect(() => Cents.max([1], 2, 3)).to.throw());

    it("works with a single value", () =>
      expect(Cents.max(new Cents(3))).to.have.property("value", 3));

    it("works with multiple values", () =>
      expect(
        Cents.max(new Cents(2), new Cents(3), new Cents(1))
      ).to.have.property("value", 3));

    it("works with non Cents values", () =>
      expect(Cents.max(new Cents(2), 3, "1")).to.have.property("value", 3));

    return it("works with a non-empty array", () =>
      expect(Cents.max([1, 2, 3])).to.have.property("value", 3));
  });

  describe(".min", function () {
    it("throws if not provided at least one value", () =>
      expect(() => Cents.min()).to.throw());

    it("throws if provided an empty array", () =>
      expect(() => Cents.min([])).to.throw());

    it("throws if provided an invalid splat", () =>
      expect(() => Cents.min([1], 2, 3)).to.throw());

    it("works with a single value", () =>
      expect(Cents.min(new Cents(3))).to.have.property("value", 3));

    it("works with multiple values", () =>
      expect(
        Cents.min(new Cents(3), new Cents(1), new Cents(2))
      ).to.have.property("value", 1));

    it("works with non Cents values", () =>
      expect(Cents.min(new Cents(3), 1, "2")).to.have.property("value", 1));

    return it("works with a non-empty array", () =>
      expect(Cents.min([1, 2, 3])).to.have.property("value", 1));
  });

  describe(".round", function () {
    it("rounds down", () =>
      expect(Cents.round(0.4999)).to.have.property("value", 0));

    it("rounds up", () =>
      expect(Cents.round(0.5)).to.have.property("value", 1));

    it("rounds 0", () => expect(Cents.round(0)).to.have.property("value", 0));

    return it("throws if given a negative number", () =>
      expect(() => Cents.round(-0.1)).to.throw());
  });

  describe(".isValid", function () {
    it("is valid for Cents", () =>
      expect(Cents.isValid(new Cents(1))).to.be.true);

    it("is valid for int string", () => expect(Cents.isValid("1")).to.be.true);

    it("is invalid for non-int string", () =>
      expect(Cents.isValid("1.5")).to.be.false);

    it("is valid for positive int", () => expect(Cents.isValid(1)).to.be.true);

    it("is invalid for negative int", () =>
      expect(Cents.isValid(-1)).to.be.false);

    return it("is invalid for float", () =>
      expect(Cents.isValid(1.5)).to.be.false);
  });

  describe(".isValidDollars", function () {
    it("is valid for dollar float", () =>
      expect(Cents.isValidDollars(33.44)).to.be.true);

    it("is invalid for non-dollar float", () =>
      expect(Cents.isValidDollars(33.444)).to.be.false);

    it("is valid for a dollar string", () =>
      expect(Cents.isValidDollars("33.44")).to.be.true);

    return it("is invalid for a non-dollar string", () =>
      expect(Cents.isValidDollars("33.444")).to.be.false);
  });

  describe(".equals", function () {
    it("should be true if the argument is a Cents object with the same value when strict", function () {
      const cents = new Cents(5);
      expect(cents.equals(new Cents(5))).to.be.true;
      return expect(cents.equals(5)).to.be.false;
    });

    it("should allow strict mode false", function () {
      expect(new Cents(5).equals(5, { strict: false })).to.be.true;
      return expect(new Cents(5).equals("5", { strict: false })).to.be.true;
    });

    it("should have an is0() alias", function () {
      expect(new Cents(0).is0()).to.be.true;
      return expect(new Cents(1).is0()).to.be.false;
    });

    return it("should have an isnt0() alias", function () {
      expect(new Cents(0).isnt0()).to.be.false;
      return expect(new Cents(1).isnt0()).to.be.true;
    });
  });

  describe(".greaterThan", function () {
    it("should work if the argument is a Cents object with the smaller value when strict", function () {
      const cents = new Cents(5);
      expect(cents.greaterThan(new Cents(10))).to.be.false;
      expect(cents.greaterThan(new Cents(4))).to.be.true;
      expect(cents.greaterThan(new Cents(5))).to.be.false;
      expect(cents.greaterThan(10)).to.be.false;
      expect(cents.greaterThan(4)).to.be.false;
      return expect(cents.greaterThan(5)).to.be.false;
    });

    return it("should allow strict mode false", function () {
      expect(new Cents(5).greaterThan(4, { strict: false })).to.be.true;
      return expect(new Cents(5).greaterThan("4", { strict: false })).to.be
        .true;
    });
  });

  describe(".lessThan", function () {
    it("should work if the argument is a Cents object with the larger value when strict", function () {
      const cents = new Cents(5);
      expect(cents.lessThan(new Cents(10))).to.be.true;
      expect(cents.lessThan(new Cents(4))).to.be.false;
      expect(cents.lessThan(new Cents(5))).to.be.false;
      expect(cents.lessThan(10)).to.be.false;
      expect(cents.lessThan(4)).to.be.false;
      return expect(cents.lessThan(5)).to.be.false;
    });

    return it("should allow strict mode false", function () {
      expect(new Cents(5).lessThan(10, { strict: false })).to.be.true;
      return expect(new Cents(5).lessThan("10", { strict: false })).to.be.true;
    });
  });

  describe(".greaterThanOrEqual", function () {
    it("should work if the argument is a Cents object with the smaller value when strict", function () {
      const cents = new Cents(5);
      expect(cents.greaterThanOrEqual(new Cents(10))).to.be.false;
      expect(cents.greaterThanOrEqual(new Cents(4))).to.be.true;
      expect(cents.greaterThanOrEqual(new Cents(5))).to.be.true;
      expect(cents.greaterThanOrEqual(10)).to.be.false;
      expect(cents.greaterThanOrEqual(4)).to.be.false;
      return expect(cents.greaterThanOrEqual(5)).to.be.false;
    });

    return it("should allow strict mode false", function () {
      expect(new Cents(5).greaterThanOrEqual(4, { strict: false })).to.be.true;
      return expect(new Cents(5).greaterThanOrEqual("4", { strict: false })).to
        .be.true;
    });
  });

  describe(".lessThanOrEqual", function () {
    it("should work if the argument is a Cents object with the larger value when strict", function () {
      const cents = new Cents(5);
      expect(cents.lessThanOrEqual(new Cents(10))).to.be.true;
      expect(cents.lessThanOrEqual(new Cents(4))).to.be.false;
      expect(cents.lessThanOrEqual(new Cents(5))).to.be.true;
      expect(cents.lessThanOrEqual(10)).to.be.false;
      expect(cents.lessThanOrEqual(4)).to.be.false;
      return expect(cents.lessThanOrEqual(5)).to.be.false;
    });

    return it("should allow strict mode false", function () {
      expect(new Cents(5).lessThanOrEqual(10, { strict: false })).to.be.true;
      return expect(new Cents(5).lessThanOrEqual("10", { strict: false })).to.be
        .true;
    });
  });

  describe(".sum", function () {
    it("should work with a single value splat", () =>
      expect(Cents.sum(1)).to.have.property("value", 1));

    it("should work with a multiple value splat", () =>
      expect(Cents.sum(1, 2, 3)).to.have.property("value", 6));

    it("should work with an empty array", () =>
      expect(Cents.sum([])).to.have.property("value", 0));

    it("should work with a non-empty array", () =>
      expect(Cents.sum([1, 2, 3])).to.have.property("value", 6));

    return it("should throw an exception when passed no arguments", () =>
      expect(() => Cents.sum()).to.throw());
  });

  describe(".sumDollars", function () {
    it("should work with a multiple value splat", () =>
      expect(Cents.sumDollars(1)).to.have.property("value", 100));

    it("should work with a multiple value splat", () =>
      expect(Cents.sumDollars(1, 2.5)).to.have.property("value", 350));

    it("should work with an empty array", () =>
      expect(Cents.sumDollars([])).to.have.property("value", 0));

    it("should work with a non-empty array", () =>
      expect(Cents.sumDollars([1, 2, 3])).to.have.property("value", 600));

    return it("should throw an exception when passed no arguments", () =>
      expect(() => Cents.sumDollars()).to.throw());
  });

  describe("arithmetic", function () {
    describe("plus", function () {
      it("should return a new Cents", function () {
        const zeroCents = new Cents(0);
        const newZeroCents = zeroCents.plus(0);
        expect(newZeroCents).to.be.instanceof(Cents);
        return expect(newZeroCents).to.not.equal(zeroCents);
      }); // different ref

      it("should accept a Cents param and return a new Cents with the correct value", () =>
        expect(new Cents(1).plus(new Cents(2))).to.have.property("value", 3));

      it("should accept a string param and return a new Cents with the correct value", () =>
        expect(new Cents(1).plus("2")).to.have.property("value", 3));

      return it("should allow strict mode true", function () {
        expect(() => new Cents(5).plus("5")).not.to.throw();
        return expect(() =>
          new Cents(5).plus("5", { strict: true })
        ).to.throw();
      });
    });

    describe("minus", function () {
      it("should return a new Cents with the correct amount", () =>
        expect(new Cents(3).minus(1)).to.have.property("value", 2));

      it("should throw an expection if a negative cents would be returned", () =>
        expect(() => new Cents(1).minus(2)).to.throw());

      it("should prevent underflow exception when maxZero flag is set", function () {
        const shouldBeZero = new Cents(1).minus(2, { maxZero: true });
        return expect(shouldBeZero).to.have.property("value", 0);
      });

      return it("should allow strict mode true", function () {
        expect(() => new Cents(5).minus("5")).not.to.throw();
        return expect(() =>
          new Cents(5).minus("5", { strict: true })
        ).to.throw();
      });
    });

    describe("times", function () {
      it("should throw an exception if an invalid scalar is provided", function () {
        expect(() => new Cents(1).times(0.5)).to.throw();
        return expect(() => new Cents(10).times(-3)).to.throw();
      });

      it("should return a new Cents with the correct value", function () {
        const cents = new Cents(5);
        expect(cents.times(1)).to.have.property("value", 5);
        expect(cents.times(5)).to.have.property("value", 25);
        expect(cents.times(0.2)).to.have.property("value", 1);
        return expect(cents.times(0)).to.have.property("value", 0);
      });

      return it("should allow transform", function () {
        const cents = new Cents(5);
        expect(cents.times(0.5, { transform: "round" })).to.have.property(
          "value",
          3
        );
        return expect(
          cents.times(0.5, { transform: "floor" })
        ).to.have.property("value", 2);
      });
    });

    describe("dividedBy", function () {
      it("should throw an exception if an invalid scalar is provided", function () {
        expect(() => new Cents(1).dividedBy(0.6)).to.throw();
        expect(() => new Cents(100).dividedBy(0)).to.throw();
        return expect(() => new Cents(10).dividedBy(-2)).to.throw();
      });

      it("should return a new Cents with the correct value", function () {
        const cents = new Cents(10);
        expect(cents.dividedBy(2)).to.have.property("value", 5);
        expect(cents.dividedBy(5)).to.have.property("value", 2);
        return expect(cents.dividedBy(0.5)).to.have.property("value", 20);
      });

      return it("should allow transform", function () {
        const cents = new Cents(5);
        expect(cents.dividedBy(50, { transform: "round" })).to.have.property(
          "value",
          0
        );
        return expect(
          cents.dividedBy(50, { transform: "ceil" })
        ).to.have.property("value", 1);
      });
    });

    return describe("percent", function () {
      it('should be equivalent to "times(percent / 100)"', function () {
        const cents1 = new Cents(10).percent(50);
        const cents2 = new Cents(10).times(50 / 100);
        return expect(cents1.equals(cents2)).to.be.true;
      });

      it('should have a default transform of "round"', () =>
        expect(new Cents(3).percent(50)).to.have.property("value", 2));

      return it("should avoid sig fig errors", () =>
        expect(() =>
          new Cents(10).percent(17.3, { transform: "round" })
        ).not.to.throw());
    });
  });

  return describe("toString", () =>
    it("should be correctly formatted", function () {
      expect(new Cents(0).toString()).to.equal("$0.00");
      expect(new Cents(1).toString()).to.equal("$0.01");
      expect(new Cents(10).toString()).to.equal("$0.10");
      return expect(new Cents(100).toString()).to.equal("$1.00");
    }));
});
