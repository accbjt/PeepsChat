Avatars = new Meteor.Collection('avatars');

if (Meteor.isClient) {
	Meteor.subscribe('avatars');

	Template.signup.events({
		'click .submit-button': function(e, template){
			e.preventDefault();

			Accounts.createUser({
				email: template.find('#su-email').value,
				username: template.find('#su-username').value,
				password: template.find('#su-password').value
			});

			Meteor.call('createAvatar', template.find('#su-avatar').value)
		}
	})

	Template.login.events({
		'click .submit-button': function(e, template){
			e.preventDefault();
			Meteor.loginWithPassword(
				template.find('#li-username').value,
				template.find('#li-password').value
				);
		}
	})

	Template.logout.events({
		'click button': function(e, template){
			e.preventDefault();
			Meteor.logout();
		}
	})

	Template.avatar.events({
		'click img': function(e, template){
			e.preventDefault();
			var imageSrc = $(e.currentTarget).attr('src');

			$(e.currentTarget).siblings().removeClass('selected');

			$('#su-avatar').val(imageSrc);
			$(e.currentTarget).addClass('selected');
		}
	})
}

if (Meteor.isServer) {

  Meteor.publish('avatars', function(){
    return Avatars.find();
  })
}

Meteor.methods({
  createAvatar: function(src){
    Avatars.insert({
      userId: Meteor.userId(),
      avatar: src
    })
  }
});