"use strict";

define(['logManager',
    'lib/jquery/jquery.qtip',
    'css!/css/Widgets/DiagramDesigner/DiagramDesignerWidget.VFRelation'], function (logManager) {
    var ArtifactInfoPanel,
        ArtifactLink,
        CopyLinkButton,
        ArtifactLinkList,
        defaultInfoURL = '/artifact_ref/get_references/';

    /**
     * ArtifactLink
     *
     * @param config
     */
    ArtifactLink = function (config, labelMaxWidth) {

        /* locals */
        var that = this;

        /* imports & exports */
        this.artifactType = 'generic';   // wiki, ticket, blob, tree etc. generic by defult
        this.label = null;          // will be called on the UI
        this.fullLabel = null;
        this.extras = null;         // html content added after artifact link
        this.infoURL = defaultInfoURL;  // has info button
        this.refId = null;          // referenceId
        this.clickURL = null;       // browser will take user here when artifact is clicked
        this.iconURL = null;        // iconURL, if set will be used instead of artifactType-derived icon
        this.showIcon = true;       // if false, icon will not be rendered
        this.leftTrimmed = false;
        this.shortLink = '';
        this.hideCreateLinkButton = false;
        this.hideInfoIcon = false;

        this.containerE = null;
        this.el = null;
        this.labelE = null;
        this.infoPanel = null;


        /* methods */
        this.render = function () {

            var el,
                iconE,
                infoButtonE,
                extrasE;

            if (!this.containerE) {
                return; // exit early if there is no container to render to
            }

            if (this.el) {
                this.el.remove();
            }

            if (this.clickURL) {
                el = $('<a/>', {
                    "class": 'clickable',
                    href: this.clickURL
                });
            } else {
                el = $('<span/>');
            }
            this.el = el.addClass('artifact-link');
            if (this.artifactType) {
                el.addClass('artifact-link-' + $vf.slugify(this.artifactType));
            }

            if (this.showIcon &&
                ( this.artifactType || this.iconURL )) {

                el.addClass('has-artifact-icon');

                /* render icon */
                iconE = $('<span/>', {
                    'class': 'artifact-icon'
                });

                if (this.iconURL) {

                    // if it has a specific icon, use that

                    switch (this.iconURL) {

                    case 'FILE_TEXT':
                    case 'FILE_IMAGE':
                    case 'FILE_DESIGN_SPACE':
                    case 'FILE_TESTBENCH_RESULT':

                        iconE.addClass(this.iconURL);

                        break;

                    default:

                        iconE.css('background-image', 'url(' + this.iconURL + ')');

                        break;

                    }


                } else {

                    // we will get the css class for the given artifactType

                    iconE.addClass($vf.slugify(this.artifactType));

                }

                el.append(iconE);

            }

            /* render label */

            this.fullLabel = this.fullLabel || this.label;

            this.labelE = $('<span/>', {
                'text': this.label,
                'class': 'artifact-label',
                'title': this.fullLabel
            });

            if (this.leftTrimmed) {
                this.labelE.addClass('left-trimmed');
            }

            this.labelE.appendTo(el);

            if (!isNaN(labelMaxWidth)) {
                this.labelE.css('max-width', labelMaxWidth + 'px');
            }

            /* render infobutton and initialize tooltip */
            if ( this.infoURL && !this.hideInfoIcon ) {
                el.addClass('has-info-button');

                infoButtonE = $('<span/>', {
                    'class': 'infoButton'
                });

                that.infoPanel = new $vf.ArtifactInfoPanel({
                    parentClickURL: this.clickURL,
                    infoURL: this.infoURL,
                    refId: this.refId,
                    infoTriggerE: infoButtonE,
                    hideCreateLinkButton: this.hideCreateLinkButton
                });

                el.append(infoButtonE);
            }

            if (this.extras) {
                extrasE = $('<div/>', {
                    'class': 'artifact-extras',
                    'html': this.extras,
                    'click': function (e) {
                        e.stopPropagation();
                    }
                });

                el.append(extrasE);
            }

            this.containerE.append(el);
            this.containerE.removeClass('rendering');

            if (this.leftTrimmed) {
                $vf.handleTrimLeft(this.labelE);
            }

        };

        this.remove = function () {

            if (this.el) {
                this.el.remove();
            }

        };

        $.extend(this, config);

    };


    /**
     * ArtifactInfoPanel
     *
     * @param config
     */
    ArtifactInfoPanel = function (config) {

        // locals
        var that = this,
            relationsInitialized = false,
            relationsE = null,
            relationsListE = null,
            createLinkButton = null,
            relationsMap = {},
            progressBar,
            postRedraw = $.noop,
            loaded = false;

        // defaults
        config.infoURL = config.infoURL || defaultInfoURL;
        config.baseUrl = config.baseUrl || '';
        if (config.baseUrl && config.baseUrl.charAt(config.baseUrl.length - 1) === '/') {
            config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
        }

        var contentE = this.contentE = $('<div/>', {
            'class': 'infopanel-content'
        });

        if ( !config.embedded ) {
            contentE.append($('<div/>', {
                'class': 'artifact-pleaseWait'
            }));
        }

        config.infoTriggerE.qtip({
            suppress: false,
            content: {
                text: function (event, api) {
                    if (!loaded) {
                        $.ajax({
                            url: config.baseUrl + config.infoURL, // URL to the JSON script
                            type: 'GET', // POST or GET
                            data: {artifact_ref: config.refId}, // Data to pass along with your request
                            dataType: 'json', // Tell it we're retrieving JSON
                            success: function (data) {
                                that.render(data);
                                api.reposition();
                                postRedraw();
                                api.reposition();
                                loaded = true;
                            }
                        });
                    }
                    return contentE;
                }

            },
            position: {
                at: 'middle right', // Position the tooltip above the link
                my: 'top left',
                viewport: $(window), // Keep the tooltip on-screen at all times
                effect: false // Disable positioning animation
            },
            show: {
                event: 'click',
                solo: true // Only show one tooltip at a time
            },
            hide: 'unfocus',
            style: {
                classes: 'ui-tooltip-artifact'
            }

        });

        var initRelations = function () {

            var classStr;

            classStr = 'relations';

            if (config.embedded === true) {
                classStr += ' embedded';
            }

            relationsE = $('<div/>', {
                'class': classStr
            });

            contentE.html(relationsE);

            relationsListE = $('<ul/>', {
                'class': 'relations-list'
            });

            relationsInitialized = true;
        };

        this.render = function (data) {

            var instancesListE;
            var addRelation, hasMoreRelations = false;

            if (relationsInitialized === false) {
                initRelations();
            }

            if (data.relations) {

                // these are te columns

                if (config.hideCreateLinkButton) {
                    relationsE.addClass('noCreateLinkButton');
                }

                // Call-out version

                relationsE.append(relationsListE);

                addRelation = function (relation) {
                    var relationE, mountPointE, iconE;

                    relationE = $('<li/>', {
                        'class': 'column'
                    });

                    mountPointE = $('<div/>', {
                        'text': relation.label +
                            (relation.count ? '[' + relation.count + ']' : ''),
                        'class': 'mount-point-label'
                    });

                    /* render icon */

                    iconE = $('<span/>', {
                        'class': 'artifact-icon mount-point-icon'
                    });

                    mountPointE.prepend(iconE);

                    if (relation.tool_name) {
                        iconE.addClass(relation.tool_name);
                    }

                    if (relation.createURL) {
                        mountPointE.append($('<a/>', {
                            'class': 'relation-create-button',
                            text: '+',
                            'href': relation.createURL + '?artifact_ref=' + encodeURIComponent(config.refId),
                            title: 'Create new',
                            target: '_top'
                        }));
                    }

                    relationE.append(mountPointE);
                    relationsListE.append(relationE);

                    return relationE;
                };

                // Render Each tool

                $.each(data.relations, function (i, relation) {

                    if (relation.instances) {

                        if (!relationsMap[relation.label]) {
                            relationsMap[relation.label] = addRelation(relation);
                        }

                        //if (relation.instances.length) {

                            if ( config.embedded ) {
                                instancesListE = $('<div/>', {
                                    'class': 'instances-list'
                                });
                            } else {
                                instancesListE = $('<ul/>', {
                                    'class': 'instances-list'
                                });
                            }

                            relationsMap[relation.label].append(instancesListE);
                        //}

                        hasMoreRelations = hasMoreRelations ||
                            (relation.count &&
                                relation.count > relation.instances.length);


                        var linkList, itIsRepo = [ 'Git', 'SVN' ].indexOf( relation.tool_name ) !== -1,
                                labelMaxWidth;

                        if (config.embedded) {

                            if ( relation.instances && relation.instances.length ) {

                                if (itIsRepo) {
                                    labelMaxWidth = 95;
                                } else {
                                    labelMaxWidth = 105;
                                }

                                linkList = new $vf.ArtifactLinkList({
                                    containerE: instancesListE,
                                    referenceDescriptors: relation.instances,
                                    editable: false,
                                    hideCreateLinkButton: true,
                                    hideInfoIcon: true,
                                    showIcon: itIsRepo,
                                    labelMaxWidth: labelMaxWidth
                                });

                                linkList.render();

                            } else {

                                instancesListE.append($('<div/>', {
                                    'text': 'No references',
                                    'class': 'noReferences'
                                }));

                            }

                        } else {

                            $.each(relation.instances, function (j, relationInstance) {

                                var instanceE = $('<li/>', {
                                    text: relationInstance[0],
                                    title: relationInstance[0],
                                    click: function () {
                                        top.location.href =
                                            relationInstance[1];
                                    }
                                });

                                instancesListE.append(instanceE);

                            });

                        }


                    }

                });

                if (hasMoreRelations && config.parentClickURL) {
                    relationsListE.after($('<div/>', {
                        html: 'Show more relations &raquo;',
                        click: function () {
                            top.location.href = config.parentClickURL;
                        },
                        'class': 'show-more',
                        title: 'Show all relationships'
                    }));
                }


            }

            // Create Link

            if (data.shortLink && config.hideCreateLinkButton !== true) {
                createLinkButton = new CopyLinkButton({
                    containerE: contentE,
                    refId: config.refId,
                    addUrl: config.addUrl,
                    baseUrl: config.baseUrl
                });
            }


            // Remove Loading spin

            if (data.loading) {

                $('<div/>', {
                    "class": "references-loading",
                    "text": "Loading..."
                }).appendTo(contentE);
            } else {
                contentE.find('.references-loading').remove();
            }

            if ( config.embedded ) {
                config.containerE.prepend($('<h4>Related</h4>'));
            }

        };


    };

    CopyLinkButton = function (config) {

        var buttonE;

        config.baseUrl = config.baseUrl || '';

        if (config.containerE) {

            buttonE = $('<div/>', {

                'class': 'copyLinkButton',
                'title': 'Add to Link Bin',
                click: function () {
                    if ( top.$vf && top.$vf.referenceBin ) {
                        top.$vf.referenceBin.addReference(config.refId);
                    } else {
                        $.ajax({
                            url: config.baseUrl + config.addUrl,
                            type: 'POST',
                            data: {
                                'ref_id': config.refId,
                                '_session_id': cval
                            },
                            dataType: "json",
                            error: function() {

                            }
                        });
                    }
                }
            });
            config.containerE.append(buttonE);

        }

    };


    /**
     * List of ArtifactLinks
     *
     * @class
     * @param config
     */
    ArtifactLinkList = function (config) {

        trace('ArtifactLinkList created...');

        var that = this;
        var liE, artifactLink, artifactLinkList, removeE;

        var listE = this.listE = $('<div/>', {
            'class': 'artifactLinkList'
        });

        this.referenceDescriptors = config.referenceDescriptors;

        this.length = 0;

        this.render = function (silent) {

            if (config.containerE) {

                artifactLinkList = artifactLinkList || {};

                this.empty();

                config.containerE.append(listE);

                if ($.isArray(this.referenceDescriptors) || this.referenceDescriptors.length) {

                    $.each(this.referenceDescriptors, function (i, e) {

                        that.addLinkByDescriptor(e, silent);

                    });

                }

            }

        };

        this.addLinkByDescriptor = function (descriptor, silent) {

            var messagesEl;

            artifactLinkList = artifactLinkList || {};

            if (config.maxLength !== undefined && this.length >= config.maxLength) {

                // Here we drop error message

                messagesEl = $("#messages");
                messagesEl.notify('Link Bin is full. [' + descriptor.label + '] can not be added.', {
                        status: 'error',
                        timer: 4000
                    }
                );

                return false;

            }

            if (artifactLinkList[ descriptor.refId ] === undefined) {

                liE = $('<div/>', {
                    'class': 'artifactLinkListElement'
                });

                listE.append(liE);

                if (config.editable) {

                    liE.draggable({

                        cursor: 'move',
                        revert: true,
                        containment: 'document',
                        appendTo: 'body',
                        helper: 'clone',
                        zIndex: 15000,
                        revertDuration: 250,
                        opacity: 0.7,
                        scroll: true,

                        start: function (event, ui) {
                            // FIXING Chrome specific offset bug
                            if(! $.browser.chrome) ui.position.top -= $(window).scrollTop();

                            // making textareas link-droppable

                            var textareaAction = function (artifactLink) {

                                $(this).insertAtCaret(artifactLink.shortLink);

                            };

                            $('.markdown-edit textarea').each(function () {

                                $(this).artifactLinkDroppable(textareaAction);

                            });

                        },
                        // FIXING Chrome specific offset bug
                        drag: function(event, ui) {
                            if(! $.browser.chrome) ui.position.top -= $(window).scrollTop();
                        }

                    });

                }

                artifactLink = new ArtifactLink(descriptor, config.labelMaxWidth);

                // passing some settings over to ArtifactLink instance
                artifactLink.containerE = liE;
                artifactLink.hideCreateLinkButton = config.hideCreateLinkButton;
                artifactLink.hideInfoIcon = config.hideInfoIcon;

                if ( config.showIcon === false ) {
                    artifactLink.showIcon = false;
                }

                if ( config.leftTrimmed ) {
                    artifactLink.leftTrimmed = true;
                }

                artifactLink.render();

                artifactLinkList[ descriptor.refId ] = artifactLink;

                var handlerFactory = function (id) {
                    return function () {
                        that.removeLinkByRefId(id);
                    };
                };

                liE.data('host', artifactLink);

                if (config.editable) {

                    removeE = $('<span/>', {
                        'class': 'linkRemoveButton',
                        'text': 'X',
                        'title': 'Remove Link',
                        click: handlerFactory(descriptor.refId)
                    });

                    liE.append(removeE);
                }

                this.length += 1;

                if ($.isFunction(config.on_linkAdd) && silent !== true) {
                    config.on_linkAdd.call(that, descriptor.refId);
                }

            } else {

                // Already in bin. Display error message.

                messagesEl = $("#messages");
                messagesEl.notify('[' + descriptor.label + '] is already in Link Bin.', {
                        status: 'error',
                        timer: 4000
                    }
                );

                return false;

            }

        };

        this.empty = function() {

            $.each(artifactLinkList, function (i, e) {
                artifactLink = artifactLinkList[ i ];

                if (artifactLink) {

                    liE = artifactLink.containerE;

                    artifactLink.remove();

                    liE.remove();

                    delete artifactLinkList[ i ];

                }

            });

            this.length = 0;
            artifactLinkList = {};

        };

        this.removeLinkByRefId = function (refId, silent) {

            artifactLink = artifactLinkList[ refId ];

            if (artifactLink) {

                liE = artifactLink.containerE;

                artifactLink.remove();

                liE.remove();

                delete artifactLinkList[ refId ];

                this.length -= 1;

                if ($.isFunction(config.on_linkRemove) && silent !== true) {
                    config.on_linkRemove.call(that, refId);
                }

            }

        };

    };


    return ArtifactInfoPanel;
});

