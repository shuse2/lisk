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

import { BatchChain } from '@liskhq/lisk-db';
import { DataAccess } from '../data_access';
import { BlockHeader, StateDiff } from '../types';
import { DB_KEY_CHAIN_STATE } from '../data_access/constants';
import { calculateDiffTemp } from '../diff';

interface AdditionalInformation {
	readonly lastBlockHeader: BlockHeader;
	readonly networkIdentifier: Buffer;
	readonly lastBlockReward: bigint;
}

interface KeyValuePair {
	[key: string]: Buffer | undefined;
}

export class ChainStateStore {
	private readonly _name = 'ChainState';
	private _data: KeyValuePair;
	private _originalData: KeyValuePair;
	private _updatedKeys: Set<string>;
	private _originalUpdatedKeys: Set<string>;
	private readonly _dataAccess: DataAccess;
	private readonly _lastBlockHeader: BlockHeader;
	private readonly _networkIdentifier: Buffer;
	private readonly _lastBlockReward: bigint;
	private readonly _initialValue: KeyValuePair;

	public constructor(
		dataAccess: DataAccess,
		additionalInformation: AdditionalInformation,
	) {
		this._dataAccess = dataAccess;
		this._lastBlockHeader = additionalInformation.lastBlockHeader;
		this._networkIdentifier = additionalInformation.networkIdentifier;
		this._lastBlockReward = additionalInformation.lastBlockReward;
		this._data = {};
		this._originalData = {};
		this._initialValue = {};
		this._updatedKeys = new Set();
		this._originalUpdatedKeys = new Set();
	}

	public get networkIdentifier(): Buffer {
		return this._networkIdentifier;
	}

	public get lastBlockHeader(): BlockHeader {
		return this._lastBlockHeader;
	}

	public get lastBlockReward(): bigint {
		return this._lastBlockReward;
	}

	public createSnapshot(): void {
		this._originalData = { ...this._data };
		this._originalUpdatedKeys = new Set(this._updatedKeys);
	}

	public restoreSnapshot(): void {
		this._data = { ...this._originalData };
		this._updatedKeys = new Set(this._originalUpdatedKeys);
	}

	public async get(key: string): Promise<Buffer | undefined> {
		const value = this._data[key];

		if (value) {
			return value;
		}

		const dbValue = await this._dataAccess.getChainState(key);
		// If it doesn't exist in the database, return undefined without caching
		if (dbValue === undefined) {
			return dbValue;
		}
		this._initialValue[key] = dbValue;
		this._data[key] = dbValue;

		return this._data[key];
	}

	public getOrDefault(): void {
		throw new Error(`getOrDefault cannot be called for ${this._name}`);
	}

	public find(): void {
		throw new Error(`getOrDefault cannot be called for ${this._name}`);
	}

	public set(key: string, value: Buffer): void {
		this._data[key] = value;
		this._updatedKeys.add(key);
	}

	public finalize(batch: BatchChain): StateDiff {
		const stateDiff = { updated: [], created: [] } as StateDiff;

		if (this._updatedKeys.size === 0) {
			return stateDiff;
		}

		for (const key of Array.from(this._updatedKeys)) {
			const dbKey = `${DB_KEY_CHAIN_STATE}:${key}`;
			const updatedValue = this._data[key] as Buffer;
			batch.put(dbKey, updatedValue);

			if (this._initialValue.length) {
				const diff = calculateDiffTemp(
					this._initialValue[key] as Buffer,
					updatedValue,
				);
				stateDiff.updated.push({
					key: dbKey,
					value: diff,
				});
			} else {
				stateDiff.created.push(dbKey);
			}
		}

		return stateDiff;
	}
}
