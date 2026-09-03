export const SITE = {
  businessName: "Belce",
  shortName: "Belce",
  tagline: "Watches, sneakers, bracelets & clothes",
  location: "Kumasi",
  fullAddress: "Kumasi, Ghana",
  phone: "0509459009",
  phoneHref: "tel:+233509459009",
  whatsapp: "0530913920",
  whatsappHref: "https://wa.me/233530913920",
  email: "damedzie4@gmail.com",
  emailHref: "mailto:damedzie4@gmail.com",
  currency: "GHS",
  categories: ["Watches", "Sneakers", "Bracelets", "Clothes", "Accessories", "Other"],
};

export const formatGHS = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
