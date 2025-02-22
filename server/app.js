require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require("cors");
const { connectToDatabase } = require("./db");

const app = express();
app.use(express.json());

// Set up CORS
app.use(cors({
    origin: process.env.FRONT_END,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

// Variables to access Mongo database and collections
let client, db, usersCollection;

// Starts MongoDB server
async function startMongo() {
    try {
        const collections = await connectToDatabase();
        client = collections.client;
        db = collections.db;
        usersCollection = collections.usersCollection;

        // Create a unique index on the email field
        await usersCollection.createIndex({ email: 1 }, { unique: true });

        console.log("MongoDB connected and index created.");
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startMongo().then(() => {
    // Start the server only after MongoDB connection is successful
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Function to insert a user
async function insertUser(info) {
    try {
        if (!usersCollection) {
            throw new Error('usersCollection is not defined');
        }

        console.log("Attempting to insert user with email: " + info.email);

        // Check if the email already exists
        const existingUser = await usersCollection.findOne({ email: info.email });
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // Encrypt the password before storing it
        const hashedPassword = await bcrypt.hash(info.password, 10);
        const user = {
            ...info,
            password: hashedPassword,
            isAdmin: false,
        };

        // Insert the user document into the usersCollection
        const result = await usersCollection.insertOne(user);
        return result.insertedId;
    } catch (error) {
        console.error('Error inserting user document:', error);
        throw new Error('Failed to insert user document');
    }
}

// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send("Access denied");

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid token");
        req.user = user;
        next();
    });
};

// Register Route
// Endpoint for Signup
app.post('/register', async (req, res) => {
    try {
        // Call insert user function
        const userId = await insertUser(req.body);
        res.status(200).send({ message: 'User created successfully', userId });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Login Route (commented out for now)
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//
//     if (user && (await bcrypt.compare(password, user.password))) {
//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
//         res.json({ token });
//     } else {
//         res.status(400).send("Invalid credentials");
//     }
// });

// Get Advice Route (Protected) (commented out for now)
// app.post('/getAdvice', authenticateToken, async (req, res) => {
//     const { age, name } = req.body;
//     const user = await User.findById(req.user.userId);
//
//     if (user.apiCalls >= 20) {
//         return res.status(403).send("API call limit reached");
//     }
//
//     try {
//         const response = await axios.post('http://localhost:5001/getAdvice', { age, name });
//         const advice = response.data.advice;
//
//         user.apiCalls += 1;
//         await user.save();
//         res.json({ advice });
//     } catch (error) {
//         res.status(500).send("Failed to get advice");
//     }
// });
