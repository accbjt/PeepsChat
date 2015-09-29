Chats = new Meteor.Collection('chats');

if (Meteor.isClient) {
  Meteor.subscribe('chats');
  Meteor.subscribe('users');

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

  Template.chatList.helpers({
    chats: function () {
      return Chats.find({userIds: {"id": Meteor.userId()}});
    }
  });

  Template.userItem.events({
    'click button': function(e, template){
      Meteor.call('createChat', template.data._id);
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
}

Meteor.methods({
  createChat: function(otherId){
    Chats.insert({
      userIds:[{id: Meteor.userId()},{id: otherId}],
      started: new Date()
    })
  }
});