// Opening Hour DTO class
class OpeningHourDTO {
  constructor(lang, hours) {
    this.lang = lang; // Language code (e.g., 'en', 'fi')
    this.hours = hours; // Hours object { monday, tuesday, ..., sunday }
  }
}

// Company DTO class
class CompanyDTO {
  constructor(
    name,
    logo,
    address,
    phone,
    email,
    googleMap,
    description,
    createdAt,
    updatedAt,
    openingHours
  ) {
    this.name = name;
    this.logo = logo;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.googleMap = googleMap;
    this.description = description;
    this.created_at = createdAt;
    this.updated_at = updatedAt;
    this.openingHours = openingHours;
  }

  // Method to transform company data from Mongoose models to DTO
  static fromModel(company) {
    const openingHours = company.openingHours.map(
      (hour) => new OpeningHourDTO(hour.lang, hour.hours)
    );
    return new CompanyDTO(
      company.name,
      company.logo,
      company.address,
      company.phone,
      company.email,
      company.googleMap,
      company.description,
      company.created_at,
      company.updated_at,
      openingHours
    );
  }
}

module.exports = { CompanyDTO, OpeningHourDTO };
