/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * AUTO GENERATED CODE FOR PROJECT brollgen
 */

"use strict";

define(['underscore',
        'js/Utils/METAAspectHelper'], function (_underscore,
                                                METAAspectHelper) {

    var _metaID = 'brollgen.META.js';

    //META ASPECT TYPES
    var _metaTypes = {
		'BFCO': '/-6',
		'BProject': '/-3',
		'CFCO': '/-40',
		'CProject': '/-4',
		'Connection': '/-49',
		'ContainerPlaceHolder': '/-38',
		'EFCO': '/-47',
		'FCO': '/-1',
		'GProject': '/-36',
		'GenEnd': '/-45',
		'GenParameter': '/-33',
		'GenParameterConnection': '/-31',
		'GenParameterPort': '/-32',
		'GenStart': '/-44',
		'GenStructuralConnection': '/-30',
		'GenStructuralPort': '/-34',
		'Generator': '/-28',
		'GeneratorReference': '/-29',
		'Generator_List': '/-11',
		'Item': '/-48',
		'OutsideObjectPlaceHolder': '/-37',
		'Project': '/-2',
		'Loop': '/-7'
	};

    //META ASPECT TYPE CHECKING
    var _isBFCO = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.BFCO); };
	var _isBProject = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.BProject); };
	var _isCFCO = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.CFCO); };
	var _isCProject = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.CProject); };
	var _isConnection = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Connection); };
	var _isContainerPlaceHolder = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.ContainerPlaceHolder); };
	var _isEFCO = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.EFCO); };
	var _isFCO = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.FCO); };
	var _isGProject = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GProject); };
	var _isGenEnd = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GenEnd); };
	var _isGenParameter = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GenParameter); };
	var _isGenParameterConnection = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GenParameterConnection); };
	var _isGenParameterPort = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GenParameterPort); };
	var _isGenStart = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GenStart); };
	var _isGenStructuralConnection = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GenStructuralConnection); };
	var _isGenStructuralPort = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GenStructuralPort); };
	var _isGenerator = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Generator); };
	var _isGeneratorReference = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.GeneratorReference); };
	var _isGenerator_List = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Generator_List); };
	var _isItem = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Item); };
	var _isOutsideObjectPlaceHolder = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.OutsideObjectPlaceHolder); };
	var _isProject = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Project); };
	var _isLoop = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Loop); };
	

    var _queryMetaTypes = function () {
/*
        var nMetaTypes = METAAspectHelper.getMETAAspectTypes(),
            m;

        if (!_.isEqual(_metaTypes,nMetaTypes)) {
            var metaOutOfDateMsg = _metaID + " is not up to date with the latest META aspect. Please update your local copy!";
            if (console.error) {
                console.error(metaOutOfDateMsg);
            } else {
                console.log(metaOutOfDateMsg);
            }

            for (m in _metaTypes) {
                if (_metaTypes.hasOwnProperty(m)) {
                    delete _metaTypes[m];
                }
            }

            for (m in nMetaTypes) {
                if (nMetaTypes.hasOwnProperty(m)) {
                    _metaTypes[m] = nMetaTypes[m];
                }
            }
        }
*/
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
			isBFCO: _isBFCO,
			isBProject: _isBProject,
			isCFCO: _isCFCO,
			isCProject: _isCProject,
			isConnection: _isConnection,
			isContainerPlaceHolder: _isContainerPlaceHolder,
			isEFCO: _isEFCO,
			isFCO: _isFCO,
			isGProject: _isGProject,
			isGenEnd: _isGenEnd,
			isGenParameter: _isGenParameter,
			isGenParameterConnection: _isGenParameterConnection,
			isGenParameterPort: _isGenParameterPort,
			isGenStart: _isGenStart,
			isGenStructuralConnection: _isGenStructuralConnection,
			isGenStructuralPort: _isGenStructuralPort,
			isGenerator: _isGenerator,
			isGeneratorReference: _isGeneratorReference,
			isGenerator_List: _isGenerator_List,
			isItem: _isItem,
			isOutsideObjectPlaceHolder: _isOutsideObjectPlaceHolder,
			isProject: _isProject,
			isLoop: _isLoop
		}
    };
});
