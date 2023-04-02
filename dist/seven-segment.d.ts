import { Backpack } from './backpack';
export declare class SevenSegment {
    display: Backpack;
    constructor(bus?: number, address?: number);
    /**
     *
     * @param charNumber Sets a single decimal or hexademical value (0..9 and A..F)
     * @param index
     * @param dot
     */
    writeDigit(charNumber: number, index: number, dot?: number): void;
    writeDigitRaw(charNumber: number, value: number): void;
    /**
     * Enables or disables the *middle* colon (on or off).
     *
     * There are more colons available to be set on or off, however, you should be able to turn these on or off using the ascii writing mechanism.
     * WARN: Overwrites any previous states and the other colons.
     *
     * @param state Whether the middle colon should be on or off.
     */
    setColon(state: boolean): void;
    /**
     * Write the (current) time to the display.
     *
     * @param date If you do not want the current time to be written, give your own date object.
     */
    writeTime(date?: Date): void;
    /**
     * Clears the display.
     */
    clear(): Promise<void>;
    /**
     * Write the current framebuffer to the display.
     */
    flush(): Promise<void>;
}
/**
 * Map of ascii charcters to uint8 bytes
 */
export declare const NumberTable: {
    [char: string]: number;
};
