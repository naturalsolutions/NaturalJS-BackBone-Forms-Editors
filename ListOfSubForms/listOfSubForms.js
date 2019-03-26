define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'backbone_forms',

], function ($, _, Backbone, Marionette, Form, List, tpl) {

    Backbone.Form.validators.ListOfSubFormsValidator = function (options) {
        return function subforms(value) {
            var errors = [];
            for (var i = 0; i < options.editor.forms.length; i++) {
                var validation = options.editor.forms[i].validate();
                if (validation != null) {
                    errors.push(validation);
                }
            }
            if (errors.length > 0) {
                return errors;
            }
            else {
                return null;
            }
        };
    };

    Form.validators.ListOfSubFormsValidator = function (options) {
        return function subforms(value) {
            var errors = [];
            for (var i = 0; i < options.editor.forms.length; i++) {
                var validation = options.editor.forms[i].validate();
                if (validation != null) {
                    errors.push(validation);
                }
            }
            if (errors.length > 0) {
                return errors;
            }
            else {
                return null;
            }
        };
    };

    var myListOfSubForms = Form.editors.Base.extend({
        events: {
            'click #addFormBtn': 'addEmptyForm',
        },
        initialize: function (options) {
            var _this = this;
            Form.editors.Base.prototype.initialize.call(this, options);
            if (options.schema.validators == null) {
                options.schema.validators = [];
            }
            if (options.schema.validators.length) {
                this.defaultRequired = true;
            } else {
                //options.schema.validators.push('required');
                this.defaultRequired = false;
            }
            this.validators = options.schema.validators = [];

            this.validators.push({ type: 'ListOfSubFormsValidator', editor: this });


            this.template = options.template || this.constructor.template;
            var $el = $($.trim(this.template({
                hidden: this.hidden
            })));

            this.options = options;
            //this.options.schema.fieldClass += 'col-xs-12';
            this.forms = [];
            this.disabled = false;
            if ((options.schema.editorAttrs && options.schema.editorAttrs.disabled) || options.schema.editable == false) {
                this.disabled = true;
            }
            this.hidden = '';
            if (this.disabled) {
                this.hidden = 'hidden';
            }
            this.hasNestedForm = true;

            var key = this.options.key;
            if (this.options.model.schema[key].defaultValue)
                this.defaultValue = this.options.model.schema[key].defaultValue['FK_ProtocoleType'];
            else
                this.defaultValue = 0;
        },

        //removeForm
        deleteForm: function () {

        },

        addEmptyForm: function () {

            var model = new Backbone.Model( this.options.schema.defaultvalue );

            model.schema = this.options.schema.subschema;
            model.fieldsets = this.options.schema.fieldsets;

            var canedit = true;
            if (model.fieldsets)
                canedit = false;

            var form = this.addForm(model, canedit);
        },

        addForm: function (model, canedit) {
            var _this = this;
            if (this.disabled) {
                _.each(model.schema, function (value, key, obj) {
                    //model.schema[key].editable = false;
                    if (model.schema[key].editorAttrs == null) {
                        model.schema[key].editorAttrs = {}
                    }
                    model.schema[key].editorAttrs.disabled = true;
                });
            }

            var form = new Backbone.Form({
                model: model,
                fieldsets: model.fieldsets,
                schema: model.schema,
            }).render();

            this.forms.push(form);

            if ((canedit && (!this.defaultRequired || this.forms.length != 1))) {
                form.$el.find('fieldset').append('\
                    <div class="' + this.hidden + ' col-md-1 control delsubformline">\
                        <button type="button" class="btn but-grey pull-right" id="remove">X</button>\
                    </div>\
                ');
                form.$el.find('button#remove').on('click', function () {
                    _this.$el.find('.formContainer').find(form.el).remove();
                    var i = _this.forms.indexOf(form);
                    if (i > -1) {
                        _this.forms.splice(i, 1);
                    }
                    return;
                });
            }

            form.$el.addClass("subformArea");
            // form.$el.find('.formContainer fieldset').removeClass('col-md-12');
            this.$el.find('.formContainer').append(form.el);

            if (canedit)
                $(form.el).find(".form-control").removeClass("subFormCreateOnly");

            var itemsize = Math.floor(12 / Object.keys(model.schema).length);

            $.each(model.schema, function (index, value) {
                var strRef = "label[for='" + model.cid + "_" + value.name + "']";

                if ($(strRef).length > 0)
                {
                    var lengthToSet = "col-xs-6";
                    var formControl = $(strRef)[0].control;

                    if ($(formControl).length > 0) {
                        var fcClasses = $(formControl).prop("class").split(" ");
                        $.each(fcClasses, function (subindex, subvalue) {
                            if (subvalue.indexOf("col-") != -1) {
                                lengthToSet = "col-xs-" + subvalue.split("-")[2];
                            }
                        });
                    }
                    $(strRef).parent().addClass(lengthToSet);
                }

                if (value.editorClass.indexOf("HiddenInput") !== -1)
                    $(strRef).parent().addClass("HiddenInputParent");
                if (value.editorClass.indexOf("ReadOnlyInput") !== -1)
                    $(strRef).parent().addClass("ReadOnlyInputParent");
                if (value.validators && value.validators[0] == "required")
                {
                    $(strRef).addClass('required');
                }

                var element = $(".formModeEdit [name='" + value.name + "']:last");

                // TODO TMP : COPIED FROM DEFAULT VALUE SETUP ON FILE NSFORMSMODULE.JS
                switch (value.type.toLowerCase()) {
                    case "text":
                        var mydefaultValue = "";
                        if (element.val() == "") {
                            mydefaultValue = value.defaultValue;
                            if ((mydefaultValue == null || mydefaultValue == "")
                                && value.options && value.options.defaultValue)
                                mydefaultValue = value.options.defaultValue
                            element.val(mydefaultValue);
                        }

                        break;

                    case "select":
                        var mydefaultValue = "";
                        if ((element.val() == "" || element.val() == null) && value.options && value.options.length > 0) {

                            var foundselected = false;
                            $.each(value.options, function (eachindex, eachvalue) {
                                if (!foundselected && eachvalue.selected
                                    && eachvalue.selected == "selected") {
                                    foundselected = true;
                                    mydefaultValue = eachvalue.val;
                                }
                            });

                            if (foundselected)
                                element.val(mydefaultValue);
                        }

                        break;

                    case "checkbox":

                        if (value.options && value.options.defaultValue) {
                            element.prop('checked', true);
                        }

                        break;

                    //TODO FIND A WAY TO APPLY ONLY ON CREATE, NOT ON EDIT AND IF DEFAULT VALUE IS NOT FORCED AT 0
                    case "number":
                        if (value.options && value.options.defaultValue) {
                            if (element.val() == 0)
                                element.val(value.options.defaultValue);
                        }
                        else if (element.val() == 0) {
                            element.val("");
                        }
                        break;
                }
            });

            return form;
        },

        render: function () {
            var that = this;

            var $el = $($.trim(this.template({
                hidden: this.hidden
            })));

            this.setElement($el);

            var key = this.options.key;
            var data = {};
            if (this.options.model.attributes[key])
                data = JSON.parse(this.options.model.attributes[key]);

            if (data.length) {
                for (var i = 0; i < data.length; i++) {
                    var model = new Backbone.Model();
                    model.schema = this.options.schema.subschema;
                    model.fieldsets = this.options.schema.fieldsets;
                    model.attributes = data[i];
                    this.addForm(model);
                    this.defaultRequired = false;
                };
            } else {
                if (this.defaultRequired) {
                    this.addEmptyForm();
                    this.defaultRequired = false;
                }
            }

            return this;
        },

        getValue: function () {
            var errors = false;
            for (var i = 0; i < this.forms.length; i++) {
                if (this.forms[i].commit()) {
                    errors = true;
                }
            };
            if (errors) {
                return false;
            } else {
                var values = [];
                for (var i = 0; i < this.forms.length; i++) {
                    var tmp = this.forms[i].getValue();
                    var empty = true;
                    for (var key in tmp) {
                        if (tmp[key]) {
                            empty = false;
                        }
                    }
                    if (!empty) {
                        if (this.defaultValue) {
                            tmp['FK_ProtocoleType'] = this.defaultValue;
                        }
                        values[i] = tmp;
                    }
                };
                return values;
            }


        },
    }, {
        //STATICS
        template: _.template('\
            <div class="required nested clearfix ">\
                <div class="formContainer clearfix listofsubforms"></div>\
                <div class="clearfix"><button type="button" id="addFormBtn" class="<%= hidden %> btn pull-right"> <span>Add</span><i id="I3" class="icon ">+</i></button></div>\
            </div>\
            ', null, Form.templateSettings),
    });

    Form.editors.ListOfSubForms = myAutocompTreeEditor;
    Backbone.Form.editors.ListOfSubForms = myAutocompTreeEditor;

    return myListOfSubForms;
});
