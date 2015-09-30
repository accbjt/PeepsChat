Chats = new Meteor.Collection('chats');

if (Meteor.isClient) {
  Meteor.subscribe('chats');
  Meteor.subscribe('users');
  Meteor.subscribe('avatars');

  Template.userList.helpers({
    users: function () {
      var currentUserId = Meteor.userId();
      var cantChatWith = [currentUserId];

      Chats.find().forEach(function(chat){
        cantChatWith.push(chat.userIds[chat.userIds[0].id === currentUserId ? 1 : 0].id);
      });

      return Accounts.users.find({ _id: { $not: { $in:cantChatWith }}});
    }
  });

  Template.userItem.helpers({
    avatar: function(){
      return Avatars.findOne({userId: Meteor.userId()});
    }
  })

  Template.chatList.helpers({
    chats: function () {
      return Chats.find({userIds: {"id": Meteor.userId()}});
    }
  });

  Template.userItem.events({
    'click button': function(e, template){
      e.preventDefault();
      Meteor.call('createChat', template.data._id, template.data.username);

    }
  });

  Template.chat.events({
    'click button': function(e, template){
      e.preventDefault();

      var message = $(e.currentTarget).siblings().val();

      Meteor.call('addMessage', message, "text", template.data._id );

      $(e.currentTarget).siblings().val('');

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
    Chats.insert({
      userIds:[{id: Meteor.userId()},{id: otherId}],
      messages: [],
      name: name,
      started: new Date()
    })
  },
  addMessage: function(message, type, chatId){
    var query = { _id: chatId };
    var message = {
      messageEntry: message, 
      type:type, 
      userId: Meteor.userId(),
      userName: Meteor.user().username,
      entryDate: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
    };

    Chats.update(query, {$push: {messages:message}})
  }
});



