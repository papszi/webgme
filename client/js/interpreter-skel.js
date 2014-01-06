"use strict";

/*
 * This is a skeleton interpreter file. To create an interpreter, simply specify the appropriate territory and insert 
 * the interpreter logic.
 * 
 * Currently, server side interpreters need to be added in the created in the WebGME.js file.
 */

define(['logManager',
        'js/NodePropertyNames',
        'js/Constants'], function (logManager,
                                                    nodePropertyNames,
                                                    CONSTANTS) {
  
    var GenericInterpreter = function(_client) {
        this._logger = logManager.create('GenericInterpreter');
        this._client = _client;
        this.currentObject;
        var self = this;

        WebGMEGlobal.Toolbar.addButton({ 'title': "Generic Interpreter",
            "text":"Generic", 
            "clickFn": function (){
                self._territoryId = self._client.addUI(self, true);
                self._client.updateTerritory(self._territoryId, { 'root': { 'children': 5 }}); //TODO Set the necessary depth!
            }
        });

        this._client.addEventListener(this._client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
            self.currentObject = nodeId;
        });


    };

    GenericInterpreter.prototype.onOneEvent = function(events){
        this._runGenericInterpreter();

        this._client.removeUI(this._territoryId);
    };

    GenericInterpreter.prototype._runGenericInterpreter = function(){
        //Insert interpreter logic here
        //TODO
    };

    return GenericInterpreter;
});
