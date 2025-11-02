"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeService = void 0;
const common_1 = require("@nestjs/common");
const QRCode = __importStar(require("qrcode"));
const pix_utils_1 = require("pix-utils");
let QRCodeService = class QRCodeService {
    async generateQRCode(data) {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.95,
                margin: 1,
                width: 300,
            });
            return qrCodeDataUrl;
        }
        catch (error) {
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }
    async generateQRCodeBuffer(data) {
        try {
            const qrCodeBuffer = await QRCode.toBuffer(data, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.95,
                margin: 1,
                width: 300,
            });
            return qrCodeBuffer;
        }
        catch (error) {
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }
    async generatePixQRCode(pixData) {
        try {
            const pixParams = {
                merchantName: pixData.name.substring(0, 25),
                merchantCity: pixData.city.substring(0, 15),
                key: pixData.key,
            };
            if (pixData.amount) {
                pixParams.amount = pixData.amount;
            }
            const pix = (0, pix_utils_1.createStaticPix)(pixParams);
            if (typeof pix.toBRCode === 'function') {
                const pixString = pix.toBRCode();
                return this.generateQRCode(pixString);
            }
            else {
                const pixString = this.generatePixString(pixData);
                return this.generateQRCode(pixString);
            }
        }
        catch (error) {
            const pixString = this.generatePixString(pixData);
            return this.generateQRCode(pixString);
        }
    }
    generatePixString(pixData) {
        const segments = [];
        segments.push('000201');
        const gui = 'br.gov.bcb.pix';
        const keyType = '01';
        const keyLength = pixData.key.length.toString().padStart(2, '0');
        const innerGuiLength = gui.length.toString().padStart(2, '0');
        const innerSegment = `0014${gui}${keyType}${keyLength}${pixData.key}`;
        const innerLength = innerSegment.length.toString().padStart(2, '0');
        segments.push(`26${innerLength}${innerSegment}`);
        segments.push('52040000');
        segments.push('5303986');
        if (pixData.amount) {
            const amountStr = pixData.amount.toFixed(2);
            const amountLength = amountStr.length.toString().padStart(2, '0');
            segments.push(`54${amountLength}${amountStr}`);
        }
        segments.push('5802BR');
        const merchantName = pixData.name.substring(0, 25);
        const nameLength = merchantName.length.toString().padStart(2, '0');
        segments.push(`59${nameLength}${merchantName}`);
        const merchantCity = pixData.city.substring(0, 15);
        const cityLength = merchantCity.length.toString().padStart(2, '0');
        segments.push(`60${cityLength}${merchantCity}`);
        const referenceLabel = '***';
        const refLength = referenceLabel.length.toString().padStart(2, '0');
        segments.push(`62${refLength}${referenceLabel}`);
        const pixString = segments.join('');
        const crc = this.crc16Ccitt(pixString);
        const crcLength = '04';
        return pixString + '63' + crcLength + crc;
    }
    crc16Ccitt(data) {
        let crc = 0xffff;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                }
                else {
                    crc = crc << 1;
                }
            }
        }
        return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
    }
};
exports.QRCodeService = QRCodeService;
exports.QRCodeService = QRCodeService = __decorate([
    (0, common_1.Injectable)()
], QRCodeService);
//# sourceMappingURL=qrcode.service.js.map