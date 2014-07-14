/*globals define, Raphael, window, WebGMEGlobal, _*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define(['js/PanelBase/PanelBase',
    'css!./styles/SplitPanel'], function (PanelBase) {

    "use strict";

    var SplitPanel,
        SPLIT_PANEL_CLASS = 'split-panel',
        PANEL1_CLASS = "p1",
        PANEL2_CLASS = "p2",
        SPLITTER_CLASS = "splitter",
        SPLITTER_SIZE = 4,
        VERTICAL_CLASS = "vertical",
        HORIZONTAL_CLASS = "horizontal",
        SPLITTER_RESIZE_CLASS = "resize",
        MINIMUM_PANEL_SIZE = 50,
        SPLITTER_SNAP_FROM_DISTANCE = 25,
        SPLITTER_RESIZE_PADDING = 2;

    SplitPanel = function (layoutManager, params) {
        var options = {};
        //set properties from options
        options[PanelBase.OPTIONS.LOGGER_INSTANCE_NAME] = "SplitPanel";

        //call parent's constructor
        PanelBase.apply(this, [options]);

        this._panel1 = undefined;
        this._panel2 = undefined;

        this._readOnly = false;

        this._splitterPos = 0.5;

        //initialize UI
        this._initialize();

        this.logger.debug("SplitPanel ctor finished");
    };

    //inherit from PanelBaseWithHeader
    _.extend(SplitPanel.prototype, PanelBase.prototype);

    SplitPanel.prototype.onResize = function (width, height) {
        this.logger.debug('onResize --> width: ' + width + ', height: ' + height);

        this._width = width;
        this._height = height;

        this.$el.width(this._width);
        this.$el.height(this._height);

        this._updateUI();
    };

    SplitPanel.prototype._initialize = function () {
        var self = this;

        this.$el.addClass(SPLIT_PANEL_CLASS);

        this._panel1Container = $('<div/>', {'class': PANEL1_CLASS});
        this.$el.append(this._panel1Container);

        this._splitter = $('<div/>', {'class': SPLITTER_CLASS});
        this.$el.append(this._splitter);

        this._panel2Container = $('<div/>', {'class': PANEL2_CLASS});
        this.$el.append(this._panel2Container);

        this._panel1Container.on('mousedown', function (event) {
            self._setActivePanel(0);
            event.stopPropagation();
        });

        this._panel2Container.on('mousedown', function (event) {
            self._setActivePanel(1);
            event.stopPropagation();
        });

        this._splitter.on('mousedown', function (event) {
            self._startPanelResize(event);
            event.stopPropagation();
            event.preventDefault();
        });

        this._updateUI();
    };

    SplitPanel.prototype._updateUI = function () {
        var verticalSplit = this._width > this._height,
            w1 = this._width,
            h1 = this._height,
            w2 = this._width,
            h2 = this._height,
            sw = SPLITTER_SIZE,
            sh = SPLITTER_SIZE,
            p1_top = 0,
            p1_left = 0,
            splitter_top = 0,
            splitter_left = 0,
            p2_top = 0,
            p2_left = 0,
            has2Panels = this._panel2 !== undefined;

        if (has2Panels) {
            this._splitter.show();
            this._panel2Container.show();
            this._splitter.removeClass([VERTICAL_CLASS, HORIZONTAL_CLASS].join(' '));
        } else {
            this._splitter.hide();
            this._panel2Container.hide();
        }

        if (has2Panels) {
            if (verticalSplit) {
                sh = this._height;
                w1 = Math.floor((this._width - sw) * this._splitterPos);
                w2 = this._width - w1 - sw;
                this._splitter.addClass(VERTICAL_CLASS);
                p1_left = 0;
                splitter_left = w1;
                p2_left = w1 + sw;
            } else {
                sw = this._width;
                h1 = Math.floor((this._height - sh) * this._splitterPos);
                h2 = this._height - h1 - sh;
                this._splitter.addClass(HORIZONTAL_CLASS);
                p1_top = 0;
                splitter_top = h1;
                p2_top = h1 + sh;
            }

            this._splitter.css({'width': sw,
                'height': sh,
                'top': splitter_top,
                'left': splitter_left});

            this._panel1Container.css({'width': w1,
                'height': h1,
                'top': p1_top,
                'left': p1_left});

            this._panel2Container.css({'width': w2,
                'height': h2,
                'top': p2_top,
                'left': p2_left});

            if (this._panel1) {
                this._panel1.setSize(w1, h1);
            }

            if (this._panel2) {
                this._panel2.setSize(w2, h2);
            }
        } else {
            this._panel1Container.css({'width': w1,
                'height': h1,
                'top': p1_top,
                'left': p1_left});

            if (this._panel1) {
                this._panel1.setSize(w1, h1);
            }

            this._splitterPos = 0.5;
        }
    };

    SplitPanel.prototype.setPanel = function (panel, container) {
        if (container === 'p1') {
            this._panel1Container.empty();
            this._panel1 = panel;
            this._panel1Container.append(this._panel1.$pEl);
            this._panel1.afterAppend();
            this._setActivePanel(0);
        } else {
            this._panel2Container.empty();
            this._panel2 = panel;
            this._panel2Container.append(this._panel2.$pEl);
            this._panel2.afterAppend();
            this._setActivePanel(1);
        }

        //make sure that read-only info is passed down to the actual panels
        this.onReadOnlyChanged(this._readOnly);

        this._updateUI();
    };

    SplitPanel.prototype.deletePanel = function (container) {
        if (container === 'p1') {
            this._panel1Container.empty();
            this._panel1 = undefined;
            this._setActivePanel(1);
        } else {
            this._panel2Container.empty();
            this._panel2 = undefined;
            this._setActivePanel(0);
        }

        this._updateUI();
    };

    /* OVERRIDE FROM WIDGET-WITH-HEADER */
    /* METHOD CALLED WHEN THE WIDGET'S READ-ONLY PROPERTY CHANGES */
    SplitPanel.prototype.onReadOnlyChanged = function (isReadOnly) {
        //apply parent's onReadOnlyChanged
        PanelBase.prototype.onReadOnlyChanged.call(this, isReadOnly);

        this._readOnly = isReadOnly;

        if (this._panel1) {
            this._panel1.onReadOnlyChanged(isReadOnly);
        }

        if (this._panel2) {
            this._panel2.onReadOnlyChanged(isReadOnly);
        }
    };

    SplitPanel.prototype._setActivePanel = function (p) {
        //if (this._panel1 && this._panel2) {
            if (p === 0) {
                WebGMEGlobal.PanelManager.setActivePanel(this._panel1);
            }

            if (p === 1) {
                WebGMEGlobal.PanelManager.setActivePanel(this._panel2);
            }
        //}
    };

    SplitPanel.prototype._startPanelResize = function (event) {
        var self = this,
            verticalSplit = this._width > this._height;

        this._splitterResize = this._splitter.clone().addClass(SPLITTER_RESIZE_CLASS);
        this.$el.append(this._splitterResize);

        this._splitterResizePos = this._splitterPos;
        this._splitStartMousePos = verticalSplit ? event.pageX : event.pageY;


        $(document).on('mousemove.SplitPanel', function (event) { self._onMouseMove(event); });
        $(document).on('mouseup.SplitPanel', function (event) { self._onMouseUp(event); });
    };

    SplitPanel.prototype._onMouseMove = function (event) {
        var verticalSplit = this._width > this._height,
            mousePos = verticalSplit ? event.pageX : event.pageY,
            mouseDelta = mousePos - this._splitStartMousePos,
            maxVal = verticalSplit ? this._width :  this._height,
            resizeDelta = mouseDelta / maxVal,
            snapDistance = SPLITTER_SNAP_FROM_DISTANCE / maxVal,
            minPanelSize = MINIMUM_PANEL_SIZE / maxVal;

        this._splitterResizePos =  this._splitterPos + resizeDelta;

        if (this._splitterResizePos >= 0.5 - snapDistance &&
            this._splitterResizePos <= 0.5 + snapDistance) {
            this._splitterResizePos = 0.5;
        }

        if (this._splitterResizePos < minPanelSize) {
            this._splitterResizePos = minPanelSize;
        }

        if (this._splitterResizePos > 1 - minPanelSize) {
            this._splitterResizePos = 1 - minPanelSize;
        }

        this._updateSplitterResize();
    };

    SplitPanel.prototype._updateSplitterResize = function () {
        var verticalSplit = this._width > this._height,
            sw = SPLITTER_SIZE + 2 * SPLITTER_RESIZE_PADDING,
            sh = SPLITTER_SIZE + 2 * SPLITTER_RESIZE_PADDING,
            splitter_left,
            splitter_top;

        if (verticalSplit) {
            sh = this._height;
            splitter_left = Math.floor((this._width - sw) * this._splitterResizePos);
        } else {
            sw = this._width;
            splitter_top = Math.floor((this._height - sh) * this._splitterResizePos);
        }

        this._splitterResize.css({'width': sw,
            'height': sh,
            'top': splitter_top,
            'left': splitter_left});
    };

    SplitPanel.prototype._onMouseUp = function (event) {
        $(document).off('mousemove.SplitPanel');
        $(document).off('mouseup.SplitPanel');

        this._splitterPos = this._splitterResizePos;

        this._splitterResize.remove();
        this._splitterResize = undefined;
        this._splitterResizePos = undefined;

        this._updateUI();
    };

    return SplitPanel;
});

