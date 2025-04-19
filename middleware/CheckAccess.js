// middlewares/CheckAccess.js
module.exports = (menuPath, requiredPermission) => {
  return async (req, res, next) => {
    const role = req.session.user.role;
    if (!role) return res.status(403).json({ message: "Role not found." });

    const targetMenu = role.menuRights.find(
      (menuRight) => menuRight.menu.path === menuPath
    );

    if (
      (targetMenu && targetMenu.permissions.includes(requiredPermission)) ||
      role.name == "admin" ||
      role.name == "superadmin"
    ) {
      return next();
    }

    return res.status(403).json({ message: "You do not have access." });
  };
};
