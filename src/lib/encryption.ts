import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256-bit
const IV_LENGTH = 12;  // Recommended IV length for GCM

// Interface for encrypted data
export interface EncryptedData {
    encryptedData: string;
    iv: string;
    authTag: string;
}

/** Generate a random encryption key (one per note/document). */
export function generateKey(): Buffer {
    return crypto.randomBytes(KEY_LENGTH);
}

/** Encrypt arbitrary UTF-8 data (e.g. JSON string). */
export function encrypt(data: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        encryptedData: encrypted.toString("base64"),
        iv: iv.toString("base64"),
        authTag: authTag.toString("base64"),
    };
}

/** Decrypts base64-encoded data using AES-256-GCM. */
export function decrypt(encryptedData: string, key: Buffer, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(authTag, "base64"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData, "base64")),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}
