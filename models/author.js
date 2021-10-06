const mongoose = require('mongoose');
let Book;
if (mongoose.models.Book) {
    Book = mongoose.model('Book');
} else {
    Book = require('./book');
}

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

authorSchema.pre('remove', async function(next) {
    try {
        const books = await Book.find({ author: this.id });
        if (books.length > 0) {
            throw new Error('This author has books still');
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Author', authorSchema);