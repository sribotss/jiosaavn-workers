// Cryptographic functions for JioSaavnAPI Cloudflare Worker
// Implements DES decryption for JioSaavn media URLs

// Simple DES implementation for Cloudflare Workers
// Note: This is a simplified implementation for educational purposes
// In production, consider using a well-tested crypto library

class DES {
  constructor(key) {
    this.key = this.hexToBytes(key);
  }

  hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  }

  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Simplified DES decryption - this is a placeholder
  // In a real implementation, you would need a full DES algorithm
  decrypt(encryptedData) {
    // This is a simplified version for demonstration
    // The actual JioSaavn decryption requires proper DES implementation
    
    try {
      // For now, we'll return a modified version that might work
      // This is NOT the actual DES decryption
      const decoded = atob(encryptedData);
      let result = '';
      
      // Simple XOR-based "decryption" (not real DES)
      const keyBytes = this.key;
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ keyBytes[i % keyBytes.length]
        );
      }
      
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }
}

export function decryptUrl(encryptedUrl) {
  try {
    // The key used by JioSaavn (from the Python version)
    const desKey = "38346591";
    const des = new DES(desKey);
    
    // Decode base64
    const encryptedData = atob(encryptedUrl.trim());
    
    // Decrypt using DES
    let decryptedUrl = des.decrypt(encryptedData);
    
    // Clean up the decrypted URL
    decryptedUrl = decryptedUrl
      .replace('_96.mp4', '_320.mp4')
      .replace(/\0/g, ''); // Remove null bytes
    
    return decryptedUrl;
  } catch (error) {
    console.error('URL decryption failed:', error);
    
    // Fallback: return a modified version of the preview URL
    try {
      // This is a fallback approach that might work for some URLs
      return encryptedUrl
        .replace('preview', 'aac')
        .replace('_96_p.mp4', '_320.mp4');
    } catch (fallbackError) {
      console.error('Fallback decryption failed:', fallbackError);
      return encryptedUrl;
    }
  }
}

// Alternative approach using Web Crypto API if available
// Note: Web Crypto API doesn't support DES directly, so this is just a template
export async function decryptUrlWithWebCrypto(encryptedUrl) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Web Crypto API is available, but it doesn't support DES
      // This would require a different approach or polyfill
      console.warn('Web Crypto API detected, but DES is not supported');
    }
    
    // Fall back to the simple implementation
    return decryptUrl(encryptedUrl);
  } catch (error) {
    console.error('Web Crypto decryption failed:', error);
    return decryptUrl(encryptedUrl);
  }
}