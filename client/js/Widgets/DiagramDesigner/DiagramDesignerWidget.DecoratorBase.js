"use strict";

define(['logManager',
        './DiagramDesignerWidget.Constants'], function (logManager,
                                                        DiagramDesignerWidgetConstants) {

    var DiagramDesignerWidgetDecoratorBase,
        DECORATOR_ID = "DiagramDesignerWidgetDecoratorBase";

    DiagramDesignerWidgetDecoratorBase = function (params) {

        this.hostDesignerItem = params.host;
        this.logger = params.logger || logManager.create(this.DECORATORID);

        this.skinParts = {};
        this.$connectors = null;

        this._initialize();

        this.logger.debug("Created");
    };

    DiagramDesignerWidgetDecoratorBase.prototype.DECORATORID = DECORATOR_ID;

    /*DiagramDesignerWidgetDecoratorBase.prototype.setControlSpecificAttributes = function () {
    };*/

    DiagramDesignerWidgetDecoratorBase.prototype.setControl = function (control) {
        this._control = control;
    };

    DiagramDesignerWidgetDecoratorBase.prototype.getControl = function () {
        return this._control;
    };

    DiagramDesignerWidgetDecoratorBase.prototype.setMetaInfo = function (params) {
        this._metaInfo = params;
    };

    DiagramDesignerWidgetDecoratorBase.prototype.getMetaInfo = function () {
        return this._metaInfo;
    };

    //NOTE - CAN BE OVERRIDDEN TO SPECIFY CUSTOM TEMPLATE FOR THE DECORATOR
    DiagramDesignerWidgetDecoratorBase.prototype.$DOMBase = $("");

    //initialization code for the decorator
    //this.$el will be created as the top-level container for the decorator's DOM
    //this.$el will be used later in the DesignerItem's code, it must exist
    //NOTE - SHOULD NOT BE OVERRIDDEN
    DiagramDesignerWidgetDecoratorBase.prototype._initialize = function () {
        this.$el = this.$DOMBase.clone();

        //extra default initializations
        this.initializeConnectors();
    };

    //as a common default functionality, DiagramDesignerWidgetDecoratorBase provides solution for taking care of the connectors
    //DiagramDesignerWidgetDecoratorBase will handle DOM elements with class CONNECTOR_CLASS as connectors
    //these will be queried and detached from the decorator's DOM by default
    //NODE - CAN BE OVERRIDDEN WHEN NEEDED
    DiagramDesignerWidgetDecoratorBase.prototype.initializeConnectors = function () {
        //find connectors
        this.$connectors = this.$el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS);

        if (this.hostDesignerItem) {
            this.hostDesignerItem.registerConnectors(this.$connectors);
        }

        this.hideConnectors();
    };

    //Shows the 'connectors' - appends them to the DOM
    DiagramDesignerWidgetDecoratorBase.prototype.showConnectors = function () {
        this.$connectors.appendTo(this.$el);
    };

    //Hides the 'connectors' - detaches them from the DOM
    DiagramDesignerWidgetDecoratorBase.prototype.hideConnectors = function () {
        this.$connectors.detach();
    };

    //Called before the host designer item is added to the canvas DOM (DocumentFragment more precisely)
    //At this point the decorator should create its DOM representation
    //At this point no dimension information is available since the content exist only in memory, not yet rendered
    //NOTE - DO NOT ACCESS ANY LAYOUT OR DIMENSION INFORMATION FOR PERFORMANCE REASONS
    //NOTE - ALL LAYOUT INFORMATION SHOULD BE QUERIED IN onRenderGetLayoutInfo
    //NOTE - SHALL BE OVERRIDDEN WHEN NEEDED
    DiagramDesignerWidgetDecoratorBase.prototype.on_addTo = function () {
    };

    //All DOM queries that causes reflow (position / width / height / etc) should be done here
    //Use helper object 'this.renderLayoutInfo' to store info needed
    //NOTE - But DO NOT SET ANY SUCH SETTING HERE, THAT SHOULD HAPPEN IN 'onRenderGetLayoutInfo'
    //NOTE - DO NOT TOUCH THE DOM FOR WRITE
    //NOTE - CAN BE OVERRIDDEN WHEN NEEDED
    //NOTE - More info on this: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
    DiagramDesignerWidgetDecoratorBase.prototype.onRenderGetLayoutInfo = function () {
        this.calculateDimension();

        this.renderLayoutInfo = {};
    };

    //Do anything needs to be done to adjust look, write all width, height, position, etc infomration
    //Use values stored in helper object 'this.renderLayoutInfo'
    //NOTE - But DO NOT READ ANY SUCH INFORMATION, DO NOT TOUCH THE DOM FOR READ
    //NOTE - CAN BE OVERRIDDEN WHEN NEEDED
    DiagramDesignerWidgetDecoratorBase.prototype.onRenderSetLayoutInfo = function () {
        delete this.renderLayoutInfo;
    };

    //Override to set the
    // - 'this.hostDesignerItem.width' and
    // - 'this.hostDesignerItem.height' attributes with the correct dimensions of this decorator
    //The dimension information is used for many different reasons in the canvas (line routing, etc...),
    //Please set it correctly
    //NOTE - SHALL BE OVERRIDDEN
    DiagramDesignerWidgetDecoratorBase.prototype.calculateDimension = function () {
        if (this.hostDesignerItem) {
            this.hostDesignerItem.width = this.$el.outerWidth(true);
            this.hostDesignerItem.height = this.$el.outerHeight(true);
        }
    };

    //Should return the connection areas for the component with the given 'id'
    //Canvas will draw the connection to / from this coordinate
    //'id' might be the id of this DesignerItem itself, or the
    //'id' can be the ID of one of the SubComponents contained in this component
    //result should be an array of the area descriptors
    //NOTE - SHALL BE OVERRIDDEN WHEN NEEDED
    DiagramDesignerWidgetDecoratorBase.prototype.getConnectionAreas = function (id) {
        var result = [];

        //by default return the center point of the item
        //canvas will draw the connection to / from this coordinate
        result.push( {"id": "0",
            "x": this.hostDesignerItem.width / 2,
            "y": this.hostDesignerItem.height / 2,
            "w": 0,
            "h": 0,
            "orientation": "N",
            "len": 10} );

        return result;
    };

    //Called when the decorator of the DesignerItem needs to be destroyed
    //There is no need to touch the DOM, it will be taken care of in the DesignerItem's code
    //Remove any additional business logic, free up resources, territory, etc...
    //NOTE - CAN BE OVERRIDDEN WHEN NEEDED
    DiagramDesignerWidgetDecoratorBase.prototype.destroy = function () {
        this.logger.debug("DiagramDesignerWidgetDecoratorBase.destroyed");
    };

    /******************** EVENT HANDLERS ************************/

    //called when the mouse enters the DesignerItem's main container
    //return TRUE if decorator code handled the event
    //when returned FALSE, DesignerItem's event handler will be executed
    DiagramDesignerWidgetDecoratorBase.prototype.onMouseEnter = function (event) {
        return false;
    };

    //called when the mouse leaves the DesignerItem's main container
    //return TRUE if decorator code handled the event
    //when returned FALSE, DesignerItem's event handler will be executed
    DiagramDesignerWidgetDecoratorBase.prototype.onMouseLeave = function (event) {
        return false;
    };

    //called when the mouse leaves the DesignerItem's receives mousedown
    //return TRUE if decorator code handled the event
    //when returned FALSE, DesignerItem's event handler will be executed
    DiagramDesignerWidgetDecoratorBase.prototype.onMouseDown = function (event) {
        return false;
    };

    //called when the mouse leaves the DesignerItem's receives mouseup
    //return TRUE if decorator code handled the event
    //when returned FALSE, DesignerItem's event handler will be executed
    DiagramDesignerWidgetDecoratorBase.prototype.onMouseUp = function (event) {
        return false;
    };

    //called when the designer items becomes selected
    //return TRUE if decorator code handled the event
    //when returned FALSE, DesignerItem's event handler will be executed
    DiagramDesignerWidgetDecoratorBase.prototype.onSelect = function () {
        return false;
    };

    //called when the designer items becomes deselected
    //return TRUE if decorator code handled the event
    //when returned FALSE, DesignerItem's event handler will be executed
    DiagramDesignerWidgetDecoratorBase.prototype.onDeselect = function () {
        return false;
    };

    //called when double click happens on the DesignerItem
    //return TRUE if decorator code handled the event
    //when returned FALSE, DesignerItem's event handler will be executed
    DiagramDesignerWidgetDecoratorBase.prototype.onDoubleClick = function (event) {
        return false;
    };

    /******************** END OF - EVENT HANDLERS ************************/



    /************* ADDITIONAL METHODS ***************************/
    //called when the designer item should be updated
    DiagramDesignerWidgetDecoratorBase.prototype.update = function () {
    };

    //called when the designer item's subcomponent should be updated
    DiagramDesignerWidgetDecoratorBase.prototype.updateSubcomponent = function (subComponentId) {
    };

    DiagramDesignerWidgetDecoratorBase.prototype.readOnlyMode = function (readOnlyMode) {
    };

    return DiagramDesignerWidgetDecoratorBase;
});