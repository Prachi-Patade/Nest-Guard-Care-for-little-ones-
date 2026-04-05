const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));   // 10MB tak accept karega
app.use(express.urlencoded({ limit: '10mb', extended: true }));
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'prachipatade7975mysql', 
    database: 'nest_guard_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Database Connected Successfully!');
});

// 1. REGISTRATION API (Sari info store hogi + Duplicate check)
app.post('/register', (req, res) => {
    const { username, address, email, password, telephone, city } = req.body;
    
    // Check if email already exists
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], (err, result) => {
        if (result.length > 0) {
            return res.status(400).send({ message: "You are already registered! Please Login." });
        }

        // Agar naya user hai toh insert karein
        const sql = "INSERT INTO users (username, address, email, password, telephone, city) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [username, address, email, password, telephone, city], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: "Registration Successful! You can now log in." });
        });
    });
});

// 2. LOGIN API (Check karega registered hai ya nahi)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length === 0) {
            return res.status(404).send({ message: "Account not found" });
        }

        if (result[0].password !== password) {
            return res.status(401).send({ message: "Incorrect password" });
        }

        // ✅ IMPORTANT
        res.send({ 
            message: "Login Successful!",
            userId: result[0].id   // 👈 Ye add karo
        });
    });
});
// 3. FORGOT PASSWORD API (User check + Password Update)
app.post('/forgot-password', (req, res) => {
    const { email, newPassword } = req.body;

    // Pehle check karo user exist karta hai ya nahi
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], (err, result) => {
        if (result.length === 0) {
            return res.status(404).send({ message: "This email is not registered. Password reset is not possible!" });
        }

        // Agar user mil gaya toh password update karo
        const updateSql = "UPDATE users SET password = ? WHERE email = ?";
        db.query(updateSql, [newPassword, email], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: "Password changed successfully!" });
        });
    });
});

// 4. SAVE PROFILE API
app.post('/save-profile', (req, res) => {
    const {
        userId,
        name,
        phone,
        email,
        type,
        time,
        exp,
        bname,
        bage,
        feed,
        p1,
        p2,
        p3,
        p4,
        profileImage
    } = req.body;

    const sql = `
        UPDATE users SET
            username = ?,
            telephone = ?,
            email = ?,
            type = ?,
            timing = ?,
            experience = ?,
            baby_name = ?,
            baby_age = ?,
            feeding = ?,
            pref1 = ?,
            pref2 = ?,
            pref3 = ?,
            pref4 = ?,
            profile_image = ?
        WHERE id = ?
    `;

    db.query(sql, [
        name, phone, email, type, time, exp,
        bname, bage, feed, p1, p2, p3, p4,
        profileImage, userId
    ], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Profile saved in database!" });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));