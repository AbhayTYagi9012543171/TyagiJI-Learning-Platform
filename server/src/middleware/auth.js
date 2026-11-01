
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function getToken(req) {
  const authorization = req.headers.authorization || '';
  const bearer = authorization.match(/^Bearer\s+(.+)$/i);

  return req.cookies?.cp_session || bearer?.[1] || null;
}

async function getAuthenticatedUser(req) {
  const token = getToken(req);

  if (!token) return null;

  let payload;

  try {
    payload = jwt.verify(token, process.env.SESSION_SECRET);
  } catch {
    return null;
  }

  if (!payload?.sub) return null;

  const user = await User.findById(payload.sub)
    .select('name email role status preferences +authVersion');

  if (!user || user.status !== 'active' || Number(payload.ver || 0) !== Number(user.authVersion || 0)) {
    return null;
  }

  return user;
}

async function optionalAuth(req, res, next) {
  try {
    req.user = await getAuthenticatedUser(req);
    return next();
  } catch (error) {
    return next(error);
  }
}

async function requireAuth(req, res, next) {
  try {
    req.user = await getAuthenticatedUser(req);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to continue.',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access is required.',
    });
  }

  return next();
}

module.exports = {
  optionalAuth,
  requireAuth,
  requireAdmin,
};
