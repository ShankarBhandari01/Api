
module.exports = (requiredRole) => {
    return (req, res, next) => {
      // Get user role from JWT token or session (depending on how you store it)
      const userRole = req.user?.role;
  
      if (!userRole) {
        return res.status(401).json({ message: 'Access denied, no user role found.' });
      }
      // If the user does not have the required role, deny access
      if (userRole !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden, insufficient permissions.' });
      }
      next();
    };
  };
  