function formatMumbleUrl(options) {
	var mumbleUrl = 'mumble://';
	// if (options.user) { 
	// 	mumbleUrl += options.user;
	// 	if (options.pass) { 
	// 		mumbleUrl += ':' + options.pass
	// 	}
	// 	mumbleUrl += '@';
	// }

	mumbleUrl += options.host;

	if (options.port) { 
		mumbleUrl += ':' + options.port; 
	}

	mumbleUrl += '/';

	if (options.channel) {
		mumbleUrl += options.channel;
	}
	return mumbleUrl;
}

module.exports = {
	formatMumbleUrl: formatMumbleUrl
};