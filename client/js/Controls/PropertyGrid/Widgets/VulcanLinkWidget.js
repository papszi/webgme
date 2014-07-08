"use strict";

define(['js/Controls/PropertyGrid/Widgets/WidgetBase',
    'blob/BlobClient',
    'clientUtil',
    'css!/css/Controls/PropertyGrid/Widgets/VulcanLinkWidget'],
    function (WidgetBase,
              BlobClient,
              clientUtil) {

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

            //filedrag
            this.__linkDropTarget.on('dragover dragenter', function (event) {
                event.preventDefault(); //IE 10 needs this to ba able to drop
                self.__linkDropTarget.addClass('hover');
            });

            this.__linkDropTarget.on('dragleave', function (event) {
                event.preventDefault();
                self.__linkDropTarget.removeClass('hover');
            });

            this.__linkDropTarget.on("drop", function (event) {
                event.stopPropagation();
                event.preventDefault();
                self.__linkDropTarget.removeClass('hover');
                self._linkDropHandler(event.originalEvent);
            });
        };

        VulcanLinkWidget.prototype._detachLinkDropHandlers = function () {
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

            this._detachLinkDropHandlers();
            if (isReadOnly !== true) {
                this._attachLinkDropHandlers();
            }
        };

        VulcanLinkWidget.prototype._linkDropHandler = function (event) {
            var self = this,
                blobClient = new BlobClient(),
                vfBaseUrl;

            // cancel event and hover styling
            event.stopPropagation();
            event.preventDefault();

            var droppedData = JSON.parse(event.dataTransfer.getData("application/json"));
            var afName = self.propertyName;
            var artifact = blobClient.createArtifact(afName);
            vfBaseUrl = clientUtil.getURLParameterByName("vfBaseUrl");

            if (vfBaseUrl) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function(){
                    if (xhr.status == 200){
                        console.log(droppedData.label+'.zip');
                        artifact.addFileAsSoftLink(droppedData.label+'.zip', xhr.response, function (err, hash) {
                            if (err) {
                                //TODO: something went wrong, tell the user????
                            } else {
                                // successfully uploaded
                            }

                            self.setValue(hash);
                            self.fireFinishChange();
                            self._attachLinkDropHandlers(false);
                        });

                    }
                }
                xhr.open('GET', vfBaseUrl + '/rest' + droppedData.clickURL + "zip");
                xhr.responseType = 'blob';
                xhr.send();
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