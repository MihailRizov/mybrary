const express = require('express');
const mongoose = require('mongoose');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');
const router = express.Router();
// const Book = require('../models/Book');
let Book;
if (mongoose.models.Book) {
    Book = mongoose.model('Book');
} else {
    Book = require('../models/book');
}
// const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
let Author;
if (mongoose.models.Author) {
    Author = mongoose.model('Author');
} else {
    Author = require('../models/Author');
}

// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype));
//     }
// });

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

// Book page route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id.trim()).populate('author').exec();
        res.render('books/show', { book: book });
    } catch (error) {
        res.redirect('/');
    }
});

// Edit page route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id.trim());
        renderEditPage(res, book);
    } catch (error) {
        res.redirect('/');
    }
});

// Create Book route
// router.post('/', upload.single('cover'), async (req, res) => { // upload.single tells multer that we uploading a single file with the name of cover // multer will upload the file in the correct folder. And it will add a variable in to the req called file
router.post('/', async (req, res) => {
    // const filename = req.file != null ? req.file.filename : null;
    const book = new Book({                                    
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        // coverImageName: filename
    });
    
    saveCover(book, req.body.coverImage);
    
    try {
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
    } catch (error) {
        // console.error(error);
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName);
        // }
        
        renderNewPage(res, book, true);
    }
});

// Update Book route
router.put('/:id', async (req, res) => {
    let book
    try {
        const book = await Book.findById(req.params.id.trim());
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = req.body.publishDate;
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.book.cover)
        }
        
        await book.save();
        
        res.redirect(`/books/${book.id}`);
    } catch (error) {
        if (book != null) {
            renderEditPage(res, book, true);
        } else {
            res.redirect('/');
        }
    }
});

// Delete Book route
router.delete('/:id', async (req, res) => {
    let book
    try {
        const book = await Book.findById(req.params.id.trim());
        await book.remove();
        res.redirect('/books');
    } catch (error) {
        if (book == null) {
            res.redirect('books/show', {
                book: book,
                errorMessage: 'Could not remove the book'
            }); // No book was found
        } else {
            res.redirect(`/books/${book.id}`);
        }
    }
});

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) {
        return;
    }
    
    const cover = JSON.parse(coverEncoded);
    
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
};

function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({}); // Empty object means no conditions
        const params = { authors: authors, book: book };
        if (hasError) {
            let msg;
            if (form === 'new') {
                msg = 'Error new a book';
            }
            
            if (form === 'edit') {
                msg = 'Error editing a book';
            }
            
            params.errorMessage = msg;
        }
        
        res.render(`books/${form}`, params);
    } catch (error) {
        res.redirect('/books');
    }
}

// function removeBookCover(filename) {
//     fs.unlink(path.join(uploadPath, filename), err => {
//         console.error(err);
//     }) // this will remove the file
// }

module.exports = router;