
(function (root, factory) {

    // Set up Backbone appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {

        define(['underscore',
                'jquery',
                'backbone',
                'backbone_forms',
                'dateTimePicker',
                'moment',
        ], function (_, $, Backbone, Form, datetimepicker, moment, exports) {
            var Retour = factory(root, exports, _, $, Backbone, Form, datetimepicker, moment);
            return Retour;
        });
    } else if (typeof exports !== 'undefined') {
        var $ = require('jquery');
        var _ = require('underscore');
        var Backbone = require('backbone');
        Backbone.$ = $;
        var Marionette = require('backbone.marionette');
        require('backbone-forms');
        var BackboneForm = Backbone.Form;
        var Form = BackboneForm ;
        var moment = require('moment') ;
        var datetimepicker = require('eonasdan-bootstrap-datetimepicker');

        module.exports = factory(root, exports, _, $, Backbone, Form, datetimepicker, moment);
    } else {
        //TODO
        //root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function (root, DateTimePickerEditor, _, $, Backbone, Form, datetimepicker, moment) {



    var Retour = Form.editors.DateTimePickerEditor = Form.editors.Base.extend({



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
            this.id = options.id;
            this.dictFormat = {
                'DD/MM/YYYY HH:mm:ss': 'datetime',
                'DD/MM/YYYY': 'date',
                'HH:mm:ss': 'time'
            }
            if (options.schema.options) {
                this.format = options.schema.options.format;
                this.maxDate = options.schema.options.maxDate || false;
                this.defaultDate = options.schema.options.defaultValue || false;
            } else {
                this.format = "DD/MM/YYYY HH:mm:ss";
            }

            this.datetimepickerOptions = { format: this.format };
            if (this.defaultDate) {
                this.datetimepickerOptions.defaultDate = moment(this.defaultDate, this.format);
            }
            if (this.maxDate) {
                this.datetimepickerOptions.maxDate = moment(this.maxDate, this.format);
            }

            this.classIcon = 'reneco-calendar reneco';
            if (this.format && (this.format.toLowerCase() == 'hh:mm:ss')) {
                this.classIcon = 'glyphicon-time glyphicon';
            }
        },

        getValue: function () {
            /* TOCHECK
            var date = new Date;
            var input = this.$el.find('#' + this.id);
            return this.$el.find('#' + this.id).val();
            */

            var date= new Date;
            if (this.el.children['Date_'])
                return this.el.children['Date_'].value;
            return date;
        },

        render: function () {
            var options = this.options;
            var schema = this.schema;
            var _this = this;
            var value;
            var required;

            if (options.schema.validators) {
                required = options.schema.validators[0];
            }

            if (options.model && this.format && this.format.toLowerCase() == 'hh:mm:ss') {
                var val = options.model.get(this.options.key);
                if (val) {
                    var tab = val.split(" ");
                    if (tab.length > 1) {
                        value = tab[1];
                    } else {
                        value = val;
                    }
                }

            } else {
                if (options.model) {
                    value = options.model.get(this.options.key);
                } else {
                    value = '';
                }
            }

            var $el = $($.trim(this.template({
                value: value,
                editorClass: schema.editorClass,
                required: required,
                editable: (options.schema.editable != false) ? '' : 'disabled',
                hidden: (options.schema.editable != false) ? '' : 'hidden',
                inputID: this.id,
                iconClass: _this.classIcon
            })));
            this.setElement($el);
            

            if (_this.options.schema.options.closeOnClick == null || _this.options.schema.options.closeOnClick) {
                
                $($el[0]).on('dp.change', function (e, f) {

                    if (e.oldDate == null || (e.oldDate.format("MM/DD/YYYY") == e.date.format("MM/DD/YYYY"))) {
                    }
                    else {
                        $(e.target).data('DateTimePicker').hide();
                    }
                });

            }

            /* TODO IS BUGGED
            if (this.options && this.options.model.attributes.beforeEventDate) {
                _this.datetimepickerOptions.minDate = new Date(this.options.model.attributes.beforeEventDate);
            }
            if (this.options && this.options.model.attributes.afterEventDate) {
                _this.datetimepickerOptions.maxDate = new Date(this.options.model.attributes.afterEventDate);
            }
            */

            $($el[0]).datetimepicker(_this.datetimepickerOptions);
            
            //tmp solution ? datetimepicker remove the value
            /*            if(this.options){
                            var value = this.options.model.get(this.options.key);
                            $el.find('input').val(value);
                        }*/

            return this;
        },
    }, {
        // STATICS

        /* TOCHECK
        template: _.template('<div class="input-group date dateTimePicker"'
            + 'data-editors="Date_"><span class="input-group-addon <%= hidden %>">'
            + '<span class="<%= iconClass %> "></span></span><input id="<%=inputID%>" '
            + 'name="Date_" class="<%= editorClass %> <%= required %>" type="text" '
            + ' value="<%= value %>" <%= editable %> ></div>', null, Form.templateSettings) //data-date-format="DD/MM/YYYY HH:mm:ss" placeholder="jj/mm/aaaa hh:mm:ss"
        */

        template: _.template('<div class="input-group date dateTimePicker" id="dateTimePicker" data-editors="Date_"><span class="input-group-addon <%= hidden %>"><span class="reneco-calendar reneco"></span></span><input id="c24_Date_" name="Date_" class="<%= editorClass %> <%= required %>" type="text" placeholder="jj/mm/aaaa hh:mm:ss" data-date-format="DD/MM/YYYY" value="<%= value %>" <%= editable %> ></div>', null, Form.templateSettings)
    });

    return Retour;

}));
