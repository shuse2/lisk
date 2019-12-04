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

const BigNum = require('@liskhq/bignum');
const { hash, verifyData } = require('@liskhq/lisk-cryptography');

const validateSignature = (block, blockBytes) => {
	const signatureLength = 64;
	const dataWithoutSignature = blockBytes.slice(
		0,
		blockBytes.length - signatureLength,
	);
	const hashedBlock = hash(dataWithoutSignature);

	const verified = verifyData(
		hashedBlock,
		block.blockSignature,
		block.generatorPublicKey,
	);

	if (!verified) {
		throw new Error('Invalid block signature');
	}
};

const validatePreviousBlockProperty = (block, genesisBlock) => {
	const isGenesisBlock =
		block.id === genesisBlock.id &&
		!block.previousBlockId &&
		block.height === 1;
	const propertyIsValid =
		isGenesisBlock ||
		(block.id !== genesisBlock.id &&
			block.previousBlockId &&
			block.height !== 1);

	if (!propertyIsValid) {
		throw new Error('Invalid previous block');
	}
};

const validateReward = (block, expectedReward, exceptions) => {
	expectedReward = new BigNum(expectedReward);

	if (
		block.height !== 1 &&
		!expectedReward.equals(block.reward) &&
		(!exceptions.blockRewards || !exceptions.blockRewards.includes(block.id))
	) {
		throw new Error(
			`Invalid block reward: ${block.reward} expected: ${expectedReward}`,
		);
	}
};

const validatePayload = (block, maxTransactionsPerBlock, maxPayloadLength) => {
	if (block.payloadLength > maxPayloadLength) {
		throw new Error('Payload length is too long');
	}

	if (block.transactions.length !== block.numberOfTransactions) {
		throw new Error(
			'Included transactions do not match block transactions count',
		);
	}

	if (block.transactions.length > maxTransactionsPerBlock) {
		throw new Error('Number of transactions exceeds maximum per block');
	}

	let totalAmount = new BigNum(0);
	let totalFee = new BigNum(0);
	const transactionsBytesArray = [];
	const appliedTransactions = {};

	block.transactions.forEach(transaction => {
		const transactionBytes = transaction.getBytes();

		if (appliedTransactions[transaction.id]) {
			throw new Error(`Encountered duplicate transaction: ${transaction.id}`);
		}

		appliedTransactions[transaction.id] = transaction;
		if (transactionBytes) {
			transactionsBytesArray.push(transactionBytes);
		}
		totalAmount = totalAmount.plus(transaction.asset.amount || 0);
		totalFee = totalFee.plus(transaction.fee);
	});

	const transactionsBuffer = Buffer.concat(transactionsBytesArray);
	const payloadHash = hash(transactionsBuffer).toString('hex');

	if (payloadHash !== block.payloadHash) {
		throw new Error('Invalid payload hash');
	}

	if (!totalAmount.equals(block.totalAmount)) {
		throw new Error('Invalid total amount');
	}

	if (!totalFee.equals(block.totalFee)) {
		throw new Error('Invalid total fee');
	}
};

// TODO: Move to DPOS validation
const validateBlockSlot = (block, lastBlock, slots) => {
	const blockSlotNumber = slots.getSlotNumber(block.timestamp);
	const lastBlockSlotNumber = slots.getSlotNumber(lastBlock.timestamp);

	if (
		blockSlotNumber > slots.getSlotNumber() ||
		blockSlotNumber <= lastBlockSlotNumber
	) {
		throw new Error('Invalid block timestamp');
	}
};

module.exports = {
	validateSignature,
	validatePreviousBlockProperty,
	validateReward,
	validatePayload,
	validateBlockSlot,
};
