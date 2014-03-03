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
                self._client.updateTerritory(self._territoryId, { 'root': { 'children': 5 }});
                self._runPegasusInterpreter();
            }
        });

        this._client.addEventListener(this._client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
            self.currentObject = nodeId;
        });

    };

        //I will need to find the portions of the model that need to be duplicated
        //Algorithm:
        //Working from the top left to the bottom right, 
            //I will need to expand from the most enclosed version (recursively?)
            //Keep track of the "push zones" or the areas that objects need to be moved from (to make space)
        //Finally, add all the remaining objects with respect to the "push zones"
    PegasusInterpreter.prototype._runPegasusInterpreter = function(){
        this._logger.info("Running Pegasus Interpreter");
        this.original2copy = {}; //Mapping original node ids to copy
        this.boxes2process = [];
        this.params = [{}];
        this.extraCopying = [];

        //Copying project
        this._createOutputProject();
        this._client.startTransaction();

        var childrenIds = this._client.getNode(this.currentObject).getChildrenIds();
        this._copyNodes(childrenIds, this.params[0].parentId);

        var i = this.params.length;
        while(i--){
            this.original2copy[this.params[i].parentId] = this._client.copyMoreNodes(this.params[i]);
        }

        this._client.completeTransaction();
        this._client.startTransaction();


        //Make any extra copies that were requested
        this.copyParams = {};
        while(this.extraCopying.length){
            var job = this.extraCopying.splice(0, 1)[0],
                i = 0;
            job.id = this.original2copy[job.dstId][job.id];

            while(i < job.num){

                if(this.copyParams[job.dstId] === undefined)
                    this.copyParams[job.dstId] = [{ 'parentId': job.dstId }];

                if(i === this.copyParams[job.dstId].length)
                    this.copyParams[job.dstId].push({ 'parentId': job.dstId });

                this.copyParams[job.dstId][i][job.id] = {};
                i++;
            }
        }

        for(var plist in this.copyParams){
            if(this.copyParams.hasOwnProperty(plist)){
                i = this.copyParams[plist].length;
                while(i--){
                    this._client.copyMoreNodes(this.copyParams[plist][i]);
                }
            }
        }
        this._client.completeTransaction();

    };

    PegasusInterpreter.prototype._createOutputProject = function(){
        var currentNode = this._client.getNode(this.currentObject),
            baseId = currentNode.getBaseId(),
            name = "Generated From " + currentNode.getAttribute(nodePropertyNames.Attributes.name);

        this.params[0].parentId = this._client.createChild({ 'parentId': currentNode.getParentId(), 'baseId': baseId });

        this._setNodeAttributes(this.params[0].parentId, this.currentObject);
        this._client.setAttributes(this.params[0].parentId, nodePropertyNames.Attributes.name, name);
    };


    PegasusInterpreter.prototype._copyNodes = function(nIds, dstId){
        //Find start node
        var nodeIds = [],
            i,
            boundary = {},
            paths = [],
            p_i = 0,
            next = [];

        //Order the nodes by the following rule:
        //If it is linked to the last node, add it
        //ow get the highest node
        while(nIds.length){
            //Add to paths
            if(paths[p_i] === undefined){ //Start a new path
                paths.push([]);
            }else{
                paths[p_i].push(next[0]);
                nIds.splice(nIds.indexOf(next[0]));
            }

            if(paths[p_i].length){
                //Get next point
                //Get the connected nodes
                while(++i < nIds.length){
                    var nodeId = nIds[i],
                        node = this._client.getNode(nodeId),
                        index = paths.length-1,
                        lastNode = paths[index][paths[index].length-1],
                        nodePtrNames = node.getPointerNames(),
                        lastPtrNames = lastNode.getPointerNames(),
                        lastId = nodeIds.length ? null : nodeIds[nodeIds.length-1],
                        added = false,
                        searchId,
                        sNode;//search node

                    if(nodePtrNames.indexOf(CONSTANTS.POINTER_SOURCE) !== -1){
                        sNode = node;
                        searchId = lastId;
                    }else if(lastPtrNames.indexOf(CONSTANTS.POINTER_SOURCE) !== -1){ //Assuming not both connections
                        sNode = lastNode;
                        searchId = nodeId;
                    }

                    if(sNode){//one is a connection
                        var src = sNode.getPointer(CONSTANTS.POINTER_SOURCE).to,
                            dst = sNode.getPointer(CONSTANTS.POINTER_TARGET).to,
                            id = sNode === node ? lastId : id;

                        if(src == id || dst === id){//Then they are connected
                            //add the nodeId to the nodeIds list
                            next[0] = nodeId;
                            added = true;
                            break;
                        }
                    }

                    if(!added)//End of the given path
                        p_i++;

                }
            }else{
                //Get start point
                //Get the top most node
                //NOTE: For now I will only support straight paths FIXME
                i = nIds.length;
                var minY = undefined,
                    topNode = null;
                while(i--){
                    var nodeId = nIds[i],
                        node = this._client.getNode(nodeId);

                        if(minY > y1)//Compare y positions
                            topNode = nodeId;
                }

                next[0] = topNode;
            }

            /*
               var x1 = ,//TODO
               x2 = ,
               y1 = ,
               y2 = ;
            //Get boundary rectangle
            boundary.x1 = Math.min(boundary.x1, x1);
            boundary.x2 = Math.max(boundary.x2, x2);
            boundary.y1 = Math.min(boundary.y1, y1);
            boundary.y2 = Math.max(boundary.y2, y2);
             */

            //If there is a node in nodeIds, check to see 
            //if it is connected to the current
        }

        //Next, for each path, I will need to pass through and find any sub paths that will need to be duplicated
        i = paths.length;
        while(i--){
            this._processPath(path[i], dst);
        }
    };

    PegasusInterpreter.prototype._processPath = function(path, dst){
        //Find the areas to copy multiple times 
        //using Dot and Collect operators
        var i = 1;
//Get the duplication number from the first node
//TODO
//if(this.pegasusTypes.isFileSet(path[0]) && this.pegasusTypes.isDot(path[1]))
//var num = this.getFileCount(path[0]);
var num = 1;

//get boundary box

//
while(++i < path.length){
        var node = this._client.getNode(path[i]);

//if(//leader is a dot operator
}

    };
    
    PegasusInterpreter.prototype._copyPath = function(path, dst, dis){
        //For a given path, this method will copy path to dst with the given displacement
        //dis = {dx: dy:}
    };

