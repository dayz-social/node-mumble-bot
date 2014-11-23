var util = require('util');
var mumble = require('mumble');
var debug = require('debug')('bot');
var utils = require('./utils');

var EventEmitter = require('events').EventEmitter;

var Bot = module.exports = function (options) {
	var self = this;
	var mumbleUrl = utils.formatMumbleUrl(options);

	mumble.connect(mumbleUrl, options.ssl, onConnect);

	function onConnect(err, connection) {
		if (err) throw err;

		connection.authenticate(options.user, options.pass);
		
		self._Channels = require('./channels')(connection);
		self._Users = require('./users')(connection);

		self.connection = connection;
		var channels = self.channels = new self._Channels.Channels();
		var users = self.users = new self._Users.Users();
		var server = self.server = {};

		connection.on('protocol-in', function (data) {
			var msg = data.message;

			switch (data.type) {
				case 'Version':
					debug('event: version');
					server.version = msg;
					break;
				case 'Ping':
					break;
				case 'CodecVersion':
			    debug('event: codec version');
					server.codecVersion = msg;
					break;
				case 'CryptSetup':
					debug('event: crypt setup');
					break;
				case 'PermissionQuery':
					debug('event: permission query');
					break;
				case 'PermissionDenied':
					debug('event: permission denied', msg);
					break;
				case 'ServerSync':
					debug('event: server sync');
					break;
				case 'ChannelState':
					if (msg.name) {
						if (channels.exists(msg.channelId)) {
							channels.emit('update', msg);
						} else {
							channels.emit('add', msg);
						}						
					} else if (msg.links || msg.linksAdd || msg.linksRemove) {
						var links = msg.links || msg.linksAdd || msg.linksRemove;
						var channel = channels.get(msg.channelId).name;

						links = links.map(function (channel) {
							return channels.get(channel).name;
						});

						if (msg.links) {
							debug('%s is linked to: %s', channel, links.join(','));
						} else if (msg.linksAdd) {
							debug('%s added link(s) to: %s', channel, links.join(','));
						} else if (msg.linksRemove) {
							debug('%s removed link(s) to: %s', channel, links.join(','));
						}
					} else {
						console.dir(data);
					}
					break;
				case 'ChannelRemove':
					var channel = channels.get(msg.channelId);
					debug('channel (%s) removed', channel.name);
					channels.emit('remove', msg.channelId);
					break;
				case 'UserState':
					if (msg.name) {
						if (users.exists(msg.session)) {
							users.emit('update', msg);
						} else {
							users.emit('add', msg);
						}
					} else if (msg.channelId) {
						var actor = users.get(msg.actor);
						var session = users.get(msg.session);
						
					}
					break;
				case 'TextMessage':
					msg.actor = users.get(msg.actor);
					if (msg.channelId) { 
						msg.channelId.forEach(function (channelId) {
							channels.get(channelId).emit('message', msg);
						});
					} else if (msg.session) {
						self.emit('message', msg);
					}
					break;
				case 'ServerConfig':
					self.emit('connected', connection);
					break;
				default:
					console.log(data);
					break;
			}
		});
	}
};

util.inherits(Bot, EventEmitter);