var _ = require('lodash');
var util = require('util');

var debug = require('debug')('bot');

var EventEmitter = require('events').EventEmitter;

module.exports = function (connection) {

	var Users = function () {
		var users = [];

		// incoming event handlers
		this.on('add', add);
		
		function add(user) {
			debug('user added to collection: %s (%d)', user.name, user.session);
			users.push(new User(user));
		};

		function remove(id) {
			var user = _.where(users, {session: id});
			if (user) {
				users.splice(users.indexOf(user), 1);
			}
		};

		// helper methods
		this.get = function (id) {
			if (id) { return _.find(users, {session: id}); }
			return users;
		}

		this.exists = function (id) {
			return (!!_.find(users, {session: id}));
		};
	};

	util.inherits(Users, EventEmitter);

	var User = function (user) {
		_.assign(this, user);

		this.move = function (channelId) {
			connection.sendMessage('UserState', {
				session: this.session,
				actor: connection.sessionId,
				channelId: channelId
			});
		};

		this.message = function (message) {
			connection.sendMessage('TextMessage', {
				actor: connection.sessionId,
				session: [this.session],
				message: message
			});
		};

	};

	util.inherits(User, EventEmitter);

	return {
		Users: Users,
		User: User
	}
};