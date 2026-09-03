const { supabaseAdmin } = require("../config/supabase");

const TABLE = "orders";

const serialize = (row) => {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    customer: row.customer,
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    deliveryZoneId: row.delivery_zone_id,
    deliveryZoneName: row.delivery_zone_name,
    total: Number(row.total),
    paystackReference: row.paystack_reference,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const createOrder = async ({
  orderNumber,
  userId,
  customer,
  items,
  subtotal,
  deliveryFee,
  deliveryZoneId,
  deliveryZoneName,
  total,
  paystackReference,
}) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      order_number: orderNumber,
      user_id: userId || null,
      customer,
      items,
      subtotal,
      delivery_fee: deliveryFee,
      delivery_zone_id: deliveryZoneId,
      delivery_zone_name: deliveryZoneName,
      total,
      paystack_reference: paystackReference,
      payment_status: "pending",
      order_status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return serialize(data);
};

const findByReference = async (reference) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (error) throw error;
  return serialize(data);
};

const findAll = async ({ status } = {}) => {
  let query = supabaseAdmin.from(TABLE).select("*");
  if (status) query = query.eq("order_status", status);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(serialize);
};

const findMineByUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(serialize);
};

// Loose matching used by the guest "track my order" page: match on order
// number, or on email + phone together.
const findByTrackingDetails = async ({ orderNumber, email, phone }) => {
  if (orderNumber) {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .ilike("order_number", orderNumber.trim())
      .maybeSingle();
    if (error) throw error;
    return serialize(data);
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").replace(/\D/g, "");

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const match = data.find((row) => {
    const customer = row.customer || {};
    const customerEmail = String(customer.email || "").trim().toLowerCase();
    const customerPhone = String(customer.phone || "").replace(/\D/g, "");
    return customerEmail === normalizedEmail && customerPhone === normalizedPhone;
  });

  return serialize(match);
};

const updatePaymentStatus = async (id, paymentStatus, orderStatus) => {
  const patch = { payment_status: paymentStatus };
  if (orderStatus) patch.order_status = orderStatus;
  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().single();
  if (error) throw error;
  return serialize(data);
};

const updateOrderStatus = async (id, orderStatus) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ order_status: orderStatus })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return serialize(data);
};

// Atomically decrements stock for every item in a paid order via the
// decrement_stock_bulk() Postgres function defined in supabase/schema.sql.
const decrementStockForOrder = async (order) => {
  const items = order.items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
  const { error } = await supabaseAdmin.rpc("decrement_stock_bulk", { items });
  if (error) throw error;
};

module.exports = {
  createOrder,
  findByReference,
  findAll,
  findMineByUser,
  findByTrackingDetails,
  updatePaymentStatus,
  updateOrderStatus,
  decrementStockForOrder,
};
