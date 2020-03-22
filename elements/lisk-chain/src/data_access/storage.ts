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
	getAddressFromPublicKey,
	intToBuffer,
} from '@liskhq/lisk-cryptography';
import { TransactionJSON } from '@liskhq/lisk-transactions';

import { StateStore } from '../state_store';
import { AccountJSON, BlockJSON, DB } from '../types';

import {
	DB_KEY_ACCOUNT_STATE,
	DB_KEY_BLOCKID_BLOCK,
	DB_KEY_BLOCKID_TXIDS,
	DB_KEY_CHAIN_STATE,
	DB_KEY_CONSENSUS_STATE,
	DB_KEY_HEIGHT_BLOCKID,
	DB_KEY_TEMPBLOCK_HEIGHT_BLOCK,
	DB_KEY_TXID_TX,
} from './constants';

const numberToHexString = (num: number): string => {
	// tslint:disable-next-line no-magic-numbers
	const buf = intToBuffer(num, 8);

	return buf.toString('hex');
};

const getEndPrefix = (prefix: string): string => `${prefix}\xFF`;

export class Storage {
	private readonly _db: DB;

	public constructor(db: DB) {
		this._db = db;
	}

	/*
		Block headers
	*/

	public async getBlockHeaderByID(id: string): Promise<BlockJSON> {
		const block = await this._db.get(`${DB_KEY_BLOCKID_BLOCK}:${id}`);

		return block;
	}

	public async getBlockHeadersByIDs(
		arrayOfBlockIds: ReadonlyArray<string>,
	): Promise<BlockJSON[]> {
		const blocks = [];
		for (const id of arrayOfBlockIds) {
			const block = await this.getBlockHeaderByID(id);
			blocks.push(block);
		}

		return blocks;
	}

	public async getBlockHeaderByHeight(height: number): Promise<BlockJSON> {
		const blockID = await this._db.get(
			`${DB_KEY_HEIGHT_BLOCKID}:${numberToHexString(height)}`,
		);

		return this.getBlockHeaderByID(blockID);
	}

	public async getBlockHeadersByHeightBetween(
		fromHeight: number,
		toHeight: number,
	): Promise<BlockJSON[]> {
		const stream = this._db.createReadStream({
			gte: `${DB_KEY_HEIGHT_BLOCKID}:${numberToHexString(fromHeight)}`,
			lte: `${DB_KEY_HEIGHT_BLOCKID}:${numberToHexString(toHeight)}`,
			reverse: true,
		});
		const blockIDs = await new Promise<string[]>((resolve, reject) => {
			const ids: string[] = [];
			stream
				.on('data', ({ value }) => {
					ids.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(ids);
				});
		});

		return this.getBlockHeadersByIDs(blockIDs);
	}

	public async getBlockHeadersWithHeights(
		heightList: ReadonlyArray<number>,
	): Promise<BlockJSON[]> {
		const ids = [];
		for (const height of heightList) {
			const id = await this._db.get(
				`${DB_KEY_HEIGHT_BLOCKID}:${numberToHexString(height)}`,
			);
			ids.push(id);
		}

		return this.getBlockHeadersByIDs(ids);
	}

	public async getLastBlockHeader(): Promise<BlockJSON> {
		const key = `${DB_KEY_HEIGHT_BLOCKID}:`;
		const stream = this._db.createReadStream({
			gte: key,
			lte: getEndPrefix(key),
			reverse: true,
			limit: 1,
		});
		const [blockID] = await new Promise<string[]>((resolve, reject) => {
			const ids: string[] = [];
			stream
				.on('data', ({ value }) => {
					ids.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(ids);
				});
		});

		return this.getBlockHeaderByID(blockID);
	}

	public async getLastCommonBlockHeader(
		arrayOfBlockIds: ReadonlyArray<string>,
	): Promise<BlockJSON> {
		const blocks = await this.getBlockHeadersByIDs(arrayOfBlockIds);
		blocks.sort((a, b) => b.height - a.height);

		return blocks[0];
	}

	public async getBlocksCount(): Promise<number> {
		const lastBlock = await this.getLastBlockHeader();

		return lastBlock.height;
	}

