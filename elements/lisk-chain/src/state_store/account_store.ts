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
// tslint:disable-next-line no-require-imports
import cloneDeep = require('lodash.clonedeep');
// tslint:disable-next-line no-require-imports
import isEqual = require('lodash.isequal');

import { Account } from '../account';
import { DataAccess } from '../data_access';
import { DB_KEY_ACCOUNT_STATE } from '../data_access/constants';
import { BatchChain } from '../types';

export class AccountStore {
	private readonly _dataAccess: DataAccess;
	private _data: Account[];
	private _originalData: Account[];
	private _updatedKeys: { [key: number]: string[] } = {};
	private _originalUpdatedKeys: { [key: number]: string[] } = {};
	private readonly _primaryKey = 'address';
	private readonly _name = 'Account';

	public constructor(dataAccess: DataAccess) {
		this._dataAccess = dataAccess;
		this._data = [];
		this._updatedKeys = {};
		this._primaryKey = 'address';
		this._name = 'Account';
		this._originalData = [];
		this._originalUpdatedKeys = {};
	}

	public createSnapshot(): void {
		this._originalData = cloneDeep(this._data);
		this._updatedKeys = cloneDeep(this._updatedKeys);
	}

	public restoreSnapshot(): void {
		this._data = this._originalData;
		this._updatedKeys = this._originalUpdatedKeys;
		this._originalData = [];
		this._originalUpdatedKeys = {};
	}

	public async get(primaryValue: string): Promise<Account> {
		// Account was cached previously so we can return it from memory
		const element = this._data.find(
			item => item[this._primaryKey] === primaryValue,
		);

		if (element) {
			return new Account(element.toJSON());
		}

		// Account was not cached previously so we try to fetch it from db
		const elementFromDB = await this._dataAccess.getAccountByAddress(
			primaryValue,
		);

		if (elementFromDB) {
			this._data.push(elementFromDB);

			return new Account(elementFromDB.toJSON());
		}

		// Account does not exist we can not continue
		throw new Error(
			`${this._name} with ${this._primaryKey} = ${primaryValue} does not exist`,
		);
	}

	public async getOrDefault(primaryValue: string): Promise<Account> {
		// Account was cached previously so we can return it from memory
		const element = this._data.find(
			item => item[this._primaryKey] === primaryValue,
		);
		if (element) {
			return new Account(element.toJSON());
		}

		// Account was not cached previously so we try to fetch it from db (example delegate account is voted)
		// tslint:disable-next-line no-null-keyword
		const elementFromDB = await this._dataAccess.getAccountByAddress(
			primaryValue,
		);

		if (elementFromDB) {
			this._data.push(elementFromDB);

			return new Account(elementFromDB.toJSON());
		}

		const defaultElement: Account = Account.getDefaultAccount(primaryValue);

		const newElementIndex = this._data.push(defaultElement) - 1;
		this._updatedKeys[newElementIndex] = Object.keys(defaultElement);

		return new Account(defaultElement.toJSON());
	}

	public getUpdated(): ReadonlyArray<Account> {
		return [...this._data];
	}

	public find(
		fn: (value: Account, index: number, obj: Account[]) => unknown,
	): Account | undefined {
		const foundAccount = this._data.find(fn);
		if (!foundAccount) {
			return undefined;
		}

		return new Account(foundAccount.toJSON());
	}

	public set(primaryValue: string, updatedElement: Account): void {
		const elementIndex = this._data.findIndex(
			item => item[this._primaryKey] === primaryValue,
		);

		if (elementIndex === -1) {
			throw new Error(
				`${this._name} with ${this._primaryKey} = ${primaryValue} does not exist`,
			);
		}

		const updatedKeys = Object.entries(updatedElement).reduce(
			(existingUpdatedKeys, [key, value]) => {
				const account = this._data[elementIndex];
				// tslint:disable-next-line:no-any
				if (!isEqual(value, (account as any)[key])) {
					existingUpdatedKeys.push(key);
				}

				return existingUpdatedKeys;
			},
			[] as string[],
		);

		this._data[elementIndex] = updatedElement;
		this._updatedKeys[elementIndex] = this._updatedKeys[elementIndex]
			? [...new Set([...this._updatedKeys[elementIndex], ...updatedKeys])]
			: updatedKeys;
	}

	public finalize(batch: BatchChain): void {
		for (const account of this._data) {
			batch.put(`${DB_KEY_ACCOUNT_STATE}:${account.address}`, account.toJSON());
		}
	}
}
