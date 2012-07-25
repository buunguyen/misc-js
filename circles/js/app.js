(function (window) {
    var Point = function (x, y) {
        this.x = x
        this.y = y
    }

    var Circle = function (pos, dir, color, radius) {
        this.pos = pos
        this.dir = dir
        this.color = color
        this.radius = radius
    }

    Circle.prototype.move = function (speed, w, h) {
        this.pos.x += this.dir.x * speed
        if (this.pos.x < 0) {
            this.pos.x = 0
            this.dir.x = -this.dir.x
        } else if ((this.pos.x + this.radius * 2) > w) {
            this.pos.x = w - this.radius * 2
            this.dir.x = -this.dir.x
        }

        this.pos.y += this.dir.y * speed
        if (this.pos.y < 0) {
            this.pos.y = 0
            this.dir.y = -this.dir.y
        } else if ((this.pos.y + this.radius * 2) > h) {
            this.pos.y = h - this.radius * 2
            this.dir.y = -this.dir.y
        }
    }

    Circle.prototype.draw = function (context) {
        context.beginPath()
        context.arc(this.pos.x + this.radius,
            this.pos.y + this.radius,
            this.radius,
            0,
            utils.degreesToRadians(360), true)
        context.fillStyle = this.color
        context.fill()
    }

    var Frame = function (canvas, numberOfCircles) {
        this.canvas = canvas
        this.speed = 1
        this.numberOfCircles = numberOfCircles || 5
        this.circles = []
    }

    Frame.prototype.start = function () {
        for (var i = 0; i < this.numberOfCircles; i++) {
            this.addCircle()
        }
        var self = this
        setInterval(function () {
            self.render()
        }, 25)
        return this
    }

    Frame.prototype.speedUp = function () {
        this.speed++
    }

    Frame.prototype.addCircle = function () {
        var circle = new Circle(utils.randPos(this.canvas.width, this.canvas.height),
            utils.randDir(),
            utils.randColor(),
            utils.randRadius())
        this.circles.push(circle)
    }

    Frame.prototype.render = function () {
        var canvas = this.canvas
        var context = canvas.getContext("2d")

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.strokeStyle = '#000000'
        context.strokeRect(0, 0, canvas.width, canvas.height)

        mn.each(this.circles, function(circle) {
            circle.move(this.speed, canvas.width, canvas.height)
            circle.draw(context)
        }, this)
    }

    var utils = {
        degreesToRadians: function (degrees) {
            return (degrees * Math.PI) / 180
        },

        randDir: function () {
            return new Point((Math.random() > 0.5 ? 1 : -1) * mn.rand(),
                (mn.rand() > 0.5 ? 1 : -1) * mn.rand())
        },

        randPos: function (w, h) {
            return new Point(mn.rand(w), mn.rand(h))
        },

        randColor: function () {
            var letters = '0123456789ABCDEF'.split('')
            var color = '#'
            for (var i = 0; i < 6; i++) {
                color += letters[mn.rand(15)]
            }
            return color
        },

        randRadius: function () {
            return mn.rand(5) + 5
        }
    }

    window.addEventListener("load", function () {
        var doc = window.document
        var canvases = doc.getElementsByClassName("circles")
        var frames = mn.map(Array.prototype.slice.call(canvases), function (canvas) {
            return new Frame(canvas).start()
        })

        doc.getElementById("btnAddSpeed").addEventListener("click", function () {
            mn.each(frames, function (f) {
                f.speedUp()
            })
        })

        doc.getElementById("btnAddBall").addEventListener("click", function () {
            mn.each(frames, function (f) {
                f.addCircle()
            })
        })
    })
})(window)