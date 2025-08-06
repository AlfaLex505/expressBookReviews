const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// REGISTER a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully!" });
});

// Get all books
public_users.get('/', async (req, res) => {
  try {
    const getBooks = () =>
      new Promise((resolve, reject) => {
        if (books) resolve(books);
        else reject("No books available");
      });

  const bookList = await getBooks();
  return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const results = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

  if (results.length === 0) {
    return res.status(404).json({ message: "No books found by that author" });
  }

  return res.status(200).json(results);
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const results = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

  if (results.length === 0) {
    return res.status(404).json({ message: "No books found with that title" });
  }

  return res.status(200).json(results);
});

// Get book reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
