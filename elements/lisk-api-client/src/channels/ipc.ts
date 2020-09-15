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
// eslint-disable-next-line
/// <reference path="../../external_types/pm2-axon/index.d.ts" />
// eslint-disable-next-line
/// <reference path="../../external_types/pm2-axon-rpc/index.d.ts" />
import * as path from 'path';
import * as axon from 'pm2-axon';
import { PubSocket, PullSocket, PushSocket, SubSocket, ReqSocket } from 'pm2-axon';
import { Client as RPCClient } from 'pm2-axon-rpc';
import { EventEmitter } from 'events';
import { Channel, EventCallback, EventInfoObject } from '../types';

const CONNECTION_TIME_OUT = 2000;

const getSocketsPath = (dataPath: string) => {
	const socketDir = path.join(dataPath, 'tmp', 'sockets');
	return {
		root: `unix://${socketDir}`,
		pub: `unix://${socketDir}/lisk_pub.sock`,
		sub: `unix://${socketDir}/lisk_sub.sock`,
		rpc: `unix://${socketDir}/bus_rpc_socket.sock`,
	};
};

export class IPCChannel implements Channel {
	private readonly _events: EventEmitter;
	private readonly _rpcClient!: RPCClient;
	private readonly _pubSocket!: PushSocket | PubSocket;
	private readonly _subSocket!: PullSocket | SubSocket;

	private readonly _eventPubSocketPath: string;
	private readonly _eventSubSocketPath: string;
	private readonly _actionRPCConnectingServerSocketPath: string;

	public constructor(dataPath: string) {
		const socketsDir = getSocketsPath(dataPath);

		this._actionRPCConnectingServerSocketPath = socketsDir.rpc;
		this._eventPubSocketPath = `unix://${path.join(socketsDir.root, 'pub_socket.sock')}`;
		this._eventSubSocketPath = `unix://${path.join(socketsDir.root, 'sub_socket.sock')}`;
		this._pubSocket = axon.socket('push', {}) as PushSocket;
		this._subSocket = axon.socket('sub', {}) as SubSocket;
		this._rpcClient = new RPCClient(axon.socket('req') as ReqSocket);
		this._events = new EventEmitter();
	}

	public async connect(): Promise<void> {
		await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(
					new Error('IPC Socket client connection timeout. Please check if IPC server is running.'),
				);
			}, CONNECTION_TIME_OUT);
			this._pubSocket.on('connect', () => {
				clearTimeout(timeout);
				resolve();
			});
			this._pubSocket.on('error', reject);

			// We switched the path here to establish communication
			// The socket on which server is observing clients will publish
			this._pubSocket.connect(this._eventSubSocketPath);
		}).finally(() => {
			this._pubSocket.removeAllListeners('connect');
			this._pubSocket.removeAllListeners('error');
		});

		await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(
					new Error('IPC Socket client connection timeout. Please check if IPC server is running.'),
				);
			}, CONNECTION_TIME_OUT);
			this._subSocket.on('connect', () => {
				clearTimeout(timeout);
				resolve();
			});
			this._subSocket.on('error', reject);

			// We switched the path here to establish communication
			// The socket on which server is publishing clients will observer
			this._subSocket.connect(this._eventPubSocketPath);
		}).finally(() => {
			this._subSocket.removeAllListeners('connect');
			this._subSocket.removeAllListeners('error');
		});

		await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(
					new Error('IPC Socket client connection timeout. Please check if IPC server is running.'),
				);
			}, CONNECTION_TIME_OUT);
			this._rpcClient.sock.on('connect', () => {
				clearTimeout(timeout);
				resolve();
			});
			this._rpcClient.sock.on('error', reject);

			this._rpcClient.sock.connect(this._actionRPCConnectingServerSocketPath);
		}).finally(() => {
			this._rpcClient.sock.removeAllListeners('connect');
			this._rpcClient.sock.removeAllListeners('error');
		});

		this._subSocket.on('message', (eventName: string, eventData: EventInfoObject) => {
			this._events.emit(eventName, eventData);
		});
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async disconnect(): Promise<void> {
		this._subSocket.removeAllListeners();
		this._pubSocket.close();
		this._subSocket.close();
		this._rpcClient.sock.close();
	}

	public async invoke<T>(actionName: string, params?: Record<string, unknown>): Promise<T> {
		const [moduleName, funcName] = actionName.split(':');
		const action = {
			name: funcName,
			module: moduleName,
			source: 'IPCClient',
			params: params ?? {},
		};
		return new Promise((resolve, reject) => {
			this._rpcClient.call('invoke', action, (err: Error | undefined, data: T | PromiseLike<T>) => {
				if (err) {
					return reject(err);
				}

				return resolve(data);
			});
		});
	}

	public subscribe(eventName: string, cb: EventCallback): void {
		this._events.on(eventName, cb as never);
	}

	public publish(eventName: string, data?: Record<string, unknown>): void {
		const [moduleName, funcName] = eventName.split(':');
		const event = {
			module: moduleName,
			name: funcName,
			data: data ?? {},
		};
		this._pubSocket.send(eventName, event);
	}
}
