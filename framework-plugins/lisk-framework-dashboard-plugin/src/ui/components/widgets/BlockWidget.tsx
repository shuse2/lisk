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
import * as React from 'react';
import { Block } from '../../types';
import CopiableText from '../CopiableText';
import { Table, TableBody, TableHeader } from '../Table';
import Text from '../Text';
import { Widget, WidgetBody, WidgetHeader } from '../widget';
import styles from './BlockWidget.module.scss';

interface WidgetProps {
	blocks: Block[];
	title: string;
}

const BlockWidget: React.FC<WidgetProps> = props => {
	const { blocks, title } = props;

	return (
		<Widget>
			<WidgetHeader>
				<Text type={'h2'}>{title}</Text>
			</WidgetHeader>
			<WidgetBody>
				<Table>
					<TableHeader sticky>
						<tr>
							<th className={styles.headerID}>
								<Text>Id</Text>
							</th>
							<th className={styles.headerGenerator}>
								<Text>Generated by</Text>
							</th>
							<th className={styles.headerHeight}>
								<Text>Height</Text>
							</th>
							<th className={styles.headerTxs}>
								<Text>Txs</Text>
							</th>
						</tr>
					</TableHeader>
					<TableBody>
						{blocks.map(block => (
							<tr key={block.header.height}>
								<td>
									<CopiableText text={block.header.id}>{block.header.id}</CopiableText>
								</td>
								<td>
									<CopiableText text={block.header.generatorPublicKey}>
										{block.header.generatorPublicKey}
									</CopiableText>
								</td>
								<td>
									<Text key={block.header.height}>{block.header.height}</Text>
								</td>
								<td>
									<Text key={block.payload.length}>{block.payload.length}</Text>
								</td>
							</tr>
						))}
					</TableBody>
				</Table>
			</WidgetBody>
		</Widget>
	);
};

export default BlockWidget;
