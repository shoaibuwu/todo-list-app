const pool = require("./config/database");

(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log("MySQL connected", rows);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await pool.end();
  }
})();
