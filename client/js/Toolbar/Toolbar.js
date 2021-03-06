/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * Author: Robert Kereskenyi
 */

"use strict";

define(['logManager',
    './ToolbarButton',
    './ToolbarSeparator',
    './ToolbarRadioButtonGroup',
    './ToolbarToggleButton',
    './ToolbarTextBox',
    './ToolbarLabel',
    './ToolbarCheckBox',
    './ToolbarDropDownButton',
    './ToolbarColorPicker',
    'css!/css/Toolbar/Toolbar'], function (logManager,
                                           ToolbarButton,
                                           ToolbarSeparator,
                                           ToolbarRadioButtonGroup,
                                           ToolbarToggleButton,
                                           ToolbarTextBox,
                                           ToolbarLabel,
                                           ToolbarCheckBox,
                                           ToolbarDropDownButton,
                                           ToolbarColorPicker) {

    var _toolBar,
        TOOLBAR_CLASS = 'webgme-toolbar',
        TOOLBAR_EXT_CLASS = 'webgme-toolbar-ext',
        TOOLBAR_EXT_CLASS_SHOWN_CLASS = 'shown',
        TOOLBAR_EXT_TOGGLE_CLASS = 'webgme-toolbar-ext-toggle',
        MARGIN_RIGHT = 10;  //the toggle button's width plus extar 3 px padding

    var _createToolbar = function (el) {
        if (!_toolBar) {
            _toolBar = new Toolbar(el);
        }

        //hook up window resize event to do layout refresh
        $(window).on('resize', function (/*event*/) {
           _toolBar._updateLayout.call(_toolBar);
        });

        return _toolBar;
    };

    var Toolbar = function (el) {
        var self = this;

        this._el = $('<div/>', {'class': TOOLBAR_CLASS});

        this._toolbarExt = $('<div/>', {'class': TOOLBAR_EXT_CLASS});

        this._toolbarExtToggleBtn = $('<div class="' + TOOLBAR_EXT_TOGGLE_CLASS + '"><i class="icon-chevron-down"/><i class="icon-chevron-down"/></div>');

        this._toolbarExtToggleBtn.on('click', function (event) {
            self._toolbarExt.toggleClass(TOOLBAR_EXT_CLASS_SHOWN_CLASS);
            event.stopPropagation();
            event.preventDefault();
        });

        this._logger = logManager.create("Toolbar");

        el.append(this._el).append(this._toolbarExt);
    };

    Toolbar.prototype.add = function (toolbarItem) {
        if (toolbarItem.el) {
            this._el.append(toolbarItem.el);
            toolbarItem._toolbar = this;
        } else {
            this._logger.error('The given toolbarItem does not have an "el" to append to the toolbar...');
        }
    };

    Toolbar.prototype.addButton = function (params) {
        var btn = new ToolbarButton(params);
        this.add(btn);
        return btn;
    };

    Toolbar.prototype.addSeparator = function () {
        var separator = new ToolbarSeparator();
        this.add(separator);
        return separator;
    };

    Toolbar.prototype.addRadioButtonGroup = function (clickFn) {
        var tbg = new ToolbarRadioButtonGroup(clickFn);
        this.add(tbg);
        return tbg;
    };

    Toolbar.prototype.addToggleButton = function (params) {
        var tbg = new ToolbarToggleButton(params);
        this.add(tbg);
        return tbg;
    };

    Toolbar.prototype.addTextBox = function (params) {
        var txt = new ToolbarTextBox(params);
        this.add(txt);
        return txt;
    };

    Toolbar.prototype.addLabel = function () {
        var lbl = new ToolbarLabel();
        this.add(lbl);
        return lbl;
    };

    Toolbar.prototype.addCheckBox = function (params) {
        var chb = new ToolbarCheckBox(params);
        this.add(chb);
        return chb;
    };

    Toolbar.prototype.addDropDownButton = function (params) {
        var btn = new ToolbarDropDownButton(params);
        this.add(btn);
        return btn;
    };

    Toolbar.prototype.addColorPicker = function (params) {
        var btn = new ToolbarColorPicker(params);
        this.add(btn);
        return btn;
    };

    Toolbar.prototype.refresh = function () {
        this._updateLayout();
    };

    Toolbar.prototype._updateLayout = function () {
        var width = this._el.width(),
            toolbarItems,
            len,
            i,
            overflow = false;

        if (width > 0) {
            this._logger.debug('_updateLayout: ' + width);

            //put everyone back to the normal toolbar container
            this._toolbarExt.children().appendTo(this._el);
            this._toolbarExt.removeClass(TOOLBAR_EXT_CLASS_SHOWN_CLASS);

            //remove toolbar extension's show/hide button
            this._toolbarExtToggleBtn.detach();

            //iterate through the children and find the first one who does not fit
            toolbarItems = this._el.children();
            len = toolbarItems.length;

            for (i = 0; i < len; i += 1) {
                var ti = $(toolbarItems[i]);
                if (ti.offset().left + ti.width() > width - MARGIN_RIGHT) {
                    overflow = true;
                    break;
                }
            }

            //if too many items, relocate the remaining to the extension area
            if (overflow) {
                this._toolbarExtToggleBtn.insertBefore(this._toolbarExt);
                for (; i < len; i += 1) {
                    $(toolbarItems[i]).appendTo(this._toolbarExt);
                }
            }
        }
    };

    return { createToolbar: _createToolbar };
});