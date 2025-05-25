import BaseService from "./BaseService.js";

class AdminService extends BaseService {
  constructor({ connection, adminRepository }) {
    super(connection);
    this.adminRepository = adminRepository;
  }

  /**
   * Retrieves the current CORS whitelist configuration.
   * @returns {Promise<Object>} - The CORS whitelist configuration.
   */
  getCorsWhitelist = async () => await this.adminRepository.getCorsWhitelist();

  /**
   * Updates the CORS whitelist with the provided domains.
   * If the whitelist does not exist, it creates a new one.
   * If it exists, it merges the new domains with existing ones, ensuring no duplicates.
   *
   * @param {Array<string>} corsWhitelist - Array of domain strings to be added to the CORS whitelist.
   * @returns {Promise<Object>} - The updated CORS whitelist configuration.
   */
  updateCorsWhitelist = async (corsWhitelist) => {
    try {
      if (!Array.isArray(corsWhitelist)) {
        throw new Error("CORS whitelist must be an array");
      }

      // Sanitize
      corsWhitelist = corsWhitelist.map((domain) =>
        domain.trim().toLowerCase()
      );

      // Validate domains
      corsWhitelist.forEach((domain) => {
        try {
          new URL(domain);
        } catch {
          throw new Error(`Invalid domain in whitelist: ${domain}`);
        }
      });

      const existingConfig = await this.adminRepository.getCorsWhitelist();

      if (!existingConfig) {
        return await this.handleRepositoryCall(
          this.adminRepository.createCorsWhitelist,
          corsWhitelist
        );
      }
      const existingDomains = existingConfig.value || [];

      // Merge and deduplicate
      const merged = Array.from(
        new Set([...existingDomains, ...corsWhitelist])
      );
      const newOnly = corsWhitelist.filter((d) => !existingDomains.includes(d));
      if (newOnly.length === 0) {
        this.log("No new domains to add to CORS whitelist.");
        return existingConfig; // No changes needed
      }
      this.log(`Adding new domains to CORS whitelist: ${newOnly.join(", ")}`);
      return await this.handleRepositoryCall(
        this.adminRepository.updateCorsWhitelist,
        existingConfig._id,
        merged
      );
    } catch (err) {
      this.logAndThrowError("updateCorsWhitelist error", err);
    }
  };
}

export default AdminService;
