export declare class QRCodeService {
    generateQRCode(data: string): Promise<string>;
    generateQRCodeBuffer(data: string): Promise<Buffer>;
    generatePixQRCode(pixData: {
        key: string;
        name: string;
        city: string;
        amount?: number;
    }): Promise<string>;
    private generatePixString;
    private crc16Ccitt;
}
