"use strict";

define(['logManager',
    'clientUtil',
    'js/Decorators/DiagramDesigner/DefaultDecorator/DefaultDecorator',
    'text!./CircleDecoratorTemplate.html',
    'css!/css/Decorators/DiagramDesigner/CircleDecorator/CircleDecorator'], function (logManager,
                                                          util,
                                                          DefaultDecorator,
                                                          circleDecoratorTemplate) {

    var CircleDecorator,
        __parent__ = DefaultDecorator,
        __parent_proto__ = DefaultDecorator.prototype,
        DECORATOR_ID = "CircleDecorator",
        CANVAS_SIZE = 40,
        FILL_COLOR = '#000000';

    CircleDecorator = function (options) {
        var opts = _.extend( {}, options);

        __parent__.apply(this, [opts]);

        this.logger.debug("CircleDecorator ctor");
    };

    _.extend(CircleDecorator.prototype, __parent_proto__);
    CircleDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DECORATORBASE MEMBERS **************************/

    CircleDecorator.prototype.$DOMBase = $(circleDecoratorTemplate);

    //Called right after on_addTo and before the host designer item is added to the canvas DOM
    CircleDecorator.prototype.on_addTo = function () {
        this._renderCircle();

        //let the parent decorator class do its job first
        __parent_proto__.on_addTo.apply(this, arguments);
    };

    //Called right after on_addTo and before the host designer item is added to the canvas DOM
    CircleDecorator.prototype.on_addToPartBrowser = function () {
        this._renderCircle();

        //let the parent decorator class do its job first
        __parent_proto__.on_addToPartBrowser.apply(this, arguments);
    };

    CircleDecorator.prototype._renderCircle = function () {
        //find additional CircleDecorator specific UI components
        this.skinParts.$circleCanvas = this.$el.find('[id="circleCanvas"]');
        this.skinParts.$circleCanvas.height(CANVAS_SIZE);
        this.skinParts.$circleCanvas.width(CANVAS_SIZE);
        this.skinParts.svgPaper = Raphael(this.skinParts.$circleCanvas[0]);
        this.skinParts.svgPaper.circle(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 1).attr('fill',FILL_COLOR);
    };

    CircleDecorator.prototype.onRenderGetLayoutInfo = function () {
        //let the parent decorator class do its job first
        __parent_proto__.onRenderGetLayoutInfo.apply(this, arguments);

        this.renderLayoutInfo.nameWidth = this.skinParts.$name.outerWidth();
    };

    CircleDecorator.prototype.onRenderSetLayoutInfo = function () {
        var shift = (CANVAS_SIZE - this.renderLayoutInfo.nameWidth) / 2;

        this.skinParts.$name.css({ "left": shift });

        //let the parent decorator class do its job finally
        __parent_proto__.onRenderSetLayoutInfo.apply(this, arguments);
    };

    CircleDecorator.prototype.calculateDimension = function () {
        if (this.hostDesignerItem) {
            this.hostDesignerItem.width = CANVAS_SIZE;
            this.hostDesignerItem.height = CANVAS_SIZE + this.skinParts.$name.outerHeight(true);
        }
    };

    CircleDecorator.prototype.getConnectionAreas = function (/*id*/) {
        var result = [],
            width = CANVAS_SIZE,
            height = CANVAS_SIZE;

        //by default return the bounding box edges midpoints
        //NOTE: it returns the connection point regardless of being asked for
        //its own connection ports or some of the subcomponent's connection ports

        //top left
        result.push( {"id": "0",
            "x": width / 2,
            "y": 0,
            "w": 0,
            "h": 0,
            "orientation": "N",
            "len": 10} );

        result.push( {"id": "1",
            "x": width / 2,
            "y": height,
            "w": 0,
            "h": 0,
            "orientation": "S",
            "len": 10} );

        result.push( {"id": "2",
            "x": 0,
            "y": height / 2,
            "w": 0,
            "h": 0,
            "orientation": "W",
            "len": 10} );

        result.push( {"id": "3",
            "x": width,
            "y": height / 2,
            "w": 0,
            "h": 0,
            "orientation": "E",
            "len": 10} );

        return result;
    };

    return CircleDecorator;
});