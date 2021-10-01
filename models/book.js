const mongoose = require('mongoose');
const path = require('path');
const coverImageBasePath = 'uploads/bookCovers'

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // referencing another object inside our collection 
        ref: 'Author', // this is what we are referencing
        required: true
    }
});

bookSchema.virtual('coverImagePath') // Virtual property that will get its value from other props
.get(function () { // this.should be normal function in order to heave access to the book properties
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
}) // this function is executed when call book.coverImagePath

module.exports = mongoose.model('Book', bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;