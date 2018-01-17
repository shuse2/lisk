/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
'use strict';

module.exports = {};

var QueryFile = require('pg-promise').QueryFile;
var path = require('path');

// Check if app is packaged by webpack:
var isPackaged = typeof PACKAGED !== 'undefined' && !!PACKAGED;

// Full path to the SQL folder, depending on the packaging:
// - production expects ./sql folder at its root;
// - development expects sql in this very folder.
var sqlPath = isPackaged ? path.join(__dirname, './sql', file) : __dirname;

///////////////////////////////////////////////
// Helper for linking to external query files:
function sql(file) {

	var fullPath = path.join(sqlPath, file); // generating full path;

	var options = {
		minify: true, // minifies the SQL
		params: {
			schema: 'public' // replaces ${schema~} with "public"
		}
	};

	var qf = new QueryFile(fullPath, options);

	if (qf.error) {
		console.error(qf.error); // something is wrong with our query file
		process.exit(1); // exit the process with fatal error
	}

	return qf;
}
