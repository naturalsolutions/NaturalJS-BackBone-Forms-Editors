
(function (root, factory) {

    // Set up Backbone appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {

        //console.log('amd');
        define(['underscore',
                'jquery',
                'backbone',
                'backbone_forms',
        ], function (_, $, Backbone, Form,  exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            var Retour = factory(root, exports, _, $, Backbone, Form );
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
        var Form = BackboneForm;
        
        /*var brfs = require('brfs')
        var tpl = brfs('./Templates/NsFormsModule.html');*/
        

        module.exports = factory(root, exports, _, $, Backbone, Form);
        //return Retour ;
        // Finally, as a browser global.
    } else {
        //TODO
        //root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function (root, DateTimePickerEditor, _, $, Backbone, Form) {



    var Retour = Form.editors.LinkEditor = Form.editors.Base.extend({



        previousValue: '',

       

        initialize: function (options) {
            Form.editors.Base.prototype.initialize.call(this, options);
            this.template = options.template || this.constructor.template;
            this.options = options;
            this.id = options.id;
            
            //console.log(this.format);
        },

        getValue: function () {
            
            var input = this.$el.find('#' + this.id);
            return this.$el.find('#' + this.id).val();
        },

        render: function () {
            var options = this.options;
            var value = this.options.model.get(this.options.key);
            console.log(this.options.schema.options);
            if (value != null && this.options.schema.options.link != null && this.options.schema.options.valueIgnore) {
                var link = this.options.schema.options.link.replace('@value', value.replace(this.options.schema.options.valueIgnore, ''));
            }

            if (value != null && value != '') {
                var $el = $($.trim(this.template({
                    value: value,
                    editorClass: this.options.schema.editorClass,
                    editable: (options.schema.editable != false) ? '' : 'disabled',
                    hidden: (options.schema.editable != false) ? '' : 'hidden',
                    inputID: this.id,
                    iconClass: this.classIcon,
                    link: link
                })));
                this.setElement($el);
            }



            return this;
        },
    }, {
        // STATICS
        template: _.template('<div class=""'
            + '<span>  '
            + '<a id="<%=inputID%>" class="<%= editorClass %>" href="<%=link%>" target="_blank"><%=value%> </a>'
            +' </span></div>'
            , null, Form.templateSettings)
    });

    return Retour;

}));