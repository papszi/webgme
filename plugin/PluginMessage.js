/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann
 */

'use strict';
define(['plugin/PluginNodeDescription'], function (PluginNodeDescription) {

    /**
     * Initializes a new instance of plugin message.
     *
     * Note: this object is JSON serializable see serialize method.
     *
     * @param config - deserializes an existing configuration to this object.
     * @constructor
     */
    var PluginMessage = function (config) {
        if (config) {
            this.commitHash = config.commitHash;
            if (config.activeNode instanceof PluginNodeDescription) {
                this.activeNode = config.activeNode;
            } else {
                this.activeNode = new PluginNodeDescription(config.activeNode);
            }

            this.message = config.message;

            // TODO: message type ERROR, WARNING, INFO, DEBUG
        } else {
            this.commitHash = '';
            this.activeNode = new PluginNodeDescription();
            this.message = '';
            // TODO: message type ERROR, WARNING, INFO, DEBUG
        }
    };

    /**
     * Serializes this object to a JSON representation.
     *
     * @returns {{}}
     */
    PluginMessage.prototype.serialize = function () {
        var result = {
            commitHash: this.commitHash,
            activeNode: this.activeNode.serialize(),
            message: this.message
        };

        return result;
    };

    return PluginMessage;
});