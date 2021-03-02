import { SchemaWithDefault } from './../../../../elements/lisk-chain/src/utils/account';
/*
 * Copyright © 2021 Lisk Foundation
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
import {
	ActionsDefinition,
	BasePlugin,
	BaseChannel,
	EventsDefinition,
	PluginInfo,
	PluginOptionsWithAppConfig,
} from 'lisk-framework';
import * as defaults from './defaults';
// eslint-disable-next-line
const packageJSON = require('../../package.json');

export interface FaucetPluginOptions extends PluginOptionsWithAppConfig {
	encryptedPassphrase: string;
	applicationUrl: string;
	fee: string;
	token: string;
	tokenPrefix: string;
	logoURL?: string;
	captcha?: Record<string, unknown>;
}

export class FaucetPlugin extends BasePlugin<FaucetPluginOptions> {
	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public static get alias(): string {
		return 'faucet';
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public static get info(): PluginInfo {
		return {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			author: packageJSON.author,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			version: packageJSON.version,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			name: packageJSON.name,
		};
	}

	// eslint-disable-next-line class-methods-use-this
	public get defaults(): SchemaWithDefault {
		return defaults.config;
	}

	// eslint-disable-next-line class-methods-use-this
	public get events(): EventsDefinition {
		return [];
	}

	// eslint-disable-next-line class-methods-use-this
	public get actions(): ActionsDefinition {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this, @typescript-eslint/no-empty-function
	public async load(_channel: BaseChannel): Promise<void> {}

	// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
	public async unload(): Promise<void> {}
}
