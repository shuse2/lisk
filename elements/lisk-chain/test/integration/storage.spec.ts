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
import * as path from 'path';
import { DB } from '@liskhq/lisk-db';

import { Block } from '../fixtures/block';
import { Storage } from '../../src/data_access/storage';
import { DB_KEY_BLOCKID_BLOCK } from '../../src/data_access/constants';

describe('Storage', () => {
	const dbPath = path.join(__dirname, '../../.coverage/storage_integration');
	let db: DB;
	let storage: Storage;
	let stateStoreMock: { finalize: jest.Mock };

	beforeAll(async () => {
		db = new DB(dbPath);
		stateStoreMock = {
			finalize: jest.fn(),
		};
		await db.clear();
		storage = new Storage(db);
	});

	afterAll(async () => {
		await db.close();
	});

	describe('save block', () => {
		it('should save block with each key properly', async () => {
			const block = Block({ id: '123', height: 1 });
			await storage.saveBlock(block, stateStoreMock as any);
			const fetchedBlock = await db.get(`${DB_KEY_BLOCKID_BLOCK}:${block.id}`);
			expect(fetchedBlock.height).toEqual(1);
		});
	});
});
