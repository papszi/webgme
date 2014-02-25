"use strict";

define(['logManager',
        'js/NodePropertyNames',
        'js/pegasus_prototype.META.js',
        'js/Constants'], function (logManager,
                                                    nodePropertyNames,
                                                    domainMeta,
                                                    CONSTANTS) {
  
    var PegasusInterpreter = function(_client) {
        this._logger = logManager.create('PegasusInterpreter');
        this._client = _client;
        this.pegasusTypes = domainMeta.TYPE_INFO;
        this.currentObject;
        this.namespace; //Set from the currentObject's name
        var self = this;

        WebGMEGlobal.Toolbar.addButton({ 'title': "Pegasus Interpreter",
            "text":"Pegasus", 
            "clickFn": function (){
                self._territoryId = self._client.addUI(self, true);
                self._client.updateTerritory(self._territoryId, { 'root': { 'children': 5 }});
            }
        });

        this._client.addEventListener(this._client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
            self.currentObject = nodeId;
        });


    };

    PegasusInterpreter.prototype.onOneEvent = function(events){
        this._client.removeUI(this._territoryId);
        this._runPegasusInterpreter();
    };

    PegasusInterpreter.prototype._runPegasusInterpreter = function(){
        //I will need to find the portions of the model that need to be duplicated

        //Algorithm:
        //Working from the top left to the bottom right, 
            //I will need to expand from the most enclosed version (recursively?)
            //Keep track of the "push zones" or the areas that objects need to be moved from (to make space)
        //Finally, add all the remaining objects with respect to the "push zones"
    };

    return PegasusInterpreter;
});
