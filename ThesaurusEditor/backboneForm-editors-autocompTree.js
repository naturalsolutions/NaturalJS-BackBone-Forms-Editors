

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
    Backbone.Form.validators.Thesaurus = function (options) {
        return function Thesaurus(value) {
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

    Form.validators.Thesaurus = function (options) {
        return function Thesaurus(value) {
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

    var myAutocompTreeEditor = Form.editors.Base.extend({

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
                this.storedTree = GlobalModelManager.GetThesaurusTree();
            else
                this.storedTree = options.schema.options.storedTree;

            if (!this.storedTree && loop < 30) {
                setTimeout(function () { that.initStoredTree(options, loop+1); }, 1000);
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
            if (options.schema.editorAttrs && options.schema.editorAttrs.disabled) {
                this.editable = false;
            }
            if (this.editable != null && !this.editable) {
                editorAttrs += 'disabled="disabled"';
                this.ValidationRealTime = false;
            }
            var tplValeurs = {
                inputID: this.id,
                editorAttrs: editorAttrs,
                editorClass: options.schema.editorClass,
                iconFont: iconFont
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
            this.validators.push({ type: 'Thesaurus', startId: this.startId, wsUrl: this.wsUrl, parent: this });
            this.translateOnRender = options.translateOnRender || true;
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
                    webservices: 'fakeInitForCompleteTree',
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

                if (_this.translateOnRender) {
                    _this.validateAndTranslate(_this.value, true);
                }

                if (_this.FirstRender) {
                    _this.$el.find('#' + _this.id).blur(function (options) {
                        setTimeout(function (options) {
                            var value = _this.$el.find('#' + _this.id + '_value').val();
                            _this.toBeTranslated = true;
                            _this.onEditValidation(value);
                        }, 200);
                    });
                }
                _this.FirstRender = false;
            }
            else if (loop < 30)
            {
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
        applyTranslation: function (translatedDatas, isTranslated) {
            var _this = this;
            var data = translatedDatas;

            $('#divAutoComp_' + _this.id).removeClass('error');

            var translatedValue = data["TTop_FullPathTranslated"];
            if (isTranslated) {
                if (_this.displayValueName == 'valueTranslated') {
                    translatedValue = data["TTop_NameTranslated"];
                }
                _this.$el.find('#' + _this.id).val(translatedValue);
                _this.$el.find('#' + _this.id + '_value').val(data['TTop_FullPath']);
            }

            _this.displayErrorMsg(false);
        },

        validateAndTranslate: function (value, isTranslated) {
            var _this = this;
            
            if (value == null || value == '') {
                _this.displayErrorMsg(false);
                return;
            }
            var TypeField = "FullPath";
            if (value && value.indexOf(">") == -1) {
                TypeField = 'Name';
            }
            var erreur;
            var translationDatas = GlobalModelManager.getTranslationDatasFor(value,_this.lng);
            if (translationDatas)
            {
                _this.applyTranslation(translationDatas, isTranslated);
            }
            else
            {
                $.ajax({
                    url: _this.wsUrl + "/getTraductionByType",
                    //timeout: 3000,
                    data: '{ "sInfo" : "' + value + '", "sTypeField" : "' + TypeField + '", "iParentId":"' + _this.startId + '",lng:"' + _this.lng + '"  }',
                    dataType: "json",
                    type: "POST",
                    //async:false,
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        GlobalModelManager.setTranslationDatasFor(value, _this.lng, data);
                        _this.applyTranslation(data, isTranslated);
                    },
                    error: function (data) {
                        _this.$el.find('#' + _this.id).val(value);
                        if (_this.editable) {
                            $('#divAutoComp_' + _this.id).addClass('error');
                            _this.displayErrorMsg(true);
                        }
                    }
                });
            }
        },
        onEditValidation: function (value) {
            var _this = this;
            /*if (value == null || value == '') {
                $('#divAutoComp_' + _this.id).removeClass('error');
                return;
            }*/

            _this.isTermError = true;
            _this.validateAndTranslate(value, true);

            // TOCHECK _this.validateAndTranslate(value, false);
        },

        displayErrorMsg: function (bool) {
            if (this.editable) {
                this.isTermError = bool;
                if (this.isTermError) {
                    this.termError = "Invalid term";
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
                        <span id="errorMsg" class="error hidden">Invalid term</span>\
                    </div>',
    });

    Form.editors.AutocompTreeEditor = myAutocompTreeEditor;
    Backbone.Form.editors.AutocompTreeEditor = myAutocompTreeEditor;

    return myAutocompTreeEditor;
});