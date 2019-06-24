

define([
	'underscore',
	'jquery',
    'jqueryui',
	'backbone',
	'backbone_forms',
	'autocompTree',
    'GlobalModel'
], function (
	_, $, $ui, Backbone, Form, autocompTree, GlobalModelManager
) {
	var positionValidator = function (options) {
        return function Position(value) {
            if (!options.parent.isTermError) {
                return null;
            }
            return null;
            var retour = {
                type: options.type,
                message: ''
            };

            return retour;
        };
    };
	
    Backbone.Form.validators.Position = positionValidator;
    Form.validators.Position = positionValidator;

    var myPositionEditor = Form.editors.Base.extend({

        previousValue: '',
        events: {
            'hide': "hasChanged"
        },
        editable:false,
        hasChanged: function (currentValue) {
            if (currentValue !== this.previousValue) {
                this.previousValue = currentValue;
                this.trigger('change', this);
            }
        },

        initStoredTree: function (options, loop) {
            var that = this;

            if (!options.schema.options.storedTree)
                this.storedTree = GlobalModelManager.GetPositionTree();
            else
                this.storedTree = options.schema.options.storedTree;

            if (!this.storedTree && loop < 30) {
                setTimeout(function () { that.initStoredTree(options, loop + 1); }, 1000);
            }
        },

        initialize: function (options) {
            this.initStoredTree(options, 0);

            Form.editors.Base.prototype.initialize.call(this, options);
            this.FirstRender = true;
            this.languages = {
                'fr': '',
                'en': 'En'
            };
            
            this.ValidationRealTime = true;
            if (options.schema.options.ValidationRealTime == false) {
                this.ValidationRealTime = false;
            }

            var iconFont = options.schema.options.iconFont || 'hidden';

            this.validators = options.schema.validators || [];


            this.isTermError = false;
            
            this.template = options.template || this.constructor.template;
            this.id = options.id;
            var editorAttrs = "";
            
            this.editable = options.schema.editable || true;
            if (options.schema.editorAttrs && options.schema.editorAttrs.disabled)  {
                this.editable = false;
            }
            if (this.editable!=null && !this.editable) {
                editorAttrs += 'disabled="disabled"';
                this.ValidationRealTime = false;
            }
            var tplValeurs = {
                inputID: this.id,
                editorAttrs: editorAttrs,
                editorClass: options.schema.editorClass,
                iconFont:iconFont
            }

            this.template = _.template(this.template, tplValeurs);
            this.startId = options.schema.options.startId;
            this.wsUrl = options.schema.options.wsUrl;
            this.lng = options.schema.options.lng;
            this.displayValueName = options.schema.options.displayValueName || 'fullpathTranslated';
            this.storedValueName = options.schema.options.storedValueName || 'fullpath';

            //todo : tmp safe check, toremove ?
            if (!this.validators)
                this.validators = [];
            this.validators.push({ type: 'Position', startId: this.startId, wsUrl: this.wsUrl,parent:this });
        },

        getValue: function () {

            if (this.isTermError) {
                return null;
            }
            return this.$el.find('#' + this.id + '_value').val();
        },
        
        generateAutocompTree: function (loop) {
            var _this = this;
            if (this.storedTree) {
                _this.$el.find('#' + _this.id).autocompTree({
                    wsUrl: _this.wsUrl,
                    webservices: 'GetTree',
                    language: { hasLanguage: true, lng: _this.lng },
                    display: {
                        isDisplayDifferent: true,
                        suffixeId: '_value',
                        displayValueName: _this.displayValueName,
                        storedValueName: _this.storedValueName
                    },
                    inputValue: _this.value,
                    startId: _this.startId,
                    storedTree: _this.storedTree
                });

                if (_this.FirstRender) {
                    _this.$el.find('#' + _this.id).blur(function (options) {
                        setTimeout(function (options) {
                            var value = _this.$el.find('#' + _this.id + '_value').val();
                            _this.onEditValidation(value);
                        }, 200);
                    });
                }
                _this.FirstRender = false;
            }
            else if (loop < 30) {
                setTimeout(function () { _this.generateAutocompTree(loop + 1); }, 1000);
            }
        },

        render: function () {
            var $el = $(this.template);
            this.setElement($el);
            var _this = this;
            _(function () {
                _this.generateAutocompTree(0);
            }).defer();
            return this;
        },
		
        onEditValidation: function (value) {
			
        },

        displayErrorMsg: function (bool) {
            if (this.editable) {
                this.isTermError = bool;
                if (this.isTermError) {
                    this.termError = "Invalid position";
                    this.$el.find('#divAutoComp_' + this.id).addClass('error');
                    this.$el.find('#errorMsg').removeClass('hidden');
                } else {
                    this.termError = "";
                    this.$el.find('#divAutoComp_' + this.id).removeClass('error');
                    this.$el.find('#errorMsg').addClass('hidden');
                }
            }
        },

    }, {
        template: '<div ">\
                        <div class="input-group">\
                            <span class="input-group-addon <%=iconFont%>" ></span>\
                            <input id="<%=inputID%>" name="<%=inputID%>" class="autocompTree <%=editorClass%>" type="text" placeholder="" <%=editorAttrs%>>\
                       </div>\
                        <span id="errorMsg" class="error hidden">Invalid position</span>\
                    </div>',
    });

    Form.editors.Position = myPositionEditor;
    Backbone.Form.editors.Position = myPositionEditor;

    return myPositionEditor;
});