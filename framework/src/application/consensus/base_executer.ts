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

 export class BaseExecuter {
     public name(): string {
         return this.constructor.name;
     }

     public schema(): object {
         return {};
     }

    // eslint-disable-next-line class-methods-use-this
     public validate(asset: Buffer): void {
         return;
     }

    // eslint-disable-next-line class-methods-use-this
     public async execute(asset: Buffer): Promise<void> {
         return;
     };
 }