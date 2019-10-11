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

const storageConfig = (overriddenConfigProperties = {}) => ({
	host: 'localhost',
	port: 5432,
	database: 'lisk_dev',
	user: 'lisk',
	password: 'password',
	min: 1,
	// genesis_block.spec.js is using 2 Storage instance,
	// That's why max can't be less than 2
	max: 2,
	poolIdleTimeout: 30000,
	reapIntervalMillis: 1000,
	logEvents: ['error'],
	logFileName: 'logs/lisk_db.log',
	...overriddenConfigProperties,
});

module.exports = {
	storageConfig,
};
