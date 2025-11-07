import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ✅ check fields
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ check if user already exists
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // ✅ hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ insert into DB
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error("❌ Signup Error:", error.message, error.stack);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
