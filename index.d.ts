import { Address4, Address6 } from "ip-address";
import { BigInteger } from "jsbn";

declare class IPCIDR {
  constructor(cidr: string);

  formatIP<T = IPCIDR.FormatResult>(address: IPCIDR.Address, options?: any): T;

  start<T = IPCIDR.FormatResult>(options?: IPCIDR.FormatOptions): T;

  end<T = IPCIDR.FormatResult>(options?: IPCIDR.FormatOptions): T;

  toRange<T = IPCIDR.FormatResult>(options?: IPCIDR.FormatOptions): [T, T];

  loop<T = IPCIDR.FormatResult, R = any>(fn: (ip: T) => Promise<R>, options: IPCIDR.FormatOptions, results?: IPCIDR.ChunkInfo): Promise<R>[];

  getChunkInfo(length: number, options: IPCIDR.FormatOptions): IPCIDR.ChunkInfo;

  contains(address: IPCIDR.Address | string): boolean;

  isValid(): boolean;

  toString(): string;

  toArray(): string[];

  toObject(): { start: string, end: string };
}

declare namespace IPCIDR {
  type Address = Address4 | Address6;
  type FormatResult = BigInteger | Address | string;

  interface FormatOptions {
    type?: "bigInteger" | "addressObject",
    from?: string | number | BigInteger;
    to?: string | number | BigInteger;
    limit?: number | BigInteger;
  }

  interface ChunkInfo {
    from: BigInteger;
    to: BigInteger;
    limit: BigInteger;
    length: BigInteger;
  }
}

export = IPCIDR;
