const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "ict_support_secret_key";

// Verify agent token
function agentAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== "agent") {
      return res.status(403).json({ error: "Agent access only" });
    }

    req.agent = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Verify admin token
function adminAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access only" });
    }

    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Verify user token
function userAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== "user") {
      return res.status(403).json({ error: "User access only" });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { agentAuth, adminAuth, userAuth };
