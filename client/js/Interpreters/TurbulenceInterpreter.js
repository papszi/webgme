"use strict";

/*
 * This is a skeleton interpreter file. To create an interpreter, simply specify the appropriate territory and insert 
 * the interpreter logic.
 * 
 * Currently, server side interpreters need to be added in the WebGME.js file.
 */

define(['logManager',
        'js/NodePropertyNames',
        './TurbulencePrototype.Meta.js',
        'text!./TurbulenceInterpreter.html',
        'js/Constants'], function (logManager,
                                    nodePropertyNames,
                                    domainMeta,
                                    turbulenceInterpreterDialog,
                                    CONSTANTS) {
  
    var dialog_base = $(turbulenceInterpreterDialog);
    
    var TurbulenceInterpreter = function(_client) {
        this._logger = logManager.create('TurbulenceInterpreter');
        this._client = _client;
        var self = this;

        WebGMEGlobal.Toolbar.addButton({ 'title': "Turbulence Interpreter",
            "text":"Turbulence", 
            "clickFn": function (){
                var terr = {};
                terr[WebGMEGlobal.State.getActiveObject()] = { 'children': 10 };//TODO Set the necessary depth!
                // terr[CONSTANTS.PROJECT_ROOT_ID] = { 'children': 10 };//TODO Set the necessary depth!
                self._client.updateTerritory(self._territoryId, terr); //TODO Set the necessary depth!
                self._runTurbulenceInterpreter();
                // ..WebGMEGlobal.State.getActiveObject()
            }
        });

        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, function(modal, active_object_id) {
            self.currentObject = active_object_id;
        });
        // this._client.addEventListener(this._client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
        //     self.currentObject = nodeId;
        // });

    };
    var primitiveBaseId = domainMeta.META_TYPES['PrimitiveParameter'];
    var dynamicPrimitiveBaseId = domainMeta.META_TYPES['DynamicPrimitiveParameter'];
    var procId = domainMeta.META_TYPES['Proc'];
    var flowBaseId = domainMeta.META_TYPES['InputFlow'];
    var inputPortId = domainMeta.META_TYPES['Input'];
    var outputPortId = domainMeta.META_TYPES['Output'];
    var orderingFlowId = domainMeta.META_TYPES['Ordering_Flow'];
    var bufferFlowId = domainMeta.META_TYPES['Buffer_Flow'];

    // var primitiveBaseId = '/-18';
    // var dynamicPrimitiveBaseId = '/-19';
    // var procId = '/-3';
    // var flowBaseId = '/-20';
    // var inputPortId = '/-16';
    // var outputPortId = '/-17';
    // var orderingFlowId = '/-24';
    // var bufferFlowId = '/-25';

    TurbulenceInterpreter.prototype._runTurbulenceInterpreter = function() {

        var self = this;
        self._logger.warn('Running Turbulence Interpreter');

        self._dialog = dialog_base.clone();
        // self._dialog.modal('show');
        
        // TO DO: check if the current node is a workflow
        // this.currentObject = '/-6';
        var currentWorkflow = self._client.getNode(self.currentObject);
        console.dir(currentWorkflow);
        console.dir(self.currentObject);

        if (!currentWorkflow) {
            self._errorMessages('The current worksheet is not valid');
            self._logger.warn('Exiting Turbulence Interpreter');
            return;
        }
        // if (currentWorkflow.getBaseId() != domainMeta.META_TYPES['Workflow'] ) {
        //     self._errorMessages('The current worksheet is not a workflow');
        //     return;
        // }
        if (!domainMeta.TYPE_INFO.isWorkflow(self.currentObject)) {
            self._errorMessages('The current worksheet is not a workflow');
            self._logger.warn('Exiting Turbulence Interpreter');
            return;
        }

        var name_of_the_project = currentWorkflow.getAttribute('name');

        var childrenIds = currentWorkflow.getChildrenIds();

        var primitives = [];
        var dynamicPrimitives = [];
        var procs = {};
        var flows = [];

        childrenIds.forEach(function(child_id) {
            var base_id = self._client.getNode(child_id).getBaseId();
            if (base_id == primitiveBaseId) {
                primitives.push(child_id);
            } else if (base_id == dynamicPrimitiveBaseId) {
                dynamicPrimitives.push(child_id);
            } else if (base_id == procId) {
                var proc_node = self._client.getNode(child_id);
                var ports_of_proc = proc_node.getChildrenIds();
                // create a list of inputs
                var inputs = {}; // { '/-3': false}
                for (var i = 0; i < ports_of_proc.length; i++) {
                    var port_node = self._client.getNode(ports_of_proc[i]);
                    var port_node_baseId = port_node.getBaseId();
                    if (port_node_baseId == inputPortId) {
                        inputs[ports_of_proc[i]] = false;
                    }
                }
                
                procs[child_id] = { processed: false, processable: false, inputs: inputs};
            } else {
                var base_base_id = self._client.getNode(base_id).getBaseId();
                if (base_base_id == flowBaseId) {
                    flows.push(child_id);
                }
            }
        });

        var primitive_definitions = self._definePrimitives(primitives);
        var dynamic_definitions = self._defineDynamicPrimitives(dynamicPrimitives);
        var proc_definitions = self._defineProcs(procs, flows);
        if (proc_definitions === null) {
            return;
        }

        var pre_script = '//    Copyright 2011 Johns Hopkins University\n//\n//  Licensed under the Apache License, Version 2.0 (the "License");\n//  you may not use this file except in compliance with the License.\n//  You may obtain a copy of the License at\n//\n//      http://www.apache.org/licenses/LICENSE-2.0\n//\n//  Unless required by applicable law or agreed to in writing, software\n//  distributed under the License is distributed on an "AS IS" BASIS,\n//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n//  See the License for the specific language governing permissions and\n//  limitations under the License.\n\n\n#include <stdio.h>\n#include <float.h>\n#include <math.h>\n#include "turblib.h"\n#include "spline_interp_lib.h"\n\nint main(int argc, char *argv[])\n{\n';
        var after_variables = '\n    /* Initialize gSOAP */\n    soapinit();\n    /* Enable exit on error.  See README for details. */\n    turblibSetExitOnError(1);\n';
        var post_script = '/* Free gSOAP resources */\n    soapdestroy();\n\n    return 0;\n}\n\n';
        
        var full_script = pre_script;

        full_script += '\n //Primitive Definitions\n';
        primitive_definitions.forEach(function(definition) {
            full_script += '    ' + definition + '\n';
        });

        full_script += '\n //Dynamic Definitions\n';
        dynamic_definitions.forEach(function(definition) {
            full_script += '    ' + definition['def'] + '\n';
        });

        full_script += after_variables;

        full_script += '\n //Proc Definitions\n';
        proc_definitions.forEach(function(definition) {
            full_script += '    ' + definition + '\n';
        });

        full_script += '\n //Free Buffers\n';
        dynamic_definitions.forEach(function(definition) {
            full_script += '    free(' + definition['name'] + ');\n';
        });

        full_script += post_script;

        download(name_of_the_project + '.c', full_script);

        self._logger.warn('Exiting Turbulence Interpreter');

        function download(filename, text) {
            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', filename);
            pom.setAttribute('target', '_blank');
            pom.click();
        }
        
    };

    TurbulenceInterpreter.prototype._errorMessages = function(message) {
        var self = this;
        var dialogBody = self._dialog.find(".modal-body");
        var $div = $('<div/>', {
            class: 'alert',
            html: message
        });
        dialogBody.append($div);
        this._dialog.modal('show');
        // alert(message);
    }

    TurbulenceInterpreter.prototype._defineProcs = function(procs, flows) {
        var self = this;
        var definitions = [];
        while (!isAllProcessed(procs)) {
            for (var j = 0; j < flows.length; j++) {
                var flow_node = self._client.getNode(flows[j]);
                var src = flow_node.getPointer('src')['to'];
                var dst = flow_node.getPointer('dst')['to'];
                var src_node = self._client.getNode(src);
                var dst_node = self._client.getNode(dst);
                if (!doTheTypesMatch(src_node, dst_node)) {
                    errorTypesDoNotMatch(src_node, dst_node);
                    return null;
                }
                if (isSignalValid(src)) {
                    var dest_proc = dst_node.getParentId();
                    procs[dest_proc]['inputs'][dst] = src;
                    procs[dest_proc]['processable'] = true;
                    for (var key in procs[dest_proc]['inputs']) {
                        if (procs[dest_proc]['inputs'][key] == false)
                            procs[dest_proc]['processable'] = false;
                    }
                }
            }
            var isProcessed = false;
            for (var key in procs) {
                if (procs[key]['processed'])
                    continue;
                if (procs[key]['processable']) {
                    //printf
                    // var key_node = self._client.getNode(key);
                    // console.log('being processed ' + key_node.getAttribute('name'));
                    definitions.push(self._defineProc(key, procs));

                    procs[key]['processed'] = true;
                    isProcessed = true;
                }
            }
            if (!isProcessed)
                break;
        }

        return definitions;

        function errorTypesDoNotMatch(src_node, dst_node) {
            self._errorMessages('Signal flow types do not match: ' 
                                + src_node.getAttribute('name') + '('
                                + src_node.getAttribute('type') + ')'
                                + ' -> '
                                + dst_node.getAttribute('name') + '('
                                + dst_node.getAttribute('type') + ')'
                                );
        }

        function doTheTypesMatch(src, dst) {
            if (src.getAttribute('type') != dst.getAttribute('type'))
                return false;
            return true;
        }

        function isSignalValid(node_id) {
            var node = self._client.getNode(node_id);
            var base_id = node.getBaseId();
            if (base_id == primitiveBaseId || base_id == dynamicPrimitiveBaseId)
                return true;
            if (base_id == outputPortId) {
                var parent_id = node.getParentId();
                if (procs[parent_id]['processed'])
                    return true;
            } 
            return false;
        }

        function isAllProcessed(procs) {
            for (var key in procs) {
                if (!procs[key]['processed'])
                    return false;
            }
            return true;
        }

    }

    TurbulenceInterpreter.prototype._defineProc = function(node_id, procs) {
        var self = this;
        var node = self._client.getNode(node_id);
        var childrenIds = node.getChildrenIds();
        
        var inputs = [];
        var inputsRegular = [];
        var orderingFlows = [];
        var bufferFlows = [];

        // console.log(node.getAttribute('name'));
        // console.dir(childrenIds);
        
        childrenIds.forEach(function(child_id) {
            var base_id = self._client.getNode(child_id).getBaseId();
            if (base_id == inputPortId) {
                inputs[child_id] = 0;
                inputsRegular.push(child_id);
            } else if (base_id == orderingFlowId) {
                orderingFlows.push(child_id);
            } else if (base_id == bufferFlowId) {
                bufferFlows.push(child_id);
            }
        });

        // console.log('inputs');
        // console.dir(inputs);
        // console.log('orderingFlows');
        // console.dir(orderingFlows);

        var initialInput = [];
        orderingFlows.forEach(function(flow) {
            var flow_node = self._client.getNode(flow);
            var src = flow_node.getPointer('src')['to'];
            var dst = flow_node.getPointer('dst')['to'];
            inputs[src] = dst;
            initialInput[dst] = 1;
        });

        var initInp;
        inputsRegular.forEach(function(inputRegular) {
            if (!initialInput[inputRegular]) {
                initInp = inputRegular;
            }
        });

        var isInputOutputConnected = [];
        bufferFlows.forEach(function(bf) {
            var buf_flow_node = self._client.getNode(bf);
            var src = buf_flow_node.getPointer('src')['to'];
            isInputOutputConnected[src] = true;
        });

        var functionCall = node.getAttribute('name') + '(';
        var curr = initInp;
        while(inputs[curr] != 0) {
            functionCall += getNameOfInput(procs[node_id]['inputs'][curr], isInputOutputConnected[curr]) + ',';
            curr = inputs[curr];
        }
        functionCall += getNameOfInput(procs[node_id]['inputs'][curr], isInputOutputConnected[curr]) + ');';

        // put in a datastructure        
        return functionCall;

        //if the incoming edge is output, get the name of input registered inside the proc..
        // this needs to run recursively for now
        //nd is the output port
        function getNameOfInput(nd, isOutputToo) {
            var nn = self._client.getNode(nd);
            if (nn.getBaseId() == primitiveBaseId) {
                var param = isOutputToo ? '&' : '';
                param += nn.getAttribute('name');
                return param;
            } else if (nn.getBaseId() == dynamicPrimitiveBaseId) {
                return nn.getAttribute('name');
            } else if (nn.getBaseId() == outputPortId) {
                var parent_id = nn.getParentId();
                var parent_node = self._client.getNode(parent_id);
                var childrenIds = parent_node.getChildrenIds();
                for (var i = 0; i < childrenIds.length; i++) {
                    var curr_node = self._client.getNode(childrenIds[i]);
                    var curr_node_base_id = curr_node.getBaseId()
                    if (curr_node_base_id == bufferFlowId) {
                        // var np = self._client.getNode(curr_node_base_id);
                        var src_input = curr_node.getPointer('src')['to'];
                        return getNameOfInput(procs[parent_id]['inputs'][src_input], isOutputToo);
                    }
                }
            }
            return "something's happening here";
        }



    };

    TurbulenceInterpreter.prototype._defineDynamicPrimitives = function(list) {
        var self = this;
        var definitions = [];
        try {
            list.forEach(function(element_id) {
                var node = self._client.getNode(element_id);
                var name = node.getAttribute('name');
                var type = node.getAttribute('type');
                var size = node.getAttribute('size');
                
                var childrenIds = node.getChildrenIds();
                var child = childrenIds[0];
                var child_node = self._client.getNode(child);

                if (child_node != null) {
                    var ref_node = self._client.getNode(child_node.getPointer('ref')['to']);
                    var ref_name = ref_node.getAttribute('name');
                    var def = name + ' = (' + type + '*)malloc(sizeof(' + type + ')*' + ref_name + '*' + size;
                    definitions.push({name: name, def: def});
                }
            });
        } catch(e) {
            console.log(e);
        }
        return definitions;
    };

    TurbulenceInterpreter.prototype._definePrimitives = function(list) {
        var self = this;

        var definitions = [];
        list.forEach(function(element_id) {
            var node = self._client.getNode(element_id);
            var type = node.getAttribute('type');
            var size = node.getAttribute('size');
            var name = node.getAttribute('name');
            var value = node.getAttribute('value');
            var pointer = node.getAttribute('pointer');

            var def = type;
            if (pointer == true) def += '*';
            if (size > 1) def += '[' + size + ']';
            def += ' ' + name;
            if (size == 1) {
                if (value != '' ) def += ' = ' + value;
            }
            def += ';';

            definitions.push(def);

            if (size > 1) {
                var values = value.split(',');
                for (var i = 0; i < values.length; i++) {
                    var assignment = name + '[' + i + ']' + ' = ' + values[i] + ';';
                    definitions.push(assignment);
                }
            }

        });

        return definitions;

    };

    return TurbulenceInterpreter;
});
