/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * AUTO GENERATED CODE FOR PROJECT Turbulence
 */

"use strict";

define(['underscore',
        'js/Utils/METAAspectHelper'], function (_underscore,
                                                METAAspectHelper) {

    var _metaID = 'Turbulence.META.js';

    //META ASPECT TYPES
    var _metaTypes = {
		'Buffer_Flow': '/-25',
		'DynamicPrimitiveParameter': '/-19',
		'Information_Flow': '/-23',
		'Input': '/-16',
		'InputFlow': '/-20',
		'Ordering_Flow': '/-24',
		'Output': '/-17',
		'OutputToInput': '/-22',
		'Parameter': '/-7',
		'ParameterToInput': '/-21',
		'Port': '/-4',
		'PrimitiveParameter': '/-18',
		'Proc': '/-3',
		'Workflow': '/-2'
	};

    //META ASPECT TYPE CHECKING
    var _isBuffer_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Buffer_Flow); };
	var _isDynamicPrimitiveParameter = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.DynamicPrimitiveParameter); };
	var _isInformation_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Information_Flow); };
	var _isInput = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Input); };
	var _isInputFlow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.InputFlow); };
	var _isOrdering_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Ordering_Flow); };
	var _isOutput = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Output); };
	var _isOutputToInput = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.OutputToInput); };
	var _isParameter = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Parameter); };
	var _isParameterToInput = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.ParameterToInput); };
	var _isPort = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Port); };
	var _isPrimitiveParameter = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.PrimitiveParameter); };
	var _isProc = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Proc); };
	var _isWorkflow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Workflow); };
	

    var _queryMetaTypes = function () {
        var nMetaTypes = METAAspectHelper.getMETAAspectTypes(),
            m;

        if (!_.isEqual(_metaTypes,nMetaTypes)) {
            //TODO: when displaying an error message make sure it's the very same project
            /*var metaOutOfDateMsg = _metaID + " is not up to date with the latest META aspect. Please update your local copy!";
            if (console.error) {
                console.error(metaOutOfDateMsg);
            } else {
                console.log(metaOutOfDateMsg);
            }*/

            for (m in _metaTypes) {
                if (_metaTypes.hasOwnProperty(m)) {
                    // delete _metaTypes[m];
                }
            }

            for (m in nMetaTypes) {
                if (nMetaTypes.hasOwnProperty(m)) {
                    _metaTypes[m] = nMetaTypes[m];
                }
            }
        }
    };

    //hook up to META ASPECT CHANGES
    METAAspectHelper.addEventListener(METAAspectHelper.events.META_ASPECT_CHANGED, function () {
        _queryMetaTypes();
    });

    //generate the META types on the first run
    _queryMetaTypes();

    //return utility functions
    return {
        META_TYPES: _metaTypes,
        TYPE_INFO: {
			isBuffer_Flow: _isBuffer_Flow,
			isDynamicPrimitiveParameter: _isDynamicPrimitiveParameter,
			isInformation_Flow: _isInformation_Flow,
			isInput: _isInput,
			isInputFlow: _isInputFlow,
			isOrdering_Flow: _isOrdering_Flow,
			isOutput: _isOutput,
			isOutputToInput: _isOutputToInput,
			isParameter: _isParameter,
			isParameterToInput: _isParameterToInput,
			isPort: _isPort,
			isPrimitiveParameter: _isPrimitiveParameter,
			isProc: _isProc,
			isWorkflow: _isWorkflow
		}
    };
});