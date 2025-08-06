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
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = () =>
    new Promise((resolve, reject) => {
      if (books[isbn]) resolve(books[isbn]);
      else reject({status: 404, message: "No book available with that ISBN"});
  });

  try {
    const bookByISBN = await getBookByISBN();
    return res.status(200).json(bookByISBN);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error || error});
  }
});

// Get books by author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  const results = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

  const getBookByAuthor = () =>
    new Promise((resolve, reject) => {
      if (results.length > 0) resolve(results);
      else reject({status: 404, message: "No book available with that Author"});
  });

  try {
    const BookByAuthor = await getBookByAuthor();
    return res.status(200).json(BookByAuthor);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || error});
  }
});

// Get books by title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  const results = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

  const getBookByTitle = () =>
    new Promise((resolve, reject) => {
      if (results.length > 0) resolve(results);
      else reject({status: 404, message: "No book available with that Title"});
  });

  try {
    const BookByTitle = await getBookByTitle();
    return res.status(200).json(BookByTitle);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || error});
  }
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
