define([
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates',
  'templates/helpers'
], function (Backbone, $, global, Message, templates, helpers) {
  'use strict';

  return Backbone.View.extend({

    template: templates.notification,

    el: '.notification',

    model: Message,

    render: function () {
      var newElement = this.template({
        timestamp: this.model.get('meta').date.getTime(),
        date: this.model.get('meta').date,
        message: this._getMessage()
      });
      this.setElement(newElement);
      helpers.revealEmoji(this.$el.find('.content'));
    },

    _getMessage: function () {
      var stringId, localisedMessage, message, who;
      var notification = this.model;
      var contents = notification.get('contents');
      var type = notification.get('meta').type;
      var interpolate = global.l10nUtils.interpolate;
      var l10n = global.localisation[global.language];

      switch (type) {
      case 'group-subject':
        who = notification.get('from').authorMsisdn;
        stringId = 'notificationSubjectChanged';
        if (global.auth.isMe(who)) {
          stringId += 'ByYou';
        }
        message = interpolate(l10n[stringId], {
          who: global.contacts.getParticipantName(who),
          subject: contents.subject
        });
        break;

      case 'group-participant':
        stringId = 'notificationGroupParticipant';
        stringId += contents.event === 'add' ? 'Added' : 'Removed';
        localisedMessage = l10n[stringId];
        message = interpolate(localisedMessage, {
          who: global.contacts.getParticipantName(contents.participant)
        });
        break;

      case 'group-picture':
        stringId = 'notificationGroupPicture';
        stringId += contents.event === 'update' ? 'Updated' : 'Removed';
        who = notification.get('from').authorMsisdn;
        if (global.auth.isMe(who)) {
          stringId += 'ByYou';
          message = l10n[stringId];
        } else {
          message = interpolate(l10n[stringId], {
            who: global.contacts.getParticipantName(who)
          });
        }
        break;

      default:
        message = 'unknown notification!';
        break;
      }
      return message;
    }
  });
});
