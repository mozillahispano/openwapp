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

      switch (type) {
      case 'group-subject':
        who = notification.get('from').authorMsisdn;
        stringId = 'notificationSubjectChanged';
        if (global.auth.isMe(who)) {
          stringId += 'ByYou';
        }
        message = interpolate(navigator.mozL10n.get([stringId]), {
          who: global.contacts.getParticipantName(who),
          subject: contents.subject
        });
        break;

      case 'group-participant':
        stringId = 'notificationGroupParticipant';
        stringId += contents.event === 'add' ? 'Added' : 'Removed';
        localisedMessage = navigator.mozL10n.get([stringId]);
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
          message = navigator.mozL10n.get([stringId]);
        } else {
          message = interpolate(navigator.mozL10n.get([stringId]), {
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