/*
        //Next, we will 
        i = nodeIds.length;
        while(i--){
             var child = this._client.getNode(childrenIds[i]),
                childType = child.getBaseId(),
                ptrNames = child.getPointerNames(),
                src = null,
                dst = null,
                srcParent = null,
                dstParent = null;

            n = num || 1;

            if( ptrNames.indexOf(CONSTANTS.POINTER_SOURCE) !== -1 
                && ptrNames.indexOf(CONSTANTS.POINTER_TARGET) !== -1){
                src = child.getPointer(CONSTANTS.POINTER_SOURCE).to;
                dst = child.getPointer(CONSTANTS.POINTER_TARGET).to;
                srcParent = this._client.getNode(src).getParentId();
                dstParent = this._client.getNode(dst).getParentId();

            }

            if((domainMeta.TYPE_INFO.isLoop(srcParent) && srcParent !== nodeId) || (domainMeta.TYPE_INFO.isLoop(dstParent) && dstParent !== nodeId)){
                var dstParentId = domainMeta.TYPE_INFO.isLoop(srcParent) ? srcParent : dstParent,
                    j = parseInt(this._client.getNode(dstParentId).getAttribute('iterations'));

                this._addToParams(childrenIds[i], dstId);
                this.extraCopying.push({ 'num': j - 1, 'id': childrenIds[i], 'dstId': dstId });

            }else if(domainMeta.TYPE_INFO.isLoop(childrenIds[i])){
                var j = parseInt(child.getAttribute('iterations'));

                this._cloneChildren(childrenIds[i], dstId, j);
            }else{

                if(this._addToParams(childrenIds[i], dstId));
                    n--;//Decrement if one instance of the object is added to this.params

                if(n > 0)
                    this.extraCopying.push({ 'num': n, 'id': childrenIds[i], 'dstId': dstId });

                //if(child.getChildrenIds().length !== 0)
                    //this._cloneChildren(childrenIds[i], 
            //}

        }

        return boundary;
    };
    */

    PegasusInterpreter.prototype._addToParams = function(nodeId, dstId){
        var k = this.params.length;

        while(--k >= 0 && this.params[k].parentId !== dstId);

        if(k < 0){
            this.params.push({ 'parentId': dstId });
            k = this.params.length - 1;
        }

        if(this.params[k][nodeId])
            return false; //Not added - already exists in params

        this.params[k][nodeId] = {};
        return true;
    };

    PegasusInterpreter.prototype._setNodeAttributes = function(newNodeId, nodeId){
        var node = this._client.getNode(nodeId),
            names = node.getAttributeNames(),
            i = names.length,
            newNode = this._client.getNode(newNodeId);

        while(i--){//Copy attributes
            var attrName = names[i],
                attr = node.getAttribute(attrName);
            var newAttr = newNode.getEditableAttribute(attrName);

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

    return PegasusInterpreter;
});
