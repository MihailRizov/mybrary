const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const mongoose = require('mongoose');
const author = require('../models/author');

let Book;
if (mongoose.models.Book) {
    Book = mongoose.model('Book');
} else {
    Book = require('../models/book');
}

// All Authors route
router.get('/', async (req, res) => {
    const searchOptions = {};
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    
    try {
        const authors = await Author.find(searchOptions); // Empty object means no conditions
        res.render('authors/index', { authors: authors, searchOptions: req.query });
    } catch (error) {
        res.redirect('/');
    }
});

// New Author route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

// Create Author route
router.post('/', async (req, res) => {
    const newAuthor = new Author({
        name: req.body.name
    });
    
    // newAuthor.save((err, newlyCreatedAuthor) => {
    //     if (err) {
    //         res.render('authors/new', { 
    //             author: newAuthor,
    //             errorMessage: 'Error creating new author'
    //         }); // That way the form will be populated with the value of the user
    //     } else {
    //         // res.redirect(`authors/${newlyCreatedAuthor.id}`);
    //         res.redirect(`authors`);
    //     }
    // });
    
    try {
        const newlyCreatedAuthor = await newAuthor.save();
        res.redirect(`authors/${newlyCreatedAuthor.id}`);
        // res.redirect(`authors`);
    } catch (error) {
        res.render('authors/new', { 
            author: newAuthor,
            errorMessage: 'Error creating new author'
        }); // That way the form will be populated with the value of the user
    }
});

// Author page route
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id.trim());
        const books = await Book.find({ author: author.id }).limit(6).exec();
        res.render('authors/show', { author: author, booksByAuthor: books });
    } catch (error) {
        res.redirect('/');
    }
});

// Edit page route
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id.trim());
        res.render('authors/edit', { author: author });
    } catch (error) {
        console.error(error);
        res.redirect('/authors');
    }
});

// Edit route
router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id.trim());
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
        // res.redirect(`authors`);
    } catch (error) {
        if (author == null) {
            res.redirect('/'); // No author was found
        } else {
            res.render('/authors/edit', { 
                author: author,
                errorMessage: 'Error updating author'
            }); // That way the form will be populated with the value of the user
        }
        
    }
});

// Delete route
router.delete('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id.trim());
        await author.remove();
        res.redirect(`/authors`);
    } catch (error) {
        if (author == null) {
            res.redirect('/'); // No author was found
        } else {
            res.redirect(`/authors/${author.id}`);// That way the form will be populated with the value of the user
        }
        
    }
});  

module.exports = router;