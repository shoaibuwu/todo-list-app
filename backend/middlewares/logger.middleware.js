const jwt = require("jsonwebtoken");

// ANSI color codes for terminal formatting
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgBlue: "\x1b[44m\x1b[37m",
  bgGreen: "\x1b[42m\x1b[30m",
  bgYellow: "\x1b[43m\x1b[30m",
  bgRed: "\x1b[41m\x1b[37m",
};

/**
 * Determine the user-friendly action name and category based on method and route
 */
function resolveAction(method, path) {
  const cleanPath = path.toLowerCase().split("?")[0];

  // Auth actions
  if (cleanPath.includes("/auth/login")) {
    return { name: "🔐 USER LOGIN", category: "AUTH" };
  }
  if (cleanPath.includes("/auth/signup") || cleanPath.includes("/auth/register")) {
    return { name: "🔑 USER SIGN UP / REGISTER", category: "AUTH" };
  }
  if (cleanPath.includes("/auth/refresh")) {
    return { name: "🔄 REFRESH ACCESS TOKEN", category: "AUTH" };
  }
  if (cleanPath.includes("/auth/forgot-password")) {
    return { name: "📩 REQUEST PASSWORD RESET", category: "AUTH" };
  }
  if (cleanPath.includes("/auth/reset-password")) {
    return { name: "🔒 RESET PASSWORD", category: "AUTH" };
  }
  if (cleanPath.includes("/auth/logout")) {
    return { name: "🚪 USER LOGOUT", category: "AUTH" };
  }
  if (cleanPath.includes("/auth/me")) {
    return { name: "👤 FETCH USER PROFILE", category: "AUTH" };
  }

  // Todo actions
  if (cleanPath.includes("/todos") || cleanPath.includes("/todo")) {
    const isIdRoute = /\/todos\/(get\/|update\/|delete\/)?\d+/.test(cleanPath);

    if (method === "POST") {
      return { name: "➕ ADD NEW TODO", category: "TODO" };
    }
    if (method === "PUT" || cleanPath.includes("/update/")) {
      return { name: "✏️  UPDATE TODO", category: "TODO" };
    }
    if (method === "DELETE" || cleanPath.includes("/delete/")) {
      return { name: "🗑️  DELETE TODO", category: "TODO" };
    }
    if (method === "GET") {
      return isIdRoute
        ? { name: "🔍 GET SINGLE TODO", category: "TODO" }
        : { name: "📋 FETCH ALL TODOS", category: "TODO" };
    }
  }

  // Health & Root
  if (cleanPath.includes("/health")) {
    return { name: "🩺 HEALTH CHECK", category: "SYSTEM" };
  }
  if (cleanPath === "/" || cleanPath === "") {
    return { name: "🌐 API STATUS CHECK", category: "SYSTEM" };
  }

  return { name: `⚡ ${method} ${path}`, category: "API" };
}

/**
 * Safely sanitize payload by masking passwords and tokens
 */
function sanitizePayload(body) {
  if (!body || typeof body !== "object") return null;
  const clone = { ...body };
  if (clone.password) clone.password = "******";
  if (clone.newPassword) clone.newPassword = "******";
  if (clone.confirmPassword) clone.confirmPassword = "******";
  if (clone.refreshToken) {
    clone.refreshToken = `${clone.refreshToken.substring(0, 10)}...[MASKED]`;
  }
  return clone;
}

/**
 * Extract user identity safely from Authorization header if present
 */
function extractUserFromHeader(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.decode(token);
      if (decoded && (decoded.email || decoded.id || decoded.name)) {
        return {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        };
      }
    }
  } catch (err) {
    // Ignore decode errors
  }
  return null;
}

/**
 * Terminal API Activity Logger Middleware
 */
