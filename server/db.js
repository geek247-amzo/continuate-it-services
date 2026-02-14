import { promises as dns } from "dns";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required. Set it in .env before starting the server.");
}

const resolveIpv4 = async (url) => {
  try {
    const hostname = new URL(url).hostname;
    if (!hostname) return null;
    const addresses = await dns.resolve4(hostname);
    return addresses?.[0] ?? null;
  } catch {
    return null;
  }
};

const sslDisabled = process.env.DATABASE_SSL === "false";

const parsed = new URL(connectionString);
const hostaddr = await resolveIpv4(connectionString);

const pool = new Pool({
  user: parsed.username,
  password: parsed.password,
  host: parsed.hostname,
  port: Number(parsed.port || 5432),
  database: parsed.pathname.replace("/", ""),
  ssl: sslDisabled ? false : { rejectUnauthorized: false },
  ...(hostaddr ? { hostaddr } : {}),
  family: 4,
});

export const query = (text, params) => pool.query(text, params);

export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
