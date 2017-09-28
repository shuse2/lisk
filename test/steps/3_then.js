/*
 * LiskHQ/lisky
 * Copyright © 2017 Lisk Foundation
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
import fs from 'fs';
import lisk from 'lisk-js';
import tablify from '../../src/utils/tablify';

export function thenTheLiskInstanceShouldBeALiskJSApiInstance() {
	(this.test.ctx.liskInstance).should.be.instanceOf(lisk.api);
}

export function thenTheResultShouldBeReturned() {
	(this.test.ctx.returnValue).should.equal(this.test.ctx.result);
}

export function thenATableShouldBeLogged() {
	const tableOutput = tablify(this.test.ctx.result).toString();
	(this.test.ctx.vorpal.activeCommand.log.calledWithExactly(tableOutput)).should.be.true();
}

export function thenJSONOutputShouldBeLogged() {
	const jsonOutput = JSON.stringify(this.test.ctx.result);
	(this.test.ctx.vorpal.activeCommand.log.calledWithExactly(jsonOutput)).should.be.true();
}

export function thenTheLiskInstanceShouldSendARequestToTheBlocksGetAPIEndpointWithTheBlockID() {
	const route = 'blocks/get';
	const options = { id: this.test.ctx.blockId };
	(this.test.ctx.liskInstance.sendRequest.calledWithExactly(route, options)).should.be.true();
}

export function thenTheLiskInstanceShouldSendARequestToTheAccountsAPIEndpointWithTheAddress() {
	const route = 'accounts';
	const options = { address: this.test.ctx.address };
	(this.test.ctx.liskInstance.sendRequest.calledWithExactly(route, options)).should.be.true();
}

export function thenTheLiskInstanceShouldSendARequestToTheTransactionsGetAPIEndpointWithTheTransactionID() {
	const route = 'transactions/get';
	const options = { id: this.test.ctx.transactionId };
	(this.test.ctx.liskInstance.sendRequest.calledWithExactly(route, options)).should.be.true();
}

export function thenTheLiskInstanceShouldSendARequestToTheDelegatesGetAPIEndpointWithTheUsername() {
	const route = 'delegates/get';
	const options = { username: this.test.ctx.delegateUsername };
	(this.test.ctx.liskInstance.sendRequest.calledWithExactly(route, options)).should.be.true();
}

export function thenFsReadFileSyncShouldBeCalledWithThePathAndEncoding() {
	(fs.readFileSync.calledWithExactly(this.test.ctx.path, 'utf8')).should.be.true();
}

export function thenJSONParseShouldBeCalledWithTheFileContentsAsAString() {
	(JSON.parse.calledWithExactly(this.test.ctx.fileContents)).should.be.true();
}

export function thenJSONParseShouldBeCalledWithTheFileContentsAsAStringWithoutTheBOM() {
	(JSON.parse.calledWithExactly(this.test.ctx.fileContents.slice(1))).should.be.true();
}

export function thenTheParsedFileContentsShouldBeReturned() {
	(this.test.ctx.returnValue).should.equal(this.test.ctx.parsedFileContents);
}

export function thenJSONStringifyShouldBeCalledWithTheObjectUsingTabIndentation() {
	const tab = '\t';
	(JSON.stringify.calledWithExactly(this.test.ctx.objectToWrite, null, tab)).should.be.true();
}

export function thenFsWriteFileSyncShouldBeCalledWithThePathAndTheStringifiedJSON() {
	(fs.writeFileSync.calledWithExactly(this.test.ctx.path, this.test.ctx.stringifiedObject)).should.be.true();
}

export function thenTheReturnedTableShouldHaveNoHead() {
	(this.test.ctx.returnValue.options).should.have.property('head').eql([]);
}

export function thenTheReturnedTableShouldHaveNoRows() {
	(this.test.ctx.returnValue).should.have.length(0);
}

export function thenTheReturnedTableShouldHaveAHeadWithTheObjectKeys() {
	const keys = Object.keys(this.test.ctx.testObject);
	(this.test.ctx.returnValue.options).should.have.property('head').eql(keys);
}

export function thenTheReturnedTableShouldHaveARowWithTheObjectValues() {
	const values = Object.values(this.test.ctx.testObject);
	(this.test.ctx.returnValue[0]).should.eql(values);
}

export function thenTheReturnedTableShouldHaveAHeadWithTheObjectsKeys() {
	const keys = Object.keys(this.test.ctx.testArray[0]);
	(this.test.ctx.returnValue.options).should.have.property('head').eql(keys);
}

export function thenTheReturnedTableShouldHaveARowForEachObjectWithTheObjectValues() {
	this.test.ctx.testArray.forEach((testObject, i) => {
		const values = Object.values(testObject);
		(this.test.ctx.returnValue[i]).should.eql(values);
	});
}

export function thenTheReturnedTableShouldHaveAHeadWithEveryUniqueKey() {
	const uniqueKeys = this.test.ctx.testArray
		.reduce((keys, testObject) => {
			const newKeys = Object.keys(testObject).filter(key => !keys.includes(key));
			return [...keys, ...newKeys];
		}, []);
	(this.test.ctx.returnValue.options).should.have.property('head').eql(uniqueKeys);
}

export function thenTheReturnedTableShouldHaveARowForEachObjectWithTheObjectsValues() {
	this.test.ctx.testArray.forEach((testObject, i) => {
		const row = this.test.ctx.returnValue[i];
		const values = Object.values(testObject);

		values.forEach(value => (row).should.containEql(value));
		row
			.filter(value => !values.includes(value))
			.forEach(value => should(value).be.undefined());
	});
}
