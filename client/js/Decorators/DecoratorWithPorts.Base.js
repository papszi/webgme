/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * Author: Robert Kereskenyi
 */

"use strict";

define(['js/Constants',
    'js/Utils/GMEConcepts'], function (CONSTANTS,
                                 GMEConcepts) {

    var DecoratorWithPortsBase;

    DecoratorWithPortsBase = function () {
        this.portIDs = [];
        this.ports = {};
    };

    /**** Override from *Widget.DecoratorBase ****/
    /*
    * Specifies the territory rule for the decorator
    * By default the Decorator that displays ports needs to have the children of the node loaded
    * NOTE: can be overridden
    */
    DecoratorWithPortsBase.prototype.getTerritoryQuery = function () {
        var territoryRule = {};

        territoryRule[this._metaInfo[CONSTANTS.GME_ID]] = { "children": 1 };

        return territoryRule;
    };

    //register NodeID for notification in the client
    /*
    * Registers the portId with the controller so the controller will notify this decorator
    * when an insert/update/delete with the given portID happens
    * NOTE: can be overridden
    */
    DecoratorWithPortsBase.prototype.registerPortIdForNotification = function(portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];

        this._control.registerComponentIDForPartID(portId, partId);
    };

    //unregister NodeID from notification in the client
    /*
     * Unregisters the portId with the controller so the controller will not notify this decorator anymore
     * when an insert/update/delete with the given portID happens
     * NOTE: can be overridden
     */
    DecoratorWithPortsBase.prototype.unregisterPortIdForNotification = function(portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];

        this._control.unregisterComponentIDFromPartID(portId, partId);
    };

    /***** UPDATE THE PORTS OF THE NODE *****/
    DecoratorWithPortsBase.prototype.updatePortIDList = function () {
        var portIDs = this.getPortIDs(),
            len,
            knownPortIDs = this.portIDs.slice(0),
            diff;

        //get the removed ones
        diff = _.difference(knownPortIDs, portIDs);
        len = diff.length;
        while (len--) {
            this.unregisterPortIdForNotification(diff[len]);
            this.removePort(diff[len]);
        }

        diff = _.difference(portIDs, knownPortIDs);
        len = diff.length;
        while (len--) {
            this.registerPortIdForNotification(diff[len]);
            this.addPort(diff[len]);
        }
    };

    /*
     * Returns the IDs of the nodes that should be displayed as ports
     * NOTE: Can be overridden if not the children should be displayed as ports
     * NOTE: by default returns the IDs of the children of the given node
     */
    DecoratorWithPortsBase.prototype.getPortIDs = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            childrenIDs = [];

        if (nodeObj) {
            childrenIDs = nodeObj.getChildrenIds().slice(0);
        }

        return childrenIDs;
    };

    DecoratorWithPortsBase.prototype.isPort = function (objID) {
        return GMEConcepts.isPort(objID);
    };

    DecoratorWithPortsBase.prototype.addPort = function (portId) {
        if (this.isPort(portId)) {
            this.ports[portId] = this.renderPort(portId); //the representation of the Port class
            this.portIDs.push(portId);
        }
    };

    /*
    * Creates and returns the Port instance and also renders it on the screen
    * the returned port instance has to have a destroy method because removePort will call it
     */
    DecoratorWithPortsBase.prototype.renderPort = function (portId) {
        return {destroy: function () {}};
    };

    DecoratorWithPortsBase.prototype.removePort = function (portId) {
        var idx = this.portIDs.indexOf(portId);

        //if the port id being rendered, destroy it
        if (idx !== -1) {
            this.ports[portId].destroy();
            delete this.ports[portId];
            this.portIDs.splice(idx,1);
        }
    };

    return DecoratorWithPortsBase;
});