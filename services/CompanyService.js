import BaseService from "./BaseService.js";


class CompanyService extends BaseService {
  constructor(connection, {CompanyRepository}) {
    super(connection);
    this.companyRepository = CompanyRepository;
  }
  deleteRole = async (id) =>
    await this.handleRepositoryCall(this.companyRepository.deleteRole, id);

  updateRole = async (id, role) => {
    try {
      const existingRole = await this.companyRepository.findRoleById(id);
      if (!existingRole) {
        throw new Error("Role not found");
      }

      if (role.name && role.name !== existingRole.name) {
        const roleWithSameName = await this.companyRepository.findRoleByName(
          role.name
        );
        if (roleWithSameName) {
          throw new Error("Role name already exists");
        }
      }

      // Update fields
      existingRole.name = role.name || existingRole.name;
      existingRole.description = role.description || existingRole.description;
      existingRole.menuRights = role.menuRights || existingRole.menuRights;

      // updated roles
      return await this.handleRepositoryCall(
        this.companyRepository.updateRoles,
        existingRole
      );
    } catch (err) {
      this.logAndThrowError("updateRole error ", err);
    }
  };
  deleteMenu = async (id) =>
    await this.handleRepositoryCall(this.companyRepository.deleteMenu, id);
  getMenus = async (leng) =>
    await this.handleRepositoryCall(this.companyRepository.getMenus);
  getRoles = async (leng) =>
    await this.handleRepositoryCall(this.companyRepository.getRoles);

  async addRoleWithMenuRights(roleData) {
    try {
      const existingRole = await this.companyRepository.findRoleByName(
        roleData.name
      );
      if (existingRole) {
        throw new Error(`Role "${roleData.name}" already exists.`);
      }

      if (roleData.menuRights && roleData.menuRights.length > 0) {
        for (const menuRight of roleData.menuRights) {
          const menu = await this.companyRepository.findMenuById(
            menuRight.menu
          );
          if (!menu) {
            throw new Error(`Menu with ID "${menuRight.menu}" not found.`);
          }
        }
      }
      return await this.handleRepositoryCall(
        this.companyRepository.addRole,
        roleData
      );
    } catch (error) {
      this.logAndThrowError("addRoleWithMenuRights error ", error);
    }
  }
  updateMenu = async (id, menu) => {
    try {
      const existingMenu = await this.companyRepository.findMenuById(id);
      if (!existingMenu) {
        throw new Error("Menu not found");
      }

      // Check for uniqueness if path is being changed
      if (menu.path && menu.path !== existingMenu.path) {
        const menuWithSameName = await this.companyRepository.getMenuByPath(
          menu.path
        );
        if (menuWithSameName) {
          throw new Error("Menu name already exists");
        }
      }

      // Update fields
      existingMenu.name = menu.name || existingMenu.name;
      existingMenu.description = menu.description || existingMenu.description;
      existingMenu.path = menu.path || existingMenu.path;
      existingMenu.icon = menu.icon || existingMenu.icon;
      existingMenu.parent = menu.parent || existingMenu.parent;
      existingMenu.order = menu.order || existingMenu.order;
      existingMenu.isActive =
        typeof menu.isActive === "boolean"
          ? menu.isActive
          : existingMenu.isActive;

      // Save updated menu
      return await this.handleRepositoryCall(
        this.companyRepository.updateMenu,
        existingMenu
      );
    } catch (err) {
      this.logAndThrowError("updateMenu error", err);
    }
  };

  addMenus = async (menus) => {
    const results = [];

    for (const newMenu of menus) {
      try {
        if (newMenu.parent) {
          const parentMenu = await this.companyRepository.findMenuById(
            newMenu.parent
          );
          if (!parentMenu) {
            throw new Error(`Parent menu with ID ${newMenu.parent} not found`);
          }
        }

        const existingMenu = await this.companyRepository.getMenuByPath(
          newMenu.path
        );
        if (existingMenu) {
          throw new Error(`Menu path "${newMenu.path}" already exists`);
        }

        await this.handleRepositoryCall(
          this.companyRepository.addMenu,
          newMenu
        );

        results.push({
          menu: newMenu,
          status: "success",
          message: "Menu added successfully",
        });
      } catch (error) {
        results.push({
          menu: newMenu,
          status: "error",
          message: error.message,
        });
      }
    }
    return results;
  };

  getCompanyInfo = async (lang) =>
    await this.handleRepositoryCall(this.companyRepository.getCompanyInfo);

  addCompanyInfo = async (companyInfo, lang) =>
    await this.handleRepositoryCall(
      this.companyRepository.addCompanyInfo,
      companyInfo
    );

  addTable = async (table, lang) =>
    await this.handleRepositoryCall(this.companyRepository.addTable, table);
}

export default CompanyService;
