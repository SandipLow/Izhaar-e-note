document.addEventListener("DOMContentLoaded", () => {
    /* ---------- ELEMENTS ---------- */
    const getStarted = document.getElementById("get-started");
    const createBtn = document.getElementById("create-note-btn");
    const openDemoBtn = document.getElementById("open-demo-btn");
    const container = document.querySelector(".note-input-container");
    const addNoteBtn = document.getElementById("add-note-btn");
    const addPhotoBtn = document.getElementById("add-photo-btn");
    const submitBtn = document.getElementById("submit-note-btn");
    const photoContainer = document.getElementById("photo-container");

    let uploadedFile = null; // keep the File object

    /* ---------- SHOW SECTION ---------- */
    createBtn?.addEventListener("click", () => {
        getStarted.style.display = "block";
        createBtn.style.display = "none";
        getStarted.scrollIntoView({ behavior: "smooth" });
    });

    /* ---------- OPEN DEMO ---------- */
    openDemoBtn?.addEventListener("click", () => {
        window.open("/notes/49813a40-f01b-46c6-9ba4-86c4a986a8df?key=INdqEjfLn7iHdB6gIHFwK%2Fw2TXPfDwr3rvt511H5DJk%3D", "_blank");
    });

    /* ---------- CREATE TEXT NOTE ---------- */
    function createTextNote() {
        const el = document.createElement("div");
        el.className = "note-item";
        el.draggable = true;
        el.dataset.type = "text";

        el.innerHTML = `
            <span class="drag-handle" title="Drag to reorder">
                <i class="fa-solid fa-grip-lines"></i>
            </span>
            <input type="text" class="note-text-input" placeholder="Type your message here..." />
            <button type="button" class="delete-note-btn" title="Delete note">×</button>
        `;

        // Insert **before** the photo container (keeps photo at bottom)
        container.insertBefore(el, photoContainer);
        attachItemHandlers(el);
        return el;
    }

    /* ---------- ATTACH HANDLERS (delete + drag) ---------- */
    function attachItemHandlers(item) {
        // DELETE — only for text notes
        const deleteBtn = item.querySelector(".delete-note-btn");
        if (deleteBtn && item.classList.contains("note-item")) {
            deleteBtn.addEventListener("click", () => {
                item.remove();
            });
        }

        // DRAG — only for text notes
        if (item.classList.contains("note-item")) {
            item.addEventListener("dragstart", dragStart);
            item.addEventListener("dragover", e => e.preventDefault());
            item.addEventListener("dragenter", e => e.target.closest(".note-item")?.classList.add("over"));
            item.addEventListener("dragleave", e => e.target.closest(".note-item")?.classList.remove("over"));
            item.addEventListener("drop", dragDrop);
            item.addEventListener("dragend", dragEnd);
        }
    }

    /* ---------- PHOTO UPLOAD (fixed at bottom) ---------- */
    addPhotoBtn.addEventListener("click", () => {
        // If a photo is already uploaded, block
        if (uploadedFile) {
            alert("Only one photo allowed. Delete the current one first.");
            return;
        }

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";

        // Clean up any previous listener
        input.onchange = null;

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate: image only
            if (!file.type.startsWith("image/")) {
                alert("Please upload a valid image file.");
                return;
            }

            // Validate: size < 10 MB
            if (file.size > 10 * 1024 * 1024) {
                alert("File size exceeds 0.5 MB limit.");
                return;
            }

            // Success: store file
            uploadedFile = file;

            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.alt = "Uploaded photo";
            img.style.cssText =
                "max-height:120px; max-width:200px; border-radius:8px; object-fit:cover;";

            // Insert photo UI
            photoContainer.innerHTML = `
                ${img.outerHTML}
                <button type="button" class="delete-note-btn" title="Delete photo">×</button>
            `;

            // Disable upload button
            addPhotoBtn.disabled = true;

            // Re-attach delete handler to the *new* delete button
            const deleteBtn = photoContainer.querySelector(".delete-note-btn");
            if (deleteBtn) {
                deleteBtn.onclick = null; // prevent duplicate
                deleteBtn.addEventListener("click", () => {
                    photoContainer.innerHTML = "";
                    uploadedFile = null;
                    addPhotoBtn.disabled = false;
                    console.log("Photo removed. Upload button re-enabled.");
                });
            }
        };

        // Trigger file dialog
        input.click();
    });

    /* ---------- DRAG & DROP (only text notes) ---------- */
    let dragged = null;

    function dragStart(e) {
        dragged = this;
        setTimeout(() => this.classList.add("dragging"), 0);
        e.dataTransfer.effectAllowed = "move";
    }

    function dragDrop(e) {
        e.preventDefault();
        const target = e.target.closest(".note-item");
        if (!target || dragged === target) return;

        const parent = container;
        const allNotes = Array.from(parent.querySelectorAll(".note-item"));

        const fromIdx = allNotes.indexOf(dragged);
        const toIdx = allNotes.indexOf(target);

        if (fromIdx < toIdx) {
            parent.insertBefore(dragged, target.nextSibling);
        } else {
            parent.insertBefore(dragged, target);
        }
    }

    function dragEnd() {
        document.querySelectorAll(".note-item").forEach((el) => {
            el.classList.remove("dragging", "over");
        });
    }

    /* ---------- SUBMIT ---------- */
    submitBtn.addEventListener("click", async () => {
    const textItems = container.querySelectorAll(".note-item");
    const notes = [];

    textItems.forEach((itm) => {
        const val = itm.querySelector(".note-text-input")?.value.trim();
        if (val) notes.push(val);
    });

    if (notes.length === 0 && !uploadedFile) {
        alert("Add at least one note or a photo.");
        return;
    }

    const formData = new FormData();
    formData.append("notes", JSON.stringify(notes));
    if (uploadedFile) formData.append("photo", uploadedFile, uploadedFile.name);

    // Disable button + visual feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<i class='fa fa-spinner fa-spin'></i> Submitting...";

    try {
        const res = await fetch("/notes", { method: "POST", body: formData });
        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data = await res.json();
        const shareUrl = `${BASE_URL.replace(/\/+$/, "")}/notes/${data.id}?key=${encodeURIComponent(data.key)}`;

        const resultDiv = document.getElementById("result-container");
        const linkInput = document.getElementById("share-link");
        const copyBtn = document.getElementById("copy-link-btn");
        const openBtn = document.getElementById("open-link-btn");

        linkInput.value = shareUrl;
        resultDiv.style.display = "block";

        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(shareUrl);
                copyBtn.textContent = "Copied!";
                setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
            } catch {
                linkInput.select();
                document.execCommand("copy");
                copyBtn.textContent = "Copied!";
                setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
            }
        };
        openBtn.onclick = () => {
            window.open(shareUrl, "_blank");
        };
    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to create note. Check console.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Note";
    }
    });


    /* ---------- INITIAL SETUP ---------- */
    addNoteBtn.addEventListener("click", createTextNote);
    document.querySelectorAll(".note-item").forEach(attachItemHandlers);
});
