define([ "util/assert", "core/core", "core/tasync", "util/jjv" ], function(ASSERT, Core, TASYNC, JsonValidator) {
    "use strict";

    // ----------------- CoreType -----------------

    var MetaCore = function(oldcore) {
        // copy all operations
        var core = {};
        for ( var key in oldcore) {
            core[key] = oldcore[key];
        }

        var sameNode = function(nodeA,nodeB){
            if(core.getPath(nodeA) === core.getPath(nodeB)){
                return true;
            }
            return false;
        };

        var realNode = function(node){ //TODO we have to make some more sophisticated distinction
            if(core.getPath(node).indexOf('_') !== -1){
                return false;
            }
            return true;
        };

        var MetaNode = function(node){
            return core.getChild(node,"_meta");
        };
        var MetaChildrenNode = function(node){
            return core.getChild(MetaNode(node),"children");
        };
        var MetaPointerNode = function(node,name){
            var meta = MetaNode(node),
                pointerNames = core.getPointerNames(meta) || [];
            if(pointerNames.indexOf(name) !== -1){
                return core.getChild(meta,"_p_"+name);
            }
            return null;
        };

        //now the additional functions
        core.isTypeOf = function(node, typeNode){
            if(!realNode(node)){
                return false;
            }
            while(node){
                if(sameNode(node,typeNode)){
                    return true;
                }
                node = core.getBase(node);
            }
            return false;
        };

        core.isValidChildOf = function(node,parentNode){
            if(!realNode(node)){
                return true;
            }
            var validChildTypePaths = core.getMemberPaths(MetaChildrenNode(parentNode),"items") || [];
            while(node){
                if(validChildTypePaths.indexOf(core.getPath(node)) !== -1){
                    return true;
                }
                node = core.getBase(node);
            }
            return false;
        };

        core.getValidPointerNames = function(node){
            var validNames = core.getPointerNames(MetaNode(node)) || [],
                i,
                validPointerNames = [],
                metaPointerNode;

            for(i=0;i<validNames.length;i++){
                metaPointerNode = MetaPointerNode(node,validNames[i]);
                if(metaPointerNode.max === 1){ //TODO specify what makes something a pointer and what a set??? - can you extend a pointer to a set????
                    validPointerNames.push(validNames[i]);
                }
            }

            return validPointerNames;
        };

        core.getValidSetNames = function(node){
            var validNames = core.getPointerNames(MetaNode(node)) || [],
                i,
                validSetNames = [],
                metaPointerNode;

            for(i=0;i<validNames.length;i++){
                metaPointerNode = MetaPointerNode(node,validNames[i]);
                if(metaPointerNode.max === undefined || metaPointerNode.max === -1 || metaPointerNode > 1){ //TODO specify what makes something a pointer and what a set??? - can you extend a pointer to a set????
                    validSetNames.push(validNames[i]);
                }
            }

            return validSetNames;
        };

        core.isValidTargetOf = function(node,source,name){
            if(!realNode(source) || node === null){ //we position ourselves over the null-pointer layer
                return true;
            }
            var pointerMetaNode = MetaPointerNode(source,name);
            if(pointerMetaNode){
                var validTargetTypePaths = core.getMemberPaths(pointerMetaNode,"items") || [];
                while(node){
                    if(validTargetTypePaths.indexOf(core.getPath(node)) !== -1){
                        return true;
                    }
                    node = core.getBase(node);
                }
            }
            return false;
        };

        core.getValidAttributeNames = function(node){
            var names = [];
            if(realNode(node)){
                names = core.getAttributeNames(MetaNode(node)) || [];
            }
            return names;
        };

        core.isValidAttributeValueOf = function(node,name,value){
            //currently it only checks the name and the type
            if(!realNode(node)){
                return true;
            }
            if(core.getValidAttributeNames(node).indexOf(name) === -1){
                return false;
            }
            var meta = core.getAttribute(MetaNode(node),name);
            switch(meta.type){
                case "boolean":
                    if(value === true || value === false){
                        return true;
                    }
                    break;
                case "string":
                case "asset":
                    if(typeof value === 'string'){
                        return true;
                    }
                    break;
                case "integer":
                    if(!isNaN(parseInt(value)) && parseFloat(value) === parseInt(value)) {
                        return true;
                    }
                    break;
                case "float":
                    if(!isNaN(parseFloat(value))) {
                        return true;
                    }
                    break;
            }
            return false;
        };

        var MetaAspectNode = function(node,name){
            var aspectNode = core.getChild(MetaNode(node),'aspects'),
                names = core.getPointerNames(aspectNode) ||[];
            if(names.indexOf(name) !== -1){
                return core.getChild(aspectNode,"_a_"+name);
            }
            return null;
        };

        core.getValidAspectNames = function(node){
            return core.getPointerNames(core.getChild(MetaNode(node),'aspects')) ||[];
        };

        //additional meta functions for getting meta definitions
        core.getJsonMeta = function(node){
            var meta = {children:{},attributes:{},pointers:{},aspects:{}},
                tempNode,
                names,
                pointer,
                i,j;

            //fill children part
            tempNode = MetaChildrenNode(node);

            meta.children.minItems = [];
            meta.children.maxItems = [];
            meta.children.items = core.getMemberPaths(tempNode,"items");
            for(i=0;i<meta.children.items.length;i++){
                meta.children.minItems.push(core.getMemberAttribute(tempNode,"items",meta.children.items[i],"min") || -1);
                meta.children.maxItems.push(core.getMemberAttribute(tempNode,"items",meta.children.items[i],"max") || -1);
            }
            meta.children.min = core.getAttribute(tempNode,"min");
            meta.children.max = core.getAttribute(tempNode,"max");

            //attributes
            names = core.getValidAttributeNames(node);
            for(i=0;i<names.length;i++){
                meta.attributes[names[i]] = core.getAttribute(MetaNode(node),names[i]);
            }

            //pointers
            names = core.getPointerNames(MetaNode(node));
            for(i=0;i<names.length;i++){
                tempNode = MetaPointerNode(node,names[i]);
                pointer = {};

                pointer.items = core.getMemberPaths(tempNode,"items");
                pointer.min = core.getAttribute(tempNode,"min");
                pointer.max = core.getAttribute(tempNode,"max");
                pointer.minItems = [];
                pointer.maxItems = [];

                for(var j=0;j<pointer.items.length;j++){
                    pointer.minItems.push(core.getMemberAttribute(tempNode,"items",pointer.items[j],"min") || -1);
                    pointer.maxItems.push(core.getMemberAttribute(tempNode,"items",pointer.items[j],"max") || -1);

                }

                meta.pointers[names[i]] = pointer;
            }

            //aspects
            names = core.getValidAspectNames(node);

            for(i=0;i<names.length;i++){
                tempNode = MetaAspectNode(node,names[i]);
                meta.aspects[names[i]] = core.getMemberPaths(tempNode,'items') || [];
            }

            return meta;
        };

        var isEmptyObject = function(object){
            if(Object.keys(object).length === 0){
                return true;
            }
            return false;
        };
        var getObjectDiff = function(bigger,smaller){
            var diff = {},
                names, i,temp;
            if(smaller === null || smaller === undefined || isEmptyObject(smaller)){
                if(bigger === null || bigger === undefined){
                    return {};
                }
                return bigger;
            }

            names = Object.keys(bigger);
            for(i=0;i<names.length;i++){
                if(smaller[names[i]] === undefined){
                    //extra attribute of the bigger object
                    if(bigger[names[i]] !== undefined){
                        diff[names[i]] = bigger[names[i]];
                    } //if both are undefined, then they are equal :)
                } else {
                    //they share the attribute
                    if(typeof smaller[names[i]] === 'object'){
                        if(typeof bigger[names[i]] === 'object'){
                            temp = getObjectDiff(bigger[names[i]],smaller[names[i]]);
                            if(!isEmptyObject(temp)){
                                diff[names[i]] = temp;
                            }
                        } else {
                            diff[names[i]] = bigger[names[i]];
                        }
                    } else {
                        if(JSON.stringify(smaller[names[i]]) !== JSON.stringify(bigger[names[i]])){
                            diff[names[i]] = bigger[names[i]];
                        }
                    }
                }
            }

            return diff;

        };

        core.getOwnJsonMeta = function(node){
            var base = core.getBase(node),
                baseMeta = base ? core.getJsonMeta(base) : {},
                meta = core.getJsonMeta(node);

            return getObjectDiff(meta,baseMeta);
        };

        return core;

    };

    return MetaCore;
});
