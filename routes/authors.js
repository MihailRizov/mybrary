const express = require('express');
const router = express.Router();
const Author = require('../models/author');

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
        // res.redirect(`authors/${newlyCreatedAuthor.id}`);
        res.redirect(`authors`);
    } catch (error) {
        res.render('authors/new', { 
            author: newAuthor,
            errorMessage: 'Error creating new author'
        }); // That way the form will be populated with the value of the user
    }
});

module.exports = router;