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
 */

 import { StateStore } from '@liskhq/lisk-chain';

type BeforeExecHandler = (block: any, stateStore: StateStore) => Promise<void>;
type AfterExecHandler = (block: any, stateStore: StateStore) => Promise<void>;

export class Consensus {
    private readonly _beforeExec: BeforeExecHandler[] = [];

    private readonly _afterExec: AfterExecHandler[] = [];

    public async start(): Promise<void> {
    }

    public async stop(): Promise<void> {
    }

    // eslint-disable-next-line class-methods-use-this
    public actions(): Actions {
        return {};
    }

    // eslint-disable-next-line class-methods-use-this
    public events(): ReadonlyArray<string> {
        return [];
    }

    public updateValidator(string[]) {
    }

    public regiserModule(m: any): void {
        this._beforeExec.push(m.beforeExecute);
        this._afterExec.push(m.afterExecute);
    }
}