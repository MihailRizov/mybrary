const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer')
const router = express.Router();
// const Book = require('../models/Book');
let Book;
if (mongoose.models.Book) {
    Book = mongoose.model('Book');
} else {
    Book = require('../models/book');
}
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
let Author;
if (mongoose.models.Author) {
    Author = mongoose.model('Author');
} else {
    Author = require('../models/Author');
}

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

// All Books route
router.get('/', async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title.trim() != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    
    if (req.query.publishedBefore != null && req.query.publishedBefore.trim() != '') {
        query = query.lte('publishedDate', req.query.publishedBefore); // less than or equal to
    }
    
    if (req.query.publishedAfter != null && req.query.publishedAfter.trim() != '') {
        query = query.gte('publishedDate', req.query.publishedAfter); // great than or equal to
    }
    
    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    } catch (error) {
        
    }
});

// New Book route
router.get('/new', async (req, res) => {
    const book = new Book();
    renderNewPage(res, book);
});

// Create Book route
router.post('/', upload.single('cover'), async (req, res) => { // upload.single tells multer that we uploading a single file with the name of cover
    const filename = req.file != null ? req.file.filename : null;
    const book = new Book({                                    // multer will upload the file in the correct folder. And it will add a variable in to the req called file
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName: filename
    });
    
    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect('/books')
    } catch (error) {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        
        renderNewPage(res, book, true);
    }
});

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({}); // Empty object means no conditions
        const params = { authors: authors, book: book };
        if (hasError) {
            params.errorMessage = 'Error creating a book';
        }
        
        res.render('books/new', params);
    } catch (error) {
        res.redirect('/books');
    }
}

function removeBookCover(filename) {
    fs.unlink(path.join(uploadPath, filename), err => {
        console.error(err);
    }) // this will remove the file
}

module.exports = router;