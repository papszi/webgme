/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * AUTO GENERATED CODE FOR PROJECT brollb
 */

"use strict";

define(['underscore',
        'js/Utils/METAAspectHelper'], function (_underscore,
                                                METAAspectHelper) {

    var _metaID = 'brollb.META.js';

    //META ASPECT TYPES
    var _metaTypes = {
		'Directory': '/-16',
		'End': '/-8',
		'FCO': '/-1',
		'FileRoute': '/-3',
		'Grid': '/-17',
		'Operation': '/-13',
		'Profile_Item': '/-11',
		'Project': '/-7',
		'Replica_Catalog': '/-18',
		'Site': '/-10',
		'Start': '/-9',
		'Terminal': '/-5',
		'Transformation': '/-2',
		'Transformation_Ref': '/-12'
	};

    //META ASPECT TYPE CHECKING
    var _isDirectory = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Directory); };
	var _isEnd = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.End); };
	var _isFCO = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.FCO); };
	var _isFileRoute = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.FileRoute); };
	var _isGrid = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Grid); };
	var _isOperation = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Operation); };
	var _isProfile_Item = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Profile_Item); };
	var _isProject = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Project); };
	var _isReplica_Catalog = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Replica_Catalog); };
	var _isSite = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Site); };
	var _isStart = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Start); };
	var _isTerminal = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Terminal); };
	var _isTransformation = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Transformation); };
	var _isTransformation_Ref = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Transformation_Ref); };
	

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
			isDirectory: _isDirectory,
			isEnd: _isEnd,
			isFCO: _isFCO,
			isFileRoute: _isFileRoute,
			isGrid: _isGrid,
			isOperation: _isOperation,
			isProfile_Item: _isProfile_Item,
			isProject: _isProject,
			isReplica_Catalog: _isReplica_Catalog,
			isSite: _isSite,
			isStart: _isStart,
			isTerminal: _isTerminal,
			isTransformation: _isTransformation,
			isTransformation_Ref: _isTransformation_Ref
		}
    };
});
