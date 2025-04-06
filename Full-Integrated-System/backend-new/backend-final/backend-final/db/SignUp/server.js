const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "users.csv");

// Helper function to read CSV file
const readCSV = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return data
        .trim()
        .split("\n")
        .map((line) => {
            const [email, password, username] = line.split(",");
            return { email, password, username };
        });
};

// Save a new user to CSV
app.post("/signup", (req, res) => {
    const { email, password, username } = req.body;
    let users = readCSV();

    // Check if email already exists
    if (users.some((user) => user.email === email)) {
        return res.status(400).json({ error: "Email already registered" });
    }

    // Check if username exists and suggest a new one
    let suggestedUsername = username;
    let counter = 1;
    while (users.some((user) => user.username === suggestedUsername)) {
        suggestedUsername = `${username}${counter}`;
        counter++;
    }

    // Append new user to the CSV file
    const newUser = `${email},${password},${suggestedUsername}\n`;
    fs.appendFileSync(USERS_FILE, newUser);

    res.json({ message: "User registered successfully", username: suggestedUsername });
});

// Login user
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const users = readCSV();

    const user = users.find((user) => user.email === email);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", username: user.username });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
