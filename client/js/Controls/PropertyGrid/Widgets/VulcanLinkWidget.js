"use strict";

define(['js/Controls/PropertyGrid/Widgets/WidgetBase',
    'blob/BlobClient',
    'css!/css/Controls/PropertyGrid/Widgets/VulcanLinkWidget'],
    function (WidgetBase,
              BlobClient) {

        var VulcanLinkWidget,
            ASSET_WIDGET_BASE = $('<div class="asset-widget" />'),
            ASSET_LINK = $('<a href=""/>');

        VulcanLinkWidget = function (propertyDesc) {
            VulcanLinkWidget.superclass.call(this, propertyDesc);

            this.__el = ASSET_WIDGET_BASE.clone();
            this.el.append(this.__el);

            this.__assetLink = ASSET_LINK.clone();
            this.__el.append(this.__assetLink);

            this.__linkDropTarget = this.__el;

            this._attachLinkDropHandlers();

            this.updateDisplay();
        };

        VulcanLinkWidget.superclass = WidgetBase;

        _.extend(VulcanLinkWidget.prototype, WidgetBase.prototype);

        VulcanLinkWidget.prototype._attachLinkDropHandlers = function () {
            var self = this;

            this.__linkDropTarget.artifactLinkDroppable = function (action, types) {

                var that = this, artifactLink;

                this.droppable({
                    accept: function (draggable) {
                        artifactLink = draggable.data('host');
                        return ( types === undefined || ( artifactLink && types.indexOf(artifactLink.artifactType) !== -1 ) );
                    },

                    drop: function (event, ui) {
                        artifactLink = ui.draggable.data('host');
                        ui.helper.css( 'cursor', ui.helper.data( 'cursorBefore'));
                        action.call(that, artifactLink);
                    },

                    over: function (event, ui) {
                        ui.helper.data( 'cursorBefore', ui.helper.css( 'cursor') );
                        ui.helper.css( 'cursor', 'copy');
                    },

                    out: function (event, ui) {
                        ui.helper.css( 'cursor', ui.helper.data( 'cursorBefore') );
                    },
                    activeClass: 'hover',
                    hoverClass: 'hover'

                });
            };
        };

        VulcanLinkWidget.prototype._detachFileDropHandlers = function () {
            //linkdrag
            this.__linkDropTarget.off('dragover');
            this.__linkDropTarget.off('dragenter');
            this.__linkDropTarget.off('dragleave');
            this.__linkDropTarget.off("drop");
        };


        VulcanLinkWidget.prototype.updateDisplay = function () {
            var bc = new BlobClient();
            var urlDownload = this.propertyValue ? bc.getDownloadURL(this.propertyValue) : '';
            var text = this.propertyValue;

            var self = this;

            this.__assetLink.text(text);
            this.__assetLink.attr('title', text);
            this.__assetLink.attr('href', urlDownload);

            if (this.propertyValue) {
                bc.getMetadata(this.propertyValue, function (err, fileInfo) {
                    if (err) {
                        //TODO: more meaningful error message
                        text = "ERROR...";
                    } else {
                        text = fileInfo.name + ' (' + self._humanFileSize(fileInfo.size) +')';
                    }
                    self.__assetLink.text(text);
                    self.__assetLink.attr('title', text);
                });
            }

            return VulcanLinkWidget.superclass.prototype.updateDisplay.call(this);
        };

        VulcanLinkWidget.prototype.setReadOnly = function (isReadOnly) {
            VulcanLinkWidget.superclass.prototype.setReadOnly.call(this, isReadOnly);

            this._detachFileDropHandlers();
            if (isReadOnly !== true) {
                this._attachFileDropHandlers();
            }
        };

        VulcanLinkWidget.prototype._fileSelectHandler = function (event) {
            var self = this,
                blobClient = new BlobClient(),
                i,
                file;

            // cancel event and hover styling
            event.stopPropagation();
            event.preventDefault();

            // fetch FileList object
            var files = event.target.files || event.dataTransfer.files;

            // process all File objects
            if (files && files.length > 0) {
                this._detachFileDropHandlers(true);

                var afName = self.propertyName;
                var artifact = blobClient.createArtifact(afName);

                var remainingFiles = files.length;

                for (i = 0; i < files.length; i += 1) {
                    file = files[i];
                    artifact.addFileAsSoftLink(file.name, file, function (err, hash) {
                        remainingFiles -= 1;

                        if (err) {
                            //TODO: something went wrong, tell the user????
                        } else {
                            // successfully uploaded
                        }

                        if (remainingFiles === 0) {
                            if (files.length > 1) {
                                artifact.save(function (err, artifactHash) {
                                    self.setValue(artifactHash);
                                    self.fireFinishChange();
                                    self._attachFileDropHandlers(false);
                                });

                            } else {
                                self.setValue(hash);
                                self.fireFinishChange();
                                self._attachFileDropHandlers(false);
                            }
                        }
                    });
                }
            }
        };

        VulcanLinkWidget.prototype._humanFileSize = function (bytes, si) {
            var thresh = si ? 1000 : 1024;
            if (bytes < thresh) {
                return bytes + ' B';
            }

            var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

            var u = -1;

            do {
                bytes = bytes / thresh;
                u += 1;
            } while(bytes >= thresh);

            return bytes.toFixed(1) + ' ' + units[u];
        };

        return VulcanLinkWidget;

    });