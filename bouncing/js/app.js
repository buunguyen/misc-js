!function (window) {
    var Ball = function (world, color, x, y, radiusAndMass /* lazy */, speed, degree, elasticity, friction) {
        this.world = world
        this.color = color
        this.radius = this.mass = radiusAndMass
        this.x = x
        this.y = y
        this.vx = speed * Math.cos(degree)
        this.vy = speed * Math.sin(degree)
        this.elasticity = elasticity
        this.friction = friction
    }

    Ball.prototype = {
        update: function (ctx, w, h) {
            this.move(w, h)
            this.draw(ctx)
        },
        move: function (w, h) {
            if (this.x < this.radius || this.x + this.radius > w) {
                this.x = this.x < this.radius ? this.radius : w - this.radius
                this.vx *= -1
            } 
            this.vx -= this.vx * this.friction
            this.x += this.vx

            if (this.y < this.radius || this.y + this.radius > h) {
                this.y = this.y < this.radius ? this.radius : h - this.radius
                this.vy *= -this.elasticity
            } 
            this.vy += this.world.gravity
            this.y += this.vy
        },
        draw: function (ctx) {
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
            ctx.closePath()
            ctx.fillStyle = this.color
            ctx.fill()
        }
    }

    var World = function (canvas) {
        var self = this
        this.canvas = canvas
        this.gravity = .3
        this.balls = []
        var colors = ['#2c3e50', '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c']
        var addBall = function (x, y) {
            self.balls.push(new Ball(
                self,
                colors[Math.round(Math.random() * colors.length)], 
                x, y,
                15 + Math.random() * 15, 
                5 + Math.random() * 25, 
                Math.random() * 360 * Math.PI / 180, 
                .6, 
                .008
            ))    
        }        
        this.canvas.addEventListener('mousedown', function (e) {
            addBall(e.x, e.y)
        })
    }

    World.prototype = {
        start: function () {
            var self = this;
            (function loop(){
                requestAnimationFrame(loop)
                self.update()
            })()
        },
        update: function () {
            var canvas = this.canvas
            var ctx = canvas.getContext('2d')
            ctx.globalAlpha = .2
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.globalAlpha = 1
            for (var i = 0; i < this.balls.length; i++)
                this.balls[i].update(ctx, canvas.width, canvas.height)
            for (var i = 0; i < this.balls.length; i++) 
                for (var j = 0; j < this.balls.length; j++) 
                    if (i !== j && this.hasCollision(this.balls[i], this.balls[j])) 
                        this.collides(this.balls[i], this.balls[j])
        },
        hasCollision: function (b1, b2) {
            var distance = Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2)
            return distance <= Math.pow(b1.radius + b2.radius, 2)
        },
        collides: function (b1, b2) {
            var dx = b1.x - b2.x
            var dy = b1.y - b2.y
            var collisionAngle = Math.atan2(dy, dx)
            var speed1 = Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy)
            var speed2 = Math.sqrt(b2.vx * b2.vx + b2.vy * b2.vy)
            var direction1 = Math.atan2(b1.vy, b1.vx)
            var direction2 = Math.atan2(b2.vy, b2.vx)
            var vx1 = speed1 * Math.cos(direction1 - collisionAngle)
            var vy1 = speed1 * Math.sin(direction1 - collisionAngle)
            var vx2 = speed2 * Math.cos(direction2 - collisionAngle)
            var vy2 = speed2 * Math.sin(direction2 - collisionAngle)
            var finalVx1 = ((b1.mass - b2.mass) * vx1 + (b2.mass + b2.mass) * vx2)/(b1.mass + b2.mass)
            var finalVx2 = ((b1.mass + b1.mass) * vx1 + (b2.mass - b1.mass) * vx2)/(b1.mass + b2.mass)
            var finalVy1 = vy1
            var finalVy2 = vy2
            b1.vx = Math.cos(collisionAngle) * finalVx1 + Math.cos(collisionAngle + Math.PI/2) * finalVy1
            b1.vy = Math.sin(collisionAngle) * finalVx1 + Math.sin(collisionAngle + Math.PI/2) * finalVy1
            b2.vx = Math.cos(collisionAngle) * finalVx2 + Math.cos(collisionAngle + Math.PI/2) * finalVy2
            b2.vy = Math.sin(collisionAngle) * finalVx2 + Math.sin(collisionAngle + Math.PI/2) * finalVy2
            b1.x = (b1.x += b1.vx)
            b1.y = (b1.y += b1.vy)
            b2.x = (b2.x += b2.vx)
            b2.y = (b2.y += b2.vy)
        }
    }

    window.addEventListener('load', function () {
        var canvas = window.document.createElement('canvas')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        window.document.body.appendChild(canvas)
        new World(canvas).start()
    })
}(window)