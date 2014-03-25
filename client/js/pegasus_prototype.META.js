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
		'F2FS_Conn': '/-3/-67',
		'FCO': '/-3/-22',
		'FS_Conn': '/-3/-26',
		'File': '/-3/-8',
		'FileSet': '/-3/-10',
		'File_Conn': '/-3/-28',
		'Fork': '/-3/-2',
		'Fork_Conn': '/-3/-5',
		'Job': '/-3/-69',
		'Job_Conn': '/-3/-27',
		'Macro': '/-3/-70',
		'Merge_Conn': '/-3/-29',
		'Merge_operation': '/-3/-3',
		'MetaLanguageContainer': '/-3/-71',
		'Multiplexer': '/-3/-13',
		'Preview_Conn': '/-3/1520956416',
		'Preview_File': '/-3/755800864',
		'Split_Operation': '/-3/-4',
		'file2fileset': '/-3/-12',
		'fileset2file': '/-3/-25'
	};

    //META ASPECT TYPE CHECKING
    var _isAttr_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Attr_Conn); };
	var _isAttribute = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Attribute); };
	var _isConnection = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Connection); };
	var _isF2FS_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.F2FS_Conn); };
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
	var _isMerge_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Merge_Conn); };
	var _isMerge_operation = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Merge_operation); };
	var _isMetaLanguageContainer = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.MetaLanguageContainer); };
	var _isMultiplexer = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Multiplexer); };
	var _isPreview_Conn = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Preview_Conn); };
	var _isPreview_File = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Preview_File); };
	var _isSplit_Operation = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.Split_Operation); };
	var _isfile2fileset = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.file2fileset); };
	var _isfileset2file = function (objID) { return METAAspectHelper.isMETAType(objID, _metaTypes.fileset2file); };
	

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
                    //delete _metaTypes[m];
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
			isF2FS_Conn: _isF2FS_Conn,
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
			isMerge_Conn: _isMerge_Conn,
			isMerge_operation: _isMerge_operation,
			isMetaLanguageContainer: _isMetaLanguageContainer,
			isMultiplexer: _isMultiplexer,
			isPreview_Conn: _isPreview_Conn,
			isPreview_File: _isPreview_File,
			isSplit_Operation: _isSplit_Operation,
			isfile2fileset: _isfile2fileset,
			isfileset2file: _isfileset2file
		}
    };
});
