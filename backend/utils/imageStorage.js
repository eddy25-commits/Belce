const { v4: uuidv4 } = require("uuid");
const { supabaseAdmin } = require("../config/supabase");

const BUCKET = "product-images";

// Uploads a single in-memory file (from multer memoryStorage) to Supabase
// Storage and returns { url, path } — path is kept so it can be deleted later.
const uploadImage = async (file) => {
  const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
  const path = `${uuidv4()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
};

const uploadImages = async (files = []) => Promise.all(files.map(uploadImage));

const deleteImages = async (paths = []) => {
  const cleanPaths = paths.filter(Boolean);
  if (cleanPaths.length === 0) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(cleanPaths);
  if (error) {
    // Non-fatal — log and move on, we don't want a storage hiccup to block
    // a product update/delete.
    // eslint-disable-next-line no-console
    console.error("Failed to delete image(s) from storage:", error.message);
  }
};

module.exports = { uploadImage, uploadImages, deleteImages };
