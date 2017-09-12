define([
    'jquery',
    'backbone',
    'backbone_forms',
    'dateTimePicker'
], function(
    $, Backbone, Form, datetimepicker
){
    'use strict';
    return Form.editors.DateTimePickerEditor = Form.editors.Base.extend({


        previousValue: '',

        events: {
            'hide': "hasChanged"
        },

        hasChanged: function(currentValue) {
            if (currentValue !== this.previousValue){
                this.previousValue = currentValue;
                this.trigger('change', this);
            }
        },

        initialize: function(options) {
            Form.editors.Base.prototype.initialize.call(this, options);
            this.template = options.template || this.constructor.template;
            this.options = options;
        },

        getValue: function() {
            var date= new Date;
            if (this.el.children['Date_'])
                return this.el.children['Date_'].value;
            return date;
        },

        render: function(){
            var options = this.options;
            var schema = this.schema;

            if(options.schema.validators){
                var required = options.schema.validators[0];
            }

            var $el = $($.trim(this.template({
                value : options.model.get(this.options.key),
                editorClass : schema.editorClass,
                required: required,
                editable : (options.schema.editable != false) ? '' : 'disabled',
                hidden : (options.schema.editable != false) ? '' : 'hidden',
            })));
            this.setElement($el);
            //console.log('**** HIDDEN ************** ', (options.schema.editable != false) ? '' : 'hidden', options.schema.editable);
            $($el[0]).datetimepicker();

            //tmp solution ? datetimepicker remove the value
            if(this.options){
                var value = this.options.model.get(this.options.key);
                $el.find('input').val(value);
            }

            return this;
        },
        }, {
        // STATICS
            template: _.template('<div class="input-group date dateTimePicker" id="dateTimePicker" data-editors="Date_"><span class="input-group-addon <%= hidden %>"><span class="reneco-calendar reneco"></span></span><input id="c24_Date_" name="Date_" class="<%= editorClass %> <%= required %>" type="text" placeholder="jj/mm/aaaa hh:mm:ss" data-date-format="DD/MM/YYYY" value="<%= value %>" <%= editable %> ></div>', null, Form.templateSettings)
    });
});
