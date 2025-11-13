import { v4 as uuid } from "uuid";
import express, { Request, Response } from "express";
import { decrypt, encrypt, EncryptedData, generateKey } from "../lib/encryption";
import { createNote, getNoteById } from "../repositories/notes";
import upload from "../middlewares/multer";

const router = express.Router();

// POST /api/notes → Create a new note
router.post("/", upload.single("photo"), (req: Request, res: Response) => {
    try {
        const notes = req.body.notes ? JSON.parse(req.body.notes) : [];
    
        // Combine text + photo into one object
        const payload: any = { notes };
        if (req.file) {
          payload.photo = {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            data: req.file.buffer.toString("base64"),
          };
        }
    
        const jsonData = JSON.stringify(payload);
        const key = generateKey();
        const { encryptedData, iv, authTag } = encrypt(jsonData, key);
    
    
        const note: NoteData = {
            id: uuid(),
            encryptedData,
            iv,
            authTag,
            mimetype: req.file?.mimetype,
            filename: req.file?.originalname,
        };
    
        createNote(note);
    
        // Return note ID and key (encoded as base64) for decryption
        res.json({
            id: note.id,
            key: key.toString("base64"),
            message: "Note created successfully!"
        });
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
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
        const data = JSON.parse(decrypted);
    
        res.render("note", { data });
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});

export default router;