const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [
  { 
    username: "sampleUser1", 
    password: "password1234" // Note: In real applications, passwords should be hashed
  }
];

// Middleware to verify the token and attach user to req object
function verifyToken(req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: "Token is required for authentication" });

  // Split the header value by space and get the token part
  const token = authHeader.split(' ')[1]; // Assuming format "Bearer <token>"

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded user to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
}



// Checks if the username is valid (not empty and not already used)
const isValid = (username) => {
  return username && !users.some(user => user.username === username);
}

// Checks if username and password match the one we have in records
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Registration endpoint
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  // Check for missing username or password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Use isValid to check if the username is valid
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists or is invalid." });
  }

  // Add the new user (in a real app, password should be hashed)
  users.push({ username, password });

  // Respond with success message
  res.status(201).json({ message: "User registered successfully." });
});

// Secret key for JWT signing
const JWT_SECRET = 'your_secret_key'; // In real applications, keep this secret and secure!

regd_users.post("/customer/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = users.find(u => u.username === username && u.password === password);

  // Validate username and password
  if (user) {
    // User found, create a JWT token
    const token = jwt.sign({ id: user.username }, JWT_SECRET, { expiresIn: '2h' });

    // Send the JWT token in the response
    res.json({ message: "Login successful", token });
  } else {
    // User not found or password does not match
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// Existing add book review route
// Use the verifyToken middleware to ensure that the route is protected
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query; // Assuming review is passed as a query parameter
  const username = req.user.id; // Extracted username from the token

  // Find the book by ISBN
  const bookKey = Object.keys(books).find(key => books[key].isbn === isbn);
  const book = books[bookKey];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize the reviews object for the book if it doesn't exist
  if (!book.reviews) book.reviews = {};

  // Add or update the review for the user
  book.reviews[username] = review;

  res.status(200).json({
    message: "Review added/updated successfully",
    book: book
  });
});

regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
  const { isbn } = req.params;
  const username = req.user.id; // Extracted username from the token

  // Find the book by ISBN
  const bookKey = Object.keys(books).find(key => books[key].isbn === isbn);
  const book = books[bookKey];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for the book
  if (book.reviews && book.reviews[username]) {
    // Delete the user's review
    delete book.reviews[username];

    res.status(200).json({
      message: "Review deleted successfully",
      book: book
    });
  } else {
    // If the user hasn't reviewed the book or the review doesn't exist
    return res.status(404).json({ message: "Review not found" });
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
