/*globals define, Raphael, window, WebGMEGlobal*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 * @author nabana / https://github.com/nabana
 */

define(['jquery',
    'css!./styles/ContextMenu'], function () {

    "use strict";

    var ContextMenu,
        ID_MENU = 'context-menu',
        ID_LAYER = 'context-menu-layer',
        DOM_BASE = $('<div id="' + ID_MENU + '"><div class="dropdown"><ul class="dropdown-menu"></ul></div></div>'),
        BACKGROUND_DOM_BASE = $('<div id="' + ID_LAYER + '"></div>'),
        body = $('body'),
        LI_BASE = $('<li><a tabindex="-1" href="#"></a></li>'),
        DATA_KEY = 'key';

    ContextMenu = function (params) {
        this._menuDiv = DOM_BASE.clone();
        this._backgroundDiv = BACKGROUND_DOM_BASE.clone();
        this._menuUL = this._menuDiv.find('ul').first();

        if (params && params.hasOwnProperty("items")) {
            this.createMenu(params.items);
        }

        if (params && params.callback) {
            this._callback = params.callback;
        }
    };

    ContextMenu.prototype.show = function (position) {
        var self = this,
            callback = this._callback;

        this.hide();

        body.append(this._backgroundDiv).append(this._menuDiv);

        if (!position) {
            position = {'x': 100, 'y': 100};
        }

        this._menuDiv.css({
            display: "block",
            left: position.x,
            top: position.y
        });

        if (callback) {
            this._menuUL.off('click');
            this._menuUL.on('click', 'li', function (event) {
                var key = $(this).data(DATA_KEY);
                event.stopPropagation();
                event.preventDefault();
                self.hide();
                callback(key);
            });
        }

        this._backgroundDiv.off('mousedown');
        this._backgroundDiv.on('mousedown', function (event) {
            event.stopPropagation();
            event.preventDefault();
            self.hide();
        });
    };

    ContextMenu.prototype.createMenu = function (items) {
        var li,
            icon;

        this._menuUL.empty();

        for (var i in items) {
            if (items.hasOwnProperty(i)) {
                li = LI_BASE.clone();
                li.data(DATA_KEY, i);
                li.find('a').text(items[i].name);
                if (items[i].icon) {
                    li.find('a').prepend(' ');
                    if (typeof items[i].icon === 'string') {
                        icon = $('<i/>', {'class': items[i].icon });
                        li.find('a').prepend(icon);
                    } else {
                        li.find('a').prepend($(items[i].icon));
                    }
                }
                this._menuUL.append(li);
            }
        }
    };

    ContextMenu.prototype.destroy = function () {
        this.hide();
        this._menuUL.empty();
    };

    ContextMenu.prototype.hide = function () {
        this._backgroundDiv.detach();
        this._menuDiv.detach();
    };

    return ContextMenu;
});