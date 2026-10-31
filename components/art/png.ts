// Reads and writes PNGs with no image library, for scripts/check-art.ts (is the artist's file
// the right size, with a transparent background?) and the certificate PDF (the rendered PNG as
// plain RGB). Reads every standard PNG: all colour types and bit depths, with or without
// transparency chunks, interlaced or not. Node only.
import zlib from "node:zlib";

export interface PngInfo {
  width: number;
  height: number;
  bitDepth: number;
  /** 0 grey, 2 RGB, 3 palette, 4 grey and alpha, 6 RGB and alpha. */
  colourType: number;
  interlaced: boolean;
  /** An alpha channel, or a tRNS chunk that makes some colours transparent. */
  hasAlpha: boolean;
}

export interface Bitmap {
  width: number;
  height: number;
  /** 8-bit RGBA, row by row. */
  rgba: Uint8Array;
}

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

interface Chunks {
  info: PngInfo;
  palette: Uint8Array | null;
  trns: Uint8Array | null;
  data: Uint8Array;
}

function readChunks(buf: Uint8Array): Chunks {
  if (buf.length < 33 || SIGNATURE.some((b, i) => buf[i] !== b)) throw new Error("not a PNG file");
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let pos = 8;
  let info: PngInfo | null = null;
  let palette: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (pos + 8 <= buf.length) {
    const len = view.getUint32(pos);
    const type = String.fromCharCode(buf[pos + 4]!, buf[pos + 5]!, buf[pos + 6]!, buf[pos + 7]!);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      const d = new DataView(data.buffer, data.byteOffset, data.byteLength);
      const colourType = data[9]!;
      if (!(colourType in CHANNELS)) throw new Error(`unknown PNG colour type ${colourType}`);
      info = { width: d.getUint32(0), height: d.getUint32(4), bitDepth: data[8]!, colourType, interlaced: data[12] === 1, hasAlpha: colourType === 4 || colourType === 6 };
    } else if (type === "PLTE") palette = data;
    else if (type === "tRNS") trns = data;
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (!info) throw new Error("PNG has no header");
  if (trns) info.hasAlpha = true;
  const total = idat.reduce((n, c) => n + c.length, 0);
  const data = new Uint8Array(total);
  let at = 0;
  for (const c of idat) {
    data.set(c, at);
    at += c.length;
  }
  return { info, palette, trns, data };
}

/** The header alone: size, colour type, transparency. */
export function pngInfo(buf: Uint8Array): PngInfo {
  return readChunks(buf).info;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Undoes the row filters of one image (or one interlace pass) in place; returns the rows. */
function unfilter(raw: Uint8Array, start: number, rows: number, stride: number, bpp: number): Uint8Array {
  const out = new Uint8Array(rows * stride);
  for (let y = 0; y < rows; y++) {
    const filter = raw[start + y * (stride + 1)]!;
    if (filter > 4) throw new Error(`bad PNG row filter ${filter}`);
    const line = start + y * (stride + 1) + 1;
    const row = y * stride;
    const prev = row - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[row + x - bpp]! : 0;
      const b = y > 0 ? out[prev + x]! : 0;
      const c = x >= bpp && y > 0 ? out[prev + x - bpp]! : 0;
      const v = raw[line + x]!;
      out[row + x] = (filter === 0 ? v : filter === 1 ? v + a : filter === 2 ? v + b : filter === 3 ? v + ((a + b) >> 1) : v + paeth(a, b, c)) & 255;
    }
  }
  return out;
}

const ADAM7: [number, number, number, number][] = [
  [0, 0, 8, 8],
  [4, 0, 8, 8],
  [0, 4, 4, 8],
  [2, 0, 4, 4],
  [0, 2, 2, 4],
  [1, 0, 2, 2],
  [0, 1, 1, 2],
];

