import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const isRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role_id;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient privileges" });
    }
    next();
  };
};



// access control middleware for specific roles
export const canManageCompany = (req, res, next) => {
  if ([1, 2].includes(req.user.role_id)) return next(); // Super or CompanyAdmin
  return res.status(403).json({ message: "Access denied: company management only" });
};

export const canManageSubsidiary = (req, res, next) => {
  if ([1, 2, 3].includes(req.user.role_id)) return next(); // Super, Company, or SubsidiaryAdmin
  return res.status(403).json({ message: "Access denied: subsidiary management only" });
};

export const canManageDepartments = (req, res, next) => {
  if ([3].includes(req.user.role_id)) return next(); // Subsidiary admin
  return res.status(403).json({ message: "Access denied: department management only" });
};

export const canManageEmployees = (req, res, next) => {
  if ([1, 2, 3, 4].includes(req.user.role_id)) return next(); // CompanyAdmin, SubsidiaryAdmin, HR
  return res.status(403).json({ message: "Access denied: employee management only" });
};

export const canAccessWallet = (req, res, next) => {
  if ([2, 5].includes(req.user.role_id)) return next(); // CompanyAdmin, Finance
  return res.status(403).json({ message: "Access denied: wallet access only" });
};


// middleware to check whether this user belong to same comapny/subsidiary as the resource being accessed

// Enforce same subsidiary/company access
export const verifySubsidiaryScope = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: no user in request" });
    }

    const { role_id, subsidiary_id } = user;
    // Allow admins (Super, Company, Subsidiary)
    if ([1, 2, 3].includes(role_id)) return next();

    // Determine target subsidiary/company from params or body
    const targetSubsidiaryId = Number(
      req.params?.subsidiary_id ||
      req.body?.subsidiary_id ||
      req.params?.company_id ||
      req.body?.company_id ||
      req.params?.id
    );

    if (!subsidiary_id) {
      return res.status(403).json({ message: "User has no subsidiary assigned" });
    }

    if (targetSubsidiaryId && subsidiary_id !== targetSubsidiaryId) {
      return res.status(403).json({ message: "Access denied: not your subsidiary/company scope" });
    }

    next();
  } catch (err) {
    console.error("verifySubsidiaryScope error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// authMiddleware.js
export const canRegisterEmployees = (req, res, next) => {
  const { role_id, subsidiary_id } = req.user;

  // SuperAdmin (1) or CompanyAdmin (2) can always register
  if ([1, 2].includes(role_id)) return next();

  // HR (5) can register only within their own subsidiary
  if (role_id === 6) {
  const targetSubsidiary = Number(req.body.subsidiary_id);
  const userSubsidiary = Number(subsidiary_id);

  if (userSubsidiary !== targetSubsidiary) {
    return res
      .status(403)
      .json({ message: "HR cannot register employees outside their subsidiary" });
  }
  return next();
}

  return res
    .status(403)
    .json({ message: "Access denied: only HR or Admin can register employees" });
};

