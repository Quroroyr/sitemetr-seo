/**
 * Just enough of a ZIP reader to open a Search Console export.
 *
 * Search Console's "CSV" download is a ZIP of several CSV tables, and an
 * .xlsx workbook is a ZIP of XML parts. Entries are stored or deflated; the
 * deflate is undone by the platform's DecompressionStream, which Chromium
 * (the desktop app, the dashboard tab) and Node 18+ both have, so no
 * dependency is needed in either surface.
 */

export interface ZipEntry {
  name: string;
  read(): Promise<Uint8Array>;
}

const EOCD = 0x06054b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;

export function isZip(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** List the entries of a ZIP archive; throws on anything that is not one */
export function readZip(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // The end-of-central-directory record sits in the last 22 bytes plus an
  // optional comment of up to 64 KiB.
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error('Архив повреждён: не найдено оглавление ZIP');

  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];
  const decoder = new TextDecoder();

  for (let n = 0; n < count; n++) {
    if (view.getUint32(offset, true) !== CENTRAL) throw new Error('Архив повреждён: неверная запись оглавления');
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const nameBytes = bytes.subarray(offset + 46, offset + 46 + nameLength);
    // Bit 11: UTF-8 names. Without it the name is in a DOS code page, which
    // only matters for picking a file by name, and Latin names survive either way.
    const name = flags & 0x800 ? decoder.decode(nameBytes) : String.fromCharCode(...nameBytes);

    entries.push({
      name,
      async read() {
        if (view.getUint32(localOffset, true) !== LOCAL) throw new Error(`Архив повреждён: ${name}`);
        const start = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
        const data = bytes.subarray(start, start + compressedSize);
        if (method === 0) return data;
        if (method === 8) return inflateRaw(data);
        throw new Error(`Неподдерживаемое сжатие в архиве (метод ${method})`);
      },
    });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
