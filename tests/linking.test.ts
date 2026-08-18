import {
  parseInviteLink,
  createInviteWebUrl,
  createInviteWebUrlQueryFallback,
  createInviteSchemeUrl,
  generateQRMatrix,
  generateQRCodeSVG,
} from '../lib/linking';

describe('linking lib', () => {
  describe('createInviteWebUrl', () => {
    it('creates web url without secret', () => {
      const url = createInviteWebUrl('ABC12');
      expect(url).toBe('https://m1976cl-web.github.io/compatikink/guest/ABC12');
    });

    it('creates web url with secret', () => {
      const url = createInviteWebUrl('ABC12', 'sec321');
      expect(url).toBe('https://m1976cl-web.github.io/compatikink/guest/ABC12#k=sec321');
    });
  });

  describe('createInviteWebUrlQueryFallback', () => {
    it('creates fallback url without secret', () => {
      const url = createInviteWebUrlQueryFallback('ABC12');
      expect(url).toBe('https://m1976cl-web.github.io/compatikink/guest/ABC12');
    });

    it('creates fallback url with secret', () => {
      const url = createInviteWebUrlQueryFallback('ABC12', 'sec321');
      expect(url).toBe('https://m1976cl-web.github.io/compatikink/guest/ABC12?k=sec321');
    });
  });

  describe('createInviteSchemeUrl', () => {
    it('creates scheme url without secret', () => {
      const url = createInviteSchemeUrl('ABC12');
      expect(url).toBe('compatikink://join/ABC12');
    });

    it('creates scheme url with secret', () => {
      const url = createInviteSchemeUrl('ABC12', 'sec321');
      expect(url).toBe('compatikink://join/ABC12#k=sec321');
    });
  });

  describe('parseInviteLink', () => {
    it('parses universal web URL with hash fragment', () => {
      const res = parseInviteLink('https://m1976cl-web.github.io/compatikink/guest/ABC12#k=sec321');
      expect(res.inviteCode).toBe('ABC12');
      expect(res.inviteSecret).toBe('sec321');
      expect(res.isValid).toBe(true);
    });

    it('parses universal web URL with hash fragment and no secret', () => {
      const res = parseInviteLink('https://m1976cl-web.github.io/compatikink/guest/ABC12');
      expect(res.inviteCode).toBe('ABC12');
      expect(res.inviteSecret).toBeUndefined();
      expect(res.isValid).toBe(true);
    });

    it('parses web query fallback URL', () => {
      const res = parseInviteLink('https://m1976cl-web.github.io/compatikink/guest/ABC12?k=sec321');
      expect(res.inviteCode).toBe('ABC12');
      expect(res.inviteSecret).toBe('sec321');
      expect(res.isValid).toBe(true);
    });

    it('parses custom app scheme with hash fragment', () => {
      const res = parseInviteLink('compatikink://join/ABCD123#k=mysecret');
      expect(res.inviteCode).toBe('ABCD123');
      expect(res.inviteSecret).toBe('mysecret');
      expect(res.isValid).toBe(true);
    });

    it('parses custom app scheme with query fragment', () => {
      const res = parseInviteLink('compatikink://join/ABCD123?k=mysecret');
      expect(res.inviteCode).toBe('ABCD123');
      expect(res.inviteSecret).toBe('mysecret');
      expect(res.isValid).toBe(true);
    });

    it('parses raw code string input', () => {
      const res = parseInviteLink('ABCD123');
      expect(res.inviteCode).toBe('ABCD123');
      expect(res.inviteSecret).toBeUndefined();
      expect(res.isValid).toBe(true);
    });

    it('parses raw code string input lowercase', () => {
      const res = parseInviteLink('abcd123');
      expect(res.inviteCode).toBe('ABCD123');
      expect(res.inviteSecret).toBeUndefined();
      expect(res.isValid).toBe(true);
    });

    it('invalidates short raw codes', () => {
      const res = parseInviteLink('ABC');
      expect(res.inviteCode).toBe('ABC');
      expect(res.isValid).toBe(false);
    });
  });

  describe('QR Generation', () => {
    it('generateQRMatrix output is a valid boolean matrix', () => {
      const matrix = generateQRMatrix('hello');
      expect(Array.isArray(matrix)).toBe(true);
      expect(matrix.length).toBeGreaterThan(0);
      expect(Array.isArray(matrix[0])).toBe(true);
      expect(typeof matrix[0][0]).toBe('boolean');
    });

    it('generateQRCodeSVG output contains svg and viewBox tags', () => {
      const svgUrl = generateQRCodeSVG('https://example.com', 240);
      const decodedSvg = decodeURIComponent(svgUrl.replace('data:image/svg+xml;utf8,', ''));
      expect(decodedSvg).toContain('<svg');
      expect(decodedSvg).toContain('viewBox');
      expect(decodedSvg).toContain('</svg>');
    });
  });
});