	/*
		Extended blocks with transaction payload
	*/

	public async getBlockByID(id: string): Promise<BlockJSON> {
		const blockHeader = await this.getBlockHeaderByID(id);
		const transactions = await this._getTransactions(id);

		return {
			...blockHeader,
			transactions,
		};
	}

	private async _getTransactions(id: string): Promise<TransactionJSON[]> {
		const txIDs = [];
		try {
			const ids = await this._db.get(`${DB_KEY_BLOCKID_TXIDS}:${id}`);
			txIDs.push(...ids);
		} catch (error) {
			if (!error.notFound) {
				throw error;
			}
		}
		if (txIDs.length === 0) {
			return [];
		}
		const transactions = [];
		for (const txID of txIDs) {
			const tx = await this._db.get(`${DB_KEY_TXID_TX}:${txID}`);
			transactions.push(tx);
		}

		return transactions;
	}

	public async getBlocksByIDs(
		arrayOfBlockIds: ReadonlyArray<string>,
	): Promise<BlockJSON[]> {
		const blocks = [];
		for (const id of arrayOfBlockIds) {
			const block = await this.getBlockByID(id);
			blocks.push(block);
		}

		return blocks;
	}

	public async getBlockByHeight(height: number): Promise<BlockJSON> {
		const header = await this.getBlockHeaderByHeight(height);
		const transactions = await this._getTransactions(header.id);

		return {
			...header,
			transactions,
		};
	}

	public async getBlocksByHeightBetween(
		fromHeight: number,
		toHeight: number,
	): Promise<BlockJSON[]> {
		const headers = await this.getBlockHeadersByHeightBetween(
			fromHeight,
			toHeight,
		);
		const blocks = [];
		for (const header of headers) {
			const transactions = await this._getTransactions(header.id);
			blocks.push({ ...header, transactions });
		}

		return blocks;
	}

	public async getLastBlock(): Promise<BlockJSON> {
		const header = await this.getLastBlockHeader();
		const transactions = await this._getTransactions(header.id);

		return {
			...header,
			transactions,
		};
	}

	public async getTempBlocks(): Promise<BlockJSON[]> {
		const key = `${DB_KEY_TEMPBLOCK_HEIGHT_BLOCK}:`;
		const stream = this._db.createReadStream({
			gte: key,
			lte: getEndPrefix(key),
			reverse: true,
		});
		const tempBlocks = await new Promise<BlockJSON[]>((resolve, reject) => {
			const blocks: BlockJSON[] = [];
			stream
				.on('data', ({ value }) => {
					blocks.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(blocks);
				});
		});

		return tempBlocks;
	}

	public async isTempBlockEmpty(): Promise<boolean> {
		const key = `${DB_KEY_TEMPBLOCK_HEIGHT_BLOCK}:`;
		const stream = this._db.createReadStream({
			gte: key,
			lte: getEndPrefix(key),
			limit: 1,
		});
		const tempBlocks = await new Promise<BlockJSON[]>((resolve, reject) => {
			const blocks: BlockJSON[] = [];
			stream
				.on('data', ({ value }) => {
					blocks.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(blocks);
				});
		});

		return tempBlocks.length === 0;
	}

	public async clearTempBlocks(): Promise<void> {
		const tempBlocks = await this.getTempBlocks();
		if (tempBlocks.length === 0) {
			return;
		}
		const batch = this._db.batch();
		for (const temp of tempBlocks) {
			batch.del(
				`${DB_KEY_TEMPBLOCK_HEIGHT_BLOCK}:${numberToHexString(temp.height)}`,
			);
		}
		await batch.write();
	}

