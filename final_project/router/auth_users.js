const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper: Check if a username already exists
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Helper: Check if username and password match
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate request
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check credentials
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const token = jwt.sign(
      { username: username },
      'access', // secret key (change for production)
      { expiresIn: '1h' }
    );

    // Save user session info (if needed)
    req.session.authorization = {
      token,
      username
    };

    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add or update a book review (must be logged in)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
