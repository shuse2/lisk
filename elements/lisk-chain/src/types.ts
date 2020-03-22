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
import {
	BaseTransaction,
	TransactionJSON,
	TransactionResponse,
} from '@liskhq/lisk-transactions';

import { Account } from './account';

export interface Indexable {
	readonly [key: string]: unknown;
}

export type IndexableAccount = Account & Indexable;

export type IndexableTransactionJSON = TransactionJSON & Indexable;

export interface AccountVoteJSON {
	readonly delegateAddress: string;
	readonly amount: string;
}

export interface AccountUnlockingJSON {
	readonly delegateAddress: string;
	readonly amount: string;
	readonly unvoteHeight: number;
}

export interface AccountJSON {
	readonly address: string;
	readonly balance: string;
	readonly nonce: string;
	readonly producedBlocks: number;
	readonly publicKey: string | undefined;
	readonly username: string | null;
	readonly fees: string;
	readonly rewards: string;
	readonly totalVotesReceived: string;
	readonly asset: object;
	readonly keys?: {
		readonly mandatoryKeys?: string[];
		readonly optionalKeys?: string[];
		readonly numberOfSignatures?: number;
	};
	readonly votes?: AccountVoteJSON[];
	readonly unlocking?: AccountUnlockingJSON[];
	readonly delegate?: {
		readonly lastForgedHeight: number;
		readonly registeredHeight: number;
		readonly consecutiveMissedBlocks: number;
		readonly isBanned: boolean;
		readonly pomHeights: number[];
	};

	// TODO: Remove once new DPoS implementation is done
	readonly missedBlocks: number;
	readonly isDelegate: number;
	readonly voteWeight: string;
	readonly nameExist: boolean;
	readonly votedDelegatesPublicKeys: string[] | null;
}

export interface Context {
	readonly blockVersion: number;
	readonly blockHeight: number;
	readonly blockTimestamp: number;
}
export type Contexter = (() => Context) | Context;
export interface BlockHeaderJSON {
	/* tslint:disable:readonly-keyword */
	id: string;
	height: number;
	version: number;
	timestamp: number;
	previousBlockId?: string | null;
	blockSignature: string;
	generatorPublicKey: string;
	numberOfTransactions: number;
	payloadLength: number;
	payloadHash: string;
	totalAmount: string;
	totalFee: string;
	reward: string;
	maxHeightPreviouslyForged: number;
	maxHeightPrevoted: number;
	/* tslint:enable:readonly-keyword */
}

export interface BlockJSON extends BlockHeaderJSON {
	// tslint:disable-next-line readonly-keyword
	transactions: ReadonlyArray<TransactionJSON>;
}

type Modify<T, R> = Omit<T, keyof R> & R;

// All the block properties excluding transactions
export type BlockHeader = Modify<
	BlockHeaderJSON,
	{
		readonly totalAmount: bigint;
		readonly totalFee: bigint;
		readonly reward: bigint;
	}
>;

export interface BlockRewardOptions {
	readonly totalAmount: string;
	readonly distance: number;
	readonly rewardOffset: number;
	readonly milestones: ReadonlyArray<string>;
}

export interface BlockInstance extends BlockHeader {
	readonly transactions: BaseTransaction[];
	readonly receivedAt?: Date;
}

export interface TempBlock {
	readonly height: number;
	readonly id: string;
	readonly fullBlock: BlockJSON;
}

export type MatcherTransaction = BaseTransaction & {
	readonly matcher: (contexter: Context) => boolean;
};

export interface ChainState {
	readonly key: string;
	readonly value: string;
}

// tslint:disable-next-line no-any
export interface BatchChain<K = any, V = any> {
	put(key: K, value: V): this;
	del(key: K): this;
	clear(): this;
	write(): Promise<this>;
	// tslint:disable-next-line no-mixed-interface
	readonly length: number;
}

export interface ReadStreamOption {
	readonly gt?: string;
	readonly gte?: string;
	readonly lt?: string;
	readonly lte?: string;
	readonly reverse?: boolean;
	readonly limit?: number;
	readonly keys?: boolean;
	readonly values?: boolean;
}

export interface DB {
	// tslint:disable-next-line no-any
	get(rawKey: string | number): Promise<any>;
	exists(rawKey: string | number): Promise<boolean>;
	// tslint:disable-next-line no-any
	put(key: string, val: any): Promise<void>;
	del(key: string): Promise<void>;
	createReadStream(options?: ReadStreamOption): NodeJS.ReadableStream;
	batch(): BatchChain;
}

export interface ExceptionOptions {
	readonly senderPublicKey?: ReadonlyArray<string>;
	readonly signatures?: ReadonlyArray<string>;
	readonly transactionWithNullByte?: ReadonlyArray<string>;
	readonly multisignatures?: ReadonlyArray<string>;
	readonly votes?: ReadonlyArray<string>;
	readonly inertTransactions?: ReadonlyArray<string>;
	readonly roundVotes?: ReadonlyArray<string>;
	readonly blockRewards?: ReadonlyArray<string>;
	readonly recipientLeadingZero?: { readonly [key: string]: string };
	readonly recipientExceedingUint64?: { readonly [key: string]: string };
	readonly duplicatedSignatures?: { readonly [key: string]: string };
}

export type WriteableTransactionResponse = {
	-readonly [P in keyof TransactionResponse]: TransactionResponse[P];
};
