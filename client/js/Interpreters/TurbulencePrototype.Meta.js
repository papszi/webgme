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
    'Buffer': '/-19',
    'Buffer_Flow': '/-25',
    'Information_Flow': '/-23',
    'Input': '/-16',
    'Input_Flow': '/-20',
    'Multiplicity': '/2010284072',
    'Ordering_Flow': '/-24',
    'Output': '/-17',
    'Parameter': '/-7',
    'Parameter_Flow': '/-21',
    'Parameter_Input': '/1567898874',
    'Port': '/-4',
    'Primitive_Parameter': '/-18',
    'Proc': '/-3',
    'Signal_Flow': '/-22',
    'Signal_Input': '/1229971250',
    'Workflow': '/-2'
  };

    //META ASPECT TYPE CHECKING
    var _isBuffer = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Buffer); };
  var _isBuffer_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Buffer_Flow); };
  var _isInformation_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Information_Flow); };
  var _isInput = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Input); };
  var _isInput_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Input_Flow); };
  var _isMultiplicity = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Multiplicity); };
  var _isOrdering_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Ordering_Flow); };
  var _isOutput = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Output); };
  var _isParameter = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Parameter); };
  var _isParameter_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Parameter_Flow); };
  var _isParameter_Input = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Parameter_Input); };
  var _isPort = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Port); };
  var _isPrimitive_Parameter = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Primitive_Parameter); };
  var _isProc = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Proc); };
  var _isSignal_Flow = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Signal_Flow); };
  var _isSignal_Input = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Signal_Input); };
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
      isBuffer: _isBuffer,
      isBuffer_Flow: _isBuffer_Flow,
      isInformation_Flow: _isInformation_Flow,
      isInput: _isInput,
      isInput_Flow: _isInput_Flow,
      isMultiplicity: _isMultiplicity,
      isOrdering_Flow: _isOrdering_Flow,
      isOutput: _isOutput,
      isParameter: _isParameter,
      isParameter_Flow: _isParameter_Flow,
      isParameter_Input: _isParameter_Input,
      isPort: _isPort,
      isPrimitive_Parameter: _isPrimitive_Parameter,
      isProc: _isProc,
      isSignal_Flow: _isSignal_Flow,
      isSignal_Input: _isSignal_Input,
      isWorkflow: _isWorkflow
    }
    };
});