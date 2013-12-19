"use strict";

define(['logManager',
        'js/NodePropertyNames',
        'js/Utils/METAAspectHelper',
        'js/Constants'], function (logManager,
                                                    nodePropertyNames,
                                                    METAAspectHelper,
                                                    CONSTANTS) {
  
    var PegasusInterpreter = function(_client) {
        this._logger = logManager.create('PegasusInterpreter');
        this._client = _client;
        this.currentObject;
        var self = this;

        WebGMEGlobal.Toolbar.addButton({ 'title': "Pegasus Interpreter",
            "text":"Pegasus", 
            "clickFn": function (){
                self._runPegasusInterpreter();
            }
        });

        this._client.addEventListener(this._client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
            self.currentObject = nodeId;
        });


    };

    PegasusInterpreter.prototype._runPegasusInterpreter = function(){
        this.nodesByType = {};
        this.connections = [];
        this.nodeId2jobId = {};
        this._logger.warning("Pegasus is running on " + this._client.getNode(this.currentObject).getAttribute(nodePropertyNames.Attributes.name));
        if( this.currentObject !== undefined 
            && this._client.getNode(this._client.getNode(this.currentObject).getBaseId()).getAttribute(nodePropertyNames.Attributes.name) === 'Project' ){//Check that the current page is a 'Project'
            var childNames = this._client.getNode(this.currentObject).getChildrenIds(),
                dax;

            //Populate the object arrays by type
            childNames.forEach( function( name, index, array ){
                var node = this._client.getNode(name),
                    type = this._client.getNode(node.getBaseId()).getAttribute(nodePropertyNames.Attributes.name),
                    isConnection = node.getPointerNames().indexOf(CONSTANTS.POINTER_SOURCE) !== -1 && 
                        node.getPointerNames().indexOf(CONSTANTS.POINTER_TARGET) !== -1 ;

                if(this.nodesByType[type] === undefined)
                    this.nodesByType[type] = [];

                if(isConnection)
                    this.connections.push(node);

                this.nodesByType[type].push(node);

            }, this);

            dax = this._createXML(this._client.getNode(this.currentObject).getAttribute(nodePropertyNames.Attributes.name));

            //Create the transformation catalog
            var tc = this._createTC();

            //Create the replica catalog
            var rc = this._createRC();

            //this._downloadText(dax, "result.dax");
            this._downloadText(tc, "tc.dat");
            this._downloadText(rc, "rc.dat");
        }
    };

    //DAX creating methods
    PegasusInterpreter.prototype._createXML = function(xmlName){
        //Constructing a string for the xml
        var date = new Date(),
            graphInfo = '',
            res = '<?xml version="1.0" encoding="UTF-8"?>\n<!-- generated: ' + date.getFullYear() + '-' + (date.getMonth().length === 1 ? '0' + date.getMonth() : date.getMonth() ) 
                + '-' + (date.getDate().length === 1 ? '0' + date.getDate() : date.getDate() ) + ' ' 
                + (date.getHours().length === 1 ? '0' + date.getHours() : date.getHours() ) + ':'
                + (date.getMinutes().length === 1 ? '0' + date.getMinutes() : date.getMinutes() ) + ':'
                + (date.getSeconds().length === 1 ? '0' + date.getSeconds() : date.getSeconds() ) + ' -->\n<adag xmlns="http://pegasus.isi.edu/schema/DAX" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://pegasus.isi.edu/schema/DAX http://pegasus.isi.edu/schema/dax-3.4.xsd" version="3.4" name="' + xmlName + '">\n';

        //Add jobs and arg info
        this.nodesByType['Transformation Ref'].forEach( function( node, index, array ){
            var id,
                input = [],
                output = [],
                uses = '',
                nodeParents = '';

            //Create job id
            if(this.nodeId2jobId[node.getId()] === undefined)
                this._generateId(node.getId());

            id = this.nodeId2jobId[node.getId()];

            //get incoming and outgoing files and create graphInfo
            nodeParents = '<child ref="' + id + '">\n';
            this.connections.forEach( function ( conn, i, a ){
                if(conn.getPointer(CONSTANTS.POINTER_SOURCE).to === node.getId())
                    output.push(conn);
                    
                if(conn.getPointer(CONSTANTS.POINTER_TARGET).to === node.getId()){
                    var parId = conn.getPointer(CONSTANTS.POINTER_SOURCE).to;

                    input.push(conn);

                    if(this.nodeId2jobId[parId] === undefined)
                        this._generateId(parId);

                    nodeParents += '<parent ref="' + this.nodeId2jobId[parId] + '" />\n';
                }

            }, this);
            nodeParents += '</child>\n';

            if( nodeParents.indexOf("parent") !== -1 )
                graphInfo += nodeParents;

            res += '\t<job id="' + id + '" name="' + node.getAttribute(nodePropertyNames.Attributes.name) + '">\n';

            //create argument info based off of the connections
            res += '\t\t<argument>'
            input.forEach( function (conn, i, a) {
                var name = conn.getAttribute(nodePropertyNames.Attributes.name),
                    register = conn.getAttribute("register"),
                    transfer  = conn.getAttribute('transfer'),
                    src = this._client.getNode(conn.getPointer(CONSTANTS.POINTER_SOURCE).to),
                    srcType = this._client.getNode(src.getBaseId()).getAttribute(nodePropertyNames.Attributes.name);
    
                if( srcType === 'Start' ) 
                    name = src.getAttribute(nodePropertyNames.Attributes.name);

                res += ' -i <file name="' + name + '"/>';
                uses += '\t\t\t<uses name="' + name + '" link="input" register="' + register + '" transfer="' + transfer + '" />\n';
            }, this);

            output.forEach( function (conn, i, a) {
                var name = conn.getAttribute(nodePropertyNames.Attributes.name),
                    register = conn.getAttribute("register"),
                    transfer  = conn.getAttribute('transfer'),
                    tgt = this._client.getNode(conn.getPointer(CONSTANTS.POINTER_TARGET).to),
                    tgtType = this._client.getNode(tgt.getBaseId()).getAttribute(nodePropertyNames.Attributes.name);
    
                if( tgtType === 'End'){
                    name = tgt.getAttribute(nodePropertyNames.Attributes.name);
                    transfer = true; //TODO Is this always true?
                }


                res += ' -i <file name="' + name + '"/>';
                uses += '\t\t\t<uses name="' + name + '" link="output" register="' + register + '" transfer="' + transfer + '" />\n';
            }, this);

            res += '</argument>\n' + uses;


            res += '\t</job>\n';

        }, this);

        //Add job graph info

        res += '</adag>';
        return res;
    };

    PegasusInterpreter.prototype._generateId = function(nodeId){
        var id = (Object.keys(this.nodeId2jobId).length + 1).toString();

        while( id.length < 7 ){
            id = '0' + id;
        }
        id = 'ID' + id;

        this.nodeId2jobId[nodeId] = id;
    };

    PegasusInterpreter.prototype._createTC = function(){
        //Create a Transformation Catalog
        var res = '',
            trans = [],
            tranRefs = this.nodesByType['Transformation Ref'];

        tranRefs.forEach( function( tranRef, index, array ){
            var tranId = tranRef.getPointer(CONSTANTS.POINTER_REF).to; //Get referenced transition
                
            if(trans.indexOf(tranId) === -1){ //If we haven't already accounted for the transformations
                var tran = this._client.getNode(tranId),
                    name = tran.getAttribute(nodePropertyNames.Attributes.name),
                    pfn = tran.getAttribute('Physical File Name'),
                    type = tran.getAttribute('Type'),
                    site = this._client.getNode(tran.getParentId()),
                    siteName = site.getAttribute(nodePropertyNames.Attributes.name),
                    arch = tran.getAttribute('Architecture') || site.getAttribute('Architecture'),//If arch, os not specified assume it can run on the the respective site
                    os = tran.getAttribute('OS') || site.getAttribute('OS');

                
                res += 'tr ' + name + ' {\n\tsite ' + siteName
                        + ' {\n\t\tpfn ' + pfn 
                        + '\n\t\tarch ' + arch
                        + '\n\t\tos ' + os
                        + '\n\t\ttype ' + type + '\n\t}\n}\n\n';

                trans.push(tranId);
            }
                
        }, this);

        return res;
    };
    
    PegasusInterpreter.prototype._createRC = function(){
        //Create a Replica Catalog
        var res = '',
            inputfiles = this.nodesByType['Start'];

        inputfiles.forEach( function (ifile, index, array) {
            var lfn = ifile.getAttribute(nodePropertyNames.Attributes.name),
                pfn = ifile.getAttribute('Physical File Name'),
                site = ifile.getAttribute('Site'); //Should this be a text attribute or should transformations be registered at a site then have references to them in the diagram.

                res += lfn + '\t' + pfn + '\t\tpool="' + site + '"\n';
        }, this);

        return res;
    };

    PegasusInterpreter.prototype._createSC = function(){
        //Create a Site Catalog
        var sites = this.nodesByType['Site'],
            res = '<?xml version="1.0" encoding="UTF-8"?>\n<sitecatalog xmlns="http://pegasus.isi.edu/schema/sitecatalog" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://pegasus.isi.edu/schema/sitecatalog http://pegasus.isi.edu/schema/sc-4.0.xsd" version="4.0">\n';
            

        sites.forEach( function (site, index, array) {
            var name = site.getAttribute(nodePropertyNames.Attributes.name),
                arch = site.getAttribute('Architecture'),
                os = site.getAttribute('OS'),
                children = site.getChildrenIds();

            res += '<site handle="' + name + '" arch="' + arch + '" os="' + os + '">\n';

            children.forEach( function (childId, i, a) {
                var child = this._client.getNode(childId),
                    type = this._client.getNode(child.getBaseId()).getAttribute(nodePropertyNames.Attributes.name);

                switch(type){
                    case "Grid":
                        var t = child.getAttribute('Type'),
                            contact = child.getAttribute('Contact'),
                            job = child.getAttribute('Job Type'),
                            sched = child.getAttribute('Scheduler');

                        res += '\t\t<grid type="' + t + '" contact="' + contact + '" scheduler="' + sched + '" jobtype="' + job + '" />\n';
                    break;

                    case "Directory":
                        var t = child.getAttribute('Configuration'),
                            path = child.getAttribute('Path'),
                            opIds = child.getChildrenIds();

                        res += '\t\t<directory type="' + t + '" path="' + path + '">\n';

                        opIds.forEach( function( opId, i2, a2) {
                            var op = this._client.getNode(opId),
                                o = ,
                                url = ;

                            res += '\t\t\t<file-server operation="' + o + '" url="' + url + '"/>\n';
                        }, this);

                        res += '\t\t</directory>\n';
                    break;

                    case "Profile Item":
                        var key = child.getAttribute('Key'),
                            nspace = child.getAttribute('Namespace'),
                            val = child.getAttribute('Value');

                        res += '\t\t<profile namespace="' + nspace + '" key="' + key + '">' + val + '</profile>\n';
                    break;

                    case "Replica Catalog":
                        var t = child.getAttribute('Type'),
                            url = child.getAttribute('Url');

                        res += '\t\t<replica-catalog type="' + t + '" url="' + url + '" />\n';
                    break;

                }
            }, this);
        

            res += "\t</site>\n";
        }, this);

        res += '</sitecatalog>';
        return res;
            
    };

    PegasusInterpreter.prototype._downloadText = function(txt, name){
            //Creating file and downloading it
            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
            pom.setAttribute('download', name);
            pom.click();
    };

    return PegasusInterpreter;
});
