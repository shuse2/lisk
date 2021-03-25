/*
 * Copyright © 2019 Lisk Foundation
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
 *
 */

export const createMockChannel = () => {
	const channel = {
		publish: jest.fn(),
		once: jest.fn(),
		invoke: jest.fn(),
		subscribe: jest.fn(),
	};
	return channel;
};

export const createMockBus = () => ({
	registerChannel: jest.fn().mockResolvedValue(undefined),
	setup: jest.fn().mockResolvedValue(undefined),
});
