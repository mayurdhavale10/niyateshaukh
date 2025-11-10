import QRCode from 'qrcode';

interface QRData {
  userId: string;
  eventId: string;
  name: string;
  registrationType: string;
}

/**
 * Generate QR code as base64 string
 */
export async function generateQRCode(data: QRData): Promise<string> {
  try {
    // Convert data to JSON string
    const qrData = JSON.stringify(data);
    
    // Generate QR code as data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Decode QR code data
 */
export function decodeQRData(qrData: string): QRData | null {
  try {
    return JSON.parse(qrData) as QRData;
  } catch (error) {
    console.error('Error decoding QR data:', error);
    return null;
  }
}