	public async deleteBlocksWithHeightGreaterThan(
		height: number,
	): Promise<void> {
		const lastBlockHeader = await this.getLastBlockHeader();
		const batchSize = 5000;
		const loops = Math.ceil((lastBlockHeader.height - height + 1) / batchSize);
		const start = height + 1;
		// tslint:disable-next-line no-let
		for (let i = 0; i < loops; i += 1) {
			// Get all the required info
			const startHeight = i * batchSize + start + i;
			const endHeight = startHeight + batchSize - 1;
			const headers = await this.getBlockHeadersByHeightBetween(
				startHeight,
				endHeight,
			);
			const blockIDs = headers.map(header => header.id);
			const transactionIDs = [];
			const batch = this._db.batch();
			for (const blockID of blockIDs) {
				try {
					const ids = await this._db.get(`${DB_KEY_BLOCKID_TXIDS}:${blockID}`);
					transactionIDs.push(...ids);
				} catch (error) {
					if (!error.notFound) {
						throw error;
					}
				}
				batch.del(`${DB_KEY_BLOCKID_BLOCK}:${blockID}`);
				batch.del(`${DB_KEY_BLOCKID_TXIDS}:${blockID}`);
			}
			// tslint:disable-next-line no-let
			for (let j = startHeight; j <= endHeight; j += 1) {
				batch.del(`${DB_KEY_HEIGHT_BLOCKID}:${numberToHexString(j)}`);
			}
			for (const txID of transactionIDs) {
				batch.del(`${DB_KEY_TXID_TX}:${txID}`);
			}
			await batch.write();
		}
	}

	public async isBlockPersisted(blockId: string): Promise<boolean> {
		return this._db.exists(`${DB_KEY_BLOCKID_BLOCK}:${blockId}`);
	}

	/*
		ChainState
	*/
	public async getChainState(key: string): Promise<string | undefined> {
		const fullKey = `${DB_KEY_CHAIN_STATE}:${key}`;
		try {
			const value = await this._db.get(fullKey);

			return value;
		} catch (error) {
			if (error.notFound) {
				return undefined;
			}
			throw error;
		}
	}

	/*
		ConsensusState
	*/
	public async getConsensusState(key: string): Promise<string | undefined> {
		const fullKey = `${DB_KEY_CONSENSUS_STATE}:${key}`;
		try {
			const value = await this._db.get(fullKey);

			return value;
		} catch (error) {
			if (error.notFound) {
				return undefined;
			}
			throw error;
		}
	}

	/*
		Accounts
	*/
	public async getAccountsByPublicKey(
		arrayOfPublicKeys: ReadonlyArray<string>,
	): Promise<AccountJSON[]> {
		const addresses = arrayOfPublicKeys.map(getAddressFromPublicKey);

		return this.getAccountsByAddress(addresses);
	}

	public async getAccountByAddress(address: string): Promise<AccountJSON> {
		const account = await this._db.get(`${DB_KEY_ACCOUNT_STATE}:${address}`);

		return account;
	}

	public async getAccountsByAddress(
		arrayOfAddresses: ReadonlyArray<string>,
	): Promise<AccountJSON[]> {
		const accounts = [];
		for (const address of arrayOfAddresses) {
			const account = await this.getAccountByAddress(address);
			accounts.push(account);
		}

		return accounts;
	}

	public async getDelegateAccounts(limit: number): Promise<AccountJSON[]> {
		const key = `${DB_KEY_ACCOUNT_STATE}:`;
		const stream = this._db.createReadStream({
			gte: key,
			lte: getEndPrefix(key),
		});
		const accounts = await new Promise<AccountJSON[]>((resolve, reject) => {
			const accountJSONs: AccountJSON[] = [];
			stream
				.on('data', ({ value }) => {
					const { username } = value as AccountJSON;
					if (username) {
						accountJSONs.push(value);
					}
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(accountJSONs);
				});
		});
		accounts.sort((a, b) => {
			const diff = BigInt(b.voteWeight) - BigInt(a.voteWeight);
			if (diff > BigInt(0)) {
				return 1;
			}
			if (diff < BigInt(0)) {
				return -1;
			}

			if (a.address > b.address) {
				return 1;
			}
			if (a.address < b.address) {
				return -1;
			}

			return 0;
		});

		return accounts.slice(0, limit);
	}

