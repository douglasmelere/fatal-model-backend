import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { createStaticPix } from 'pix-utils';

@Injectable()
export class QRCodeService {
  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
      });

      return qrCodeBuffer;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async generatePixQRCode(pixData: {
    key: string;
    name: string;
    city: string;
    amount?: number;
  }): Promise<string> {
    // Use pix-utils library to generate proper PIX code
    try {
      const pixParams: any = {
        merchantName: pixData.name.substring(0, 25),
        merchantCity: pixData.city.substring(0, 15),
        key: pixData.key,
      };

      if (pixData.amount) {
        pixParams.amount = pixData.amount;
      }

      const pix: any = createStaticPix(pixParams);

      // Check if result has toBRCode method (success case)
      if (typeof pix.toBRCode === 'function') {
        const pixString = pix.toBRCode();
        return this.generateQRCode(pixString);
      } else {
        // Error case - fallback
        const pixString = this.generatePixString(pixData);
        return this.generateQRCode(pixString);
      }
    } catch (error) {
      // Fallback to manual implementation if pix-utils fails
      const pixString = this.generatePixString(pixData);
      return this.generateQRCode(pixString);
    }
  }

  private generatePixString(pixData: {
    key: string;
    name: string;
    city: string;
    amount?: number;
  }): string {
    // PIX EMV format - proper implementation
    // Reference: https://www.bcb.gov.br/estabilidadefinanceira/pix
    
    const segments: string[] = [];
    
    // Payload Format Indicator (00) - Fixed value "01"
    segments.push('000201');
    
    // Merchant Account Information (26) - PIX key
    // Structure: 26[length][gui][key_type][key_length][key]
    // GUI: br.gov.bcb.pix (length 14)
    const gui = 'br.gov.bcb.pix';
    const keyType = '01'; // Type of key (01 = static)
    const keyLength = pixData.key.length.toString().padStart(2, '0');
    
    // Inner segment: GUI + Key Type + Key
    const innerGuiLength = gui.length.toString().padStart(2, '0');
    const innerSegment = `0014${gui}${keyType}${keyLength}${pixData.key}`;
    const innerLength = innerSegment.length.toString().padStart(2, '0');
    
    segments.push(`26${innerLength}${innerSegment}`);
    
    // Merchant Category Code (52) - Fixed value "0000"
    segments.push('52040000');
    
    // Transaction Currency (53) - Fixed value "986" (BRL)
    segments.push('5303986');
    
    // Transaction Amount (54) - Optional, only if amount is provided
    if (pixData.amount) {
      const amountStr = pixData.amount.toFixed(2);
      const amountLength = amountStr.length.toString().padStart(2, '0');
      segments.push(`54${amountLength}${amountStr}`);
    }
    
    // Country Code (58) - Fixed value "BR"
    segments.push('5802BR');
    
    // Merchant Name (59) - Max 25 characters
    const merchantName = pixData.name.substring(0, 25);
    const nameLength = merchantName.length.toString().padStart(2, '0');
    segments.push(`59${nameLength}${merchantName}`);
    
    // Merchant City (60) - Max 15 characters
    const merchantCity = pixData.city.substring(0, 15);
    const cityLength = merchantCity.length.toString().padStart(2, '0');
    segments.push(`60${cityLength}${merchantCity}`);
    
    // Additional Data Field Template (62) - Reference label (optional)
    // You can add more fields here if needed
    const referenceLabel = '***';
    const refLength = referenceLabel.length.toString().padStart(2, '0');
    segments.push(`62${refLength}${referenceLabel}`);
    
    // CRC16 (63) - Calculate checksum
    const pixString = segments.join('');
    const crc = this.crc16Ccitt(pixString);
    const crcLength = '04';
    
    return pixString + '63' + crcLength + crc;
  }

  private crc16Ccitt(data: string): string {
    // CRC16-CCITT implementation for PIX
    let crc = 0xffff;
    
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    
    // Convert to hex string and pad to 4 characters
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  }
}
