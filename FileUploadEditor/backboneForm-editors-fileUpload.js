define([
	'jquery',
    'underscore',
	'backbone',
	'backbone_forms',
    'requirejs-text!./FileUploadEditorTemplate.html',
    './MimeType',
    'sweetalert'

], function ($, _, Backbone, Form, Template, MimeTypeObject,sweetAlert
) {
    'use strict';
    return Form.editors.FileUploadEditor = Form.editors.Base.extend({
        previousValue: '',

        events: {
            'hide': "hasChanged",
            'change input[type=file]': 'testFile',
            'click .removeBtn': 'removeFile',
            'click .uploadBtn': 'uploadFile',
            'click .downloadBtn': 'downloadFile',
            'click .deletefileBtn': 'deleteFile'
        },



        template: Template,

        hasChanged: function (currentValue) {
            if (currentValue !== this.previousValue) {
                this.previousValue = currentValue;
                this.trigger('change', this);
            }
        },

        initialize: function (options) {
            Form.editors.Base.prototype.initialize.call(this, options);
            this.template = options.template || Template;
            this.options = options;
            //Passer ça en template
            this._uploadurl = options.uploadurl;
            this.existingFiles = this.options.model.get(this.key);
            if (this.existingFiles == null) {
                this.existingFiles = [];
            }

        },


        getValue: function () {
            return this.existingFiles;
        },

        setValue: function (value) {
            var str, files = value;
            if (_(value).isObject()) {
                str = JSON.stringify(value);
            } else {
                files = value ? JSON.parse(value) : [];
            }
            this._input.val(str);
        },

        render: function () {
            var options = this.options;
            var schema = this.schema;
            var $el = _.template(
                this.template, { id: this.id, key: this.key,acceptedFiles:this.options.schema.options.acceptedFiles,editorClass:this.options.schema.editorClass }
            );


            this.setElement($el);
            if (this.schema.editable == false) {
                this.$el.find('.UploadInForm').attr('style', 'display:none');
            }
            this.displayExistingFiles({ onInit: true });

            return this;
        },

        displayExistingFiles: function (options) {

            var HtmlExistingFiles = "";


            for (var i = 0 ; i < this.existingFiles.length ; i++) {
                var file = this.existingFiles[i];
                HtmlExistingFiles += '<div><span class="downloadBtn" FileId="' + file.FileId + '"  id="FileGet_' + this.id + '" getUrl="' + file.url + '" fileExtension="' + file.FileExtension + '"  >' + file.FileName + '</span>';
                if (this.schema.editable != false) {
                    HtmlExistingFiles += '&nbsp&nbsp<span id="FileDel_' + this.id + '" class="deletefileBtn reneco reneco-trash" delUrl="' + file.urldelete + '" FileId="' + file.FileId + '" ></span></div>';
                }
            }
            if (options.onInit) {
                this.$el.find('#ExistingFiles_' + this.id).html(HtmlExistingFiles);
            }
            else {
                $('#ExistingFiles_' + this.id).html(HtmlExistingFiles);
            }
        },
        uploadFile: function (eventType) {
            
            if (eventType.currentTarget.id != ('bbfUploadBtn_' + this.id)) {
                // Not concerning this input 
                return;
            }
            

            $('#bbfUploadBtn_' + this.id).attr('style', 'display:none');
            var _this = this;
            //Tester la valeur de l'id

            var fd = new FormData();
            var fileUrl = this.schema.options.uploadurl;
            var file = $('#input_' + this.id)[0].files[0];
            fd.append("file", file);
            fd.append('field_name', this.options.key);
            var params = this.options.model.attributes;
            if (params) {
                for (var name in params) {
                    fd.append('model_' + name, params[name]);
                }
            }
            var re = new RegExp(/.[a-zA-Z]+$/);
            var ext = $('#input_' + this.id)[0].files[0].name.toLowerCase().match(re);

            fd.append('fileName', $('#input_' + this.id)[0].files[0].name);
            fd.append('fileExtension', ext);
            $.ajax({
                type: 'POST',
                url: fileUrl,
                processData: false,
                contentType: false,
                data: fd
            }).success(function (data) {

                _this.existingFiles.push(data);
                _this.displayExistingFiles({ onInit: true });
                // TODO ajouter le fichier au modèle et refaire un display 
            }

            );
        },
        downloadFile: function (eventType) {
            var _this = this;
            
            if (eventType.currentTarget.id == ('FileGet_' + this.id)) {
                // OK c'est bien liè à mon editeur

                console.log($(eventType.currentTarget).attr('getUrl'));
                $.ajax({
                    url: $(eventType.currentTarget).attr('getUrl'),
                    type: 'GET',

                }).done(function (data) {

                    console.log(data);
                    var link = document.createElement('a');
                    var typeMime = MimeType[$(eventType.currentTarget).attr('fileExtension').toLowerCase()];
                    if (typeMime == null) {
                        typeMime = ''
                    }
                    else {
                        typeMime = 'data:' + typeMime + ';charset=utf-8;base64,'
                    }
                    link.download = $(eventType.currentTarget).text();
                    link.href = typeMime + data;;
                    link.click();
                    //window.location.href = 'data:text/csv;charset=utf-8;base64,' + data;
                });
            }
        },
        deleteFile: function (eventType) {

            if (eventType.currentTarget.id != ('FileDel_' + this.id)) {
                // Not concerning this input 
                return;
            }
            var _this = this;
            
            sweetAlert({ title: "Are you sure?", text: "Are you sur you want to delete the file ", type: "warning", confirmButtonText: "Yes, delete file", cancelButtonText: "No, keep the file", showCancelButton: true }
                        , function (isConfirm) {
                            if (isConfirm) {
                                var fileid = $(eventType.currentTarget).attr('fileid');
                                
                                $.ajax({
                                    url: $(eventType.currentTarget).attr('delUrl'),
                                    type: 'DELETE',
                                }).success(function (data) {
                                    console.log('deleted');
                                    _this.existingFiles = _.filter(_this.existingFiles, function (n) {
                                        return n.FileId != fileid;
                                    })
                                    _this.displayExistingFiles({ onInit: false });
                                });

                            }
                        });

			//console.log(eventType.currentTarget);
        },
        testFile: function (eventType) {
            var re = new RegExp(/.[a-zA-Z]+$/);
            console.log($('#input_' + this.id)[0]);
            //console.log($('#' + this.id).name);
            var ext = $('#input_' + this.id)[0].files[0].name.toLowerCase().match(re);
            if (this.options.schema.options.extensions) {
                if (this.options.schema.options.extensions.indexOf(ext[0]) == -1) {
                    $('#UploadError' + this.id).text('Error, extension non supported : ' + ext);
                    $('#UploadError' + this.id).attr('style', 'display:visible');
                } else {
                    $('#bbfUploadBtn_' + this.id).attr('style', 'display:visible');
                }
            }

            else {
                $('#bbfUploadBtn_' + this.id).attr('style', 'display:visible');
            }

        },
        removeFile: function (eventType) {
            //Tester la valeur de l'id
            this._uploadInput.val("");
            this._error.text('The file uploader is now empty').show();

            this._removeBtn.hide();
        }
    }, {
    });
});
