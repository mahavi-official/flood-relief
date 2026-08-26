/**
 * Generates public/og-image.png — the picture Facebook, Viber and WhatsApp show
 * when somebody shares a link. Those scrapers largely ignore SVG, and pulling in
 * an image library for one 1200x630 file is not worth it, so this writes the PNG
 * bytes directly with a small built-in bitmap font.
 *
 * Run with: npm run og
 */
import { deflateSync } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WIDTH = 1200;
const HEIGHT = 630;

// A 5x7 bitmap font: one string of five bits per row, seven rows per glyph.
const FONT = {
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '11111 00100 00100 00100 00100 00100 11111',
  J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 11011 10001',
  X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100',
  Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10011 10101 10101 10101 11001 01110',
  1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00110 01000 10000 11111',
  3: '11111 00010 00100 00010 00001 10001 01110',
  4: '00010 00110 01010 10010 11111 00010 00010',
  5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110',
  7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110',
  9: '01110 10001 10001 01111 00001 00010 01100',
  ' ': '00000 00000 00000 00000 00000 00000 00000',
  '.': '00000 00000 00000 00000 00000 00000 00100',
  '-': '00000 00000 00000 11111 00000 00000 00000',
  ':': '00000 00100 00000 00000 00000 00100 00000',
  '/': '00001 00001 00010 00100 01000 10000 10000',
};

const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);

function setPixel(x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const i = (y * WIDTH + x) * 3;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
}

function fillRect(x0, y0, w, h, colour) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) setPixel(x, y, colour);
}

function textWidth(text, scale) {
  return text.length * 6 * scale - scale;
}

function drawText(text, x, y, scale, colour) {
  let cursor = x;
  for (const char of text.toUpperCase()) {
    const glyph = FONT[char] ?? FONT[' '];
    const rows = glyph.split(' ');
    rows.forEach((row, ry) => {
      [...row].forEach((bit, rx) => {
        if (bit === '1') fillRect(cursor + rx * scale, y + ry * scale, scale, scale, colour);
      });
    });
    cursor += 6 * scale;
  }
}

function drawCentred(text, y, scale, colour) {
  drawText(text, Math.round((WIDTH - textWidth(text, scale)) / 2), y, scale, colour);
}

const CRIMSON = [198, 40, 40];
const DEEP = [110, 22, 22];
const CREAM = [246, 245, 242];
const MUTED = [232, 200, 200];

fillRect(0, 0, WIDTH, HEIGHT, DEEP);
// A band of water across the lower third, echoing the site's flood theme.
fillRect(0, 430, WIDTH, 200, CRIMSON);
for (let x = 0; x < WIDTH; x++) {
  const wave = Math.round(Math.sin(x / 55) * 14);
  fillRect(x, 430 + wave, 1, 6, CREAM);
}

drawCentred('NEPAL FLOOD RELIEF', 150, 9, CREAM);
drawCentred('MISSING - FOUND - HELP', 260, 5, MUTED);
drawCentred('REPORT AND SEARCH. FREE. NO LOGIN.', 340, 4, MUTED);
drawCentred('MAHAVI-OFFICIAL.GITHUB.IO/FLOOD-RELIEF', 520, 3, CREAM);

// PNG: signature, IHDR, IDAT (filter byte 0 per scanline), IEND.
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: truecolour
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc(HEIGHT * (WIDTH * 3 + 1));
for (let y = 0; y < HEIGHT; y++) {
  raw[y * (WIDTH * 3 + 1)] = 0;
  pixels.copy(raw, y * (WIDTH * 3 + 1) + 1, y * WIDTH * 3, (y + 1) * WIDTH * 3);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og-image.png');
await writeFile(out, png);
console.log(`Wrote ${out} (${(png.length / 1024).toFixed(1)} KB)`);
