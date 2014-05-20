define([
  'backbone',
  'underscore',
  'zeptojs',
  'global',
  'views/index',
  'views/inbox',
  'views/login',
  'views/validate',
  'views/settings',
  'views/profile',
  'views/group-profile',
  'views/contact-profile',
  'views/conversation',
  'views/location-viewer',
  'views/compose-location',
  'views/compose-image',
  'models/message',
  'models/contact'
], function (Backbone, _, zepto, global, IndexView, InboxView, LoginView,
  ValidateView, SettingsView, ProfileView, GroupProfileView, ContactProfileView,
  ConversationView, LocationViewerView, ComposeLocationView, ComposeImageView,
  Message, Contact) {

  'use strict';

  var $ = zepto;

  var Router = Backbone.Router.extend({
    initialize: function () {
      // All navigation that is relative should be passed through the navigate
      // method, to be processed by the router. If the link has a `data-bypass`
      // attribute, bypass the delegation completely.
      // (modified from https://github.com/tbranyen/backbone-boilerplate)
      $(document).on('click', 'a[href]:not([data-bypass])',
                     _.bind(this.clickInterceptor, this));
    },

    close: function () {
      $(document).off('click', 'a[href]:not([data-bypass])');
    },

    clickInterceptor: function (evt) {

      if (evt.defaultPrevented) {
        return;
      }

      // Get the absolute anchor href.
      var href = { prop: $(evt.currentTarget).prop('href'),
                   attr: $(evt.currentTarget).attr('href') };

      // Get the absolute root.
      var appRoot = '/';
      var root = location.protocol + '//' + location.host + appRoot;

      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      if (href.prop.slice(0, root.length) === root) {
        // if it's relative
        // Remove initial '#' or '/' if present
        var whereToGo = href.attr.replace(/^[#\/]/, '');
        this.navigate(whereToGo, { trigger: true });
      } else {
        // if it's not relative
        // In our particular case, we don't want to enable ANY link outside
        // that does not have a data-bypass attribute. So do nothing here.
        console.log('Attempt to load url ' + href.prop);
      }
    },

    routes: {
      '':          'inbox',
      'inbox':     'inbox',
      'login':     'login',
      'settings':  'settings',
      'profile':   'userProfile',
      'new-group': 'newGroup',
      'validate/:phoneNumber/:countryCode(/:section)': 'validate',
      'viewer/location/:conversationId/:messageId(/:scroll)': 'locationViewer',
      'conversation/:conversationId/profile':  'profile',
      'conversation/:conversationId/sendlocation':  'sendLocation',
      'conversation/:conversationId/sendimage': 'sendImage',
      'conversation/:identifier(/:scrollTop)': 'conversation'
    },

    inbox: function () {
      this.show(new InboxView({model: global.historyCollection}));
    },

    index: function () {
      this.show(new IndexView());
    },

    login: function () {
      this.show(new LoginView());
    },

    validate: function (phoneNumber, countryCode) {
      this.show(new ValidateView({
        phoneNumber: phoneNumber,
        countryCode: countryCode
      }));
    },

    settings: function () {
      this.show(new SettingsView());
    },

    userProfile: function () {
      this.show(new ProfileView({ model: global.auth }));
    },

    newGroup: function () {
      this.show(new GroupProfileView({ model: new Contact() }));
    },

    profile: function (conversationId) {
      var contact = global.contacts.findWhere({ id: conversationId });
      if (contact.get('isGroup')) {
        this.show(new GroupProfileView({ model: contact, isEditMode: true }));
      }
      else {
        this.show(new ContactProfileView({ model: contact }));
      }
    },

    conversation: function (identifier, scrollTop) {
      console.log('Creating conversation ' + identifier);
      // here we can cache/reuse views if needed
      var c = global.historyCollection.findAndCreateConversation(identifier);
      c.loadMessagesFromStorage();
      c.set('isRead', true);
      c.saveToStorage();
      var cView = new ConversationView({model: c, scrollTop: scrollTop});
      this.show(cView);
    },

    sendLocation: function (conversationId) {
      var c = global.historyCollection.findAndCreateConversation(
        conversationId);
      this.show(new ComposeLocationView({conversation: c}));
    },

    _viewer: function (conversationId, messageId, scroll, ViewClass) {
      var c = global.historyCollection.findAndCreateConversation(
        conversationId);
      var message = c.get('messages').find(function (x) {
        return x.get('_id') === parseInt(messageId, 10);
      });

      this.show(new ViewClass({
        model: message,
        conversation: c,
        scrollTop: scroll
      }));
    },

    locationViewer: function (conversationId, messageId, scroll) {
      this._viewer(conversationId, messageId, scroll, LocationViewerView);
    },

    sendImage: function (conversationId) {
      console.log('router sendImage');
      var c = global.historyCollection.findAndCreateConversation(
        conversationId);
      var message = new Message();
      this.show(new ComposeImageView({conversation: c, model: message}));
    },

    show: function (view) {
      if (this.currentView) {
        // We use these methods instead of .remove() because remove()
        // deletes the View main element
        this.currentView.stopListening();
        this.currentView.undelegateEvents();
        this.currentView.$el.empty();

        // If defined call the close method of the view
        if (typeof this.currentView.close !== 'undefined') {
          this.currentView.close();
        }

        // Views can define a clear() method which should clean them for
        // avoiding memory leaks
        if (typeof this.currentView.clear !== 'undefined') {
          this.currentView.clear();
          console.log(' *** currentView has been cleared');
        } else {
          console.log(' *** currentView has NOT been cleared');
        }
      }

      this.currentView = view;
      this.currentView.render();
    }
  });

  return Router;
});
