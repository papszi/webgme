"use strict";

define(['logManager',
        'js/NodePropertyNames',
        'js/brollb.META.js',
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
        this.nodesByType = {};
        this.nodeId2jobId = {};

        if( this.currentObject !== undefined 
            && this.pegasusTypes.isProject(this.currentObject) ){//Check that the current page is a 'Project'

            this.namespace = this._client.getNode(this.currentObject).getAttribute(nodePropertyNames.Attributes.name);
            var childNames = this._client.getNode(this.currentObject).getChildrenIds(),
                dax = { 'name': 'result.dax'},
                tc = { 'name': 'tc.dat'},
                rc = { 'name': 'rc.dat'},
                sc = { 'name': 'sites.xml'},
                pc = { 'name': 'pegasus.conf'};

            //Populate the object arrays by type
            childNames.forEach( function( name, index, array ){//TODO load in more levels
                var node = this._client.getNode(name),
                    type = this._client.getNode(node.getBaseId()).getAttribute(nodePropertyNames.Attributes.name),
                    isConnection = node.getPointerNames().indexOf(CONSTANTS.POINTER_SOURCE) !== -1 && 
                        node.getPointerNames().indexOf(CONSTANTS.POINTER_TARGET) !== -1 ;

                if(this.nodesByType[type] === undefined)
                    this.nodesByType[type] = [];

                this.nodesByType[type].push(node);

            }, this);

            //Create the DAX file
            dax.data = this._createDAX(this._client.getNode(this.currentObject).getAttribute(nodePropertyNames.Attributes.name));

            //Create the transformation catalog
            tc.data = this._createTC();

            //Create the replica catalog
            rc.data = this._createRC();

            //Create the site catalog
            sc.data = this._createSC();

            //Create the pegasus config file
            //pc.data = this._createPC({ 'tc': tc, 'rc': rc, 'sc': sc });

            this._downloadText(dax);
            this._downloadText(tc);
            this._downloadText(rc);
            this._downloadText(sc);
            //this._downloadText(pc);
        }
    };

    //DAX creating methods
    PegasusInterpreter.prototype._createDAX = function(xmlName){

        //Constructing a string for the xml
        var date = new Date(),
            graphInfo = '',
            res = '<?xml version="1.0" encoding="UTF-8"?>\n<!-- generated: ' + date.getFullYear() + '-' + (date.getMonth().length === 1 ? '0' + date.getMonth() : date.getMonth() ) 
                + '-' + (date.getDate().toString().length === 1 ? '0' + date.getDate().toString() : date.getDate() ) + ' ' 
                + (date.getHours().toString().length === 1 ? '0' + date.getHours().toString() : date.getHours() ) + ':'
                + (date.getMinutes().toString().length === 1 ? '0' + date.getMinutes().toString() : date.getMinutes() ) + ':'
                + (date.getSeconds().toString().length === 1 ? '0' + date.getSeconds().toString() : date.getSeconds() ) + ' -->\n<adag xmlns="http://pegasus.isi.edu/schema/DAX" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://pegasus.isi.edu/schema/DAX http://pegasus.isi.edu/schema/dax-3.4.xsd" version="3.4" name="' + xmlName + '">\n';

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
            nodeParents = '\t<child ref="' + id + '">\n';
            this.nodesByType['FileRoute'].forEach( function ( conn, i, a ){
                if(conn.getPointer(CONSTANTS.POINTER_SOURCE).to === node.getId())
                    output.push(conn);
                    
                if(conn.getPointer(CONSTANTS.POINTER_TARGET).to === node.getId()
                    && this.pegasusTypes.isTransformation_Ref(conn.getPointer(CONSTANTS.POINTER_SOURCE).to) ){ //Make sure it is from another trans ref
                    var parId = conn.getPointer(CONSTANTS.POINTER_SOURCE).to;

                    input.push(conn);

                    if(this.nodeId2jobId[parId] === undefined)
                        this._generateId(parId);

                    nodeParents += '\t\t<parent ref="' + this.nodeId2jobId[parId] + '" />\n';
                }

            }, this);
            nodeParents += '\t</child>\n';

            if( nodeParents.indexOf("parent") !== -1 )
                graphInfo += nodeParents;

            res += '\t<job id="' + id + '" name="' + node.getAttribute(nodePropertyNames.Attributes.name) + '">\n';

            //create argument info based off of the connections
            res += '\t\t<argument>'
            input.forEach( function (conn, i, a) {
                var name = conn.getAttribute(nodePropertyNames.Attributes.name),
                    register = conn.getAttribute("Register"),
                    transfer  = conn.getAttribute('Transfer'),
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


                res += ' -o <file name="' + name + '"/>';
                uses += '\t\t\t<uses name="' + name + '" link="output" register="' + register + '" transfer="' + transfer + '" />\n';
            }, this);

            res += '</argument>\n' + uses;


            res += '\t</job>\n';

        }, this);

        //Add job graph info

        res += graphInfo + '\n</adag>';
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
            trans = {},
            tranRefs = this.nodesByType['Transformation Ref'];

        tranRefs.forEach( function( tranRef, index, array ){
            var tranId = tranRef.getPointer(CONSTANTS.POINTER_REF).to; //Get referenced transition

            if(trans[tranId] === undefined){ //If we haven't already accounted for the transformations
                var tran = this._client.getNode(tranId),
                    children = tran.getChildrenIds(),
                    profiles = [],
                    name = tran.getAttribute(nodePropertyNames.Attributes.name),
                    version = tran.getAttribute('Version') || '1.0', //Default version is 1.0
                    pfn = tran.getAttribute('Physical File Name'),
                    type = tran.getAttribute('Type'),
                    site = this._client.getNode(tran.getParentId()),
                    siteName = site.getAttribute(nodePropertyNames.Attributes.name),
                    siteChildren = site.getChildrenIds(),
                    siteProfiles = [],
                    arch = tran.getAttribute('Architecture') || site.getAttribute('Architecture'),//If arch, os not specified assume it can run on the the respective site
                    os = tran.getAttribute('OS') || site.getAttribute('OS');

                children.forEach( function(childId, i, ar){
                    if(this.pegasusTypes.isProfile_Item(childId))
                        profiles.push(this._client.getNode(childId));
                }, this);
                
                siteChildren.forEach( function(childId, i, ar){
                    if(this.pegasusTypes.isProfile_Item(childId))
                        siteProfiles.push(this._client.getNode(childId));
                }, this);

                trans[tranId] = 'tr ' + this.namespace + '::' + name + ':' + version + ' {\n';

                //Add profiles
                profiles.forEach( function(profile, i, ar){
                    trans[tranId] += '\tprofile ' + profile.getAttribute('Namespace') + ' "' + profile.getAttribute('Key') + '" "' + profile.getAttribute('Value') + '"\n';
                }, this);

                trans[tranId] += '\n\tsite ' + siteName
                    + ' {\n';

                siteProfiles.forEach( function(profile, i, ar){
                    trans[tranId] += '\t\tprofile ' + profile.getAttribute('Namespace') + ' "' + profile.getAttribute('Key') + '" "' + profile.getAttribute('Value') + '"\n';
                }, this);

                trans[tranId] += '\t\tpfn ' + pfn 
                    + '\n\t\tarch ' + arch
                    + '\n\t\tos ' + os
                    + '\n\t\ttype ' + type + '\n\t}\n\n';

            }

            if(this.pegasusTypes.isSite(tranRef.getParentId())){//Add it to the TC file!
                var pfn = tran.getAttribute('Physical File Name'),
                    type = tran.getAttribute('Type'),
                    site = this._client.getNode(tran.getParentId()),
                    siteName = site.getAttribute(nodePropertyNames.Attributes.name),
                    arch = tran.getAttribute('Architecture') || site.getAttribute('Architecture'),//If arch, os not specified assume it can run on the the respective site
                    os = tran.getAttribute('OS') || site.getAttribute('OS');
                
                trans[tranId] = '\tsite ' + siteName
                    + ' {\n\t\tpfn ' + pfn 
                    + '\n\t\tarch ' + arch
                    + '\n\t\tos ' + os
                    + '\n\t\ttype ' + type + '\n\t}\n\n';

            }
                
        }, this);

        //build res from transformations
        for(var k in trans){
            if(trans.hasOwnProperty(k))
                res += trans[k] + '\n}\n\n';
        }

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
                                o = op.getAttribute('Type'),
                                url = op.getAttribute('Url');

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

    PegasusInterpreter.prototype._createPC = function(files){
        //TODO Finish this
        var res = '',
            siteCatalog = files.sc.name,
            replicaCatalog = files.rc.name,
            transformCatalog = files.tc.name;

        res += 'pegasus.catalog.site.file=' + siteCatalog 
                + '\npegasus.catalog.replica=' + replicaCatalog
                + '\npegasus.catalog.replica.file=' + replicaCatalog
        
    };

    PegasusInterpreter.prototype._downloadText = function(file){
            //Creating file and downloading it
            var pom = document.createElement('a'),
                name = file.name,
                txt = file.data;

            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
            pom.setAttribute('download', name);
            pom.click();
    };

    return PegasusInterpreter;
});
