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
import { Channel, RegisteredSchema } from './types';
import { decodeBlock } from './codec';

export class Block {
	private readonly _channel: Channel;
	private readonly _schema: RegisteredSchema;

	public constructor(channel: Channel, registeredSchema: RegisteredSchema) {
		this._channel = channel;
		this._schema = registeredSchema;
	}

	public async get(id: string): Promise<Record<string, unknown>> {
		const blockHex = await this._channel.invoke<string>('app:getBlockByID', { id });
		return decodeBlock(Buffer.from(blockHex, 'hex'), this._schema);
	}

	public async getByHeight(height: number): Promise<Record<string, unknown>> {
		const blockHex = await this._channel.invoke<string>('app:getBlockByHeight', { height });
		return decodeBlock(Buffer.from(blockHex, 'hex'), this._schema);
	}
}
