import {BigNumber} from 'bignumber.js';

declare class Cents {
  constructor(value: any);
  toBigNumber(): BigNumber;
  toDollars(): number;
  toNumber(): any;
  plus(cents: any, param: any): Cents;
  minus(cents: any, param: any): Cents;
  times(scalar: any, param: any): Cents;
  dividedBy(scalar: any, param: any): Cents;
  percent(percent: any, param: any): Cents;
  is0(): any;
  isnt0(): boolean;
  toString(): string;
  _applyBackwardsCompatibleTransform(bigNumber: any, transform: any): any;
  static isValid(maybeCents: any): boolean;
  static isValidDollars(maybeDollars: any): boolean;
  static fromDollars: (dollars: any) => Cents;
  static round(maybeInt: any): Cents;
  static min(...cents: any[]): Cents;
  static max(...cents: any[]): Cents;
  static sum(...cents: any[]): any;
  static sumDollars(...dollars: any[]): any;
}
export default Cents;
// # sourceMappingURL=index.d.ts.map
