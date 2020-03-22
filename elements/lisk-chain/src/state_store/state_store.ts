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
import { BatchChain, BlockHeader } from '../types';

import { AccountStore } from './account_store';
import { ChainStateStore } from './chain_state_store';
import { ConsensusStateStore } from './consensus_state_store';

interface AdditionalInformation {
	readonly lastBlockHeaders: ReadonlyArray<BlockHeader>;
	readonly networkIdentifier: string;
}

export class StateStore {
	public readonly account: AccountStore;
	public readonly chain: ChainStateStore;
	public readonly consensus: ConsensusStateStore;

	public constructor(
		dataAccess: DataAccess,
		additionalInformation: AdditionalInformation,
	) {
		this.account = new AccountStore(dataAccess);
		this.consensus = new ConsensusStateStore(dataAccess, {
			lastBlockHeaders: additionalInformation.lastBlockHeaders,
		});
		this.chain = new ChainStateStore(dataAccess, {
			lastBlockHeader: additionalInformation.lastBlockHeaders[0],
			networkIdentifier: additionalInformation.networkIdentifier,
		});
	}

	public createSnapshot(): void {
		this.account.createSnapshot();
		this.consensus.createSnapshot();
		this.chain.createSnapshot();
	}

	public restoreSnapshot(): void {
		this.account.restoreSnapshot();
		this.consensus.restoreSnapshot();
		this.chain.restoreSnapshot();
	}

	public finalize(batch: BatchChain): void {
		this.account.finalize(batch);
		this.chain.finalize(batch);
		this.consensus.finalize(batch);
	}
}
