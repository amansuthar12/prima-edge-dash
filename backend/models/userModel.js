import pool from '../db.js';

export const createUser = async (name, email, passwordHash) => {
    const query = `
    INSERT INTO fleet_users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email;
  `;
    const { rows } = await pool.query(query, [name, email, passwordHash]);
    return rows[0];
};

export const getUserByEmail = async (email) => {
    const query = `SELECT * FROM fleet_users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
};
