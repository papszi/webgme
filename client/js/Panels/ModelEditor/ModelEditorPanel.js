"use strict";

define(['js/PanelBase/PanelBaseWithHeader',
    'js/PanelManager/IActivePanel',
    'js/Widgets/ModelEditor/ModelEditorWidget',
    './ModelEditorControl',
    'clientUtil'
], function (PanelBaseWithHeader,
             IActivePanel,
             ModelEditorWidget,
             ModelEditorControl,
             clientUtil) {

    var ModelEditorPanel;

    ModelEditorPanel = function (layoutManager, params) {
        var options = {};
        //set properties from options
        options[PanelBaseWithHeader.OPTIONS.LOGGER_INSTANCE_NAME] = "ModelEditorPanel";
        options[PanelBaseWithHeader.OPTIONS.FLOATING_TITLE] = true;

        //call parent's constructor
        PanelBaseWithHeader.apply(this, [options, layoutManager]);

        this._client = params.client;

        //initialize UI
        this._initialize();

        this.logger.debug("ModelEditorPanel ctor finished");
    };

    //inherit from PanelBaseWithHeader
    _.extend(ModelEditorPanel.prototype, PanelBaseWithHeader.prototype);
    _.extend(ModelEditorPanel.prototype, IActivePanel.prototype);

    ModelEditorPanel.prototype._initialize = function () {
        var self = this,
            params = {
                toolbar: this.toolBar,
                client: this._client
            },
            vfBaseUrl;

        vfBaseUrl = clientUtil.getURLParameterByName("vfBaseUrl");
        if (vfBaseUrl) {
            params.vehicleforge = {
                baseUrl: vfBaseUrl,
                toolRestUrl: clientUtil.getURLParameterByName("vfToolRestUrl")
            };
            this._client.addEventListener(this._client.events.PROJECT_OPENED, function (__project, projectName) {
                var url = vfBaseUrl + params.vehicleforge.toolRestUrl + '/project/create_project';
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: {project_name: projectName},
                    xhrFields: {withCredentials: true}
                });
            });
        }

        this.widget = new ModelEditorWidget(this.$el, params);

        this.widget.setTitle = function (title) {
            self.setTitle(title);
        };

        this.widget.onUIActivity = function () {
            WebGMEGlobal.PanelManager.setActivePanel(self);
            WebGMEGlobal.KeyboardManager.setListener(self.widget);
        };

        this.control = new ModelEditorControl({"client": this._client,
            "widget": this.widget});

        this.onActivate();
    };

    /* OVERRIDE FROM WIDGET-WITH-HEADER */
    /* METHOD CALLED WHEN THE WIDGET'S READ-ONLY PROPERTY CHANGES */
    ModelEditorPanel.prototype.onReadOnlyChanged = function (isReadOnly) {
        //apply parent's onReadOnlyChanged
        PanelBaseWithHeader.prototype.onReadOnlyChanged.call(this, isReadOnly);

        this.widget.setReadOnly(isReadOnly);
    };

    ModelEditorPanel.prototype.onResize = function (width, height) {
        this.logger.debug('onResize --> width: ' + width + ', height: ' + height);
        this.widget.onWidgetContainerResize(width, height);
    };

    ModelEditorPanel.prototype.destroy = function () {
        this.control.destroy();
        this.widget.destroy();

        PanelBaseWithHeader.prototype.destroy.call(this);
        WebGMEGlobal.KeyboardManager.setListener(undefined);
        WebGMEGlobal.Toolbar.refresh();
    };

    /* override IActivePanel.prototype.onActivate */
    ModelEditorPanel.prototype.onActivate = function () {
        this.widget.onActivate();
        this.control.onActivate();
        WebGMEGlobal.KeyboardManager.setListener(this.widget);
        WebGMEGlobal.Toolbar.refresh();
    };

    /* override IActivePanel.prototype.onDeactivate */
    ModelEditorPanel.prototype.onDeactivate = function () {
        this.widget.onDeactivate();
        this.control.onDeactivate();
        WebGMEGlobal.KeyboardManager.setListener(undefined);
        WebGMEGlobal.Toolbar.refresh();
    };

    ModelEditorPanel.prototype.getNodeID = function () {
        return this.control.getNodeID();
    };

    return ModelEditorPanel;
});
