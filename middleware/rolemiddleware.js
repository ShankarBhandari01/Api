
module.exports = (requiredRole) => {
    return (req, res, next) => {
      const userRole = req.user?.role;
  
      if (!userRole) {
        return res.status(401).json({ message: 'Access denied, no user role found.' });
      }
      if (userRole !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden, insufficient permissions.' });
      }
      next();
    };
  };
  