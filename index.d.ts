export = ipcidr;
export as namespace ipcidr;

import {Address4, Address6} from "ip-address";
import {BigInteger} from "jsbn";

declare namespace ipcidr {
    type Address = Address4 | Address6;
    type FormatResult = BigInteger | Address | string;

    interface FormatOptions {
        type: "bigInteger" | "addressObject",
        from: number | BigInteger;
        limit: number | BigInteger;
    }

    interface ChunkInfo {
        from: BigInteger;
        to: BigInteger;
        limit: number;
        length: number;
    }

    interface IPCIDR {
        constructor(cidr: string): IPCIDR;

        formatIP<T = FormatResult>(address: Address, options?: any): T;

        start<T = FormatResult>(options?: FormatOptions): T;

        end<T = FormatResult>(options?: FormatOptions): T;

        toRange<T = FormatResult>(options?: FormatOptions): [T, T];

        loop<T = FormatResult, R = any>(fn: (ip: T) => Promise<R>, options: FormatOptions, results?: ChunkInfo): Promise<R>[];

        getChunkInfo(length: number, options: FormatOptions): ChunkInfo;

        contains(address: Address | string): boolean;

        isValid(): boolean;

        toString(): string;

        toArray(): string[];

        toObject(): { start: string, end: string };
    }
}
