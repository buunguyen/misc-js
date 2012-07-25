(function ($) {
    var Category = Backbone.Model.extend({
        idAttribute: "_id",
        url: function () {
            return '/api/categories/' + (this.isNew() ? '' : this.get("name"))
        }
    })

    var CategoriesCollection = Backbone.Collection.extend({
        model: Category,
        url: '/api/categories/'
    })

    var Note = Backbone.Model.extend({
        idAttribute: "_id",
        url: function () {
            return '/api/categories/' + this.collection.categoryName + "/notes/" + (this.isNew() ? '' : this.id)
        },
        toJSON: function() {
            var json = Backbone.Model.prototype.toJSON.call(this)
            json.date = $.format.date(json.date, 'MM/dd')
            return json
        }
    })

    var NotesCollection = Backbone.Collection.extend({
        model: Note,
        initialize: function(models, options) {
            this.categoryName = options["categoryName"]
        },
        url: function () {
            return '/api/categories/' + this.categoryName + "/notes/"
        }
    })

    var ErrorView = Backbone.View.extend({
        el: "#error",
        initialize: function () {
            this.$el.fadeIn().fadeOut(3000)
        }
    })

    var MasterView = Backbone.View.extend({
        el: "#main",

        initialize: function () {
            this.render()
            _.bindAll(this, "reset", "add", "remove")
            this.collection.bind("reset", this.reset)
            this.collection.bind("add", this.add)
            this.collection.bind("remove", this.remove)
            this.collection.fetch()
        },

        reset: function () {
            var self = this
            var ul = this.$el.children("ul")
            this.collection.each(function (model) {
                var view = self.createDetailView(model)
                ul.append(view.render().el)
            })
            ul.hide().fadeIn();
        },

        createDetailView: function (model) {
            var self = this
            return new this.detailView({
                model: model,
                id: self.idPrefix + model.id,
                collection: self.collection
            })
        },

        add: function (model) {
            var view = this.createDetailView(model)
            this.$el.children("ul").append(view.render().$el.fadeIn())
        },

        remove: function (model) {
            this.$el.find("#" + this.idPrefix + model.id).hide('fast', function () {
                $(this).remove()
            })
        },

        render: function () {
            this.$el.empty()
            this.$el.append(new this.addView({collection: this.collection}).render().el)
            this.$el.append($("<ul></ul>"))
        }
    })

    var AddView = Backbone.View.extend({
        events: {
            "keypress": "keypress"
        },

        render: function () {
            this.$el.html("<input type='text' autofocus placeholder='" + this.placeholder + "'>")
            return this
        },

        keypress: function (e) {
            var self = this
            if (e.which !== 13) return
            var name = e.target.value
            if (!name.trim()) return
            this.collection.create(this.createModel(), {
                wait: true,
                success: function (model) {
                    self.collection.add(model)
                },
                error: function () {
                    new ErrorView()
                }
            })
            e.target.value = ""
        }
    })

    var AddCategoryView = AddView.extend({
        placeholder: "Enter new category",
        createModel: function () {
            return {name: this.$el.children("input").val()}
        }
    })

    var AddNoteView = AddView.extend({
        placeholder: "Enter new note",
        createModel: function () {
            return {note: this.$el.children("input").val()}
        }
    })

    var DetailView = Backbone.View.extend({
        tagName: "li",
        events: {
            "click .delete": "destroy",
            "click div": "showDetail"
        },

        showDetail: function() {
        },

        render: function () {
            var template = _.template(this.template)
            var json = this.model.toJSON()
            this.$el.html(template(json))
            return this
        },

        destroy: function () {
            var self = this
            this.model.destroy({
                success: function (model) {
                    self.collection.remove(model)
                },
                error: function () {
                    new ErrorView()
                }
            })
            return false
        }
    })

    var CategoryView = DetailView.extend({
        template: $("#category-row-template").html(),

        showDetail: function() {
            app.navigate("/" + this.model.get("name"), { trigger : true })
        }
    })

    var NoteView = DetailView.extend({
        template: $("#note-row-template").html()
    })
    
    var CategoriesView = MasterView.extend({
        idPrefix: "category-",
        addView: AddCategoryView,
        detailView: CategoryView
    })

    var NotesView = MasterView.extend({
        idPrefix: "note-",
        addView: AddNoteView,
        detailView: NoteView,
        render: function() {
            MasterView.prototype.render.call(this)
            this.$el.append ("<a href='#'>Back</a>")
        }
    })

    var App = Backbone.Router.extend({
        routes: {
            ":categoryName": "showNotes",
            "": "showCategories"
        },
        showNotes: function (categoryName) {
            new NotesView({collection: new NotesCollection({}, {categoryName: categoryName})})
        },
        showCategories: function () {
            new CategoriesView({collection: new CategoriesCollection()})
        }
    });
    var app = new App;
    Backbone.history.start();
})(jQuery)