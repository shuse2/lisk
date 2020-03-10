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

import { DataAccess } from '../data_access';
import { BatchChain } from '../types';

import { AccountStore } from './account_store';
import { ChainStateStore } from './chain_state_store';

export class StateStore {
	public readonly account: AccountStore;
	public readonly chain: ChainStateStore;

	public constructor(dataAccess: DataAccess) {
		this.account = new AccountStore(dataAccess);
		this.chain = new ChainStateStore(dataAccess);
	}

	public createSnapshot(): void {
		this.account.createSnapshot();
		this.chain.createSnapshot();
	}

	public restoreSnapshot(): void {
		this.account.restoreSnapshot();
		this.chain.restoreSnapshot();
	}

	public finalize(batch: BatchChain): void {
		this.account.finalize(batch);
		this.chain.finalize(batch);
	}
}
