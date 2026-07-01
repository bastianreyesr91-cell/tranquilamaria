const SECRET = process.env.SESSION_SECRET || 'tranquilamaria_dev_secret_change_me';

function toBase64Url(bytes) {
    let str = '';
    bytes.forEach((b) => { str += String.fromCharCode(b); });
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function getKey() {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
          'raw',
          enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign', 'verify']
        );
}

export async function signSession(payload) {
    const json = JSON.stringify(payload);
    const data = toBase64Url(new TextEncoder().encode(json));
    const key = await getKey();
    const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    const sig = toBase64Url(new Uint8Array(sigBuf));
    return `${data}.${sig}`;
}

export async function verifySession(token) {
    if (!token) return null;
    const parts = token.split('.');
    const data = parts[0];
    const sig = parts[1];
    if (!data || !sig) return null;
    const key = await getKey();
    const valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(sig), new TextEncoder().encode(data));
    if (!valid) return null;
    try {
          const json = new TextDecoder().decode(fromBase64Url(data));
          return JSON.parse(json);
    } catch (e) {
          return null;
    }
}
