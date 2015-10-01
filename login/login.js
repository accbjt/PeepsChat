Avatars = new Meteor.Collection('avatars');

if (Meteor.isClient) {
	Meteor.subscribe('avatars');

	Template.logout.helpers({
		avatar: function(){
			var avatar = Avatars.find({userId: Meteor.userId()}).map(function(avatar){return avatar.avatar})[0];
			return avatar
		}
	})

	Template.signup.events({
		'click .submit-button': function(e, template){
			e.preventDefault();

			function validate(e){
				var inputs = $(e.currentTarget).parents('form').find('input');
				var inputsValueArray = [];

	 			inputs.each(function(i){
					if(inputs[i].value !== "Sign Up"){
						inputsValueArray.push(inputs[i].value);
					}
				});

				return inputsValueArray.indexOf("") === -1 ? true : false;
			}

			if(validate(e)){
				Accounts.createUser({
					email: template.find('#su-email').value,
					username: template.find('#su-username').value,
					password: template.find('#su-password').value
				});

				Meteor.call('createAvatar', template.find('#su-avatar').value);
			}else{
				alert('Please make sure all inputs are filled and you have chosen an avatar.');
			}
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