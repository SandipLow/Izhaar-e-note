import zlib from "zlib";
import sharp from "sharp";

/** Compress JSON-compatible string to base64 */
export function compress(data: string): string {
    const deflated = zlib.deflateSync(Buffer.from(data, "utf8"));
    return deflated.toString("base64");
}

/** Decompress base64 back to UTF-8 string */
export function decompress(base64Data: string): string {
    const inflated = zlib.inflateSync(Buffer.from(base64Data, "base64"));
    return inflated.toString("utf8");
}


/** Compress Buffer with in limit */
export async function compressImageToFit(buffer: Buffer, maxBytes = 900_000): Promise<Buffer> {
    let quality = 80;
    let resized = buffer;
    let output: Buffer;

    while (quality >= 40) {
        output = await sharp(resized)
            .jpeg({ quality })
            .resize({ width: 1024, withoutEnlargement: true })
            .toBuffer();

        if (output.byteLength <= maxBytes) return output;
        quality -= 10;
    }

    // Final fallback: aggressive resize if still too big
    output = await sharp(resized)
        .resize({ width: 800 })
        .jpeg({ quality: 40 })
        .toBuffer();

    return output;
}
