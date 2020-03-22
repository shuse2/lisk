import { debug } from 'debug';
import EncodingDown from 'encoding-down';
// tslint:disable-next-line match-default-export-name
import levelup, { LevelUp } from 'levelup';
import RocksDB from 'rocksdb';

const logger = debug('db');

// tslint:disable-next-line no-any
export interface BatchChain<K = any, V = any> {
	// tslint:disable-next-line no-any
	put(key: K, value: V): this;
	del(key: K): this;
	clear(): this;
	write(): Promise<this>;
	// tslint:disable-next-line no-mixed-interface
	readonly length: number;
}

export interface ReadStreamOption {
	// tslint:disable-next-line no-any
	readonly gt?: any;
	// tslint:disable-next-line no-any
	readonly gte?: any;
	// tslint:disable-next-line no-any
	readonly lt?: any;
	// tslint:disable-next-line no-any
	readonly lte?: any;
	readonly reverse?: boolean;
	readonly limit?: number;
	readonly keys?: boolean;
	readonly values?: boolean;
}

export class DB {
	private readonly _db: LevelUp<RocksDB>;

	public constructor(file: string) {
		logger('opening file', { file });
		this._db = levelup(EncodingDown(RocksDB(file), { valueEncoding: 'json' }));
	}

	public async close(): Promise<void> {
		return this._db.close();
	}

	// tslint:disable-next-line no-any
	public async get(rawKey: string | number): Promise<any> {
		const key = typeof rawKey === 'number' ? rawKey.toString() : rawKey;
		logger('get', { key });

		return this._db.get(key);
	}

	// tslint:disable-next-line no-any
	public async exists(rawKey: string | number): Promise<boolean> {
		const key = typeof rawKey === 'number' ? rawKey.toString() : rawKey;
		try {
			logger('exists', { key });
			await this._db.get(key);

			return true;
		} catch (error) {
			if (error.notFound) {
				return false;
			}
			throw error;
		}
	}

	// tslint:disable-next-line no-any
	public async put(key: string, val: any): Promise<void> {
		logger('put', { key });

		return this._db.put(key, val);
	}

	public async del(key: string): Promise<void> {
		logger('del', { key });

		return this._db.del(key);
	}

	public createReadStream(options?: ReadStreamOption): NodeJS.ReadableStream {
		logger('readStream', { options });

		return this._db.createReadStream(options);
	}

	public batch(): BatchChain {
		return this._db.batch();
	}
}
