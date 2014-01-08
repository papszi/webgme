"use strict";

define(['logManager',
        'js/NodePropertyNames',
        'js/brollgen.META.js',
        'js/Constants'], function (logManager,
                                                    nodePropertyNames,
                                                    domainMeta,
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
                self._client.updateTerritory(self._territoryId, { 'root' : { 'children': 5 }}); //TODO Set the necessary depth!
            }
        });

        this._client.addEventListener(this._client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
            self.currentObject = nodeId;
        });


    };

    GenerativeInterpreter.prototype.onOneEvent = function(events){
        this._client.removeUI(this._territoryId);

        if(this.currentObject)
            this._runGenerativeInterpreter();
    };

    GenerativeInterpreter.prototype._runGenerativeInterpreter = function(){
        this._logger.info("Running Generative Interpreter");
        this.original2copy = {}; //Mapping original node ids to copy
        this.boxes2process = [];
        this.tempNodeIds = [];
        this.outputId;

        //var childNames = this._client.getNode(this.currentObject).getChildrenIds(),
            //i = childNames.length;

        this._client.startTransaction();
        this._createOutputProject();

/*
        while(i--){        
            var node = this._client.getNode(childNames[i]);
            this._copyNode(node, this.outputId);
        }
*/

        this.boxes2process.push({ 'num': 1, 'child': this._client.getNode(this.currentObject), 'dstId': this.outputId });

        //Generate Loops, etc
        while(this.boxes2process.length){
            var boxInfo = this.boxes2process.splice(0,1),
                j = boxInfo[0].num,
                child = boxInfo[0].child,
                dstId = boxInfo[0].dstId;

            while(j--){
                this._cloneChildren(child, dstId);
            }
        }

        this._client.completeTransaction();

    };

    GenerativeInterpreter.prototype._createOutputProject = function(){
        var currentNode = this._client.getNode(this.currentObject),
            baseId = currentNode.getBaseId(),
            name = "Generated From " + currentNode.getAttribute(nodePropertyNames.Attributes.name);

        this.outputId = this._client.createChild({ 'parentId': CONSTANTS.PROJECT_ROOT_ID, 'baseId': baseId });

        this._setNodeAttributes(this.outputId, this.currentObject);
        this._client.setAttributes(this.outputId, nodePropertyNames.Attributes.name, name);
    };

    GenerativeInterpreter.prototype._cloneChildren = function(node, dstId){
        var childrenIds = node.getChildrenIds(),
            i = childrenIds.length,
            currId = node.getId(),
            self = this;

        childrenIds.sort(function(a, b){//Sort the childrenIds so connections come first
            var aPtrNames = self._client.getNode(a).getPointerNames(),
                bPtrNames = self._client.getNode(b).getPointerNames(),
                aVal = aPtrNames.indexOf(CONSTANTS.POINTER_SOURCE) > -1 && aPtrNames.indexOf(CONSTANTS.POINTER_TARGET) > -1,
                bVal = bPtrNames.indexOf(CONSTANTS.POINTER_SOURCE) > -1 && bPtrNames.indexOf(CONSTANTS.POINTER_TARGET) > -1;

            return bVal - aVal;
        });

        while(i--){
            var child = this._client.getNode(childrenIds[i]),
                childType = child.getBaseId(),
                ptrNames = child.getPointerNames(),
                src,
                dst,
                srcParent,
                dstParent;

            if( ptrNames.indexOf(CONSTANTS.POINTER_SOURCE) !== -1 
                && ptrNames.indexOf(CONSTANTS.POINTER_TARGET) !== -1){
                src = child.getPointer(CONSTANTS.POINTER_SOURCE);
                dst = child.getPointer(CONSTANTS.POINTER_TARGET);
                srcParent = this._client.getNode(src).getParentId();
                dstParent = this._client.getNode(dst).getParentId();
            }

            if(domainMeta.TYPE_INFO.isLoop(srcParent) || domainMeta.TYPE_INFO.isLoop(dstParent)){
                //Move the child into the loop object
                var dstParentId = domainMeta.TYPE_INFO.isLoop(srcParent) ? srcParent : dstParent,
                    newNodeId = this._copyNode(child, dstParentId, false);

                this._setNodeAttributes(newNodeId, childrenIds[i]);

            }else if(domainMeta.TYPE_INFO.isLoop(childrenIds[i])){
                var j = parseInt(child.getAttribute('iterations'));
                this.boxes2process.push({ 'num': j, 'child': child, 'dstId': dstId });
            }else{
                this._copyNode(child, dstId);
            }
        }

        for( var k in this.original2copy ){
            if( this.original2copy.hasOwnProperty(k) ){
                this._setNodeAttributes( this.original2copy[k], k);
            }
        }

        this.original2copy = {};
    };

    GenerativeInterpreter.prototype._copyNode = function(node, dstId, store){
        var names = node.getAttributeNames(),
            newNodeId,
            newNode,
            baseId = node.getBaseId(),
            parentId = node.getParentId(),
            pos = {};

        newNodeId = this._client.createChild({ 'parentId': dstId, 'baseId': baseId, 'position': pos });

        if(store !== false)
            this.original2copy[node.getId()] = newNodeId;//Store the mapping

        return newNodeId;
    };

    GenerativeInterpreter.prototype._setNodeAttributes = function(newNodeId, nodeId){
        var node = this._client.getNode(nodeId),
            names = node.getAttributeNames(),
            i = names.length,
            newNode = this._client.getNode(newNodeId);

        while(i--){//Copy attributes
            var attrName = names[i],
                attr = node.getAttribute(attrName),
                newAttr = newNode.getEditableAttribute(attrName);

            if( typeof attr === "Object" ){
                newAttr = attr;
            }else{
                this._client.setAttributes(newNodeId, attrName, attr)
            }
        }

        //Copy Pointers
        names = node.getPointerNames();
        i = names.length;

        while(i--){
            var ptrName = names[i],
                ptr = node.getPointer(ptrName).to;
            //Need to set the pointer to the copy of the new object...

            if(ptrName !== CONSTANTS.POINTER_BASE){
                this._client.makePointer(newNodeId, ptrName, (this.original2copy[ptr] || ptr));
            }

        }

        //Copy Registry Values
        names = node.getRegistryNames();
        i = names.length;

        while(i--){
            var regName = names[i],
                val = node.getRegistry(regName);

            this._client.setRegistry(newNodeId, regName, val);
        }

    };

    return GenerativeInterpreter;
});
