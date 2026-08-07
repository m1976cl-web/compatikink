/**
 * lib/linking.ts — Deep Links & Direct Invitation Format Utility
 *
 * Provides unified parsing and creation of invitation links, custom app schemes,
 * universal web links, and local offline QR code generation (zero external API dependency).
 */

export interface ParsedInviteLink {
  inviteCode: string;
  inviteSecret?: string;
  isValid: boolean;
}

/**
 * Parses an invitation link or raw invitation code string.
 * Supports:
 * - Custom app scheme: compatikink://join/{code}#k={secret} or compatikink://guest/{code}#k={secret}
 * - Universal web URL: https://m1976cl-web.github.io/compatikink/guest/{code}#k={secret}
 * - Web query fallback: https://m1976cl-web.github.io/compatikink/invite?code={code}&k={secret}
 * - Raw code string input (e.g. "ABCD123")
 */
export function parseInviteLink(input: string): ParsedInviteLink {
  if (!input || typeof input !== 'string') {
    return { inviteCode: '', isValid: false };
  }

  const raw = input.trim();
  if (!raw) {
    return { inviteCode: '', isValid: false };
  }

  let secret: string | undefined;

  // 1. Extract secret from hash fragment (#k=) or query parameter (?k= or &k=)
  const secretMatch = raw.match(/[?#&]k=([^&\s#]+)/i);
  if (secretMatch) {
    try {
      secret = decodeURIComponent(secretMatch[1]);
    } catch {
      secret = secretMatch[1];
    }
  }

  // 2. Extract invite code
  let code = '';
  const pathMatch = raw.match(/(?:guest|join)\/([A-Za-z0-9]+)/i);
  const queryCodeMatch = raw.match(/[?&]code=([A-Za-z0-9]+)/i);

  if (pathMatch) {
    code = pathMatch[1];
  } else if (queryCodeMatch) {
    code = queryCodeMatch[1];
  } else {
    // Direct code input: strip query/fragment and non-alphanumeric chars
    const basePart = raw.split(/[?#]/)[0];
    code = basePart.replace(/[^A-Za-z0-9]/g, '');
  }

  code = code.toUpperCase();
  const isValid = code.length >= 4;

  return {
    inviteCode: code,
    inviteSecret: secret,
    isValid,
  };
}

/**
 * Constructs a universal web URL for an invitation code and secret.
 */
export function createInviteWebUrl(code: string, secret?: string): string {
  const cleanCode = encodeURIComponent(code.trim().toUpperCase());
  const base = `https://m1976cl-web.github.io/compatikink/guest/${cleanCode}`;
  return secret ? `${base}#k=${encodeURIComponent(secret)}` : base;
}

/**
 * Constructs a custom scheme deep link URL for an invitation code and secret.
 */
export function createInviteSchemeUrl(code: string, secret?: string): string {
  const cleanCode = encodeURIComponent(code.trim().toUpperCase());
  const base = `compatikink://join/${cleanCode}`;
  return secret ? `${base}#k=${encodeURIComponent(secret)}` : base;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL OFFLINE QR CODE GENERATOR (Zero Third-Party APIs)
// ─────────────────────────────────────────────────────────────────────────────

const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 256; i++) EXP_TABLE[i] = EXP_TABLE[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
}

function rsGeneratorPoly(ecCount: number): number[] {
  let g = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = [1, EXP_TABLE[i]];
    const res = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      res[j] ^= gfMul(g[j], next[0]);
      res[j + 1] ^= gfMul(g[j], next[1]);
    }
    g = res;
  }
  return g;
}

function rsCalculateEC(data: number[], ecCount: number): number[] {
  const poly = rsGeneratorPoly(ecCount);
  const res = new Array(data.length + ecCount).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];

  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < poly.length; j++) {
        res[i + j] ^= gfMul(poly[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

interface QRVersionSpec {
  version: number;
  dataCapacity: number;
  ecCount: number;
  alignCenters: number[];
}

const QR_VERSIONS: QRVersionSpec[] = [
  { version: 1, dataCapacity: 17, ecCount: 7, alignCenters: [] },
  { version: 2, dataCapacity: 32, ecCount: 10, alignCenters: [6, 18] },
  { version: 3, dataCapacity: 53, ecCount: 15, alignCenters: [6, 22] },
  { version: 4, dataCapacity: 78, ecCount: 20, alignCenters: [6, 26] },
  { version: 5, dataCapacity: 106, ecCount: 26, alignCenters: [6, 30] },
  { version: 6, dataCapacity: 134, ecCount: 36, alignCenters: [6, 34] },
  { version: 7, dataCapacity: 154, ecCount: 40, alignCenters: [6, 22, 38] },
  { version: 8, dataCapacity: 192, ecCount: 48, alignCenters: [6, 24, 42] },
  { version: 9, dataCapacity: 230, ecCount: 60, alignCenters: [6, 26, 46] },
  { version: 10, dataCapacity: 271, ecCount: 72, alignCenters: [6, 28, 50] },
];

/**
 * Generates a 2D boolean array (modules) for a given text string offline.
 */
export function generateQRMatrix(text: string): boolean[][] {
  const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const bytes = encoder ? Array.from(encoder.encode(text)) : text.split('').map((c) => c.charCodeAt(0) & 0xff);

  let spec = QR_VERSIONS.find((v) => bytes.length <= v.dataCapacity);
  if (!spec) spec = QR_VERSIONS[QR_VERSIONS.length - 1];

  const version = spec.version;
  const size = 17 + 4 * version;
  const modules: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean, isFunc: boolean = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = val;
      if (isFunc) isFunction[r][c] = true;
    }
  }

  // 1. Finder patterns (7x7)
  const addFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r;
        const mc = col + c;
        if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBlack = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          setModule(mr, mc, isBlack);
        } else {
          setModule(mr, mc, false); // separator
        }
      }
    }
  };
  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // 2. Alignment patterns
  if (spec.alignCenters.length > 0) {
    for (const r of spec.alignCenters) {
      for (const c of spec.alignCenters) {
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setModule(r + dr, c + dc, isBlack);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setModule(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  setModule(size - 8, 8, true);

  // 5. Reserve format information areas
  for (let i = 0; i <= 8; i++) {
    if (!isFunction[8][i]) setModule(8, i, false);
    if (!isFunction[i][8]) setModule(i, 8, false);
  }
  for (let i = size - 8; i < size; i++) {
    if (!isFunction[8][i]) setModule(8, i, false);
    if (!isFunction[i][8]) setModule(i, 8, false);
  }

  // 6. Build bitstream
  const bitStream: number[] = [];
  const addBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  };

  addBits(0b0100, 4); // Byte mode
  const countBits = version >= 10 ? 16 : 8;
  addBits(bytes.length, countBits);
  for (const b of bytes) addBits(b, 8);

  // Terminator & padding
  const totalDataBits = spec.dataCapacity * 8;
  const termLen = Math.min(4, totalDataBits - bitStream.length);
  addBits(0, termLen);
  while (bitStream.length % 8 !== 0) bitStream.push(0);

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < totalDataBits) {
    addBits(padBytes[padIdx], 8);
    padIdx = (padIdx + 1) % 2;
  }

  // Convert bits to byte array
  const dataBytes: number[] = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | (bitStream[i + b] || 0);
    }
    dataBytes.push(byteVal);
  }

  const ecBytes = rsCalculateEC(dataBytes, spec.ecCount);
  const allCodewords = [...dataBytes, ...ecBytes];

  // 7. Place data bits in matrix
  const allBits: number[] = [];
  for (const cw of allCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((cw >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upwards = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing pattern
    const rows = [];
    if (upwards) {
      for (let r = size - 1; r >= 0; r--) rows.push(r);
    } else {
      for (let r = 0; r < size; r++) rows.push(r);
    }
    upwards = !upwards;

    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (!isFunction[row][c]) {
          const bitVal = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          modules[row][c] = bitVal;
        }
      }
    }
  }

  // 8. Masking (Mask 0: (row + col) % 2 === 0) & Format Info (L + Mask 0 = 0x77C4)
  const formatInfo = 0x77c4;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isFunction[r][c]) {
        const val = modules[r][c] ?? false;
        const mask = (r + c) % 2 === 0;
        modules[r][c] = mask ? !val : val;
      }
    }
  }

  // Write format info bits (15 bits)
  const formatPositionsTopLeft = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  const formatPositionsSplit = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
  ];

  for (let i = 0; i < 15; i++) {
    const bit = ((formatInfo >> (14 - i)) & 1) === 1;
    const [r1, c1] = formatPositionsTopLeft[i];
    const [r2, c2] = formatPositionsSplit[i];
    modules[r1][c1] = bit;
    modules[r2][c2] = bit;
  }

  return modules.map((row) => row.map((cell) => cell ?? false));
}

/**
 * Generates an inline SVG data URL (`data:image/svg+xml;utf8,...`) for a QR code.
 * Guaranteed to run 100% offline with zero external network calls.
 */
export function generateQRCodeSVG(text: string, size: number = 240): string {
  const matrix = generateQRMatrix(text);
  const n = matrix.length;
  const cellSize = size / n;
  let rects = '';

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = (cellSize + 0.05).toFixed(2); // tiny overlap to prevent grid gaps
        rects += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="#000000"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#FFFFFF"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