	public async resetAccountMemTables(): Promise<void> {
		const batchSize = 5000;
		while (true) {
			const accountKey = `${DB_KEY_ACCOUNT_STATE}:`;
			const stream = this._db.createReadStream({
				gte: accountKey,
				lte: getEndPrefix(accountKey),
				limit: batchSize,
			});
			const accounts = await new Promise<AccountJSON[]>((resolve, reject) => {
				const accountJSONs: AccountJSON[] = [];
				stream
					.on('data', ({ value }) => {
						accountJSONs.push(value);
					})
					.on('error', error => {
						reject(error);
					})
					.on('end', () => {
						resolve(accountJSONs);
					});
			});
			if (accounts.length === 0) {
				break;
			}
			const batch = this._db.batch();
			for (const account of accounts) {
				batch.del(`${accountKey}${account.address}`);
			}
			await batch.write();
		}
		while (true) {
			const key = `${DB_KEY_CHAIN_STATE}:`;
			const stream = this._db.createReadStream({
				gte: key,
				lte: getEndPrefix(key),
				limit: batchSize,
			});
			const chainStateKeys = await new Promise<string[]>((resolve, reject) => {
				const keys: string[] = [];
				stream
					.on('data', ({ key: chainKey }) => {
						keys.push(chainKey);
					})
					.on('error', error => {
						reject(error);
					})
					.on('end', () => {
						resolve(keys);
					});
			});
			if (chainStateKeys.length === 0) {
				break;
			}
			const batch = this._db.batch();
			for (const chainStateKey of chainStateKeys) {
				batch.del(`${key}${chainStateKey}`);
			}
			await batch.write();
		}
	}

	/*
		Transactions
	*/
	public async getTransactionByID(
		transactionId: string,
	): Promise<TransactionJSON> {
		const transaction = this._db.get(`${DB_KEY_TXID_TX}:${transactionId}`);

		return transaction;
	}
	public async getTransactionsByIDs(
		arrayOfTransactionIds: ReadonlyArray<string>,
	): Promise<TransactionJSON[]> {
		const transactions = [];
		for (const id of arrayOfTransactionIds) {
			const transaction = await this.getTransactionByID(id);
			transactions.push(transaction);
		}

		return transactions;
	}

	public async isTransactionPersisted(transactionId: string): Promise<boolean> {
		const isPersisted = await this._db.exists(
			`${DB_KEY_TXID_TX}:${transactionId}`,
		);

		return isPersisted;
	}

	/*
		Save Block
	*/
	public async saveBlock(
		blockJSON: BlockJSON,
		stateStore: StateStore,
		removeFromTemp: boolean = false,
	): Promise<void> {
		const batch = this._db.batch();
		const { transactions, ...header } = blockJSON;
		batch.put(`${DB_KEY_BLOCKID_BLOCK}:${header.id}`, header);
		batch.put(
			`${DB_KEY_HEIGHT_BLOCKID}:${numberToHexString(header.height)}`,
			header.id,
		);
		if (transactions.length > 0) {
			const ids = [];
			for (const tx of transactions) {
				ids.push(tx.id);
				batch.put(`${DB_KEY_TXID_TX}:${tx.id}`, tx);
			}
			batch.put(`${DB_KEY_BLOCKID_TXIDS}:${header.id}`, ids);
		}
		if (removeFromTemp) {
			batch.del(
				`${DB_KEY_TEMPBLOCK_HEIGHT_BLOCK}:${numberToHexString(
					blockJSON.height,
				)}`,
			);
		}
		stateStore.finalize(batch);
		await batch.write();
	}

	public async deleteBlock(
		blockJSON: BlockJSON,
		stateStore: StateStore,
		saveToTemp: boolean = false,
	): Promise<void> {
		const batch = this._db.batch();
		const { transactions, ...header } = blockJSON;
		batch.del(`${DB_KEY_BLOCKID_BLOCK}:${header.id}`);
		batch.del(`${DB_KEY_HEIGHT_BLOCKID}:${numberToHexString(header.height)}`);
		if (transactions.length > 0) {
			for (const tx of transactions) {
				batch.del(`${DB_KEY_TXID_TX}:${tx.id}`);
			}
			batch.del(`${DB_KEY_BLOCKID_TXIDS}:${header.id}`);
		}
		if (saveToTemp) {
			batch.put(
				`${DB_KEY_TEMPBLOCK_HEIGHT_BLOCK}:${numberToHexString(
					blockJSON.height,
				)}`,
				blockJSON,
			);
		}
		stateStore.finalize(batch);
		await batch.write();
	}
}
