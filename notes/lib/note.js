var mongoose = require('mongoose')

var noteSchema = new mongoose.Schema({
    categoryId: {type: mongoose.Schema.ObjectId, ref: "Category"},
    note: String,
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Note', noteSchema)