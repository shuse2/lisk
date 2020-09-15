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

import { Schema } from '@liskhq/lisk-codec';

export interface EventInfoObject {
	readonly module: string;
	readonly name: string;
	readonly data: Record<string, unknown>;
}
export type EventCallback = (action: EventInfoObject) => void | Promise<void>;

export interface Channel {
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;
	invoke: <T>(actionName: string, params?: Record<string, unknown>) => Promise<T>;
	subscribe: (eventName: string, cb: EventCallback) => void;
	publish: (eventName: string, data?: Record<string, unknown>) => void;
}

export interface RegisteredSchema {
	account: Schema;
	block: Schema;
	blockHeader: Schema;
	blockHeadersAssets: { [version: number]: Schema };
	transaction: Schema;
	transactionsAssets: {
		moduleID: number;
		moduleName: string;
		assetID: number;
		assetName: string;
		schema: Schema;
	}[];
}

export interface NodeInfo {
	networkIdentifier: string;
}

export interface MultiSignatureKeys {
	readonly mandatoryKeys: Buffer[];
	readonly optionalKeys: Buffer[];
	readonly numberOfSignatures: number;
}
