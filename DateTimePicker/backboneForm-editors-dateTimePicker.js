define([
    'jquery',
    'backbone',
    'backbone_forms',
    'dateTimePicker'
    ], function (
       $, Backbone, Form
       ) {
        'use strict';
        return Form.editors.DateTimePickerBS = Form.editors.Base.extend({
            previousValue: '',

            events: {
                'hide': "hasChanged"
            },

            hasChanged: function (currentValue) {
                if (currentValue !== this.previousValue) {
                    this.previousValue = currentValue;
                    this.trigger('change', this);
                }
            },

            initialize: function (options) {

                Form.editors.Base.prototype.initialize.call(this, options);
                this.template = options.template || this.constructor.template;
                this.options = options;
                console.log('datetimepicker',this);
            },

            getValue: function () {
                var date = new Date
                return this.el.children['Date_'].value
            },

            render: function () {
                var options = this.options;
                var schema = this.schema;

                if(options.schema.validators){
                    var required = options.schema.validators[0];
                }

                var $el = $($.trim(this.template({
                    value : options.model.get(this.options.key),
                    editorClass : schema.editorClass,
                    required: required,
                    format : options.schema.options.dateFormat,
                    editable : (options.schema.editable == null) ? '' : 'disabled',
                    hidden : (options.schema.editable == null) ? '' : 'hidden',
                })));
                this.setElement($el);
                if(options.schema.options.maxDate != "" && options.schema.options.maxDate !== undefined){
                    var theDate = new Date(options.schema.options.maxDate);
                    $($el[0]).datetimepicker({ maxDate: theDate });
                }else{
                    $($el[0]).datetimepicker();
                }

                if(this.options){
                    var curValue = this.options.model.get(this.options.key);
                    if(curValue == "" || curValue === undefined){
                        var value = options.schema.options.defaultValue;
                    }else{
                        var value = this.options.model.get(this.options.key);
                    }
                    $el.find('input').val(value);
                }

                return this;
        },
    }, {
        // STATICS
        template: _.template('<div class="input-group date" id="dateTimePicker" data-editors="Date_"><span class="input-group-addon <%= hidden %>"><span class="glyphicon-calendar glyphicon"></span></span><input id="c24_Date_" name="Date_" class="<%= editorClass %> <%= required %>" type="text" placeholder="<%= format %>" data-date-format="<%= format %>" value="<%= value %>" <%= editable %> ></div>', null, Form.templateSettings)
   });
});
