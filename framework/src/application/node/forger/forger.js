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

'use strict';

const {
	getPrivateAndPublicKeyBytesFromPassphrase,
	decryptPassphraseWithPassword,
	parseEncryptedPassphrase,
} = require('@liskhq/lisk-cryptography');

const { HighFeeForgingStrategy } = require('./strategies');

const getDelegateKeypairForCurrentSlot = async (
	dposModule,
	keypairs,
	currentSlot,
	round,
	numOfActiveDelegates,
) => {
	const activeDelegates = await dposModule.getForgerPublicKeysForRound(round);

	const currentSlotIndex = currentSlot % numOfActiveDelegates;
	const currentSlotDelegate = activeDelegates[currentSlotIndex];

	if (currentSlotDelegate && keypairs[currentSlotDelegate]) {
		return keypairs[currentSlotDelegate];
	}

	return null;
};

class Forger {
	constructor({
		forgingStrategy,
		// components
		channel,
		logger,
		// Modules
		processorModule,
		dposModule,
		transactionPoolModule,
		chainModule,
		// constants
		activeDelegates,
		maxPayloadLength,
		forgingDelegates,
		forgingForce,
		forgingDefaultPassword,
		forgingWaitThreshold,
	}) {
		this.keypairs = {};
		this.channel = channel;
		this.logger = logger;
		this.config = {
			forging: {
				delegates: forgingDelegates,
				force: forgingForce,
				defaultPassword: forgingDefaultPassword,
				waitThreshold: forgingWaitThreshold,
			},
		};
		this.constants = {
			activeDelegates,
			maxPayloadLength,
		};

		this.processorModule = processorModule;
		this.dposModule = dposModule;
		this.transactionPoolModule = transactionPoolModule;
		this.chainModule = chainModule;

		this.forgingStrategy =
			forgingStrategy ||
			new HighFeeForgingStrategy({
				logger: this.logger,
				transactionPoolModule: this.transactionPoolModule,
				chainModule: this.chainModule,
				maxPayloadLength: this.constants.maxPayloadLength,
			});
	}

	// eslint-disable-next-line class-methods-use-this
	delegatesEnabled() {
		return Object.keys(this.keypairs).length > 0;
	}

	// eslint-disable-next-line class-methods-use-this
	async updateForgingStatus(publicKey, password, forging) {
		const encryptedList = this.config.forging.delegates;
		const encryptedItem = encryptedList.find(
			item => item.publicKey === publicKey,
		);

		let keypair;
		let passphrase;

		if (encryptedItem) {
			try {
				passphrase = decryptPassphraseWithPassword(
					parseEncryptedPassphrase(encryptedItem.encryptedPassphrase),
					password,
				);
			} catch (e) {
				throw new Error('Invalid password and public key combination');
			}
			const {
				publicKeyBytes,
				privateKeyBytes,
			} = getPrivateAndPublicKeyBytesFromPassphrase(passphrase);

			keypair = {
				publicKey: publicKeyBytes,
				privateKey: privateKeyBytes,
			};
		} else {
			throw new Error(`Delegate with publicKey: ${publicKey} not found`);
		}

		if (keypair.publicKey.toString('hex') !== publicKey) {
			throw new Error('Invalid password and public key combination');
		}

		const [account] = await this.chainModule.dataAccess.getAccountsByPublicKey([
			keypair.publicKey.toString('hex'),
		]);

		if (account && account.isDelegate) {
			if (forging) {
				this.keypairs[keypair.publicKey.toString('hex')] = keypair;
				this.logger.info(`Forging enabled on account: ${account.address}`);
			} else {
				delete this.keypairs[keypair.publicKey.toString('hex')];
				this.logger.info(`Forging disabled on account: ${account.address}`);
			}

			return {
				publicKey,
				forging,
			};
		}
		throw new Error('Delegate not found');
	}

