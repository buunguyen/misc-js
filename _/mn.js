!function () {
    var previous = this.mn

    var mn = {}

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = mn
        }
        exports.mn = mn
    } else {
        this.mn = mn
    }

    mn.noConflict = function () {
        this.mn = previous
        return mn
    }

    var eventSplitter = /\s+/
    var events = {
        on: function (events, callback, context) {
            events = events.split(eventSplitter)
            var callbacks = this._callbacks = this._callbacks || []
            mn.each(events, function (event) {
                callbacks[event] = callbacks[event] || []
                callbacks[event].push(mn.thunk(context, callback))
            })
        },
        trigger: function (events) {
            events = events.split(eventSplitter)
            var self = this
            var callbacks = this._callbacks = this._callbacks || []
            var args = Array.prototype.slice.call(arguments, 1)
            mn.each(events, function (event) {
                mn.each(callbacks[event], function (callback) {
                    callback.apply(self, [event].concat(args))
                })
            })
        },
        forward: function (domElement, sourceEvents, targetEvents, func) {
            var self = this
            sourceEvents = sourceEvents.split(eventSplitter)
            targetEvents = targetEvents.split(eventSplitter)

            mn.each(sourceEvents, function (sourceEvent) {
                domElement.addEventListener(sourceEvent, function (e) {
                    mn.each(targetEvents, function (targetEvent) {
                        var args = func ? func(e) : e
                        if (args === mn.breaker) return
                        self.trigger.apply(self, [targetEvent].concat(mn.toArray(args)))
                    })
                })
            })
        }
    }

    mn.event = function(obj) {
        mn.extend(obj, events)
        return obj
    }

    mn.breaker = {}

    mn.save = function (name, value) {
        localStorage[name] = JSON.stringify(value)
    }

    mn.load = function (name, defaultValue) {
        var data = localStorage[name]
        return data ? JSON.parse(data) : (defaultValue || null)
    }

    mn.keys = function (obj, own) {
        var keys = []
        for (var key in obj)
            if (!own || obj.hasOwnProperty(key))
                keys.push(key)
        return keys
    }

    mn.uuid = function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4())
    }

    mn.each = function (collection, callback, context) {
        if (!collection) return
        for (var i = 0; i < collection.length; i++)
            if (callback.call(context, collection[i], i) === mn.breaker)
                return
    }

    mn.map = function (collection, callback, context) {
        var res = []
        mn.each(collection, function (element, index) {
            res.push(callback.call(context, element, index))
        })
        return res
    }

    mn.filter = function (collection, predicate, context) {
        var res = []
        mn.each(collection, function (obj, index) {
            if (predicate.call(context, obj, index)) res.push(obj)
        })
        return res
    }

    mn.first = function (collection, predicate, context) {
        var res
        mn.each(collection, function (obj, index) {
            if (predicate.call(context, obj, index)) {
                res = obj
                return mn.breaker
            }
        })
        return res
    }

    mn.thunk = function (context, func) {
        return function () {
            func.apply(context, arguments)
        }
    }

    mn.rand = function (min, max) {
        if (!min && !max)
            return Math.random()
        if (!max) {
            max = min
            min = 0
        }
        return min + Math.round(Math.random() * (max - min - 1))
    }

    mn.extend = function (target) {
        mn.each(Array.prototype.slice.call(arguments, 1), function (source) {
            for (var prop in source)
                target[prop] = source[prop]
        })
        return target
    }

    mn.toArray = function (obj) {
        if (!obj) return []
        if (mn.isArray(obj)) return obj
        if (mn.isArguments(obj)) return Array.prototype.slice.call(obj)
        return [obj]
    }

    mn.each(["Array", "Function", "String", "Number", "Date", "Arguments", "RegExp"], function (name) {
        mn["is" + name] = function (obj) {
            return obj && Object.prototype.toString.call(obj) === "[object " + name + "]"
        }
    })
}.call(this)