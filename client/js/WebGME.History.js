/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 * 
 * Author: Robert Kereskenyi
 */

"use strict";

/*
 * Utility helper functions for saving WebGME state and reload on browser back
 */

define(['jquery',
        'logManager'], function (_jquery,
                                 logManager) {

    var _stateLoading = false,
        _initialized = false,
        logger = logManager.create("WebGME.History");

    var _saveState = function (stateObj) {
        if (_stateLoading === false) {
            logger.debug('saving state:' + JSON.stringify(stateObj));
            window.history.pushState(stateObj, null, null);
        }
    };


    var _onLoadState = function (stateObj) {
        stateObj = stateObj || window.history.state; //TODO check why it is null - probably jquery bug
        _stateLoading = true;

        //clear state in silent mode, it will not fire the clear event
        WebGMEGlobal.State.clear({'silent': true});

        //set the attributes from the saved state
        logger.debug('loading state:' + JSON.stringify(stateObj));
        WebGMEGlobal.State.set(stateObj);

        _stateLoading = false;
    };


    var _initialize = function () {
        if (_initialized) {
            return;
        }

        _initialized = true;
        WebGMEGlobal.State.on("change", function(model, options) {
            _saveState(WebGMEGlobal.State.toJSON());
        });
    };

    if (WebGMEGlobal.history !== true) {
        Object.defineProperty(WebGMEGlobal, 'history', {value : true,
            writable : false,
            enumerable : true,
            configurable : false});

        $(window).on('popstate', function(event) {
            _onLoadState(event.originalEvent.state);
        });
    }


    //return utility functions
    return { initialize: _initialize };
});