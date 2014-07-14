/*globals define, _*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


"use strict";

define(['clientUtil',
    'text!./templates/ConstraintDetailsDialog.html',
    'codemirror',
    'css!./styles/ConstraintDetailsDialog.css'], function ( util,
                                                 constraintDetailsDialogTemplate,
                                                 CodeMirror) {

    var ConstraintDetailsDialog;

    ConstraintDetailsDialog = function () {

    };

    ConstraintDetailsDialog.prototype.show = function (constraintDesc, constraintNames, saveCallBack, deleteCallBack) {
        var self = this;

        this._initDialog(constraintDesc, constraintNames, saveCallBack, deleteCallBack);

        this._dialog.modal('show');

        this._dialog.on('shown.bs.modal', function () {
            self._codeMirror.refresh();
            self._inputName.focus().trigger('keyup');
        });

        this._dialog.on('hidden.bs.modal', function () {
            self._dialog.remove();
            self._dialog.empty();
            self._dialog = undefined;
        });
    };

    ConstraintDetailsDialog.prototype._initDialog = function (constraintDesc, constraintNames, saveCallBack, deleteCallBack) {
        var self = this,
            closeSave,
            closeDelete,
            isValidConstraintName;

        closeSave = function () {
            var constDesc = {'name': self._inputName.val(),
                            'script': self._codeMirror.getValue(),
                            'priority': self._inputPriority.val(),
                            'message': self._inputMessage.val()};

            self._dialog.modal('hide');

            if (saveCallBack) {
                saveCallBack.call(self, constDesc);
            }
        };

        closeDelete = function () {
            self._dialog.modal('hide');

            if (deleteCallBack) {
                deleteCallBack.call(self);
            }
        };

        isValidConstraintName = function (name) {
            return !(name === "" || constraintNames.indexOf(name) !== -1);
        };

        this._dialog = $(constraintDetailsDialogTemplate);

        //get controls
        this._el = this._dialog.find('.modal-body').first();

        this._btnSave = this._dialog.find('.btn-save').first();
        this._btnDelete = this._dialog.find('.btn-delete').first();

        this._pName = this._el.find('#pName').first();
        this._pScript = this._el.find('#pScript').first();
        this._scriptEditor = this._pScript.find('div.controls').first();

        this._inputName = this._el.find('#inputName').first();
        this._inputPriority = this._el.find('#inputPriority').first();
        this._inputMessage = this._el.find('#inputMessage').first();

        //hook up event handlers
        //key-up in name textbox
        this._inputName.on('keyup', function () {
            var val = self._inputName.val();

            if (!isValidConstraintName(val)) {
                self._pName.addClass("error");
                self._btnSave.disable(true);
            } else {
                self._pName.removeClass("error");
                self._btnSave.disable(false);
            }
        });

        //check for ENTER in name textbox
        this._inputName.on('keydown', function (event) {
            var enterPressed = event.which === 13,
                val = self._inputName.val();

            if (enterPressed && isValidConstraintName(val)) {
                closeSave();

                event.stopPropagation();
                event.preventDefault();
            }
        });

        //click on SAVE button
        this._btnSave.on('click', function (event) {
            var val = self._codeMirror.getValue();

            event.stopPropagation();
            event.preventDefault();

            if (isValidConstraintName(val)) {
                closeSave();
            }
        });

        //click on DELETE button
        if (deleteCallBack) {
            this._btnDelete.on('click', function (event) {
                event.stopPropagation();
                event.preventDefault();

                closeDelete();
            });
        } else {
            this._btnDelete.remove();
        }


        //fill controls based on the currently edited constraint
        this._inputName.val(constraintDesc.name).focus();
        this._inputPriority.val(constraintDesc.priority);
        this._inputMessage.val(constraintDesc.message);

       this._codeMirror = CodeMirror(this._scriptEditor[0], {
            value: constraintDesc.script,
            mode:  "javascript"
       });
    };


    return ConstraintDetailsDialog;
});