function terminalLogger(req, res, next) {
  // Skip OPTIONS preflight to avoid terminal spam
  if (req.method === "OPTIONS") {
    return next();
  }

  const startTime = process.hrtime();
  const timestamp = new Date().toLocaleTimeString();
  const action = resolveAction(req.method, req.originalUrl || req.url);
  const userInfo = extractUserFromHeader(req);
  const sanitizedBody = sanitizePayload(req.body);

  // Extract ID param if in URL (e.g. /todos/5)
  const idMatch = (req.originalUrl || req.url).match(/\/todos\/(?:get\/|update\/|delete\/)?(\d+)/i);
  const targetId = idMatch ? idMatch[1] : null;

  // Intercept response finish event to capture status and duration
  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(1);

    const statusCode = res.statusCode;
    let statusFormatted = `${statusCode} ${res.statusMessage || ""}`;

    if (statusCode >= 200 && statusCode < 300) {
      statusFormatted = `${colors.green}${colors.bold}✅ ${statusCode} OK${colors.reset}`;
    } else if (statusCode >= 300 && statusCode < 400) {
      statusFormatted = `${colors.cyan}${colors.bold}ℹ️  ${statusCode}${colors.reset}`;
    } else if (statusCode >= 400 && statusCode < 500) {
      statusFormatted = `${colors.yellow}${colors.bold}⚠️  ${statusCode} Client Error${colors.reset}`;
    } else {
      statusFormatted = `${colors.red}${colors.bold}❌ ${statusCode} Server Error${colors.reset}`;
    }

    // Method badge color
    let methodBadge = `${colors.bold}${req.method}${colors.reset}`;
    if (req.method === "GET") methodBadge = `${colors.cyan}${colors.bold}GET${colors.reset}`;
    if (req.method === "POST") methodBadge = `${colors.green}${colors.bold}POST${colors.reset}`;
    if (req.method === "PUT") methodBadge = `${colors.yellow}${colors.bold}PUT${colors.reset}`;
    if (req.method === "DELETE") methodBadge = `${colors.red}${colors.bold}DELETE${colors.reset}`;

    // Pretty Terminal Block
    console.log(`\n${colors.dim}────────────────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(
      `${colors.bold}${colors.blue}🚀 API HIT:${colors.reset} ${methodBadge} ${colors.bold}${req.originalUrl || req.url}${colors.reset}  ${colors.dim}[${timestamp}]${colors.reset}`
    );
    console.log(`   ${colors.magenta}📌 Task / Action:${colors.reset} ${colors.bold}${action.name}${colors.reset}`);

    // Log target ID if present
    if (targetId) {
      console.log(`   ${colors.yellow}🎯 Target Todo ID:${colors.reset} ${colors.bold}#${targetId}${colors.reset}`);
    }

    // Log user identity
    if (userInfo) {
      const userDisplay = userInfo.name
        ? `${userInfo.name} (ID: ${userInfo.id}, ${userInfo.email})`
        : `User #${userInfo.id} (${userInfo.email || "No email"})`;
      console.log(`   ${colors.cyan}👤 User:${colors.reset}          ${userDisplay}`);
    } else if (sanitizedBody && (sanitizedBody.email || sanitizedBody.name)) {
      console.log(
        `   ${colors.cyan}👤 User Input:${colors.reset}    ${sanitizedBody.email || ""}${sanitizedBody.name ? ` (${sanitizedBody.name})` : ""}`
      );
    }

    // Log relevant request payload
    if (sanitizedBody && Object.keys(sanitizedBody).length > 0) {
      const payloadStr = JSON.stringify(sanitizedBody);
      const truncated = payloadStr.length > 120 ? `${payloadStr.substring(0, 120)}...}` : payloadStr;
      console.log(`   ${colors.white}📦 Payload:${colors.reset}       ${colors.dim}${truncated}${colors.reset}`);
    }

    // Log Result & Duration
    console.log(
      `   ${colors.bold}⚡ Response:${colors.reset}      ${statusFormatted} ${colors.dim}(took ${durationMs}ms)${colors.reset}`
    );
    console.log(`${colors.dim}────────────────────────────────────────────────────────────────────────${colors.reset}`);
  });

  next();
}

module.exports = terminalLogger;
