import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RsaOaepService {
  async encryptValues(values: Record<string, string>, publicKeyBase64: string): Promise<Record<string, string>> {
    if (!publicKeyBase64) return Promise.reject('Public key is undefined');

    const keyBuffer = this.base64ToArrayBuffer(publicKeyBase64);

    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      keyBuffer,
      {name: 'RSA-OAEP', hash: 'SHA-256'},
      false,
      ['encrypt']
    );
    const result: Record<string, string> = {};
    const promises = Object.keys(values).map(key => {
      const encoded = new TextEncoder().encode(values[key]);
      return window.crypto.subtle.encrypt({name: 'RSA-OAEP'}, publicKey, encoded)
        .then(buffer => {
          result[key] = this.arrayBufferToBase64(buffer);
        });
    });
    await Promise.all(promises);
    return result;
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const cleaned = base64.replace(/\s+/g, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }
}
