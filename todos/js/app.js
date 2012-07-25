(function (window) {
    var Statistics = function (total, done) {
        this.total = total
        this.done = done
        this.remained = total - done
    }

    var Todo = function (text) {
        this.id = mn.uuid()
        this.text = text
        this.done = false
    }

    var controller = {
        initialized: function () {
            this._todos = mn.load("todos", [])
            this.trigger("modelLoaded", this._todos, this._statistics())
        },
        _statistics: function () {
            var total = this._todos.length
            var done = mn.filter(this._todos,function (todo) {
                return todo.done
            }).length
            return new Statistics(total, done)
        },
        _modelChanged: function () {
            mn.save("todos", this._todos)
            this.trigger("modelChanged", this._todos, this._statistics())
        },
        add: function (text) {
            text = text.trim()
            if (text) {
                this._todos.push(new Todo(text))
                this._modelChanged()
            }
        },
        update: function (id, text) {
            text = text.trim()
            mn.each(this._todos, function (todo, index) {
                if (todo.id === id) {
                    if (text) todo.text = text
                    else this._todos.splice(index, 1)
                    this._modelChanged()
                    return mn.breaker
                }
            }, this)
        },
        destroy: function (id) {
            mn.each(this._todos, function (todo, index) {
                if (todo.id === id) {
                    this._todos.splice(index, 1)
                    this._modelChanged()
                    return mn.breaker
                }
            }, this)
        },
        setDone: function (id, done) {
            var all = id === undefined
            mn.each(this._todos, function (todo) {
                if (all || todo.id === id) {
                    todo.done = done
                    this._modelChanged()
                    if (!all) return mn.breaker
                }
            }, this)
        },
        clearDone: function () {
            for (var i = this._todos.length - 1; i >= 0; i--)
                if (this._todos[i].done)
                    this._todos.splice(i, 1)
            this._modelChanged()
        }
    }

    var view = {
        initialize: function () {
            this._divMain = document.getElementById("main")
            this._divFooter = document.getElementById("footer")
            this._txtNewTodo = document.getElementById("new-todo")
            this._lstTodos = document.getElementById("todo-list")
            this._chkToggleAll = document.getElementById("toggle-all")
            this._lblTodoCount = document.getElementById("todo-count")
            this._btnClear = document.getElementById("clear-completed")
            this._setupHandlers()
        },

        _setupHandlers: function () {
            var self = this
            this.forward(this._txtNewTodo, "keypress", "add", function (e) {
                if (e.keyCode !== 13) return mn.breaker
                var text = self._txtNewTodo.value
                self._txtNewTodo.value = ""
                return text
            })
            this.forward(this._chkToggleAll, "change", "done", function (e) {
                return [undefined, e.target.checked]
            })
            this.forward(this._btnClear, "click", "clearDone")
        },

        _renderStatistics: function (statistics) {
            var lblCount, remainedString

            this._divFooter.style.display = statistics.total ? "block" : "none"
            if (statistics.total === 0) return

            lblCount = document.createElement("strong")
            lblCount.innerHTML = statistics.remained
            remainedString = statistics.remained === 1 ? " item left" : " items left"

            this._lblTodoCount.innerHTML = ""
            this._lblTodoCount.appendChild(lblCount)
            this._lblTodoCount.appendChild(document.createTextNode(remainedString))

            this._btnClear.style.visibility = statistics.done ? "visible" : "hidden"
            this._btnClear.innerHTML = "Clear completed (" + statistics.done + ")"

            this._chkToggleAll.checked = statistics.total === statistics.done
        },

        _renderTodos: function (todos) {
            var chkToggle, lblText, btnDestroy, divView, txtEdit, li, todos, self

            self = this
            this._lstTodos.innerHTML = ""
            this._divMain.style.display = todos.length ? "block" : "none"

            mn.each(todos, function (todo) {
                chkToggle = document.createElement("input")
                chkToggle.type = "checkbox"
                chkToggle.className = "toggle"
                if (todo.done)
                    chkToggle.checked = true

                self.forward(chkToggle, "change", "done", function (e) {
                    return [todo.id, e.target.checked]
                })

                lblText = document.createElement("label")
                lblText.innerText = todo.text

                btnDestroy = document.createElement("button")
                btnDestroy.className = "destroy"
                self.forward(btnDestroy, "click", "destroy", function () {
                    return todo.id
                })

                divView = document.createElement("div")
                divView.className = "view"
                divView.addEventListener("dblclick", function () {
                    var li = document.getElementById("li_" + todo.id)
                    li.className = "editing"
                    document.getElementById("txt_" + todo.id).focus()
                })

                divView.appendChild(chkToggle)
                divView.appendChild(lblText)
                divView.appendChild(btnDestroy)

                var update = function (e) {
                    if (e.keyCode && e.keyCode != 13) return
                    self.trigger("update", todo.id, e.target.value)
                }
                txtEdit = document.createElement("input")
                txtEdit.id = "txt_" + todo.id
                txtEdit.className = "edit"
                txtEdit.addEventListener("keypress", update)
                txtEdit.addEventListener("blur", update)
                txtEdit.value = todo.text

                li = document.createElement("li")
                li.id = "li_" + todo.id
                if (todo.done)
                    li.className = "completed"

                li.appendChild(divView)
                li.appendChild(txtEdit)
                this._lstTodos.appendChild(li)
            }, this)
        },

        render: function (todos, statistics) {
            this._renderTodos(todos)
            this._renderStatistics(statistics)
        }
    }

    window.addEventListener("load", function () {
        mn.each([controller, view], function (object) {
            mn.event(object)
            if (mn.isFunction(object.initialize))
                object.initialize()
        })

        controller.on("modelLoaded modelChanged", function (eventName, todos, statistics) {
            view.render(todos, statistics)
        })

        view.on("add", function (eventName, text) {
            controller.add(text)
        })

        view.on("update", function (eventName, id, text) {
            controller.update(id, text)
        })

        view.on("destroy", function (eventName, id) {
            controller.destroy(id)
        })

        view.on("done", function (eventName, id, done) {
            controller.setDone(id, done)
        })

        view.on("clearDone", function () {
            controller.clearDone()
        })

        mn.each([controller, view], function (object) {
            if (mn.isFunction(object.initialized))
                object.initialized()
        })
    })
})(window)