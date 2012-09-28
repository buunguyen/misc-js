!function (window) {
    var Circle = function (pos, dir, color, radius) {
        this.pos = pos
        this.dir = dir
        this.color = color
        this.radius = radius
        this.lastPos = []
    }

    Circle.prototype = {
        render: function(w, h, ctx) {
            this.move(w, h)
            ctx.globalAlpha = 1
            this.draw(ctx, this.lastPos[0], this.radius)

            ctx.globalAlpha = 0.4
            for (var i = 1; i < this.lastPos.length; i++) {
                ctx.globalAlpha -= .05
                this.draw(ctx, this.lastPos[i], this.radius - i * .05)
            }
        },
        move: function (w, h) {
            if (this.lastPos.length == 10)
                this.lastPos.pop()

            this.pos.x += this.dir.x
            if (this.pos.x - this.radius < 0) {
                this.pos.x = this.radius
                this.dir.x = -this.dir.x
            } else if (this.pos.x + this.radius > w) {
                this.pos.x = w - this.radius
                this.dir.x = -this.dir.x
            }

            this.pos.y += this.dir.y
            if (this.pos.y - this.radius < 0) {
                this.pos.y = this.radius
                this.dir.y = -this.dir.y
            } else if (this.pos.y + this.radius > h) {
                this.pos.y = h - this.radius
                this.dir.y = -this.dir.y
            }

            this.lastPos.unshift({x: this.pos.x, y: this.pos.y})
        },
        draw: function (ctx, pos, radius) {
            ctx.save();
            ctx.translate(pos.x, pos.y)
            ctx.beginPath()
            ctx.arc(0, 0, radius, 0, Math.PI * 2, false)
            ctx.closePath()
            ctx.fillStyle = this.color
            ctx.fill()
            ctx.restore()
        }
    }

    var Scene = function (canvas, numberOfCircles) {
        this.canvas = canvas
        this.numberOfCircles = numberOfCircles || 5
        this.circles = []
        this.canvas.addEventListener('webkitAnimationEnd', function () {
            this.style.webkitAnimationName = ''
        })
        var startPos
        this.canvas.addEventListener("mousedown", function (e) {
            startPos = { x: e.x, y: e.y }
        })
        this.canvas.addEventListener("mouseup", mn.thunk(this, function(e) {
            this.addCircle({ x: e.x, y: e.y },
                           { x: (startPos.x - e.x) / 20, y: (startPos.y - e.y) / 20 })
        }))
    }

    Scene.prototype = {
        start: function () {
            for (var i = 0; i < this.numberOfCircles; i++) {
                this.addCircle()
            }

            var self = this;
            (function loop(){
                requestAnimationFrame(loop)
                self.render()
            })()

            return this
        },
        addCircle: function (pos, dir, color, radius) {
            if (!dir || (!dir.x && !dir.y))
                dir = {
                    x: (mn.rand() > 0.5 ? 1 : -1) * mn.rand(1, 10),
                    y: (mn.rand() > 0.5 ? 1 : -1) * mn.rand(1, 10)
                }
            dir = { x: Math.min(dir.x, 10), y: Math.min(dir.y, 10) }
            var circle = new Circle(
                pos || utils.randPos(this.canvas.width, this.canvas.height),
                dir,
                color || utils.randColor(),
                radius || utils.randRadius())
            this.circles.push(circle)
        },
        render: function () {
            var canvas = this.canvas
            var ctx = canvas.getContext("2d")

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            mn.each(this.circles, function (circle) {
                circle.render(canvas.width, canvas.height, ctx)
            }, this)

            if (mn.rand(0, 100) === 0) this.canvas.style.webkitAnimationName = 'blur'
        }
    }

    var utils = {
        randPos: function (w, h) {
            return { x: mn.rand(w), y: mn.rand(h) }
        },

        colors: [ '#CC5C54', '#F69162', '#FFFFCD', '#ff454f', '#85A562', '#7AB5DB' ],
        randColor: function () {
            return this.colors[mn.rand(this.colors.length)]
        },

        randRadius: function () {
            return mn.rand(20) + 20
        }
    }

    window.addEventListener("load", function () {
        var doc, canvas, frame, div, startPos

        doc = window.document

        canvas = doc.createElement("canvas")
        new Scene(canvas).start()

        div = doc.createElement("div")
        div.appendChild(canvas)
        div.style.minWidth = div.style.minHeight = "100%"
        doc.body.appendChild(div)

        canvas.width = div.offsetWidth
        canvas.height = div.offsetHeight
    })
}(window)