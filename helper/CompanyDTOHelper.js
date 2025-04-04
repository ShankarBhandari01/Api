const { CompanyDTO } = require("../dtos/CompanyDTO");
// Helper function to map request data to CompanyDTO
function mapToCompanyDTO(req) {
  const { body, files } = req;

  // Set default language
  const lang = req.session.lang || "en";

  // Default to the body fields or handle cases where some data might be missing
  const companyData = {
    name: body.name || "",
    logo: files?.logo || body.logo || "", // Prioritize uploaded image if present
    address: body.address || "",
    phone: body.phone || "",
    email: body.email || "",
    googleMap: body.googleMap || "",
    description: parseLangField(body.description),
    created_at: body.created_at || new Date(),
    updated_at: body.updated_at || new Date(),
    openingHours: body.openingHours
      ? typeof body.openingHours === "string"
        ? JSON.parse(body.openingHours)
        : body.openingHours
      : [],
  };

  return new CompanyDTO(
    companyData.name,
    companyData.logo,
    companyData.address,
    companyData.phone,
    companyData.email,
    companyData.googleMap,
    companyData.description,
    companyData.created_at,
    companyData.updated_at,
    companyData.openingHours
  );
}
function parseLangField(field) {
  if (typeof field === "string") {
    try {
      field = JSON.parse(field);
    } catch (e) {
      field = {};
    }
  }
  return field;
}

module.exports = { mapToCompanyDTO };
