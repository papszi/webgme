/*globals define*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 * @author nabana / https://github.com/nabana
 */

define([
    'logManager',
    'text!./templates/CommitDialog.html',
    'css!./styles/CommitDialog.css'
], function (logManager,
        commitDialogTemplate) {

    "use strict";


    var CommitDialog;

    CommitDialog = function (client) {
        this._logger = logManager.create("CommitDialog");

        this._client = client;

        this._logger.debug("Created");
    };

    CommitDialog.prototype.show = function () {
        var self = this;

        this._initDialog();

        this._dialog.modal('show');

        this._dialog.on('shown.bs.modal', function () {
            self._txtMessage.focus();
        });

        this._dialog.on('hidden.bs.modal', function () {
            self._dialog.remove();
            self._dialog.empty();
            self._dialog = undefined;
        });
    };

    CommitDialog.prototype._initDialog = function () {
        var self = this,
            actualBranchName = this._client.getActualBranch();

        this._dialog = $(commitDialogTemplate);

        this._messagePanel = this._dialog.find('.fs-message');

        this._btnCommit = this._dialog.find('.btn-commit');

        this._branchAlertLabel = this._dialog.find('.alert');

        this._txtMessage = this._dialog.find('.txt-message');
        this._controlGroupMessage = this._dialog.find('.control-group-message');

        if (actualBranchName === undefined || actualBranchName === null) {
            this._messagePanel.remove();
            this._btnCommit.remove();
        } else {
            this._branchAlertLabel.removeClass('alert-error').addClass('alert-info');
            this._branchAlertLabel.text(actualBranchName);
        }

        this._txtMessage.on('keydown', function () {
            var val = self._txtMessage.val();
            if (val === "") {
                self._controlGroupMessage.addClass("error");
                self._btnCommit.disable(true);
            } else {
                self._controlGroupMessage.removeClass("error");
                self._btnCommit.disable(false);
            }
        });

        this._btnCommit.on('click', function () {
            var val = self._txtMessage.val();
            if (val !== "") {
                self._btnCommit.off('click').hide();
                self._client.commitAsync({"message": val}, function () {
                    self._dialog.modal('hide');
                });
            }
        });
    };

    return CommitDialog;
});