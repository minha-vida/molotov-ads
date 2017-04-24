"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var doubleclick_adslot_1 = require("../doubleclick/doubleclick.adslot");
var RubiconFastlaneDfpAdSlot = (function (_super) {
    __extends(RubiconFastlaneDfpAdSlot, _super);
    function RubiconFastlaneDfpAdSlot(HTMLElement) {
        var _this = _super.call(this, HTMLElement) || this;
        _this.HTMLElement = HTMLElement;
        _this.rubiconPosition = HTMLElement.dataset.madRubiconPosition;
        return _this;
    }
    RubiconFastlaneDfpAdSlot.prototype.defineSlot = function () {
        this.rubiconAdSlot = rubicontag.defineSlot(this.adUnit, this.size, this.name)
            .setPosition(this.rubiconPosition)
            .setFPI('adunit', this.adUnit.substring(this.adUnit.lastIndexOf('/') + 1))
            .setFPI('position', this.rubiconPosition);
    };
    RubiconFastlaneDfpAdSlot.prototype.defineSlotDoubleclick = function () {
        _super.prototype.defineSlot.call(this);
    };
    RubiconFastlaneDfpAdSlot.prototype.setTargetingForGPTSlot = function () {
        rubicontag.setTargetingForGPTSlot(_super.prototype.getDoubleclickAdSlot.call(this));
    };
    return RubiconFastlaneDfpAdSlot;
}(doubleclick_adslot_1.DoubleClickAdSlot));
exports.RubiconFastlaneDfpAdSlot = RubiconFastlaneDfpAdSlot;
