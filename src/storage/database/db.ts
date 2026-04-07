import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : undefined,
});

// 创建 Drizzle 实例
export const db = drizzle(pool);

// 获取数据库连接
export async function getConnection() {
  return pool.connect();
}

// 健康检查
export async function healthCheck() {
  try {
    const client = await getConnection();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// 关闭连接池
export async function closePool() {
  await pool.end();
}
