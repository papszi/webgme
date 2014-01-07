"use strict";

define(['logManager',
        'js/NodePropertyNames',
        'js/Constants'], function (logManager,
                                                    nodePropertyNames,
                                                    CONSTANTS) {
  
    var GenerativeInterpreter = function(_client) {
        this._logger = logManager.create('GenerativeInterpreter');
        this._client = _client;
        this.currentObject;
        var self = this;

        WebGMEGlobal.Toolbar.addButton({ 'title': "Generative Interpreter",
            "text":"Generative", 
            "clickFn": function (){
                self._territoryId = self._client.addUI(self, true);
                self._client.updateTerritory(self._territoryId, { 'root': { 'children': 5 }}); //TODO Set the necessary depth!
            }
        });

        this._client.addEventListener(this._client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
            self.currentObject = nodeId;
        });


    };

    GenerativeInterpreter.prototype.onOneEvent = function(events){
        this._client.removeUI(this._territoryId);
        this._runGenerativeInterpreter();
    };

    GenerativeInterpreter.prototype._runGenerativeInterpreter = function(){
        //Insert interpreter logic here
        this._logger.info("Running Generative Interpreter");

        var childNames = this._client.getNode(this.currentObject).getChildrenIds(),
            i = childNames.length;

        while(i--){        
            var node = this._client.getNode(childNames[i]);
            this._copyNode(node);
        }

    };

    GenerativeInterpreter.prototype._copyNode = function(node){
        var names = node.getAttributeNames(),
            i = names.length,
            attributes = {},
            newNodeId,
            newNode,
            baseId = node.getBaseId(),
            pos = {},
            params;

        newNodeId = this._client.createChild({ 'parentId': this.currentObject, 'baseId': baseId, 'position': pos });
        newNode = this._client.getNode(newNodeId);

        while(i--){
            var attrName = names[i],
                attr = newNode.getEditableAttribute(attrName);
            attr = node.getAttribute(attrName);
            //attributes[attr] = node.getAttribute(attr);
        }


        //TODO add the attributes to the new node
    };

    return GenerativeInterpreter;
});
