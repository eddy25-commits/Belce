const { supabaseAdmin } = require("../config/supabase");

const SCOPES = ["ghana", "international"];
const TABLE = "delivery_zones";

const serialize = (row) => {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    scope: row.scope,
    fee: Number(row.fee),
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const orderClauses = (query) =>
  query.order("scope", { ascending: true }).order("sort_order", { ascending: true }).order("name", { ascending: true });

const getActiveZones = async () => {
  const { data, error } = await orderClauses(
    supabaseAdmin.from(TABLE).select("*").eq("is_active", true)
  );
  if (error) throw error;
  return data.map(serialize);
};

const getAllZones = async () => {
  const { data, error } = await orderClauses(supabaseAdmin.from(TABLE).select("*"));
  if (error) throw error;
  return data.map(serialize);
};

const getZoneById = async (id) => {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return serialize(data);
};

const getActiveZoneById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return serialize(data);
};

const createZone = async ({ name, scope, fee, isActive, sortOrder }) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      name: name.trim(),
      scope,
      fee,
      is_active: isActive === undefined ? true : isActive,
      sort_order: sortOrder || 0,
    })
    .select()
    .single();
  if (error) throw error;
  return serialize(data);
};

const updateZone = async (id, fields) => {
  const patch = {};
  if (fields.name !== undefined) patch.name = fields.name.trim();
  if (fields.scope !== undefined) patch.scope = fields.scope;
  if (fields.fee !== undefined) patch.fee = fields.fee;
  if (fields.isActive !== undefined) patch.is_active = fields.isActive;
  if (fields.sortOrder !== undefined) patch.sort_order = fields.sortOrder;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().single();
  if (error) throw error;
  return serialize(data);
};

const deleteZone = async (id) => {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) throw error;
};

module.exports = {
  SCOPES,
  getActiveZones,
  getAllZones,
  getZoneById,
  getActiveZoneById,
  createZone,
  updateZone,
  deleteZone,
};
