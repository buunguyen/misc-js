var express = require('express')

var app = express.createServer()
app.configure(function () {
    app.use(express.logger())
    app.use(express.bodyParser())
    app.use(express.methodOverride())
    app.use(express.static(__dirname + '/public/backbone/'))
    app.use(app.router)
})

app.configure('development', function () {
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}))
    app.dbUrl = 'mongodb://localhost:27017/notes'
    app.port = process.env.PORT || 5000
})

require('./lib/api')(app)

app.listen(app.port, function () {
    console.log("Listening on " + app.port)
})