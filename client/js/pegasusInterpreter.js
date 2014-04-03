"use strict";

define(['logManager',
        'js/NodePropertyNames',
        'util/assert',
        'js/pegasus_prototype.META.js',
        'js/Constants'], function (logManager,
                                                    nodePropertyNames,
                                                    assert,
                                                    domainMeta,
                                                    CONSTANTS) {
  
    var PegasusInterpreter = function(_client) {
        this._logger = logManager.create('PegasusInterpreter');
        this._client = _client;
        this.pegasusTypes = domainMeta.META_TYPES;
        this.pegasusTypeCheck = domainMeta.TYPE_INFO;
        this.currentObject;
        this.namespace; //Set from the currentObject's name
        this.dx = 140;
        this.dy = 0;
        var self = this;

        WebGMEGlobal.Toolbar.addButton({ 'title': "Pegasus Interpreter",
            "text":"Pegasus", 
            "clickFn": function (){
            var terr = {};
            terr[WebGMEGlobal.State.getActiveObject()] = { 'root': { 'children': 5 }};
                self._client.updateTerritory(self._territoryId, terr);
                self._runPegasusInterpreter();
            }
        });

        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, function(modal, active_object_id){
                self.currentObject = active_object_id;
        });

    };

        //I will need to find the portions of the model that need to be duplicated
        //Algorithm:
        //Working from the top down
            //I will copy the filesets to files
            //Resolve the Fork operators
        //Add extra copies to make
    PegasusInterpreter.prototype._runPegasusInterpreter = function(){
        this._logger.info("Running Pegasus Interpreter");
        this.original2copy = {}; //Mapping original node ids to copy
        this.graph = null;
        this.params = [{ 'parentId': this.currentObject }];
        this.extraCopying = [];

        //Copying project
        this.outputId = this.currentObject;//this._createOutputProject();
        
        this._client.startTransaction();

        //var childrenIds = this._client.getNode(this.currentObject).getChildrenIds();
        var childrenIds = this._getChildrenAndClearPreview();//delete previously generated preview

        this._createCopyLists(childrenIds);

/*
        var i = this.params.length;
        while(i--){
            this.original2copy[this.params[i].parentId] = this._client.copyMoreNodes(this.params[i]);
        }

        //Correct any incorrect connections - This assumes that all connections should be within the 
        //project (dstId)
        this._correctConnections(outputId);

        this._client.completeTransaction();
        this._client.startTransaction();


        //Make any extra copies that were requested
        this.params = [{}];
        while(this.extraCopying.length){
            var job = this.extraCopying.splice(0, 1)[0];

            if(!this._isContainedBy(job.id, outputId))
                job.id = this.original2copy[job.dstId][job.id];

                this._addToParams(job.id, job.dstId, job.attr);
        }

        i = this.params.length;
        while(i--){
            this.original2copy[this.params[i].parentId] = this._client.copyMoreNodes(this.params[i]);
        }
        //Correct any incorrect connections - This assumes that all connections should be within the 
        //project (dstId)
        this._correctConnections(outputId);
*/

        this._client.completeTransaction();

    };

    PegasusInterpreter.prototype._getChildrenAndClearPreview = function(){
        //This method gets the children ids and removes the preview nodes before returning it
        var childrenIds = this._client.getNode(this.currentObject).getChildrenIds(),
            deleteIds = [],
            i = -1;

        while(++i < childrenIds.length){
            if(this.pegasusTypeCheck.isInPreviewAspect(childrenIds[i]))
                deleteIds.push(childrenIds.splice(i--,1)[0]);
        }

        this._client.delMoreNodes(deleteIds);

        return childrenIds;
    };

    PegasusInterpreter.prototype._createCopyLists = function(nIds){
        var forks;//Create lists out of lists

        //Next, for each path, I will resolve the dot operators then the filesets
        this._createGraph(nIds);
        forks = this._createSkeletonWorkflowAndGetForks();
        if(forks.length)
            this._copyForkGroups(forks);
        this._connectPreviewObjects();
    };

    PegasusInterpreter.prototype._createGraph = function(nIds){
        // I will create a dictionary of objects with pointers to the base/children
        // in the graph
        this.graph = {};
        var n,
            src,
            dst,
            nodes;

        //Order the nodes by the following rule:
        //If it is linked to the last node, add it
        //O.W. get the highest node
        while(nIds.length){
            //Create entries in the graph for all non-connection ids
            if(!this.pegasusTypeCheck.isConnection(nIds[0])/* && !this.pegasusTypeCheck.isInPreviewAspect(nIds[0])*/){//None should be in preview aspect

                if(!this.graph[nIds[0]])
                    this.graph[nIds[0]] = {'base': [], 'child': []};

            }else if(this.pegasusTypeCheck.isConnection(nIds[0]) ){//Connection
                n = this._client.getNode(nIds[0]);
                src = n.getPointer(CONSTANTS.POINTER_SOURCE).to;
                dst = n.getPointer(CONSTANTS.POINTER_TARGET).to;

                //Create src/dst if necessary
                if(!this.graph[src]){
                    this.graph[src] = {'base': [], 'child': []};
                }

                if(!this.graph[dst]){
                    this.graph[dst] = {'base': [], 'child': []};
                }

                //Update the src/dst entries in the graph
                this.graph[src].child.push(dst);
                this.graph[dst].base.push(src);
            }

            nIds.splice(0,1);
        }

        //Store the start node as 'start' in the dictionary
        nodes = Object.keys(this.graph);
        for(var ids in this.graph){
            if(this.graph.hasOwnProperty(ids)){
                if(this.pegasusTypeCheck.isFileSet(ids) || this.pegasusTypeCheck.isFile(ids)){
                    if(this.graph[ids].base.length === 0)
                        this.graph['start'] = ids;
                }
            }
        }
    };

    PegasusInterpreter.prototype._createSkeletonWorkflowAndGetForks = function(){
        // Traverse/Update the graph and create the forks object
        var forks = [],
            nodeIds = [this.graph.start],
            nodeId,
            preview,
            currFork,//Preview node
            fork,
            ids,
            skip,
            j,
            i;

        while(nodeIds.length){//BFS
            skip = false;
            //If the next node is a fork
            //Create a fork object and add to "forks"
            if( this.pegasusTypeCheck.isFork(this.graph[nodeIds[0]].child[0]) ){
                fork = { 'start': nodeIds[0], 'in': [], 'out': null  }; 
                if(currFork){//set the 'in'/'out' variable
                    currFork.in.push(fork);
                    fork.out = currFork;
                }

                forks.push(fork);
                currFork = fork;

                skip = true;
            }else if( this.pegasusTypeCheck.isMerge(nodeIds[0]) ){//Close the most recent fork

                assert(currFork, "No current fork");
                currFork.end = this.graph[nodeIds[0]].child[0];
                assert(this.graph[nodeIds[0]].child.length === 1, "Merge operators can have only one node following");

                currFork = currFork.out;
                skip = true;

            }else if( this.pegasusTypeCheck.isFileSet(nodeIds[0]) ){//If the node is a fileset and next is not a fork
                ids = this._processFileSet(nodeIds[0]);             //Resolve the whole fileset and insert the additional files into the graph
                preview = ids[0];
                i = 0;

                while(++i < ids.length){
                    this.graph[ids[i]] = { 'base': this.graph[nodeIds[0]].base, 'child': this.graph[nodeIds[0]].child };

                }
                    //j = nodeIds[0].base.length;
                    //while(j--){
                        //this._createConnection(nodeIds[0].base[j], ids[i]);//Create connection
                    //}
            }else{//Else create preview node

                preview = this._createPreviewNode(nodeIds[0]);
            }

            //Add the children of nodeId to nodeIds
            if(skip){
                nodeIds = nodeIds.concat(this.graph[this.graph[nodeIds[0]].child].child);
            }else{
                nodeIds = nodeIds.concat(this.graph[nodeIds[0]].child);
            }

            //Replace nodeIds[0] with preview object 
            if(preview){

                i = this.graph[nodeIds[0]].base.length;
                while(i--){
                    if(this.graph[this.graph[nodeIds[0]].base[i]].child.indexOf(preview) !== -1)//Kinda hacky
                        continue;

                    j = this.graph[this.graph[nodeIds[0]].base[i]].child.indexOf(nodeIds[0]);
                    if(j !== -1){
                        this.graph[this.graph[nodeIds[0]].base[i]].child.splice(j, 1, preview); //replace nodeIds[0] with preview
                    }else{
                        this.graph[this.graph[nodeIds[0]].base[i]].child.push(preview); //replace nodeIds[0] with preview
                    }
                }

                i = this.graph[nodeIds[0]].child.length;
                while(i--){
                    if(this.graph[this.graph[nodeIds[0]].child[i]].base.indexOf(preview) !== -1)
                        continue;

                    j = this.graph[this.graph[nodeIds[0]].child[i]].base.indexOf(nodeIds[0]);
                    if(j !== -1){
                        this.graph[this.graph[nodeIds[0]].child[i]].base.splice(j, 1, preview); //replace nodeIds[0] with preview
                    }else{
                        this.graph[this.graph[nodeIds[0]].child[i]].base.push(preview); //replace nodeIds[0] with preview
                    }
                }

                //Add preview to graph
                this.graph[preview] = this.graph[nodeIds[0]];
                if(this.graph.start === nodeIds[0])
                    this.graph.start = preview;
                delete this.graph[nodeIds[0]];
            }

            //Create a preview connection btwn preview node and base elements
            //i = nodeIds[0].base.length;
            //while(i--){
                //this._createConnection(nodeIds[0].base[i], nodeIds[0]);//Create connection
            //}

            nodeIds.splice(0,1);
        }

        return forks;
    };

    PegasusInterpreter.prototype._copyForkGroups = function(forks){
        var outer = forks[0];

        //Find the outermost fork and copy it 
        while(outer.out){
            outer = outer.out;
        }

        this._copyFork(outer);
    };

    PegasusInterpreter.prototype._copyFork = function(fork){
        var i = fork.in.length,
            numCopies,
            startNames = [],
            endNames = [],
            copyRequest = {},
            nodes = [],
            ids,
            x1,
            x2,
            y1,
            y2,
            j;

        assert(fork.start && fork.end, "Fork missing a merge operator");

        //Start a transaction
        this._client.startTransaction();

        //Copy any inside forks
        while(i--){
            this._copyFork(fork.in[i]);
        }

        //Resolve the first and last file
        var fileObject = this._createFileFromFileSet(fork.start),
            sfile = fileObject.id,//start file
            efile;//end file

        startNames = fileObject.names;

        fileObject = this._createFileFromFileSet(fork.end);
        efile = fileObject.id;
        endNames = fileObject.names;

        this._client.completeTransaction();

        this._client.startTransaction();

        //Insert the files into the graph
        this._replaceInGraph(sfile, fork.start);
        this._replaceInGraph(efile, fork.end);

        fork.end = efile;

        //Get the number of copies needed from fork.start fileset
        numCopies = startNames.length;

        if(endNames.length < startNames.length){
            i = startNames.length;
            endNames = [];
            while(i--){
                endNames.push(startNames[i] + "out");
            }
        }

        nodes.push(sfile);
        //Figure out the size of the current fork

        var pos;
        while(this.graph[nodes[0]] && this.graph[nodes[0]].base[0] !== fork.end){//BFS
            //Get the position info about entire box
            pos = this._client.getNode(nodes[0]).getRegistry('position');
            x1 = Math.min(x1, pos.x) || pos.x; 
            x2 = Math.max(x2, pos.x) || pos.x; 
            y1 = Math.min(y1, pos.y) || pos.y; 
            y2 = Math.max(y2, pos.y) || pos.y; 

            //Create list of nodes to copy
            copyRequest[nodes[0]] = { 'registry': { 'position': { 'x': pos.x , 'y': pos.y} }};
            //copyRequest[nodes[0]]['registry'][

            //Add next nodes
            nodes = nodes.concat(this.graph[nodes[0]].child);

            nodes.splice(0,1);
        }

        //Copy the nodes
        var dx = this.dx + (x2-x1),
            dy = this.dy + (y2-y1),
            nodeIds;

        i = 0;
        while(++i <= numCopies){
            //Set names
            copyRequest[sfile]['attributes'] = {};
            copyRequest[sfile]['attributes'][nodePropertyNames.Attributes.name] = startNames[i];
            copyRequest[efile]['attributes'] = {};
            copyRequest[efile]['attributes'][nodePropertyNames.Attributes.name] = endNames[i];

            //Shift each node
            for(var k in copyRequest){
                if(copyRequest.hasOwnProperty(k)){
                    copyRequest[k]['registry']['position']['x'] += dx;
                    copyRequest[k]['registry']['position']['y'] += dy;
                }
            }

            //Insert nodes into graph
            nodeIds = this._client.copyMoreNodes(copyRequest);
            for(var k in nodeIds){
                if(nodeIds.hasOwnProperty(k)){//Insert the node copy into our graph

                    j = this.graph[k].child.length;
                    while(j--){
                        this.graph[this.graph[k].child[i]].base.push(nodeIds[k]);
                    }

                    j = this.graph[k].child.length;
                    while(j--){
                        j = this.graph[this.graph[k].base[j]].child.push(nodeIds[k]);
                    }
                }
            }
        }

        //Finish the transaction
        this._client.completeTransaction();
    };

    PegasusInterpreter.prototype._connectPreviewObjects = function(){
        var nodeIds = [this.graph['start']],
            visited = {},//dictionary of visited nodes
            j;

        while(nodeIds.length){
            if(visited[nodeIds[0]]){
                nodeIds.splice(0,1);
                continue;
            }

            j = this.graph[nodeIds[0]].base.length;

            while(j--){
                this._createConnection(nodeIds[0], this.graph[nodeIds[0]].base[j]);
            }

            nodeIds = nodeIds.concat(this.graph[nodeIds[0]].child);
            visited[nodeIds.splice(0,1)[0]] = true;
        }
    };

    PegasusInterpreter.prototype._replaceInGraph = function(nodes, original){
        nodes = nodes instanceof Array ? nodes : [nodes];

        this._addToGraph(nodes, original);

        if(this.graph.start === original)
            this.graph.start = nodes[0];
        delete this.graph[original];
    }; 

    PegasusInterpreter.prototype._addToGraph = function(nodes, original){
        nodes = nodes instanceof Array ? nodes : [ nodes ];
        var node,
            k = nodes.length,
            j,
            i;

        while(k--){
            node = nodes[k];

            //Set the node's child/base ptrs
            this.graph[node] = this.graph[original];

            i = this.graph[original].base.length;//Set all bases' children ptrs
            while(i--){
                if(this.graph[this.graph[original].base[i]].child.indexOf(node) !== -1)//Kinda hacky
                    continue;

                j = this.graph[this.graph[original].base[i]].child.indexOf(original);
                if(j !== -1){
                    this.graph[this.graph[original].base[i]].child.splice(j, 1, node); //replace original with node
                }else{
                    this.graph[this.graph[original].base[i]].child.push(node); //replace original with node
                }
            }

            i = this.graph[original].child.length;
            while(i--){//Set all children's base ptrs
                if(this.graph[this.graph[original].child[i]].base.indexOf(node) !== -1)
                    continue;

                j = this.graph[this.graph[original].child[i]].base.indexOf(original);
                if(j !== -1){
                    this.graph[this.graph[original].child[i]].base.splice(j, 1, node); //replace original with node
                }else{
                    this.graph[this.graph[original].child[i]].base.push(node); //replace original with node
                }
            }
        }
    }; 

    PegasusInterpreter.prototype._processForkOperation = function(dst, path, index){
        //Get the next process
        var prev = index >= 1 ? index - 2 : -1,
            fsId = index,
            next,
            job,
            jobConn,
            next,
            nextItem,
            conns = [],
            count = this._getFileNames(path[index]).length,
            fileObject = this.pegasusTypeCheck.isFileSet(path[fsId]) ? this._createFileFromFileSet(path[fsId], dst) : 
            { 'id': path[fsId], 'name': this._client.getNode(path[fsId]).getAttribute(nodePropertyNames.Attributes.name), 
                'position': this._client.getNode(path[fsId]).getRegistry('position') },
            file = fileObject.id,
            dx = this.dx,
            dy = this.dy,
            i = -1,//total files and jobs to create in parallel
            names = fileObject.names,
            shift = {'x': dx * (count-2)/2, 'y': dy * (count-2)/2 },
            pos = [ { 'x': fileObject.position.x, 'y': fileObject.position.y }]; //input

        //Need to handle the filesets, connection to prev on the first run only.

        //prev to first created file
        if(prev !== -1)
            conns.push(this._createConnection(path[prev], file));

        //Copy the initial fileset
        i = 0;
        while(++i < count){
            var attr = {},
                position = { 'x': pos[0].x+(i)*dx, 'y': pos[0].y+(i)*dy };

            attr[nodePropertyNames.Attributes.name] = names[i];
            this.extraCopying.push({ 'num': 1, 'id': file, 'dstId': dst, 'attr': { 'attributes': attr, 'registry': {'position': position} }});
        }

        do {
            /* * * * * * * * Find the next important values    * * * * * * * */
            prev = index >= 1 ? index - 2 : -1;
            fsId = index;
            index += 4;
            job = index;
            while(!this.pegasusTypeCheck.isJob(path[job]) && job < path.length - 2){
                job += 2;
            }

            jobConn = job + 1;
            next = jobConn < path.length - 1 ? jobConn + 1 : -1;
            nextItem = next < path.length - 2 ? next + 2 : -1;

            if(!fileObject){//This will happen all but first iteration
                fileObject = { 'id': path[fsId], 'name': this._client.getNode(path[fsId]).getAttribute(nodePropertyNames.Attributes.name), 
                    'position': this._client.getNode(path[fsId]).getRegistry('position') };
                names = outputNames;
            }
            file = fileObject.id;
            i = -1;//total files and jobs to create in parallel
            pos = [{ 'x': this._client.getNode(path[job]).getRegistry('position').x, 
                'y': this._client.getNode(path[job]).getRegistry('position').y }];//input, job, output

            /* * * * * * * * Now process things    * * * * * * * */
            var ofile,
                outputNames = this.pegasusTypeCheck.isFileSet(path[next]) ? this._getFileNames(path[next]) : [],
                nextJob;
            //TODO if path[next] is not a fileset, create one and insert it into the path array

            //Create output names
            if(outputNames.length < count){
                outputNames = names.slice(0);
                while(++i < outputNames.length){
                    var j;
                    if((j = outputNames[i].lastIndexOf(".out")) !== -1){
                        var base = outputNames[i].substr(0, j + 4),
                            c = parseInt(outputNames[i].substr(j + 4)) || 1;

                        outputNames[i] = base + (c + 1);
                    }else{
                        outputNames[i] += '.out';
                    }
                }
            }

            //Create output file
            shift = { 'x': this.dx * (outputNames.length-2)/2, 'y': this.dy * (outputNames.length-2)/2 };

            if(path[next] === undefined)//Make sure we have an output file!
                throw "Operation needs an output file!";

            pos.push({ 'x': this._client.getNode(path[next]).getRegistry('position').x,//FIXME shouldn't be hardcoded
                    'y': this._client.getNode(path[next]).getRegistry('position').y });

            pos[1].x = Math.max(0, pos[1].x - shift.x);
            pos[1].y = Math.max(0, pos[1].y - shift.y);

            ofile = this._createFile(outputNames[0], pos[1]);

            //In case we are doing another iteration...
            path[next] = ofile;

            /* * * * * * Job * * * * * */
            //Shift the pos values to roughly center the boxes
            pos[0].x = Math.max(0, pos[0].x - shift.x);
            pos[0].y = Math.max(0, pos[0].y - shift.y);

            
            //Copy the first job
            var job_node = this._client.getNode(path[job]);

            path[job] = this._createJob(job_node.getAttribute(nodePropertyNames.Attributes.name), job_node.getAttribute('cmd'), pos[0]);


            /* * * * Connections * * * * */
            //file to job
            conns.push(this._createConnection(file, path[job]));

            if(path[nextItem] && !this.pegasusTypeCheck.isFork(path[nextItem])){
                path[nextItem] = this._createPreviewNode(dst, path[nextItem]);
                conns.push(this._createConnection(ofile, path[nextItem]));
            }

            //file to job
            if(jobConn !== -1){
                //Fix JobConn to point to the correct output file
                path[jobConn] = this._createConnection(path[job], ofile);
                conns.push(path[jobConn]);
            }

            //Now I have created the structure to copy; just need to copy it
            // (with extraCopying)

            i = 0;
            while(++i < count){
                var attr = {},
                    position = [ { 'x': pos[0] .x+(i)*dx, 'y': pos[0].y+(i)*dy }, { 'x': pos[1] .x+(i)*dx, 'y': pos[1].y+(i)*dy }],
                    j = conns.length;

                attr[nodePropertyNames.Attributes.name] = outputNames[i];

                this.extraCopying.push({ 'num': 1, 'id': path[job], 'dstId': dst, 'attr': { 'registry': {'position': position[0]} }});
                this.extraCopying.push({ 'num': 1, 'id': ofile, 'dstId': dst, 'attr': { 'attributes': attr, 'registry': {'position': position[1]} }});

                while(j--){
                    //TODO Remove the 'num' attribute - deprecated
                    //Copy the conn(s) for each file copied
                    this.extraCopying.push({ 'num': 1, 'id': conns[j], 'dstId': dst, 'attr': { 'registry': {'position': position[1]} }});
                }
            }

            index = next;
            conns = [];//Clear conns for next run
            fileObject = null;
        } while(nextItem !== -1 && this.pegasusTypeCheck.isFork(path[nextItem]));

        return index+2;
    };

    PegasusInterpreter.prototype._processFileSet = function(fsId){//return ids: [ first file, ... rest ]
        var fileObject = this._createFileFromFileSet(fsId),
            ids = [ fileObject.id ],
            id,
            names = fileObject.names,
            pos = { 'x': fileObject.position.x, 'y': fileObject.position.y },
            dx = this.dx,//TODO figure out an intelligent way to set these!
            dy = this.dy,
            i = 0,
            conns = [],
            attr,
            position,
            j;

        this.graph[ids[0]] = { 'base': this.graph[fsId].base, 'child': this.graph[fsId].child };//Add the files to the graph

        i = 0;
        //Next, we will create the rest of the files
        while(++i < names.length){
            attr = {};
            position = { 'x': pos.x+(i)*dx, 'y': pos.y+(i)*dy };

            id = this._createFile(names[i], position);
            this.graph[id] = { 'base': this.graph[fsId].base, 'child': this.graph[fsId].child };//Add the files to the graph
            ids.push(id);

            j = this.graph[fsId].base.length;
            while(j--){
                this.graph[this.graph[fsId].base[j]].child.push(id);
            }

            j = this.graph[fsId].child.length;
            while(j--){
                this.graph[this.graph[fsId].child[j]].base.push(id);
            }

        }

        return ids;
    };

    PegasusInterpreter.prototype._createFileFromFileSet = function(fsId){
        var pos = { 'x': this._client.getNode(fsId).getRegistry('position').x,//FIXME shouldn't be hardcoded
            'y': this._client.getNode(fsId).getRegistry('position').y },
            names = this._getFileNames(fsId),
            name = names[0],
            fileId, 
            shift = { 'x': this.dx * (names.length-1)/2, 'y': this.dy * (names.length-1)/2 };//adjust pos by names and dx/dy

        pos.x = Math.max(0, pos.x - shift.x);
        pos.y = Math.max(0, pos.y - shift.y);

        fileId = this._createFile(name, pos);

        return { 'id': fileId, 'name': name, 'names': names, 'position': pos };
    };

    PegasusInterpreter.prototype._createConnection = function(src, dst){
        var baseId = this.pegasusTypes.PreviewConn,
            connId;

        connId = this._client.createChild({ 'parentId': this.outputId, 'baseId': baseId });
        this._client.makePointer(connId, CONSTANTS.POINTER_SOURCE, src);
        this._client.makePointer(connId, CONSTANTS.POINTER_TARGET, dst);
        return connId;
    };

    PegasusInterpreter.prototype._createPreviewNode = function(id){
        //Creates the Preview_File/Job 
        var node = this._client.getNode(id),
            name = node.getAttribute(nodePropertyNames.Attributes.name),
            pos = node.getRegistry('position');

        if(this.pegasusTypeCheck.isFile(id)){

            id = this._createFile(name, pos);

        }else {//if(this.pegasusTypeCheck.isJob(id)){

            var cmd = node.getAttribute('cmd') || "MACRO";
            id = this._createJob(name, cmd, pos);

        }

        return id;
    };

    PegasusInterpreter.prototype._createFile = function(name, pos){
        //Create a file type only viewable in the "Preview" aspect: Preview_File
        var baseId = this.pegasusTypes.PreviewFile,
            fileId;

        fileId = this._client.createChild({ 'parentId': this.outputId, 'baseId': baseId });

        this._client.setAttributes(fileId, nodePropertyNames.Attributes.name, name || "File_1");//Set name
        this._client.setRegistry(fileId, 'position', pos);//Set position

        return fileId;
    };

    PegasusInterpreter.prototype._createJob = function(name, cmd, pos){
        //Create a file type only viewable in the "Preview" aspect: Preview_File
        var baseId = this.pegasusTypes.PreviewJob,
            jobId;

        jobId = this._client.createChild({ 'parentId': this.outputId, 'baseId': baseId });

        this._client.setAttributes(jobId, nodePropertyNames.Attributes.name, name);//Set name
        this._client.setAttributes(jobId, 'cmd', cmd);//Set name
        this._client.setRegistry(jobId, 'position', pos);//Set position

        return jobId;
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

    PegasusInterpreter.prototype._correctConnections = function(parentId){
        var nodeIds = this._client.getNode(parentId).getChildrenIds();

        while(nodeIds.length){
            var nodeId = nodeIds.splice(0, 1)[0],
                node = this._client.getNode(nodeId);

            if(node.getPointerNames().indexOf(CONSTANTS.POINTER_SOURCE) === -1)//Is it a type of connection?
                continue;

            var src = node.getPointer(CONSTANTS.POINTER_SOURCE).to,
                dst = node.getPointer(CONSTANTS.POINTER_TARGET).to;

            if(!this._isContainedBy(src, parentId))//Then points to something in another project
                this._client.makePointer(nodeId, CONSTANTS.POINTER_SOURCE, this.original2copy[parentId][src]);

            if(!this._isContainedBy(dst, parentId))//Then points to something in another project
                this._client.makePointer(nodeId, CONSTANTS.POINTER_TARGET, this.original2copy[parentId][dst]);
        }
    };

    PegasusInterpreter.prototype._isContainedBy = function(id, parentId){
        return id.indexOf(parentId) === 0;
    };

    return PegasusInterpreter;
});
