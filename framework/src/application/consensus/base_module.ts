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

import { BaseExecuter } from "./base_executer";

type UpdateValidator = (addresses: string[]) => void;

 interface Executers { readonly [type: string]: BaseExecuter };
 interface Actions { readonly [type: string]: Function };

 export class BaseModule {
     public name(): string {
        return this.constructor.name;
     }

     public executers(): Executers {
         return {};
     }

     public actions(): Actions {
         return {};
     }

    public events(): ReadonlyArray<string> {
        return [];
     }

     public async beforeTransactionExecute(transaction: any, stateStore: any): Promise<void> {};

     public async afterTransactionExecute(transaction: any, stateStore: any): Promise<void> {};

     public async beforeExecute(block: any, stateStore: any): Promise<void> {};

     public async afterExecute(block: any, stateStore: any, updateValidator: UpdateValidator): Promise<void> {};
 }