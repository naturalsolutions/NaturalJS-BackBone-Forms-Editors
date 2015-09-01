define([
	'jquery',
	'backbone',
	'backbone_forms',
    'requirejs-text!./FileUploadEditorTemplate.html',
    './MimeType'
], function (
	$, Backbone, Form, Template, MimeTypeObject
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
            console.log('options', options);
            Form.editors.Base.prototype.initialize.call(this, options);
            this.template = options.template || Template;
            this.options = options;
            console.log('this', this);
            console.log('options', options);
            console.log('value', this.value);
            //Passer ça en template
            this._uploadurl = options.uploadurl;
            this.existingFiles = this.options.model.get(this.key);
            if (this.existingFiles == null) {
                this.existingFiles = [];
            }

        },

        getValue: function () {
            return this.existingFiles;
            
            return fileName ? JSON.stringify(fileName) : "";
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
                this.template, { id: this.id, key: this.key }
            );


            this.setElement($el);
            this.displayExistingFiles({ onInit: true });

            return this;
        },
        displayExistingFiles: function (options) {
            console.log('***************displayExistingFiles',this.existingFiles);
            var HtmlExistingFiles = "";


            for (var i = 0 ; i < this.existingFiles.length ; i++) {
                var file = this.existingFiles[i];
                console.log('Adding file', file);
                HtmlExistingFiles += '<div><span class="downloadBtn" FileId="' + file.FileId + '"  id="FileGet_' + this.id + '" getUrl="' + file.url + '" fileExtension="' + file.FileExtension + '"  >' + file.FileName + '</span>';
                HtmlExistingFiles += '<span id="FileGet_' + this.id + '" class="deletefileBtn" delUrl="' + file.urldelete + '" FileId="' + file.FileId + '" >&nbsp DEL</span></div>';
            }
            console.log(HtmlExistingFiles);
            console.log(this.$el.find('#ExistingFiles_' + this.id));
            if (options.onInit) {
                this.$el.find('#ExistingFiles_' + this.id).html(HtmlExistingFiles);
            }
            else {
                $('#ExistingFiles_' + this.id).html(HtmlExistingFiles);
            }

        },
        uploadFile: function (eventType) {
            $('#bbfUploadBtn_' + this.id).attr('style', 'display:none');
            var _this = this;
            //Tester la valeur de l'id
            console.log('uploadFile');
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
                console.log('***********************UPLOAD FINISHED********************', data);
                console.log(data);

                
                _this.existingFiles.push(data);
                _this.displayExistingFiles({ onInit: true });
                // TODO ajouter le fichier au modèle et refaire un display 
            }

            );
        },
        downloadFile: function (eventType) {
            var _this = this;
            console.log(eventType)
            if (eventType.currentTarget.id == ('FileGet_' + this.id)) {
                // OK c'est bien liè à mon editeur

                console.log($(eventType.currentTarget).attr('getUrl'));
                $.ajax({
                    url: $(eventType.currentTarget).attr('getUrl'),
                    type: 'GET',
                    data: {
                        fileId: $(eventType.currentTarget).attr('fileid'),
                        //order_by : '1'
                    }
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

            console.log(eventType.currentTarget);
            
            $.ajax({
                url: $(eventType.currentTarget).attr('delUrl'),
                type: 'DEL',
                data: {
                    fileId: $(eventType.currentTarget).attr('fileid'),
                    //order_by : '1'
                }
            }).done(function (data) {
                /*
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
                */
            });



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
            console.log(this.options);
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
