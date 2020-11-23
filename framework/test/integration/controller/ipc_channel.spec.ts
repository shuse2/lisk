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
 */

import { homedir } from 'os';
import { mkdirSync, rmdirSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { IPCChannel, InMemoryChannel } from '../../../src/controller/channels';
import { Bus } from '../../../src/controller/bus';

describe('IPCChannel', () => {
	// Arrange
	const logger: any = {
		info: jest.fn(),
	};

	const socketsDir = pathResolve(`${homedir()}/.lisk/functional/ipc_channel/sockets`);

	const config: any = {
		socketsPath: {
			root: socketsDir,
		},
		rpc: {
			enable: false,
			mode: 'ipc',
			port: 8080,
		},
	};

	const alpha = {
		moduleAlias: 'alphaAlias',
		events: ['alpha1', 'alpha2'],
		actions: {
			multiplyByTwo: {
				handler: (action: any) => action.params.val * 2,
			},
			multiplyByThree: {
				handler: (action: any) => action.params.val * 3,
			},
		},
	};

	const beta = {
		moduleAlias: 'betaAlias',
		events: ['beta1', 'beta2'],
		actions: {
			divideByTwo: {
				handler: (action: any) => action.params.val / 2,
			},
			divideByThree: {
				handler: (action: any) => action.params.val / 3,
			},
		},
	};

	describe('after registering itself to the bus', () => {
		let alphaChannel: IPCChannel;
		let betaChannel: IPCChannel;
		let bus: Bus;

		beforeAll(async () => {
			mkdirSync(socketsDir, { recursive: true });

			// Arrange
			bus = new Bus(logger, config);

			alphaChannel = new IPCChannel(alpha.moduleAlias, alpha.events, alpha.actions, config);

			betaChannel = new IPCChannel(beta.moduleAlias, beta.events, beta.actions, config);

			await bus.setup();
			await alphaChannel.registerToBus();
			await betaChannel.registerToBus();
		});

		afterAll(async () => {
			alphaChannel.cleanup();
			betaChannel.cleanup();
			await bus.cleanup();

			rmdirSync(socketsDir);
		});

		describe('#subscribe', () => {
			it('should be able to subscribe to an event.', async () => {
				// Arrange
				const betaEventData = { data: '#DATA' };
				const eventName = beta.events[0];

				const donePromise = new Promise(resolve => {
					// Act
					alphaChannel.subscribe(`${beta.moduleAlias}:${eventName}`, event => {
						// Assert
						expect(event.data).toEqual(betaEventData);
						resolve();
					});
				});

				betaChannel.publish(`${beta.moduleAlias}:${eventName}`, betaEventData);

				return donePromise;
			});

			it('should be able to subscribe to an event once.', async () => {
				// Arrange
				const betaEventData = { data: '#DATA' };
				const eventName = beta.events[0];
				const donePromise = new Promise(resolve => {
					// Act
					alphaChannel.once(`${beta.moduleAlias}:${eventName}`, event => {
						// Assert
						expect(event.data).toEqual(betaEventData);
						resolve();
					});
				});

				betaChannel.publish(`${beta.moduleAlias}:${eventName}`, betaEventData);

				return donePromise;
			});

			it('should be able to subscribe to an unregistered event.', async () => {
				// Arrange
				const omegaEventName = 'omegaEventName';
				const omegaAlias = 'omegaAlias';
				const dummyData = { data: '#DATA' };
				const inMemoryChannelOmega = new InMemoryChannel(omegaAlias, [omegaEventName], {});

				const donePromise = new Promise(resolve => {
					// Act
					alphaChannel.subscribe(`${omegaAlias}:${omegaEventName}`, event => {
						// Assert
						expect(event.data).toEqual(dummyData);
						resolve();
					});
				});

				await inMemoryChannelOmega.registerToBus(bus);

				inMemoryChannelOmega.publish(`${omegaAlias}:${omegaEventName}`, dummyData);

				return donePromise;
			});
		});

		describe('#publish', () => {
			it('should be able to publish an event.', async () => {
				// Arrange
				const alphaEventData = { data: '#DATA' };
				const eventName = alpha.events[0];

				const donePromise = new Promise(done => {
					// Act
					betaChannel.once(`${alpha.moduleAlias}:${eventName}`, event => {
						// Assert
						expect(event.data).toEqual(alphaEventData);
						done();
					});
				});

				alphaChannel.publish(`${alpha.moduleAlias}:${eventName}`, alphaEventData);

				return donePromise;
			});
		});

		describe('#invoke', () => {
			it('should be able to invoke its own actions.', async () => {
				// Act && Assert
				await expect(
					alphaChannel.invoke<number>(`${alpha.moduleAlias}:multiplyByTwo`, {
						val: 2,
					}),
				).resolves.toBe(4);

				await expect(
					alphaChannel.invoke<number>(`${alpha.moduleAlias}:multiplyByThree`, {
						val: 4,
					}),
				).resolves.toBe(12);
			});

			it("should be able to invoke other channels' actions.", async () => {
				// Act && Assert
				await expect(
					alphaChannel.invoke<number>(`${beta.moduleAlias}:divideByTwo`, {
						val: 4,
					}),
				).resolves.toEqual(2);

				await expect(
					alphaChannel.invoke<number>(`${beta.moduleAlias}:divideByThree`, {
						val: 9,
					}),
				).resolves.toEqual(3);
			});

			it('should throw error when trying to invoke an invalid action.', async () => {
				// Arrange
				const invalidActionName = 'INVALID_ACTION_NAME';

				// Act && Assert
				await expect(
					alphaChannel.invoke(`${beta.moduleAlias}:${invalidActionName}`),
				).rejects.toThrow(
					`Action name "${beta.moduleAlias}:${invalidActionName}" must be a valid name with module name and action name.`,
				);
			});
		});
	});
});
