module.exports = function (app) {
    require('mongoose').connect(app.dbUrl)

    var Category = require('./category')
    var Note = require('./note')

    app.get('/api/categories/', function (req, res, next) {
        Category.find({}, function (err, categories) {
            if (err) next(err)
            else res.send(categories)
        })
    })

    app.post('/api/categories/', function (req, res, next) {
        var category = new Category()
        category.name = req.body.name
        category.save(function (err) {
            if (err) next(err)
            else res.send(category)
        })
    })

    var loadCategory = function (req, res, next) {
        Category.findOne({name: req.params.name}, function (err, category) {
            if (err) next(error)
            else if (!category) res.send('Category not found!', 404)
            else {
                req.category = category
                next()
            }
        })
    }

    app.del('/api/categories/:name', loadCategory, function (req, res, next) {
        Category.findOne({name: req.params.name}).remove(function (err) {
            if (err) next(err)
            else res.end()
        })
    })

    app.get('/api/categories/:name/notes', loadCategory, function (req, res, next) {
        Note.find({categoryId: req.category._id}, function (err, notes) {
            if (err) next(err)
            else res.send(notes)
        })
    })

    app.post('/api/categories/:name/notes', loadCategory, function (req, res, next) {
        var note = new Note()
        note.categoryId = req.category._id
        note.note = req.body.note
        note.save(function (err) {
            if (err) next(err)
            else res.send(note)
        })

    })

    app.del('/api/categories/:name/notes/:id', function (req, res, next) {
        Note.findOne({_id: req.params.id}).remove(function (err) {
            if (err) next(err)
            else res.end()
        })
    })

    app.get('/favicon.ico', function (req, res) {
        res.send(null, { 'Content-Type': 'text/plain' }, 200)
    })

    app.get('*', function (req, res) {
        res.send('Oops, not found!', 404)
    })
}