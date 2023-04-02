"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backpack = exports.Blinkrate = void 0;
var i2c_bus_1 = require("i2c-bus");
var eventemitter3_1 = require("eventemitter3");
var buffer_1 = require("buffer");
var debuglib = require("debug");
var debug = debuglib('wekker:backpack');
var REGISTER_DISPLAY_SETUP = 0x80;
var REGISTER_SYSTEM_SETUP = 0x20;
var REGISTER_DIMMING = 0xE0;
var ADDRESS_KEY_DATA = 0x40;
var HT16K33_CMD_OSCILATOR = 0x20;
var HT16K33_CMD_OSCILATOR_ON = 0x01;
var HT16K33_CMD_OSCILATOR_OFF = 0x00;
var HT16K33_CMD_DISPLAY = 0x80;
var HT16K33_CMD_DISPLAY_ON = 0x01;
var HT16K33_CMD_DISPLAY_OFF = 0x00;
var HT16K33_CMD_BRIGHTNESS = 0xE0;
var Blinkrate;
(function (Blinkrate) {
    Blinkrate[Blinkrate["Off"] = 0] = "Off";
    Blinkrate[Blinkrate["Double"] = 1] = "Double";
    Blinkrate[Blinkrate["Normal"] = 2] = "Normal";
    Blinkrate[Blinkrate["Half"] = 3] = "Half";
})(Blinkrate = exports.Blinkrate || (exports.Blinkrate = {}));
var UINT16_BUFFER_SIZE = 8;
/**
 * Represents the backpack.
 */
var Backpack = /** @class */ (function (_super) {
    __extends(Backpack, _super);
    function Backpack(bus, address) {
        var _this = _super.call(this) || this;
        _this.address = address;
        _this.buffer = new Uint16Array(UINT16_BUFFER_SIZE);
        /**
         * Whether or not the screen is on or off.
         */
        _this.state = HT16K33_CMD_DISPLAY_ON;
        debug('initializing backpack...');
        _this.wire = (0, i2c_bus_1.open)(bus, function (err) {
            if (err == null) {
                debug("succesfully opened the bus ".concat(bus));
                debug("initializing the segmented display...");
                // Turn the oscillator on
                _this.executeCommand(HT16K33_CMD_OSCILATOR | HT16K33_CMD_OSCILATOR_ON, 'HT16K33_CMD_OSCILATOR_ON')
                    // Turn blink off
                    .then(function () { return _this.setBlinkrate(Blinkrate.Off); })
                    .then(function () { return _this.setBrightness(10); })
                    .then(function () { return _this.clear(); })
                    .then(function () {
                    debug("successfully initialized the segmented display.");
                    _this.emit('ready');
                })
                    .catch(function (err) {
                    debug("unable to complete system startup!!:", err);
                    _this.emit('error', err);
                });
            }
            else {
                _this.emit('error', err);
            }
        });
        return _this;
    }
    Backpack.prototype.setBlinkrate = function (rate) {
        if (rate > Blinkrate.Half) {
            rate = Blinkrate.Off;
        }
        debug("changing blinkrate to \"".concat(Blinkrate[rate], "\"..."));
        return this.executeCommand(HT16K33_CMD_DISPLAY | this.state | (rate << 1), 'HT16K33_CMD_DISPLAY');
    };
    /**
     * Set the brightness of the display.
     *
     * @param brightness A number from 0-15.
     */
    Backpack.prototype.setBrightness = function (brightness) {
        // brightness 0-15
        if (brightness > 15) {
            brightness = 15;
        }
        if (brightness < 0) {
            brightness = 0;
        }
        debug("changing brightness to level ".concat(brightness, "..."));
        return this.executeCommand(HT16K33_CMD_BRIGHTNESS | brightness, 'HT16K33_CMD_BRIGHTNESS');
    };
    Backpack.prototype.setBufferBlock = function (block, value) {
        // Updates a single 16-bit entry in the 8*16-bit buffer
        if (block < 0 || block >= UINT16_BUFFER_SIZE) {
            // Prevent buffer overflow
            throw new Error("Buffer over- or underflow, tried to write block ".concat(block, ", which is out of range of 0-").concat(UINT16_BUFFER_SIZE, "."));
        }
        this.buffer[block] = value;
    };
    Backpack.prototype.writeDisplay = function () {
        var _this = this;
        debug("writing buffer to display...");
        var bytes = new buffer_1.Buffer(UINT16_BUFFER_SIZE * 2), // Create a UINT8 buffer for writing to the display
        i = 0;
        this.buffer.forEach(function (item) {
            // bytes[i++] = (item & 0xFF);
            // bytes[i++] = ((item >> 8) & 0xFF);
            bytes.writeUInt8(item & 0xFF, i++);
            bytes.writeUInt8(item >> 8, i++);
        });
        return new Promise(function (resolve, reject) {
            _this.wire.writeI2cBlock(_this.address, 0x00, bytes.byteLength, bytes, function (err, writtenBytes) {
                if (err != null) {
                    debug("[err] unable to write buffer!", err);
                    reject(err);
                }
                debug("succesfully wrote buffer with size ".concat(writtenBytes));
                resolve();
            });
        });
    };
    Backpack.prototype.clear = function () {
        for (var i = 0; i < UINT16_BUFFER_SIZE; i++) {
            this.buffer[i] = 0;
        }
        return this.writeDisplay();
    };
    /**
     * Execute an command via I2C on the backpack and return the async promise.
     *
     * @param cmd Command to execute.
     * @param arg Optionally an argument for it.
     */
    Backpack.prototype.executeCommand = function (cmd, debugName, arg) {
        var _this = this;
        if (debugName === void 0) { debugName = 'command'; }
        if (arg === void 0) { arg = 0x00; }
        return new Promise(function (resolve, reject) {
            _this.wire.writeByte(_this.address, cmd, arg, function (err) {
                if (err != null) {
                    debug("[err] unable to execute command \"".concat(debugName, "\"!"), err);
                    reject(err);
                }
                debug("succesfully executed command \"".concat(debugName, "\""));
                resolve();
            });
        });
    };
    return Backpack;
}(eventemitter3_1.EventEmitter));
exports.Backpack = Backpack;
//# sourceMappingURL=backpack.js.map