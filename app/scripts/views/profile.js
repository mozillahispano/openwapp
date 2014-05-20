define([
  'backbone',
  'zeptojs',
  'global',
  'templates',
  'models/auth',
  'utils/thumbnail'
], function (Backbone, $, global, templates, Auth, Thumbnail) {
  'use strict';

  var Profile = Backbone.View.extend({

    el: '#main-page',

    model: Auth,

    template: templates.profile,

    picture: null,

    thumb: null,

    PICTURE_MAX_SIZE: 640,

    THUMB_MAX_SIZE: 180,

    initialize: function () {
      this.picture = this.model.get('photo');
      this.thumb = this.model.get('thumb');
    },

    render: function () {
      this.$el.html(this.template({
        screenName: this.model.get('screenName'),
        status: this.model.get('status')
      }));
      this._replacePhoto(this.picture);

      this.checkNameInput();

      var awakePeriod = global.backgroundService.get('awakePeriod');
      awakePeriod = (awakePeriod / 60000).toFixed(0);
      var selected = 'option[value="' + awakePeriod  + '"]';
      this.el.querySelector(selected).setAttribute('selected', 'selected');
    },

    events: {
      'keyup input[name=screen-name]':       'checkNameInput',
      'click button.done':                   'updateProfileData',
      'click button.close':                  'goToInbox',
      'click img':                           'selectPicture',
      'click legend':                        'showSelect',
      'change select':                       'setAwakePeriod'
    },

    checkNameInput: function (evt) {
      if (evt) { evt.preventDefault(); }
      var name = $('input[name=screen-name]').val();
      var button = $('button.done');
      button.prop('disabled', name.length < 3);
    },

    updateProfileData: function (evt) {
      evt.preventDefault();

      var picture = this.picture;
      var thumb = this.thumb;
      var status = this.$el.find('[name=status]').val();
      var screenName = this.$el.find('[name=screen-name]').val();
      global.auth.updateProfileData(screenName, status, picture, thumb);

      this.goToInbox();
    },

    selectPicture: function () {
      var requestPicture = new window.MozActivity({
        name: 'pick',
        data: {
          type: 'image/jpeg'
        }
      });

      var _this = this;
      requestPicture.onsuccess = function () {
        var picture = requestPicture.result.blob;
        Thumbnail.setMaxSize(_this.PICTURE_MAX_SIZE);
        Thumbnail.generate(picture, function (err, picture) {
          if (err) { return; }
          _this.picture = picture;
          _this._replacePhoto(picture);

          // Generate thumb
          Thumbnail.setMaxSize(_this.THUMB_MAX_SIZE);
          Thumbnail.generate(picture, function (err, thumb) {
            if (err) { return; }
            _this.thumb = thumb;
          }, { asBlob: true });
        }, { asBlob: true });
      };

      requestPicture.onerror = function () {
        console.error('Impossible to get profile\'s picture.');
      };
    },

    showSelect: function () {
      var $select = this.$el.find('select');
      $select.focus();
    },

    setAwakePeriod: function (evt) {
      evt.preventDefault();
      var value = parseInt($(evt.target).val(), 10) * 60 * 1000;
      var select = evt.target;
      this.$el.find('legend').html(
        select.options[select.selectedIndex].innerHTML
      );
      global.backgroundService.set('awakePeriod', value);
    },

    _replacePhoto: function (newPictureBlob) {
      this.clear();
      if (newPictureBlob instanceof window.Blob) {
        this.$el.find('img')
          .attr('src', window.URL.createObjectURL(newPictureBlob));
      }
    },

    goToInbox: function (evt) {
      if (evt) { evt.preventDefault(); }
      global.router.navigate('inbox', { trigger: true });
    },

    clear: function () {
      window.URL.revokeObjectURL(this.$el.find('img').attr('src'));
    }
  });

  return Profile;
});
