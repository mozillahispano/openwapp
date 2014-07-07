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

    THUMB_MAX_SIZE: 96,

    initialize: function () {
      this.picture = this.model.get('photo');
      this.thumb = this.model.get('thumb');
      this.updateProfileDataFromServer();
    },

    render: function () {
      this.$el.html(this.template({
        expiration: global.client.expirationDate,
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
      'change select':                       'setAwakePeriod',
      'click #upgrade-now':                  'goToUpgradeNow'
    },

    checkNameInput: function (evt) {
      if (evt) { evt.preventDefault(); }
      var name = $('input[name=screen-name]').val();
      var button = $('button.done');
      button.prop('disabled', name.length < 3);
    },

    updateProfileDataFromServer: function () {
      var _this = this;

      global.auth.getProfilePicture(function (error, picture) {
        if (error || !picture) {
          return;
        }
        _this.generatePicture(picture, function (err, resizedPic) {
          if (err) { return; }
          _this.picture = resizedPic;
          _this._replacePhoto(resizedPic);
        });

        _this.generateThumbnail(picture, function (err, thumb) {
          if (err) { return; }
          _this.thumb = thumb;
        });
      });

      global.auth.getProfileStatus(function (error, status) {
        if (error || !status) {
          return;
        }
        _this.$el.find('#input-status').attr('value', status);
      });
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
        _this.generatePicture(picture, function (err, resizedPic) {
          if (err) { return; }
          _this.picture = resizedPic;
          _this._replacePhoto(resizedPic);
        });

        _this.generateThumbnail(picture, function (err, thumb) {
          if (err) { return; }
          _this.thumb = thumb;
        });
      };

      requestPicture.onerror = function () {
        console.error('Impossible to get profile\'s picture.');
      };
    },

    generatePicture: function (picture, callback) {
      var quality = global.client.getProperty('image_quality');
      Thumbnail.setMaxSize(this.PICTURE_MAX_SIZE);
      Thumbnail.generate(picture, callback, { asBlob: true, quality: quality });
    },

    generateThumbnail: function (picture, callback) {
      var quality = global.client.getProperty('image_quality');
      Thumbnail.setMaxSize(this.THUMB_MAX_SIZE);
      Thumbnail
        .generate(picture, callback, { asBlob: true, quality: quality / 2 });
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
        this.$el.find('#profile-picture')
          .attr('src', window.URL.createObjectURL(newPictureBlob));
      }
    },

    goToInbox: function (evt) {
      if (evt) { evt.preventDefault(); }
      global.router.navigate('inbox', { trigger: true });
    },

    goToUpgradeNow: function (evt) {
      if (evt) { evt.preventDefault(); }
      var phone = this.model.get('msisdn');
      window.open(global.client.getUpgradeAccountURL(phone), '', 'dialog');
    },

    clear: function () {
      window.URL.revokeObjectURL(this.$el.find('img').attr('src'));
    }
  });

  return Profile;
});
