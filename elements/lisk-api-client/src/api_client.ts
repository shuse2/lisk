/*
 * Copyright © 2020 Lisk Foundation
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
 *
 */

import { EventCallback, Channel, RegisteredSchema, NodeInfo } from './types';
import { Block } from './block';
import { Transaction } from './transaction';
import { Account } from './account';
import { Node } from './node';

export class APIClient {
	private readonly _channel: Channel;
	private _block!: Block;
	private _transaction!: Transaction;
	private _account!: Account;
	private _node!: Node;

	public constructor(channel: Channel) {
		this._channel = channel;
	}

	public async connect(): Promise<void> {
		await this._channel.connect();
		const registeredSchemas = await this._channel.invoke<RegisteredSchema>('app:getSchema');
		const nodeInfo = await this._channel.invoke<NodeInfo>('app:getNodeInfo');
		this._block = new Block(this._channel, registeredSchemas);
		this._transaction = new Transaction(
			this._channel,
			registeredSchemas,
			Buffer.from(nodeInfo.networkIdentifier, 'hex'),
		);
		this._account = new Account(this._channel, registeredSchemas);
		this._node = new Node(this._channel);
	}

	public async disconnect(): Promise<void> {
		await this._channel.disconnect();
	}

	public get block(): Block {
		return this._block;
	}

	public get transaction(): Transaction {
		return this._transaction;
	}

	public get account(): Account {
		return this._account;
	}

	public get node(): Node {
		return this._node;
	}

	public async invoke<T>(actionName: string, params?: Record<string, unknown>): Promise<T> {
		return this._channel.invoke(actionName, params);
	}

	public subscribe(eventName: string, cb: EventCallback): void {
		this._channel.subscribe(eventName, cb);
	}

	public publish(eventName: string, data?: Record<string, unknown>): void {
		this._channel.publish(eventName, data);
	}
}