	async loadDelegates() {
		const encryptedList = this.config.forging.delegates;

		if (
			!encryptedList ||
			!encryptedList.length ||
			!this.config.forging.force ||
			!this.config.forging.defaultPassword
		) {
			return;
		}
		this.logger.info(
			`Loading ${encryptedList.length} delegates using encrypted passphrases from config`,
		);

		for (const encryptedItem of encryptedList) {
			let passphrase;
			try {
				passphrase = decryptPassphraseWithPassword(
					parseEncryptedPassphrase(encryptedItem.encryptedPassphrase),
					this.config.forging.defaultPassword,
				);
			} catch (error) {
				const decryptionError = `Invalid encryptedPassphrase for publicKey: ${encryptedItem.publicKey}. ${error.message}`;
				this.logger.error(decryptionError);
				throw new Error(decryptionError);
			}

			const {
				publicKeyBytes,
				privateKeyBytes,
			} = getPrivateAndPublicKeyBytesFromPassphrase(passphrase);

			const keypair = {
				publicKey: publicKeyBytes,
				privateKey: privateKeyBytes,
			};

			if (keypair.publicKey.toString('hex') !== encryptedItem.publicKey) {
				throw new Error(
					`Invalid encryptedPassphrase for publicKey: ${encryptedItem.publicKey}. Public keys do not match`,
				);
			}

			const [
				account,
			] = await this.chainModule.dataAccess.getAccountsByPublicKey([
				keypair.publicKey.toString('hex'),
			]);

			if (!account) {
				throw new Error(
					`Account with public key: ${keypair.publicKey.toString(
						'hex',
					)} not found`,
				);
			}
			if (account.isDelegate) {
				this.keypairs[keypair.publicKey.toString('hex')] = keypair;
				this.logger.info(`Forging enabled on account: ${account.address}`);
			} else {
				this.logger.warn(
					`Account with public key: ${keypair.publicKey.toString(
						'hex',
					)} is not a delegate`,
				);
			}
		}
	}

	// eslint-disable-next-line class-methods-use-this
	async forge() {
		const currentSlot = this.chainModule.slots.getSlotNumber();
		const currentSlotTime = this.chainModule.slots.getRealTime(
			this.chainModule.slots.getSlotTime(currentSlot),
		);

		const currentTime = new Date().getTime();
		const waitThreshold = this.config.forging.waitThreshold * 1000;
		const { lastBlock } = this.chainModule;
		const lastBlockSlot = this.chainModule.slots.getSlotNumber(
			lastBlock.timestamp,
		);

		if (currentSlot === lastBlockSlot) {
			this.logger.trace(
				{ slot: currentSlot },
				'Block already forged for the current slot',
			);
			return;
		}

		// We calculate round using height + 1, because we want the delegate keypair for next block to be forged
		const round = this.dposModule.rounds.calcRound(
			this.chainModule.lastBlock.height + 1,
		);

		let delegateKeypair;
		try {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			delegateKeypair = await exportedInterfaces.getDelegateKeypairForCurrentSlot(
				this.dposModule,
				this.keypairs,
				currentSlot,
				round,
				this.constants.activeDelegates,
			);
		} catch (err) {
			this.logger.error({ err }, 'Skipping delegate slot');
			throw err;
		}

		if (delegateKeypair === null) {
			this.logger.trace(
				{ currentSlot: this.chainModule.slots.getSlotNumber() },
				'Waiting for delegate slot',
			);
			return;
		}

		// If last block slot is way back than one block
		// and still time left as per threshold specified
		if (
			lastBlockSlot < currentSlot - 1 &&
			currentTime <= currentSlotTime + waitThreshold
		) {
			this.logger.info('Skipping forging to wait for last block');
			this.logger.debug('Slot information', {
				currentSlot,
				lastBlockSlot,
				waitThreshold,
			});
			return;
		}

		const timestamp = this.chainModule.slots.getSlotTime(currentSlot);
		const previousBlock = this.chainModule.lastBlock;
		const transactions = await this.forgingStrategy.getTransactionsForBlock();

		const forgedBlock = await this.processorModule.create({
			keypair: delegateKeypair,
			timestamp,
			transactions,
			previousBlock,
		});

		await this.processorModule.process(forgedBlock);
		this.logger.info(
			{
				id: forgedBlock.id,
				height: forgedBlock.height,
				round: this.dposModule.rounds.calcRound(forgedBlock.height),
				slot: this.chainModule.slots.getSlotNumber(forgedBlock.timestamp),
				reward: forgedBlock.reward.toString(),
			},
			'Forged new block',
		);
	}

	// eslint-disable-next-line class-methods-use-this
	getForgersKeyPairs() {
		return this.keypairs;
	}

	// eslint-disable-next-line class-methods-use-this
	getForgingStatusForAllDelegates() {
		const keyPairs = this.keypairs;
		const forgingDelegates = this.config.forging.delegates;
		const forgersPublicKeys = {};

		Object.keys(keyPairs).forEach(key => {
			forgersPublicKeys[keyPairs[key].publicKey.toString('hex')] = true;
		});

		const fullList = forgingDelegates.map(forger => ({
			forging: !!forgersPublicKeys[forger.publicKey],
			publicKey: forger.publicKey,
		}));

		return fullList;
	}
}

const exportedInterfaces = {
	Forger,
	getDelegateKeypairForCurrentSlot,
};

// Export
module.exports = exportedInterfaces;
