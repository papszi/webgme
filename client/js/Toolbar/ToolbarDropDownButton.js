/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * Author: Robert Kereskenyi
 */

"use strict";

define(['./ButtonBase',
        'js/Controls/iCheckBox',
        './ToolbarItemBase'], function (buttonBase,
                                            iCheckBox,
                                            ToolbarItemBase) {

    var ToolbarDropDownButton,
        EL_BASE = $('<div/>', {"class": "btn-group"}),
        CARET_BASE = $('<span class="caret"></span>'),
        UL_BASE = $('<ul class="dropdown-menu"></ul>'),
        DIVIDER_BASE = $('<li class="divider"></li>'),
        CHK_LI_BASE = $('<li/>', {'class': 'chkbox'}),
        CHK_LI_A_BASE = $('<a href="#"></a>'),
        LI_BASE = $('<li></li>');

    ToolbarDropDownButton = function (params) {
        this.el = EL_BASE.clone();

        var oClickFn;
        if (params.clickFn) {
            oClickFn = params.clickFn;
            params.clickFnEventCancel = false;

            params.clickFn = function () {
                oClickFn();
            };
        }
        //delete params.clickFn;

        this._dropDownBtn = buttonBase.createButton(params);
        var caret = CARET_BASE.clone();

        this._ulMenu = UL_BASE.clone();

        if (params && params.menuClass) {
            this._ulMenu.addClass(params.menuClass);
        }

        this._dropDownBtn.append(' ').append(caret);

        this._dropDownBtn.addClass("dropdown-toggle");
        this._dropDownBtn.attr('data-toggle', "dropdown");

        this.el.append(this._dropDownBtn).append(this._ulMenu);
    };

    _.extend(ToolbarDropDownButton.prototype, ToolbarItemBase.prototype);

    ToolbarDropDownButton.prototype.clear = function () {
        this._ulMenu.empty();
    };

    ToolbarDropDownButton.prototype.enabled = function (enabled) {
        if (enabled === true) {
            this.el.find('.btn').disable(false);
        } else {
            this.el.find('.btn').disable(true);
        }
    };

    ToolbarDropDownButton.prototype.addButton = function (params) {
        var btn,
            oclickFn,
            li = LI_BASE.clone(),
            dropDownBtn = this._dropDownBtn;

        if (params.clickFn) {
            oclickFn = params.clickFn;
            params.clickFn = function (data) {
                dropDownBtn.dropdown('toggle');
                oclickFn(data);
            }
        }

        btn = buttonBase.createButton(params);

        li.append(btn.removeClass("btn btn-mini"));

        this._ulMenu.append(li);
    };

    ToolbarDropDownButton.prototype.addDivider = function () {
        var divider = DIVIDER_BASE.clone();

        this._ulMenu.append(divider);
    };

    ToolbarDropDownButton.prototype.addCheckBox = function (params) {
        var chkLi = CHK_LI_BASE.clone(),
            a = CHK_LI_A_BASE.clone(),
            checkBox;

        if (params.text) {
            a.append(params.text);
        }

        checkBox = new iCheckBox(params);
        checkBox.el.addClass('pull-right');
        a.append(checkBox.el);

        chkLi.append(a);

        chkLi.on('click', function (event) {
            checkBox.toggleChecked();
            event.stopPropagation();
            event.preventDefault();
        });

        this._ulMenu.append(chkLi);

        chkLi.setEnabled = function (enabled) {
            if (enabled) {
                chkLi.disable(false);
            } else {
                chkLi.disable(true);
            }

            checkBox.setEnabled(enabled);
        };

        chkLi.setChecked = function (checked) {
            checkBox.setChecked(checked);
        };

        return chkLi;
    };

    ToolbarDropDownButton.prototype.destroy = function () {
        this.el.remove();
        this.el.empty();
        this.el = undefined;
    };

    return ToolbarDropDownButton;
});