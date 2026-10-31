// A one-page PDF holding one picture, filling A4 landscape: the certificate, for printing.
// The picture is the rendered PNG, flattened onto white and stored losslessly. No PDF library.
// Server only.
import zlib from "node:zlib";
import { BRAND } from "@/lib/brand";
import { decodePng } from "../art/png";

/** A PDF text string: UTF-16 with a byte order mark, so any name prints. */
const pdfText = (s: string) => `<FEFF${Buffer.from(s, "utf16le").swap16().toString("hex").toUpperCase()}>`;

export function pngToPdf(png: Uint8Array, title: string): Buffer {
  const { width, height, rgba } = decodePng(png);
  const rgb = Buffer.alloc(width * height * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    const a = rgba[i + 3]! / 255;
    rgb[j] = Math.round(rgba[i]! * a + 255 * (1 - a));
    rgb[j + 1] = Math.round(rgba[i + 1]! * a + 255 * (1 - a));
    rgb[j + 2] = Math.round(rgba[i + 2]! * a + 255 * (1 - a));
  }
  // A4 landscape in points; the picture is scaled to fit and centred.
  const pageW = 842;
  const pageH = 595;
  const scale = Math.min(pageW / width, pageH / height);
  const w = +(width * scale).toFixed(2);
  const h = +(height * scale).toFixed(2);
  const x = +((pageW - w) / 2).toFixed(2);
  const y = +((pageH - h) / 2).toFixed(2);
  const image = zlib.deflateSync(rgb, { level: 9 });
  const content = Buffer.from(`q 1 1 1 rg 0 0 ${pageW} ${pageH} re f Q q ${w} 0 0 ${h} ${x} ${y} cm /Im1 Do Q`);
  const objects: Buffer[] = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>`),
    Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Interpolate true /Filter /FlateDecode /Length ${image.length} >>\nstream\n`), image, Buffer.from("\nendstream")]),
    Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`), content, Buffer.from("\nendstream")]),
    Buffer.from(`<< /Title ${pdfText(title)} /Producer ${pdfText(BRAND.name)} /Creator ${pdfText(BRAND.name)} >>`),
  ];
  const parts: Buffer[] = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "latin1")];
  const offsets: number[] = [];
  let length = parts[0]!.length;
  objects.forEach((obj, i) => {
    offsets.push(length);
    const chunk = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), obj, Buffer.from("\nendobj\n")]);
    parts.push(chunk);
    length += chunk.length;
  });
  const xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)].join("");
  parts.push(Buffer.from(`${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${length}\n%%EOF\n`));
  return Buffer.concat(parts);
}
