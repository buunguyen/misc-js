var mongoose = require('mongoose')

var categorySchema = new mongoose.Schema({
    name: {type: String, index: {unique: true, dropDups: true}}
})

module.exports = mongoose.model('Category', categorySchema)