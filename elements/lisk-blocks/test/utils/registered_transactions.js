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
	TransferTransaction,
	SecondSignatureTransaction,
	DelegateTransaction,
	VoteTransaction,
	MultisignatureTransaction,
} = require('@liskhq/lisk-transactions');

const registeredTransactions = {
	8: TransferTransaction,
	9: SecondSignatureTransaction,
	10: DelegateTransaction,
	11: VoteTransaction,
	12: MultisignatureTransaction,
};

module.exports = {
	registeredTransactions,
};
