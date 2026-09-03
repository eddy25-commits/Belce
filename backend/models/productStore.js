const { supabaseAdmin } = require("../config/supabase");

const CATEGORIES = ["Watches", "Sneakers", "Bracelets", "Clothes", "Accessories", "Other"];

const TABLE = "products";

// Keeps the API response shape stable for the existing frontend (which
// reads product._id, product.isActive, etc.) while the DB itself uses
// snake_case columns.
const serialize = (row) => {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    brand: row.brand,
    stock: row.stock,
    images: row.images || [],
    isFeatured: row.is_featured,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const getActiveProducts = async ({ category, search, featured } = {}) => {
  let query = supabaseAdmin.from(TABLE).select("*").eq("is_active", true);

  if (category && category !== "All") query = query.eq("category", category);
  if (featured === "true" || featured === true) query = query.eq("is_featured", true);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(serialize);
};

const getAllProducts = async () => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(serialize);
};

const getProductById = async (id) => {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return serialize(data);
};

const createProduct = async ({ name, description, price, category, brand, stock, isFeatured, images }) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      name,
      description,
      price,
      category,
      brand: brand || "",
      stock: stock || 0,
      is_featured: !!isFeatured,
      images: images || [],
    })
    .select()
    .single();
  if (error) throw error;
  return serialize(data);
};

const updateProduct = async (id, fields) => {
  const patch = {};
  if (fields.name !== undefined) patch.name = fields.name;
  if (fields.description !== undefined) patch.description = fields.description;
  if (fields.price !== undefined) patch.price = fields.price;
  if (fields.category !== undefined) patch.category = fields.category;
  if (fields.brand !== undefined) patch.brand = fields.brand;
  if (fields.stock !== undefined) patch.stock = fields.stock;
  if (fields.isFeatured !== undefined) patch.is_featured = fields.isFeatured;
  if (fields.isActive !== undefined) patch.is_active = fields.isActive;
  if (fields.images !== undefined) patch.images = fields.images;

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return serialize(data);
};

const deleteProduct = async (id) => {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) throw error;
};

module.exports = {
  CATEGORIES,
  getActiveProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
