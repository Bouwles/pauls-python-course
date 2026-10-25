// A one-page PDF holding one image, centred on A4 landscape: enough for a certificate,
// with no PDF library. Node only.
import zlib from "node:zlib";

export function imagePdf(width: number, height: number, rgb: Buffer, title: string): Buffer {
  const pageW = 842;
  const pageH = 595;
  const scale = Math.min((pageW - 48) / width, (pageH - 48) / height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const x = Math.round((pageW - w) / 2);
  const y = Math.round((pageH - h) / 2);
  const image = zlib.deflateSync(rgb);
  const content = Buffer.from(`q ${w} 0 0 ${h} ${x} ${y} cm /Im1 Do Q`);
  const esc = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const objects: Buffer[] = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>`),
    Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Interpolate false /Filter /FlateDecode /Length ${image.length} >>\nstream\n`), image, Buffer.from("\nendstream")]),
    Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`), content, Buffer.from("\nendstream")]),
    Buffer.from(`<< /Title (${esc(title)}) /Producer (Fixwick) >>`),
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
