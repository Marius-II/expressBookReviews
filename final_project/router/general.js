const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Middleware to parse JSON bodies
public_users.use(express.json());

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', (req, res) => {
  return res.status(200).json(Object.values(books));
});

public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = Object.values(books).find(b => b.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
});

public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const authorBooks = Object.values(books).filter(book => book.author === author);
  if (authorBooks.length === 0) {
    return res.status(404).json({ message: "No books found by this author" });
  }
  return res.status(200).json(authorBooks);
});

public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const titleBooks = Object.values(books).filter(book => book.title.includes(title));
  if (titleBooks.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  return res.status(200).json(titleBooks);
});

public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = Object.values(books).find(b => b.isbn === isbn);
  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
  return res.status(200).json(book.reviews);
});

// New route handler for fetching books using async/await
public_users.get('/', async (req, res) => {
  try {
    // Simulate fetching books data from an external API
    const response = await axios.get('http://example.com/api/books');
    const books = response.data;
    res.status(200).json(books);
  } catch (error) {
    // Log error and return a server error response
    console.error("Failed to fetch books:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Route handler for fetching book details by ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    // Replace the URL with the actual endpoint of the external API
    const response = await axios.get(`http://example.com/api/books/${isbn}`);
    const bookDetails = response.data;
    res.status(200).json(bookDetails);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "Book not found" });
    } else {
      console.error("Failed to fetch book details:", error);
      res.status(500).json({ message: "Failed to fetch book details" });
    }
  }
});

public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;

  try {
      // Replace the URL with the actual API endpoint
      const response = await axios.get(`http://example.com/api/books/author/${encodeURIComponent(author)}`);
      const booksByAuthor = response.data;
      res.status(200).json(booksByAuthor);
  } catch (error) {
      if (error.response && error.response.status === 404) {
          res.status(404).json({ message: "No books found by this author" });
      } else {
          console.error("Failed to fetch books:", error);
          res.status(500).json({ message: "Failed to fetch books" });
      }
  }
});

public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    // Replace the URL with the actual API endpoint
    // encodeURIComponent is used to handle titles with spaces or special characters in the URL
    const response = await axios.get(`http://example.com/api/books/title/${encodeURIComponent(title)}`);
    const bookDetails = response.data;
    res.status(200).json(bookDetails);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "No books found with this title" });
    } else {
      console.error("Failed to fetch book details:", error);
      res.status(500).json({ message: "Failed to fetch book details" });
    }
  }
});
module.exports.general = public_users;
