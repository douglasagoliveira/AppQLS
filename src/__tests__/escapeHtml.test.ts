import { escapeHtml, safeUrl } from '../lib/escapeHtml';

describe('escapeHtml', () => {
  it('escapes tags, quotes and ampersands', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(escapeHtml(`Tom & "Jerry's"`)).toBe('Tom &amp; &quot;Jerry&#39;s&quot;');
  });

  it('is safe for null/undefined and coerces numbers', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(42)).toBe('42');
  });

  it('does not double-escape plain text', () => {
    expect(escapeHtml('Mosman Residence')).toBe('Mosman Residence');
  });
});

describe('safeUrl', () => {
  it('allows only http(s) URLs', () => {
    expect(safeUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('data:text/html;base64,AAA')).toBe('');
    expect(safeUrl(undefined)).toBe('');
  });

  it('escapes quotes inside otherwise valid URLs', () => {
    expect(safeUrl('https://x.com/"onload="x')).toBe('https://x.com/&quot;onload=&quot;x');
  });
});
