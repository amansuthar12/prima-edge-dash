import express from "express";
const router = express.Router();

// Example login endpoint
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    // You can later connect this to a database or Firebase
    if (username === "admin" && password === "1234") {
        res.json({ success: true, message: "Login successful", token: "mockToken123" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

export default router;
