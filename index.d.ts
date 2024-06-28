import { Address4, Address6 } from "ip-address";

type Address = Address4 | Address6;

declare class IPCIDR {
  cidr: string;
  address: Address;
  addressStart: Address;
  addressEnd: Address;
  size: BigInt;

  constructor(cidr: string);

  start<T = IPCIDR.FormatResult>(options?: IPCIDR.FormatOptions): T;

  end<T = IPCIDR.FormatResult>(options?: IPCIDR.FormatOptions): T;

  toRange<T = IPCIDR.FormatResult>(options?: IPCIDR.FormatOptions): [T, T];

  loop<T = IPCIDR.FormatResult, R = any>(fn: (ip: T) => Promise<R>, options: IPCIDR.FormatOptions, results?: IPCIDR.ChunkInfo): Promise<R>[];

  getChunkInfo(length: number, options: IPCIDR.FormatOptions): IPCIDR.ChunkInfo;

  contains(address: IPCIDR.Address | string | BigInt): boolean;

  toString(): string;

  toArray(options?: IPCIDR.FormatOptions, results?: IPCIDR.ChunkInfo): string[];

  toObject(options?: IPCIDR.FormatOptions): { start: string, end: string };
}

declare namespace IPCIDR {
  type Address = Address4 | Address6;
  type FormatResult = BigInt | Address | string;

  interface FormatOptions {
    type?: "bigInteger" | "addressObject",
    from?: string | number | BigInt;
    to?: string | number | BigInt;
    limit?: number | BigInt;
  }

  interface ChunkInfo {
    from: BigInt;
    to: BigInt;
    limit: BigInt;
    length: BigInt;
  }
  
  export function formatIP<T = FormatResult>(address: Address, options?: any): T;
  export function isValidAddress(address: string): boolean;
  export function isValidCIDR(address: string): boolean;
  export function createAddress(address: string): Address;
}

export default IPCIDR;
