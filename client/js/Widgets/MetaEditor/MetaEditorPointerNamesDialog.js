"use strict";

define(['clientUtil',
        'js/Constants',
        'text!html/Widgets/MetaEditor/MetaEditorPointerNamesDialog.html',
        'css!/css/Widgets/MetaEditor/MetaEditorPointerNamesDialog'], function ( util,
                                                                                CONSTANTS,
                                                               metaEditorPointerNamesDialogTemplate) {

    var MetaEditorPointerNamesDialog,
        POPULAR_POINTER_NAMES = [CONSTANTS.POINTER_SOURCE, CONSTANTS.POINTER_TARGET];

    MetaEditorPointerNamesDialog = function () {
      
    };

    MetaEditorPointerNamesDialog.prototype.show = function (existingPointerNames, notAllowedPointerNames, isSet, callBack) {
        var self = this;

        this._initDialog(existingPointerNames, notAllowedPointerNames, isSet, callBack);

        this._dialog.modal('show');

        this._dialog.on('shown', function () {
            if (existingPointerNames.length === 0) {
	        	self._txtNewPointerName.focus();
	        }
        });

        this._dialog.on('hidden', function () {
            self._dialog.remove();
            self._dialog.empty();
            self._dialog = undefined;
        });
    };

    MetaEditorPointerNamesDialog.prototype._initDialog = function (existingPointerNames, notAllowedPointerNames, isSet, callBack) {
        var self = this,
            i,
            len = existingPointerNames.length,
            closeAndCallback,
            popularsAdded,
            isValidPointerName;

        closeAndCallback = function (selectedName) {
        	self._dialog.modal('hide');

        	if (callBack) {
        		callBack.call(self, selectedName);
        	}
        };

        isValidPointerName = function (name) {
            return !(name === "" || existingPointerNames.indexOf(name) !== -1 || notAllowedPointerNames.indexOf(name) !== -1);
        };

        this._dialog = $(metaEditorPointerNamesDialogTemplate);

        //by default the template is for single pointer
        //in case of pointer list, update labels in the dialog
        if (isSet === true) {
            this._dialog.find('.modal-header > h3').text('New set...');
            this._dialog.find('.modal-body > .title').text('Pick one of the existing sets:');
            this._dialog.find('.modal-footer .create').text('Or create a new set:');
            this._dialog.find('.modal-footer .txt-pointer-name').attr('placeholder', 'New set name...');
        }

        //get controls
        this._el = this._dialog.find('.modal-body').first();
        this._btnGroup = this._el.find('.btn-group-existing').first();
        this._btnGroupPopular = this._dialog.find('.btn-group-popular').first();

		//fill pointer names
        existingPointerNames.sort();
        for (i = 0; i < len ; i += 1) {
            this._btnGroup.append($('<button class="btn">' + util.toSafeString(existingPointerNames[i]) + '</button>'));
        }

        //add most popular ones
        popularsAdded = false;
        if (isSet !== true) {
            len = POPULAR_POINTER_NAMES.length;

            for (i = 0; i < len ; i += 1) {
                if (existingPointerNames.indexOf(POPULAR_POINTER_NAMES[i]) === -1) {
                    this._btnGroupPopular.append($('<button class="btn">' + POPULAR_POINTER_NAMES[i] + '</button>'));
                    popularsAdded = true;
                }
            }
        }

        //if all the popular ones were there already, remove popular panel completely
        if (!popularsAdded) {
            this._dialog.find('.panel-popular').remove();
        }

        //create UI for new pointer name
        this._txtNewPointerName =  this._dialog.find('.txt-pointer-name').first();
        this._btnCreateNew = this._dialog.find('.btn-create').first();
        this._panelCreateNew = this._dialog.find('.panel-create-new').first();

        //hook up event handlers
        this._btnGroup.on('click', '.btn', function (event) {
        	var selectedPointerName = $(this).text();
            
            event.stopPropagation();
            event.preventDefault();

            closeAndCallback(selectedPointerName);
        });

        //hook up event handlers
        this._btnGroupPopular.on('click', '.btn', function (event) {
            var selectedPointerName = $(this).text();

            event.stopPropagation();
            event.preventDefault();

            closeAndCallback(selectedPointerName);
        });

        this._txtNewPointerName.on('keyup', function () {
            var val = self._txtNewPointerName.val();

            self._btnCreateNew.text('Create \'' + val +'\'');

            if (!isValidPointerName(val)) {
                self._panelCreateNew.addClass("error");
                self._btnCreateNew.addClass("disabled");
            } else {
                self._panelCreateNew.removeClass("error");
                self._btnCreateNew.removeClass("disabled");
            }
        });

        this._txtNewPointerName.on('keydown', function (event) {
            var enterPressed = event.which === 13,
                selectedPointerName = self._txtNewPointerName.val();

            if (enterPressed && isValidPointerName(selectedPointerName)) {
                closeAndCallback(selectedPointerName);

                event.stopPropagation();
                event.preventDefault();
            }
        });

        this._btnCreateNew.on('click', function (event) {
        	var selectedPointerName = self._txtNewPointerName.val();
            
            event.stopPropagation();
            event.preventDefault();

            if (!($(this).hasClass('disabled'))) {
            	closeAndCallback(selectedPointerName);
            }
        });
    };


    return MetaEditorPointerNamesDialog;
});