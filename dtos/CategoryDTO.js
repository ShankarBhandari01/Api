class CategoryDTO {
  constructor(data = {}) {
    this.name = {
      en: data.name?.en || "",
      fi: data.name?.fi || undefined,
    };

    this.description = {
      en: data.description?.en || "",
      fi: data.description?.fi || undefined,
    };

    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.mode = data.mode || "new";
    this.id=data.id
  }

    // stringified JSON fields
    parseLangField(field) {
      if (typeof field === "string") {
        try {
          field = JSON.parse(field);
        } catch (e) {
          field = {};
        }
      }
      return field;
    }
}

module.exports = CategoryDTO;
