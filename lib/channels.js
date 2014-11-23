var _ = require('lodash');
var util = require('util');
var debug = require('debug')('bot');

var EventEmitter = require('events').EventEmitter;

module.exports = function (connection) {

	var Channels = function () {
		var channels = [];

		// outgoing commands
		this.add = function (channel) {
			debug('sending command to add channel: %s', channel.name);
			connection.sendMessage('ChannelState', {
				actor: connection.sessionId,
				parent: channel.parent,
				name: channel.name,
				description: channel.description || '',
				temporary: channel.temporary || false,
				position: channel.position || 0
			});
		};

		this.remove = function (id) {
			var channel = this.get(id);
			debug('sending command to remove channel: %s', channel.name);
			connection.sendMessage('ChannelRemove', {channelId: id});
		};

		// incoming event handlers
		this.on('add', add);
		this.on('remove', remove);
		this.on('update', update)


		function add(channel) {
			debug('channel added to collection: %s (%d)', channel.name, channel.channelId);
			channels.push(new Channel(channel));				
		}

		function remove(id) {
			var channel = this.get(id);
			debug('channel removed from collection: %s', channel.name);
			channels.splice(channels.indexOf(channel), 1);
		}

		function update(channel) {
			var oldChannel = this.get(channel.channelId);

			debug('channel updated in collection: %s', oldChannel.name + ((channel.name) ? ' -> ' + channel.name : ''));
			_.forIn(channel, function (val, key) {
				oldChannel[key] = val;
			});
		}

		// helper methods
		this.get = function (id) {
			if (id) return _.find(channels, {channelId: id});
			else return channels;
		};

		this.exists = function (id) {
			return (!!_.find(channels, {channelId: id}));
		};

	};

	util.inherits(Channels, EventEmitter);

	var Channel = function (channel) {
		_.assign(this, channel);

		this.rename = function (name) {
			connection.sendMessage('ChannelState', {
				channelId: this.channelId,
				name: name
			});
		};
	};

	util.inherits(Channel, EventEmitter);

	return {
		Channels: Channels,
		Channel: Channel
	}
};