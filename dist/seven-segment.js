"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberTable = exports.SevenSegment = void 0;
var backpack_1 = require("./backpack");
var debuglib = require("debug");
var debug = debuglib('wekker:seven-segment');
var SevenSegment = /** @class */ (function () {
    function SevenSegment(bus, address) {
        if (bus === void 0) { bus = 0; }
        if (address === void 0) { address = 0x70; }
        this.display = new backpack_1.Backpack(bus, address);
    }
    /**
     *
     * @param charNumber Sets a single decimal or hexademical value (0..9 and A..F)
     * @param index
     * @param dot
     */
    SevenSegment.prototype.writeDigit = function (charNumber, index, dot) {
        if (dot === void 0) { dot = 0; }
        // Sets a single decimal or hexademical value (0..9 and A..F)
        if (charNumber > 7) {
            return;
        }
        if (index > 0xF) {
            return;
        }
        // Set the appropriate digit
        this.display.setBufferBlock(charNumber, digits[index] | (dot << 7));
    };
    SevenSegment.prototype.writeDigitRaw = function (charNumber, value) {
        // Sets a digit using the raw 16-bit value"
        if (charNumber > 7) {
            return;
        }
        // Set the appropriate digit
        this.display.setBufferBlock(charNumber, value);
    };
    /**
     * Enables or disables the *middle* colon (on or off).
     *
     * There are more colons available to be set on or off, however, you should be able to turn these on or off using the ascii writing mechanism.
     * WARN: Overwrites any previous states and the other colons.
     *
     * @param state Whether the middle colon should be on or off.
     */
    SevenSegment.prototype.setColon = function (state) {
        if (state) {
            //this.display.setBufferBlock(2, 0xFFFF);
            this.display.setBufferBlock(2, 0x2);
        }
        else {
            this.display.setBufferBlock(2, 0);
        }
    };
    /**
     * Write the (current) time to the display.
     *
     * @param date If you do not want the current time to be written, give your own date object.
     */
    SevenSegment.prototype.writeTime = function (date) {
        if (date === void 0) { date = new Date; }
        var date = new Date(), hour = date.getHours(), minute = date.getMinutes();
        debug("wrote time: ".concat(Math.floor(hour / 10)).concat(hour % 10, ":").concat(Math.floor(minute / 10)).concat(minute % 10));
        // Hours
        this.writeDigit(0, Math.floor(hour / 10));
        this.writeDigit(1, hour % 10);
        // Minutes
        this.writeDigit(3, Math.floor(minute / 10));
        this.writeDigit(4, minute % 10);
        // Colon
        this.setColon(true);
    };
    /**
     * Clears the display.
     */
    SevenSegment.prototype.clear = function () {
        return this.display.clear();
    };
    /**
     * Write the current framebuffer to the display.
     */
    SevenSegment.prototype.flush = function () {
        return this.display.writeDisplay();
    };
    return SevenSegment;
}());
exports.SevenSegment = SevenSegment;
/**
 * Map of ascii charcters to uint8 bytes
 */
exports.NumberTable = {
    '0': 0x3F,
    '1': 0x06,
    '2': 0x5B,
    '3': 0x4F,
    '4': 0x66,
    '5': 0x6D,
    '6': 0x7D,
    '7': 0x07,
    '8': 0x7F,
    '9': 0x6F,
    'a': 0x77,
    'b': 0x7C,
    'C': 0x39,
    'd': 0x5E,
    'E': 0x79,
    'F': 0x71, /* F */
};
//Hexadecimal character lookup table (0..9, A..F)
var digits = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];
//# sourceMappingURL=seven-segment.js.map