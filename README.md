node-mumble-bot
===============

Example usage

```js
var fs = require('fs');
var Bot = require('mumble-bot');

var bot = new Bot({
	user: 'username',
	pass: 'password', // optional
	host: 'mumble.tld',
	channel: 'Lobby', // optional
	ssl: {
		key: fs.readFileSync('./bot.key'),
		cert: fs.readFileSync('./bot.crt')
	}
});

bot.on('connected', function (connection) {

	// listen for incoming private message events
	bot.on('message', function (message) {
		console.log('%s says: %s', message.actor.name, message.message);
	});
});
```

## Todo

- Publish to npm
- Add better documentation
- Figure out out permissions and ACL commands

## License
See LICENSE file.