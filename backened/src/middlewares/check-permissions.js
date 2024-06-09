const ValidationError = require('../services/notifications/errors/validation');

/**
 * @param {string} permission
 * @return {import("express").RequestHandler}
 */
function checkPermissions(permission) {
  return (req, res, next) => {
    const { currentUser } = req;
    if (currentUser) {
      if (currentUser.id === req.params.id || currentUser.id === req.body.id) {
        next();
        return;
      }
      const userPermission = currentUser.custom_permissions.find(
        (cp) => cp.name === permission,
      );

      if (userPermission) {
        next();
      } else {
        if (!currentUser.app_role) {
          return next(new ValidationError('auth.forbidden'));
        }}
    }}}