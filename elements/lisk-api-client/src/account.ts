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
import { codec } from '@liskhq/lisk-codec';
import { Channel, RegisteredSchema } from './types';

export class Account {
	private readonly _channel: Channel;
	private readonly _schema: RegisteredSchema;

	public constructor(channel: Channel, registeredSchema: RegisteredSchema) {
		this._channel = channel;
		this._schema = registeredSchema;
	}

	public async get(address: string): Promise<Record<string, unknown>> {
		const accountHex = await this._channel.invoke<string>('app:getAccountByAddress', { address });
		return codec.decode(this._schema.account, Buffer.from(accountHex, 'hex'));
	}
}
