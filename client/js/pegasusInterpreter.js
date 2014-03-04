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
        this.pegasusTypes = domainMeta.META_TYPES;
        this.pegasusTypeCheck = domainMeta.TYPE_INFO;
        this.currentObject;
        this.namespace; //Set from the currentObject's name
        this.dx = 110;
        this.dy = 0;
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
        this._createCopyLists(childrenIds, this.params[0].parentId);

        var i = this.params.length;
        while(i--){
            this.original2copy[this.params[i].parentId] = this._client.copyMoreNodes(this.params[i]);
        }

        //Correct any incorrect connections - This assumes that all connections should be within the 
        //project (dstId)
        this._correctConnections(this.params[0].parentId);

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

                this.copyParams[job.dstId][i][job.id] = job.attr;
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


    PegasusInterpreter.prototype._createPaths = function(nIds){
        //Find start node
        var nodeIds = [],
            i,
            boundary = {},
            paths = [[]],
            p_i = 0,
            next = [];

        //Order the nodes by the following rule:
        //If it is linked to the last node, add it
        //O.W. get the highest node
        while(nIds.length){
           if(paths[p_i].length){
                //Get next point
                //Get the connected nodes
                var index = paths.length-1,
                    lastId = paths[index][paths[index].length-1],
                    lastNode = this._client.getNode(lastId),
                    lastPtrNames = lastNode.getPointerNames(),
                    added = false;

                i = -1;
                while(++i < nIds.length){
                    var nodeId = nIds[i],
                        node = this._client.getNode(nodeId),
                        nodePtrNames = node.getPointerNames(),
                        searchId = null,
                        connNode = null;//search node

                    if(this.pegasusTypeCheck.isConnection(nodeId)){
                        connNode = node;
                        searchId = lastId;
                    }else if(this.pegasusTypeCheck.isConnection(lastId)){ //Assuming not both connections
                        connNode = lastNode;
                        searchId = nodeId;
                    }

                    if(connNode){//one is a connection
                        var src = connNode.getPointer(CONSTANTS.POINTER_SOURCE).to,
                            dst = connNode.getPointer(CONSTANTS.POINTER_TARGET).to,
                            id = connNode === node ? lastId : nodeId;

                        if(src === searchId || dst === searchId
                                || src.indexOf(searchId+'/') !== -1 || dst.indexOf(searchId+'/') !== -1){//Then they are connected (to obj or children)
                            //add the nodeId to the nodeIds list
                            next[0] = nodeId;
                            added = true;
                            break;
                        }
                    }
                }
                    if(!added)//End of the given path
                        p_i++;

            }else{
                //Get start point
                //Get the top most node
                //NOTE: For now I will only support straight paths FIXME
                i = nIds.length;
                var minY = null,
                    topNode = null;
                while(i--){
                    var nodeId = nIds[i],
                        node = this._client.getNode(nodeId),
                        y = node.getRegistry("position").y;

                    if(minY > y || minY === null){//Compare y positions
                        topNode = nodeId;
                        minY = y;
                    }
                }

                next[0] = topNode;
            }

            //If there is a node in nodeIds, check to see 
            //if it is connected to the current

            //Add to paths
            if(paths[p_i] === undefined){ //Start a new path
                paths.push([]);
            }else{
                paths[p_i].push(next[0]);
                nIds.splice(nIds.indexOf(next[0]),1);
            }
 
        }
        return paths;
    };

    PegasusInterpreter.prototype._createCopyLists = function(nIds, dstId){
        var paths = this._createPaths(nIds),//Create lists out of lists
            i = paths.length;

        //Next, for each path, I will resolve the dot operators then the filesets
        while(i--){
            this._copyPath(paths[i], dstId);
        }
    };

    PegasusInterpreter.prototype._copyPath = function(path, dst, dis){
        //Find the maximal width TODO
        var i = -1;
        while(++i < path.length){
            if(this.pegasusTypeCheck.isConnection(path[i]) && !this.pegasusTypeCheck.isFileSet(path[i+1])){
                this._addToParams(path[i], dst);
            }else if(this.pegasusTypeCheck.isFileSet(path[i])){
                if(this.pegasusTypeCheck.isFork(path[i+2])){//Next is a Fork/Dot operator!
                    //Get the next process
                    var j = i+4,
                        next = path[j];
                    while(!this.pegasusTypeCheck.isJob(next)){
                        next = path[j+=2];
                    }

                    //I will need to create "parallel tracks"
                    this._processForkOperation(path[i], dst, { 'prev': i > 1 ? path[i-2] : null, 'job': path[j], 'jobConn': path[j+1], 'next': j < path.length - 2 ? path[j+2] : null });
                    i = j+2;
                }else{//All created files will share prev/next things in the list!
                    this._processFileSet(path[i], dst, i > 1 ? path[i-2] : null, i < path.length - 2 ? path[i+2] : null);//this._getFileNames(path[i]);
                    i++;//Skip the next connection
                }
            }else if(!this.pegasusTypeCheck.isConnection(path[i])){
                this._addToParams(path[i], dst);
            }
        }
    };

    PegasusInterpreter.prototype._processForkOperation = function(fsId, dst, nearObjects){
        //TODO
        //
        //I need to:
        //
        //Create a connection from prev to first created file
        var conn = this._createConnection(dst, prev, fsId);

        //Create a job
        var job;//TODO
        //Create a connection from file to job
        //
        //Copy connection (made previously)
        //Copy jobs
        //Copy path from 'jobs' (jobConn)
        console.log("FOUND A FORK!");
    };

    PegasusInterpreter.prototype._processFileSet = function(fsId, dst, prev, next){
        var fileObject = this._createFileFromFileSet(fsId, dst),
            file = fileObject.id,
            names = fileObject.names,
            pos = fileObject.position,
            dx = 110,//TODO figure out an intelligent way to set these!
            dy = 0,
            i = -1,
            conns = [];

        //Create the first connection (which we will copy)
        if(prev)
            conns.push(this._createConnection(dst, prev, file));

        if(next)
            conns.push(this._createConnection(dst, file, next));

        //Next, we will add these files to be copied
        while(++i < names.length){//FIXME add formatting to make it look nice
            var attr = {},
                position = { 'x': pos.x+(i+1)*dx, 'y': pos.y+(i+1)*dy },
                j = conns.length;

            attr[nodePropertyNames.Attributes.name] = names[i];
            this._addToParams(file, dst, { 'attributes': attr, 'registry': {'position': position} }); //FIXME shouldn't be hardcoded!

            while(j--){
                //Copy the conn(s) for each file copied
                this._addToParams(conns[j], dst);
            }
        }
    };

    PegasusInterpreter.prototype._createFileFromFileSet = function(fsId, dst){
        var pos = this._client.getNode(fsId).getRegistry('position'),//FIXME shouldn't be hardcoded
            names = this._getFileNames(fsId),
            fileId = this._client.createChild({ 'parentId': dst, 'baseId': this.pegasusTypes.File });

        this._client.setAttributes(fileId, nodePropertyNames.Attributes.name, names.splice(0,1)[0]);
        this._client.setRegistry(fileId, 'position', pos);

        return { 'id': fileId, 'names': names, 'position': pos };
    };

    PegasusInterpreter.prototype._createConnection = function(dstId, src, dst){
        var baseId = this.pegasusTypes.Job_Conn,
            connId;

        connId = this._client.createChild({ 'parentId': dstId, 'baseId': baseId });
        this._client.makePointer(connId, CONSTANTS.POINTER_SOURCE, src);
        this._client.makePointer(connId, CONSTANTS.POINTER_TARGET, dst);
        return connId;
    };

    PegasusInterpreter.prototype._getFileNames = function(fsId){//FileSet node
        var fs = this._client.getNode(fsId),
            filenames = fs.getAttribute('filenames'),
            names = [],
            k = filenames.indexOf('['),
            basename = filenames.slice(0,k) + "%COUNT" + filenames.slice(filenames.lastIndexOf(']')+1),
            i = filenames.slice(k+1),
            j;//Only supports one set of numbered input for now

        j = parseInt(i.slice(i.indexOf('-')+1, i.indexOf(']')));
        i = parseInt(i.slice(0,i.indexOf('-')));

        k = Math.max(i,j);
        i = Math.min(i,j)-1;

        while(i++ < j){
            names.push(basename.replace("%COUNT", i));
        }

        return names;
    };

    PegasusInterpreter.prototype._addToParams = function(nodeId, dstId, attr){
        var k = -1;

        while(++k < this.params.length && (this.params[k].parentId !== dstId || this.params[k][nodeId]));

        if(k === this.params.length || this.params[k][nodeId]){
            this.params.push({ 'parentId': dstId });
            k = this.params.length - 1;
        }

        this.params[k][nodeId] = attr || {};
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

    PegasusInterpreter.prototype._correctConnections = function(parentId){
        var nodeIds = this._client.getNode(parentId).getChildrenIds();

        while(nodeIds.length){
            var nodeId = nodeIds.splice(0, 1)[0],
                node = this._client.getNode(nodeId);

            if(node.getPointerNames().indexOf(CONSTANTS.POINTER_SOURCE) === -1)//Is it a type of connection?
                continue;

            var src = node.getPointer(CONSTANTS.POINTER_SOURCE).to,
                dst = node.getPointer(CONSTANTS.POINTER_TARGET).to;

            if(src.indexOf(parentId) !== 0)//Then points to something in another project
                this._client.makePointer(nodeId, CONSTANTS.POINTER_SOURCE, this.original2copy[parentId][src]);

            if(dst.indexOf(parentId) !== 0)
                this._client.makePointer(nodeId, CONSTANTS.POINTER_TARGET, this.original2copy[parentId][dst]);
        }
    };

return PegasusInterpreter;
});