/** Any PNG as 8-bit RGBA. */
export function decodePng(buf: Uint8Array): Bitmap {
  const { info, palette, trns, data } = readChunks(buf);
  const { width, height, bitDepth: depth, colourType: ct } = info;
  const channels = CHANNELS[ct]!;
  const bitsPerPixel = channels * depth;
  const bpp = Math.max(1, bitsPerPixel >> 3);
  const raw = zlib.inflateSync(data);
  const rgba = new Uint8Array(width * height * 4);
  const max = (1 << depth) - 1;
  const sample = (rows: Uint8Array, row: number, x: number, ch: number): number => {
    if (depth === 8) return rows[row + x * channels + ch]!;
    if (depth === 16) return rows[row + (x * channels + ch) * 2]!;
    // 1, 2 and 4 bits: grey or palette only, one channel.
    const bit = x * depth;
    return (rows[row + (bit >> 3)]! >> (8 - depth - (bit & 7))) & max;
  };
  const sample16 = (rows: Uint8Array, row: number, x: number, ch: number): number => (depth === 16 ? (rows[row + (x * channels + ch) * 2]! << 8) | rows[row + (x * channels + ch) * 2 + 1]! : sample(rows, row, x, ch));
  const key = trns && trns.length >= 2 ? [((trns[0]! << 8) | trns[1]!), trns.length >= 6 ? (trns[2]! << 8) | trns[3]! : 0, trns.length >= 6 ? (trns[4]! << 8) | trns[5]! : 0] : null;

  const put = (rows: Uint8Array, row: number, x: number, at: number) => {
    let r: number;
    let g: number;
    let b: number;
    let a = 255;
    if (ct === 3) {
      const i = sample(rows, row, x, 0);
      r = palette?.[i * 3] ?? 0;
      g = palette?.[i * 3 + 1] ?? 0;
      b = palette?.[i * 3 + 2] ?? 0;
      a = trns && i < trns.length ? trns[i]! : 255;
    } else if (ct === 0 || ct === 4) {
      const v = sample(rows, row, x, 0);
      r = g = b = depth < 8 ? Math.round((v * 255) / max) : v;
      if (ct === 4) a = sample(rows, row, x, 1);
      else if (key && sample16(rows, row, x, 0) === key[0]) a = 0;
    } else {
      r = sample(rows, row, x, 0);
      g = sample(rows, row, x, 1);
      b = sample(rows, row, x, 2);
      if (ct === 6) a = sample(rows, row, x, 3);
      else if (key && sample16(rows, row, x, 0) === key[0] && sample16(rows, row, x, 1) === key[1] && sample16(rows, row, x, 2) === key[2]) a = 0;
    }
    rgba[at] = r;
    rgba[at + 1] = g;
    rgba[at + 2] = b;
    rgba[at + 3] = a;
  };

  const passes: [number, number, number, number][] = info.interlaced ? ADAM7 : [[0, 0, 1, 1]];
  let offset = 0;
  for (const [x0, y0, dx, dy] of passes) {
    const pw = Math.ceil((width - x0) / dx);
    const ph = Math.ceil((height - y0) / dy);
    if (pw <= 0 || ph <= 0) continue;
    const stride = Math.ceil((pw * bitsPerPixel) / 8);
    const rows = unfilter(raw, offset, ph, stride, bpp);
    offset += ph * (stride + 1);
    for (let y = 0; y < ph; y++)
      for (let x = 0; x < pw; x++) put(rows, y * stride, x, ((y0 + y * dy) * width + x0 + x * dx) * 4);
  }
  return { width, height, rgba };
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 255]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  out.set(data, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/** An 8-bit PNG, unfiltered, with alpha or (`alpha: false`) without: for test fixtures and trying the pipeline with stand-in art. */
export function encodePng({ width, height, rgba }: Bitmap, { alpha = true }: { alpha?: boolean } = {}): Buffer {
  const channels = alpha ? 4 : 3;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, alpha ? 6 : 2, 0, 0, 0], 8);
  const stride = width * channels;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      for (let c = 0; c < channels; c++) raw[y * (stride + 1) + 1 + x * channels + c] = rgba[(y * width + x) * 4 + c]!;
  return Buffer.concat([Buffer.from(SIGNATURE), chunk("IHDR", header), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", new Uint8Array(0))]);
}
