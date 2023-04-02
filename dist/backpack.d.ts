import { EventEmitter } from 'eventemitter3';
export declare enum Blinkrate {
    Off = 0,
    Double = 1,
    Normal = 2,
    Half = 3
}
/**
 * Represents the backpack.
 */
export declare class Backpack extends EventEmitter {
    private address;
    private wire;
    private buffer;
    /**
     * Whether or not the screen is on or off.
     */
    private state;
    constructor(bus: number, address: number);
    setBlinkrate(rate: Blinkrate): Promise<void>;
    /**
     * Set the brightness of the display.
     *
     * @param brightness A number from 0-15.
     */
    setBrightness(brightness: number): Promise<void>;
    setBufferBlock(block: number, value: number): void;
    writeDisplay(): Promise<void>;
    clear(): Promise<void>;
    /**
     * Execute an command via I2C on the backpack and return the async promise.
     *
     * @param cmd Command to execute.
     * @param arg Optionally an argument for it.
     */
    private executeCommand;
}
