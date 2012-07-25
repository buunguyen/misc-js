(function ($) {
    var handleError = function () {
        $('#error').fadeIn().fadeOut(3000)
    }

    var format = function (str) {
        var replaces = Array.prototype.slice.call(arguments, 1)
        $.each(replaces, function (index, replace) {
            str = str.replace(new RegExp("{" + index + "?}", "g"), replace)
        })
        return str
    }

    var populateList = function (list, url, getElementHtml) {
        $.getJSON(url,function (data) {
            var items = []
            $.each(data, function (index, item) {
                items.push(getElementHtml(item))
            })
            list.html(items.join('')).hide().fadeIn()
        }).error(handleError)
    }

    var bindDelete = function (list, getUrl) {
        list.on('click', '.delete', function (e) {
            e.preventDefault()
            e.stopPropagation()
            var li = $(this).parents('li')
            $.ajax({
                url: getUrl(li), type: 'DELETE',
                success: function () {
                    li.hide('fast', function () {
                        li.remove()
                    })
                },
                error: handleError
            })
        })
    }

    var bindAdd = function (list, txt, url, getOptions, getElementHtml) {
        txt.keypress(function (e) {
            if (e.which !== 13 || !txt.val()) return
            e.preventDefault()
            $.post(url, getOptions(),
                function (item) {
                    $(getElementHtml.call(this, item)).hide().appendTo(list).fadeIn()
                }
            ).error(handleError)
            txt.val('')
        })
    }

    var app = $.sammy(function () {
        this.get('/#:category', function (context) {
            var categoryName = this.params.category
            var main = $('#main').html('')
            var txtAdd = $('<input type="text" placeholder="Enter new note" autofocus />').appendTo(main)
            var lstItems = $('<ul id="list-note"></ul>').appendTo(main)
            var getElementHtml = function (note) {
                var template =
                    '<li id="note-{0}">' +
                    '   <div>' +
                    '       <span class="text">{1}</span>' +
                    '       <span class="date">{2}</span>' +
                    '       <button class="delete"></button>' +
                    '   </div>' +
                    '</li>'
                return format(template, note._id, note.note, $.format.date(note.date, 'MM/dd'))
            }

            populateList(lstItems, '/api/categories/' + categoryName + '/notes/', getElementHtml)

            bindAdd(lstItems, txtAdd, '/api/categories/' + categoryName + '/notes/',
                function () { return { note: txtAdd.val() } },
                getElementHtml)

            bindDelete(lstItems, function (li) {
                return '/api/categories/' + categoryName + '/notes/' + li.attr('id').substring('note-'.length)
            })

            var lnkBack = $('<a href="/#">Back</a>')
            main.append(lnkBack)
        })

        this.get('', function (context) {
            var main = $('#main').html('')
            var txtAdd = $('<input type="text" placeholder="Enter new category" autofocus />').appendTo(main)
            var lstItems = $('<ul id="list-category"></ul>').appendTo(main)
            var getElementHtml = function (category) {
                var template =
                    '<li id="category-{0}">' +
                    '   <div>' +
                    '       <span class="text">{0}</span>' +
                    '       <button class="delete"></button>' +
                    '   </div>' +
                    '</li>'
                return format(template, category.name)
            }

            populateList(lstItems, '/api/categories/', getElementHtml)

            bindAdd(lstItems, txtAdd, '/api/categories/',
                function () { return {name: txtAdd.val()} },
                getElementHtml
            )

            bindDelete(lstItems, function (li) {
                return '/api/categories/' + li.attr('id').substring('category-'.length)
            })

            $('#list-category').on('click', 'li', function () {
                context.redirect('/#' + $(this).attr('id').substring('category-'.length))
            })
        })

    })
    $(function () {
        app.run()
    })
})(jQuery)