Chats = new Meteor.Collection('chats');

if (Meteor.isClient) {
  Meteor.subscribe('chats');
  Meteor.subscribe('users');
  Meteor.subscribe('avatars');

  Template.userList.helpers({
    users: function () {
      return Accounts.users.find({ _id: { $not: Meteor.userId()}});
    }
  });

  Template.userItem.helpers({
    avatar: function(userId){
      var avatar = Avatars.find({userId: userId}).map(function(avatar){return avatar.avatar})[0];
      return avatar;
    },
    chatId: function(otherId){
      var id = Chats.find({userIds: {"id": otherId}}).map(function(chat){
        var ids = chat.userIds.map(function(i){return i.id});
        if(ids.indexOf(Meteor.userId()) !== -1){
          return chat._id
        }
      })[0];
      return id;
    }
  })

  Template.chatList.helpers({
    chats: function () {
      return Chats.find({userIds: {"id": Meteor.userId()}});
    }

  });

  Template.userItem.events({
    'click .choose-peep': function(e, template){
      e.preventDefault();
      var chat = Chats.find({userIds: {"id": template.data._id}}).map(function(chat){
        var id = chat.userIds.map(function(id){return id.id});
        if(id.indexOf(Meteor.userId()) !== -1){
          return chat
        }
      });


      if(chat.length === 1) {
        var chatId = e.currentTarget.dataset.id;
        window.currentChat = chatId;
        var currentChat = $('.chat[data-id="'+chatId+'"]');

        currentChat.siblings().hide()
        currentChat.show();

        $(e.currentTarget).siblings('.choose-peep').children('img').removeClass('active');
        $(e.currentTarget).children('img').addClass('active');
      }else{
        Meteor.call('createChat', template.data._id, template.data.username);
      }
    }
  });

  Template.chat.rendered = function(){
    var chatId = window.currentChat ? window.currentChat : $(chats).children().last().data('id');
    var messagesBox = $('.chat[data-id="'+chatId+'"]').find("#messages")[0];

    $('.choose-peep[data-id="'+chatId+'"]').siblings('.choose-peep').find('img').removeClass('active');
    $('.choose-peep[data-id="'+chatId+'"]').children('img').addClass('active');
  };

  Template.message.rendered = function(){
    var chatId = window.currentChat ? window.currentChat : $(chats).children().last().data('id');
    var messagesBox = $('.chat[data-id="'+chatId+'"]').find("#messages")[0];
    messagesBox.scrollTop = messagesBox.scrollHeight+200;
  };

  Template.chat.events({
    'click .submit-button': function(e, template){
      e.preventDefault();
      var message = $(e.currentTarget).siblings().val();
      var messagesContainer = $(e.currentTarget).parents('.chat').find('#messages')[0];

      Meteor.call('addMessage', message, "text", template.data._id );

      $(e.currentTarget).siblings().val('');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish('chats', function(){
    return Chats.find();
  });

  Meteor.publish('users', function(){
    return Accounts.users.find();
  })

  Meteor.publish('avatars', function(){
    return Avatars.find();
  })
}

Meteor.methods({
  createChat: function(otherId, name){
    var avatar = Avatars.find({userId: otherId}).map(function(avatar){return avatar.avatar})[0];

    Chats.insert({
      userIds:[{id: Meteor.userId()},{id: otherId}],
      messages: [],
      name: name,
      avatar: avatar,
      started: new Date()
    })
  },
  addMessage: function(message, type, chatId){
    var query = { _id: chatId };
    var avatar = Avatars.find({userId: Meteor.userId()}).map(function(avatar){return avatar.avatar})[0];

    var message = {
      messageEntry: message,
      avatar: avatar,
      type:type, 
      userId: Meteor.userId(),
      userName: Meteor.user().username,
      entryDate: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
    };

    Chats.update(query, {$push: {messages:message}})
  }
});




