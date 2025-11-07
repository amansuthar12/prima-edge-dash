// backend/test-db.js
import { pool } from './db.js';

const testDB = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connected at:', res.rows[0].now);
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    } finally {
        pool.end();
    }
};

testDB();
