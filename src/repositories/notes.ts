import db from "../lib/db";
import { collection, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

const notesCollection = collection(db, "NOTES");

// Create a new note
export async function createNote(note: NoteData): Promise<NoteData> {
  await setDoc(doc(notesCollection, note.id), note);
  return note;
}

// Get a note by ID
export async function getNoteById(id: string): Promise<NoteData | null> {
  const docRef = doc(notesCollection, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as NoteData;
}

// Delete a note by ID
export async function deleteNote(id: string): Promise<void> {
  await deleteDoc(doc(notesCollection, id));
}
