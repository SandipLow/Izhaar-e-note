import { v4 as uuid } from "uuid";
import express, { Request, Response } from "express";
import { decrypt, encrypt, EncryptedData, generateKey } from "../lib/encryption";
import { createNote, getNoteById } from "../repositories/notes";
import upload from "../middlewares/multer";
import { compress, compressImageToFit, decompress } from "../lib/compression";

const router = express.Router();

// POST /api/notes → Create a new note
router.post("/", upload.single("photo"), async (req: Request, res: Response) => {
    try {
        const notes = req.body.notes ? JSON.parse(req.body.notes) : [];

        // Build payload
        const payload: any = { notes };

        if (req.file) {
            const compressedBuffer = await compressImageToFit(req.file.buffer);
            payload.photo = {
                filename: req.file.originalname,
                mimetype: "image/jpeg",
                data: compressedBuffer.toString("base64"),
            };
        }

        const compressedJson = compress(JSON.stringify(payload));
        const key = generateKey();
        const { encryptedData, iv, authTag } = encrypt(compressedJson, key);

        const note: NoteData = {
            id: crypto.randomUUID(),
            encryptedData,
            iv,
            authTag,
            mimetype: payload.photo?.mimetype,
            filename: payload.photo?.filename,
        };

        await createNote(note);

        res.json({
            id: note.id,
            key: key.toString("base64"),
            message: "Note created successfully!",
        });
    } catch (error: any) {
        console.error("Error creating note:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/notes/:id → Get encrypted note data
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const keyBase64 = req.query.key as string;
        if (!keyBase64) {
            res.status(400).json({ error: "Missing decryption key" });
            return;
        }

        const note = await getNoteById(id);
        if (!note) {
            res.status(404).json({ error: "Note not found" });
            return;
        }

        const decrypted = decrypt(note.encryptedData, Buffer.from(keyBase64, "base64"), note.iv, note.authTag);
        const decompressed = decompress(decrypted);
        const data = JSON.parse(decompressed);

        res.render("note", { data });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});

export default router;

