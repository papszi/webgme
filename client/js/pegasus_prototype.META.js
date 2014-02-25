/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * AUTO GENERATED CODE FOR PROJECT pegasus_prototype
 */

"use strict";

define(['underscore',
        'js/Utils/METAAspectHelper'], function (_underscore,
                                                METAAspectHelper) {

    var _metaID = 'pegasus_prototype.META.js';

    //META ASPECT TYPES
    var _metaTypes = {
		'Attr_Conn': '/-3/-30',
		'Attribute': '/-3/-14',
		'Connection': '/-3/-24',
		'FCO': '/-3/-22',
		'FS_Conn': '/-3/-26',
		'File': '/-3/-8',
		'FileSet': '/-3/-10',
		'File_Conn': '/-3/-28',
		'Fork': '/-3/-12',
		'Fork_Conn': '/-3/-67',
		'Job': '/-3/-69',
		'Job_Conn': '/-3/-27',
		'Macro': '/-3/-70',
		'Merge': '/-3/-25',
		'Merge_Conn': '/-3/-29',
		'MetaLanguageContainer': '/-3/-71',
		'Multiplexer': '/-3/-13'
	};

    //META ASPECT TYPE CHECKING
    var _isAttr_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Attr_Conn); };
	var _isAttribute = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Attribute); };
	var _isConnection = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Connection); };
	var _isFCO = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.FCO); };
	var _isFS_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.FS_Conn); };
	var _isFile = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.File); };
	var _isFileSet = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.FileSet); };
	var _isFile_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.File_Conn); };
	var _isFork = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Fork); };
	var _isFork_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Fork_Conn); };
	var _isJob = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Job); };
	var _isJob_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Job_Conn); };
	var _isMacro = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Macro); };
	var _isMerge = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Merge); };
	var _isMerge_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Merge_Conn); };
	var _isMetaLanguageContainer = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.MetaLanguageContainer); };
	var _isMultiplexer = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Multiplexer); };
	

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
                    delete _metaTypes[m];
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
			isAttr_Conn: _isAttr_Conn,
			isAttribute: _isAttribute,
			isConnection: _isConnection,
			isFCO: _isFCO,
			isFS_Conn: _isFS_Conn,
			isFile: _isFile,
			isFileSet: _isFileSet,
			isFile_Conn: _isFile_Conn,
			isFork: _isFork,
			isFork_Conn: _isFork_Conn,
			isJob: _isJob,
			isJob_Conn: _isJob_Conn,
			isMacro: _isMacro,
			isMerge: _isMerge,
			isMerge_Conn: _isMerge_Conn,
			isMetaLanguageContainer: _isMetaLanguageContainer,
			isMultiplexer: _isMultiplexer
		}
    };
});