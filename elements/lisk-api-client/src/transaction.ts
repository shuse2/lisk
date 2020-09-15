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
/* eslint-disable no-param-reassign */
import { signTransaction, signMultiSignatureTransaction } from '@liskhq/lisk-transactions';
import { getAddressAndPublicKeyFromPassphrase } from '@liskhq/lisk-cryptography';
import { Channel, RegisteredSchema, MultiSignatureKeys } from './types';
import {
	decodeTransaction,
	encodeTransaction,
	getTransactionAssetSchema,
	decodeAccount,
} from './codec';

export interface CreateTransactionOptions {
	nonce?: bigint;
	includeSenderSignature?: boolean;
	multisignatureKeys?: MultiSignatureKeys;
}

type CreateFunction = (
	input: Record<string, unknown>,
	passphrase: string,
	options?: CreateTransactionOptions,
) => Promise<Record<string, unknown>>;

const createFunction = (
	channel: Channel,
	registeredSchema: RegisteredSchema,
	networkIdentifier: Buffer,
): CreateFunction => async (
	input: Record<string, unknown>,
	passphrase: string,
	options?: CreateTransactionOptions,
) => {
	const { publicKey, address } = getAddressAndPublicKeyFromPassphrase(passphrase);
	const accountHex = await channel.invoke<string>('app:getAccountByAddress', {
		address: address.toString('hex'),
	});
	const account = decodeAccount(Buffer.from(accountHex, 'hex'), registeredSchema);
	if (!options?.nonce && !input.nonce) {
		if (
			typeof account.sequence !== 'object' ||
			!(account.sequence as Record<string, unknown>).nonce
		) {
			throw new Error('Unspported account type.');
		}
		input.nonce = (account.sequence as { nonce: bigint }).nonce;
	}
	if (!input.senderPublicKey) {
		input.senderPublicKey = publicKey;
	}
	const assetSchema = getTransactionAssetSchema(input, registeredSchema);
	if (account.keys && (account.keys as MultiSignatureKeys).numberOfSignatures > 0) {
		return signMultiSignatureTransaction(
			assetSchema,
			input,
			networkIdentifier,
			passphrase,
			account.keys as MultiSignatureKeys,
			options?.includeSenderSignature,
		);
	}
	if (options?.multisignatureKeys) {
		return signMultiSignatureTransaction(
			assetSchema,
			input,
			networkIdentifier,
			passphrase,
			options.multisignatureKeys,
			options?.includeSenderSignature,
		);
	}
	return signTransaction(assetSchema, input, networkIdentifier, passphrase);
};

export class Transaction {
	public create: { [moduleName: string]: { [assetName: string]: CreateFunction } };

	private readonly _channel: Channel;
	private readonly _schema: RegisteredSchema;
	private readonly _networkIdentifier: Buffer;

	public constructor(
		channel: Channel,
		registeredSchema: RegisteredSchema,
		networkIdentifier: Buffer,
	) {
		this._channel = channel;
		this._schema = registeredSchema;
		this._networkIdentifier = networkIdentifier;
		this.create = {};
		for (const assetSchema of this._schema.transactionsAssets) {
			if (!this.create[assetSchema.moduleName]) {
				this.create[assetSchema.moduleName] = {};
			}
			this.create[assetSchema.moduleName][assetSchema.assetName] = createFunction(
				this._channel,
				this._schema,
				this._networkIdentifier,
			).bind(this);
		}
	}

	public async get(id: string): Promise<Record<string, unknown>> {
		const transactionHex = await this._channel.invoke<string>('app:getBlockByID', { id });
		return decodeTransaction(Buffer.from(transactionHex, 'hex'), this._schema);
	}

	public async getByHeight(height: number): Promise<Record<string, unknown>> {
		const transactionHex = await this._channel.invoke<string>('app:getBlockByHeight', { height });
		return decodeTransaction(Buffer.from(transactionHex, 'hex'), this._schema);
	}

	public sign(
		transaction: Record<string, unknown>,
		passphrases: string[],
	): Record<string, unknown> {
		const assetSchema = getTransactionAssetSchema(transaction, this._schema);
		return signTransaction(assetSchema, transaction, this._networkIdentifier, passphrases[0]);
	}

	public async send(transaction: Record<string, unknown>): Promise<void> {
		const encodedTx = encodeTransaction(transaction, this._schema);
		return this._channel.invoke('app:postTransaction', { transaction: encodedTx.toString('hex') });
	}

	public decode(transaction: Buffer): Record<string, unknown> {
		return decodeTransaction(transaction, this._schema);
	}

	public encode(transaction: Record<string, unknown>): Buffer {
		return encodeTransaction(transaction, this._schema);
	}
}
