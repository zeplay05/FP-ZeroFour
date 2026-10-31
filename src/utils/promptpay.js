/**
 * Pure JavaScript PromptPay EMVCo QR Code Payload Generator (Zero Dependencies)
 * Conforms to Thai PromptPay QR specifications.
 */

function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(id, val) {
  const len = String(val.length).padStart(2, '0');
  return `${id}${len}${val}`;
}

export function generatePromptPayPayload(target, amount) {
  if (!target) return '';
  const sanitized = String(target).replace(/[^0-9]/g, '');

  let subTarget = '';
  if (sanitized.length === 10 && sanitized.startsWith('0')) {
    // Mobile number: prefix with 0066
    const phone = '0066' + sanitized.substring(1);
    subTarget = formatTag('01', phone);
  } else if (sanitized.length === 13) {
    // National ID or Tax ID
    subTarget = formatTag('02', sanitized);
  } else if (sanitized.length === 15) {
    // E-Wallet ID
    subTarget = formatTag('03', sanitized);
  } else {
    // Fallback: treat as mobile phone if <= 10 digits
    const phone = '0066' + sanitized.replace(/^0/, '');
    subTarget = formatTag('01', phone);
  }

  const appTag = formatTag('00', 'A000000677010111');
  const merchantInfo = formatTag('29', appTag + subTarget);

  const numAmount = Number(amount);
  const isDynamic = !isNaN(numAmount) && numAmount > 0;

  let payload = '';
  payload += formatTag('00', '01'); // Version
  payload += formatTag('01', isDynamic ? '12' : '11'); // 12 = Dynamic (with amount), 11 = Static
  payload += merchantInfo;
  payload += formatTag('53', '764'); // THB Currency

  if (isDynamic) {
    payload += formatTag('54', numAmount.toFixed(2));
  }

  payload += formatTag('58', 'TH'); // Country code
  payload += '6304'; // CRC placeholder
  payload += crc16(payload);

  return payload;
}

export function getPromptPayQrUrl(target, amount) {
  const payload = generatePromptPayPayload(target, amount);
  if (!payload) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(payload)}`;
}

export const DEFAULT_PAYMENT_CONFIG = {
  promptPayId: '0812345678',
  accountName: 'FP ZEROFOUR',
  bankName: 'ธนาคารกสิกรไทย (KBANK)',
  accountNumber: '123-4-56789-0',
  qrImageUrl: '' // Optional uploaded QR image
};
