
(function (root, factory) {

    // Set up Backbone appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {

        //console.log('amd');
        define(['underscore',
                'jquery',
                'backbone',
                'backbone_forms',
                'dateTimePicker',
                'moment',
        ], function (_, $, Backbone, Form, datetimepicker, moment, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            var Retour = factory(root, exports, _, $, Backbone, Form, datetimepicker, moment);
            //console.log(Retour);
            return Retour;
        });

        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    } else if (typeof exports !== 'undefined') {
        //console.log('common JS');
        var $ = require('jquery');
        var _ = require('underscore');
        var Backbone = require('backbone');
        Backbone.$ = $;
        var Marionette = require('backbone.marionette');
        require('backbone-forms');
        var BackboneForm = Backbone.Form;
        var Form = BackboneForm ;
        var moment = require('moment') ;
        /*var brfs = require('brfs')
        var tpl = brfs('./Templates/NsFormsModule.html');*/
        var datetimepicker = require('eonasdan-bootstrap-datetimepicker');

        module.exports = factory(root, exports, _, $, Backbone, Form, datetimepicker, moment);
        //return Retour ;
        // Finally, as a browser global.
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
            // datetimepicker options
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
            //console.log(this.format);
        },

        getValue: function () {
            var date = new Date;
            var input = this.$el.find('#' + this.id);
            return this.$el.find('#' + this.id).val();
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
                //value = options.model.get(this.options.key);
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
                //console.log(this.format)
                //console.log(options.value)
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
            //_this.datetimepickerOptions.debug = true;
            //console.log('**** HIDDEN ************** ', (options.schema.editable != false) ? '' : 'hidden', options.schema.editable);
            $($el[0]).datetimepicker(_this.datetimepickerOptions);

            if (_this.options.schema.options.closeOnClick == null || _this.options.schema.options.closeOnClick) {
                // var firstClick = true ;
                // $($el[0]).on('dp.show',function() {
                //     firstClick = true ;
                //     console.log('FirstClick') ;
                // }) ;
              

               // console.log('Contenu', $($el[0]).data('DateTimePicker'));
                $($el[0]).on('dp.change', function (e, f) {

                    //console.log('CHANGE', e);

                    if (e.oldDate == null || (e.oldDate.format("MM/DD/YYYY") == e.date.format("MM/DD/YYYY"))) {
                        //console.log('Change Hour') ;
                    }
                    else {
                        //console.log('Change Date') ;
                        $(e.target).data('DateTimePicker').hide();
                    }
                    //
                    //     }
                    // },0);
                });

            }


            //tmp solution ? datetimepicker remove the value
            /*            if(this.options){
                            var value = this.options.model.get(this.options.key);
                            $el.find('input').val(value);
                        }*/

            return this;
        },
    }, {
        // STATICS
        template: _.template('<div class="input-group date dateTimePicker"'
            + 'data-editors="Date_"><span class="input-group-addon <%= hidden %>">'
            + '<span class="<%= iconClass %> "></span></span><input id="<%=inputID%>" '
            + 'name="Date_" class="<%= editorClass %> <%= required %>" type="text" '
            + ' value="<%= value %>" <%= editable %> ></div>', null, Form.templateSettings) //data-date-format="DD/MM/YYYY HH:mm:ss" placeholder="jj/mm/aaaa hh:mm:ss"
    });

    return Retour;

}));