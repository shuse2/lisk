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

'use strict';

const randomstring = require('randomstring');
const stampit = require('stampit');
const faker = require('faker');

const rounds = {};

const Round = stampit({
	props: {
		address: '',
		amount: null,
		delegatePublicKey: '',
		round: null,
	},
	init({ address, amount, delegatePublicKey, round }) {
		this.address =
			address ||
			`${randomstring.generate({ charset: 'numeric', length: 20 })}L`;
		this.amount =
			amount || faker.random.number({ min: 1000, max: 5000 }).toString();
		this.delegatePublicKey =
			delegatePublicKey ||
			randomstring.generate({
				charset: 'hex',
				length: 32,
				capitalization: 'lowercase',
			});
		this.round = round || faker.random.number({ min: 10, max: 500 });
	},
});

// Results from Lisk-Core 0.9.3 (after genesis block insertion)
rounds.delegatesOrderAfterGenesisBlock = [
	'96d08ea966d5d80cbf8a0691c46af9e80954de9e113e5785d931e45bd93de992',
	'ef0e7cda1e3e41b65944f744af8cba62a17a2c60e813120a1f9282d72678ed4a',
	'8ca1170bc9c2838ce35d02dbf61f4c7e1ebbcfd478cb7cf8be2d2fa2395ca5e6',
	'40c82d0e0b4437410371c2d445d7d71248d60b9b94239e2c3a7f3ee2976ef106',
	'87cbb1736fa336953be588ff45690ab18d5314b4c963c38021c746099e7488de',
	'c11b34b4223fa0c4c0944a0711cd3678d033b454f225e1450076a7def12b73b7',
	'80496942d95666e6ef963e656ea7411b02a7c42fd9eaf00bae078be27dd84d43',
	'cd6d181284e2930cb7967146248e4ab93e22c410a10443decf910c0c2363a684',
	'b32d7f0156abffaf1270537576566740ebe57d3bbff546f70d18e7b034417f9c',
	'3bf9cce33a2275c7a33ae6ca46a9428853113fff5bd1d734270218cb4592f4df',
	'd5e1bc9ddf73fc4906c4029ea43b37b3a1d7cadf0ae867dc3d4946fde768f9eb',
	'7351f319155e85ad29b74e3734ab46615522617033041b8b2f9913e35c5dec2f',
	'545293b159c1205b4d6ebe4276fe5edce3a3f8acadfe0f80fdd2221cec003e9d',
	'6ae318cac22391dec6416578bdae9191c91e6b95f0b0533a987874fbc481fce7',
	'18ad592791894e56a1ec9c97606c1dfa876d800aede6aa901bfb3cbd50368ae0',
	'a1f174e8e68de794adc5c33f1ee87ddd770314e673363aa6f9e7068035560925',
	'4f8f89046dbb6e25fa468ba3a9a08d889d3782cc742c7ab3bea179436c5de215',
	'4e1c31c89e3881458e051316941715304d45e879ac036f590b39221be6c01a00',
	'f743a7f5bc8474ccf304fd3d2dc598f852e55344e6bc4eb1ab05a24e9594c365',
	'0ee0074501faea2d48f5fec60672396b6e40e10413e31b28a9b6a2f49fe27830',
	'f0878b21516f76014eaf5b27c9cf272dbf8dde76387c085b2777b6f95de26288',
	'f59b1d36b42d9b40c56b4af6ee8b388a75e7cbc7207c4b0b56340fa8eeb54ac8',
	'1bcf7704efc299d519618de9ddfebc2e3e0e5643e2ac0cb6a60babc08d3afe02',
	'6efe9df36d1b6a93dde7a6ff2f9294c97b4ad454ee089d3f0abc8a94d4aac15e',
	'e94e552fb7bc12a637d4822e4d84459f0408698133e695419d0997be2757f071',
	'c883d355b4ce51e429c42e01a2172c9b5f2e1792c02f42872f335db5fdd00abc',
	'04de7937d1bb0bcb18c4528b76362cbe69c644cab4c0f16bb6544f7a7efc4267',
	'953f89e8f63e8b3f493d6ef89300ab8b40c972cc656b463b0b93df3f13cd9d9e',
	'ad46339369e9bc1cea4982a9ef510dae6d777d8d3ab1cd3893c41dfed71e6d5d',
	'94d62cd2e7249ab0aa19d35002335be7d4d39cc7e3579ae77638a4ef6dd52993',
	'fdaf5bd1e7d4f8ff9cde5de231c0b847c50fbff9e4594981003f795599b1e942',
	'808f95838b8890e4b7141c93a7561fab66d8b5138c12547ab169174486f74466',
	'95f90a8aaec1e29af8e74d2dac1b405439fccad35e56864c9b4eac9c28328cf6',
	'c787166d16653ba9410638dbe48a207e84ab95bc08233849cb4ad93a270ebd56',
	'4663cdac7e5aafd9ad16ac80623241a6325e20745c5d0a3d7602fc29ed0f9c1c',
	'a484a46928b265281c8d19b082325e31c0b620a5ce0ac912cddab1ac1add1f89',
	'25a3d39166ba0f684f2b37431e838e0c3b709e5ebb1633bdc598e1b7c4289d5e',
	'826258377263ad1c1be090083bd254e836d5f2fb8d7f342d5a4fdf7b26012426',
	'd712e2f2df8a442ac63db8e6f35ad45b220598ca15a969dcd22713efcf1347ac',
	'7fe53138101e3a34f3ed22308910692483d32dd3591f31137ff807a1e001a55c',
	'd8685de16147583d1b9f2e06eb43c6af9ba03844df30e20f3cda0b681c14fb05',
	'9f4a7d405744edee89f2567fb8e77c66a94282408a62aaea0c4f0f218f482a1c',
	'f1e3229fd7b141f08be9d34a9c05d8bf08f2584aa5aeeb3b1a6b2cb37a942cae',
	'448da45f2987b245fe088bfd33aa256c490fd3d338fecfd5cac1f54de7406806',
	'8a1f1cf1bed1f8753c78435c7ddffc11e78dbfdd27f413802c06edac5c39d217',
	'918090faee45252139d190e7702322bcc51f9ac4b045d4f311e4feff5241029f',
	'661c42cf98aa87e05f55c2998381f302a5e497a9b0a177bbd22ecb51c88faa10',
	'c0e433c5ba1772242d94e26bed4a013c229046448dd0cf92be76e8bdb080daf4',
	'c8c1404d28e530d5addd3175d45799bb1df725a168e4e234b1de5508ea874d1e',
	'9233ff74671eb04cda1b28b63599b840bd82fb52ddb7b3eca71a7edd126358c2',
	'664660271a533e02f13699d17e6fb2fccd48023685a47fd04b3eea0acf2a9531',
	'a43c558693db3dcfc908fc8b783963e81775194abc8c0aad26336b184f92337e',
	'e312d17c883026ba3527230ec07019bf70e8afa6685f3c9d03d2d07bb999566b',
	'1d4677e06f870449f271f859e299e3514718e4b8498c1bd832daa7843b83d9c5',
	'a8d3a3ec34d22928b55ecf9d8d575e6310538935daf977f5b56bb788c4ac9f6e',
	'54298817e3e5811c9b8e109e48c22787c5401129c0a6ef0307d9e329820709dc',
	'6849973243ff018e920d19afed415d5bfa451e9b21e270c4ea6d9656af1ea1cb',
	'd37730a11ba94342b67ed1df434742473dedc84bc0fb52b3ce893124c5e6a312',
	'd03d85fc12dee4a18ef5524ca7b8c1d5626a4be7347eded082ef9aa7ed892a59',
	'a3ea3205d9a40b1dac695767ade74a9b1b9cab27ccbad59dfab1e3aa0c6d1f27',
	'b8ee8cd5055ac0518fb375b21e2951870a74c911e10e58cc03c2c41271cb4f96',
	'1a020d27baea4fe7b240c10f85ad97fc311399b6d3be76b2cd4564a2481d3676',
	'a44c83e6051f7129c62f9aab54631c70366407573219aafe01fda9fdef88d893',
	'9818ee3947760aeae90e2cca8592a373a44af11f13cc5e2490b9a056598c34c7',
	'a916f32473e9c0fb845d555ee1a62797612a720e8b39d57e17fdb7f5dcfae86a',
	'ef7ac1ce53fef049d26fced7a6a13ba878e2e563f4db03d7dc2059a8ae7b27e2',
	'32a2f261985252022b8c40b5c64f7588aced08c7cc6e48719b66808b313cacc8',
	'e874d533a1513ca5879ae0868bd668a28a7bb22392c9a7cf82277c58f31ca445',
	'e9a9357401162a07de98c9da8f56a745e9bd9cbc58ebd77732f42704c8bdbc79',
	'bd6c57a5fc10dd3d5c304da971f2ddf032736c260a04c8c0122123c8015dea0d',
	'8d8586af8a3dc3d1aaff3abc886e6089ac0ece6274491c0f487a51ffb6c303bd',
	'4d77037232850a4d003ef7984d7c731e4653fe131159b9e6ec7cbdacc0d81bb3',
	'98f88a243d008d23637a8e15e2d4883173bea3e132bf092e0f74903920c2d1eb',
	'141eba3ea56a32dfc4cb192a7909073927beb390dcea1dea736ccf2c6307e426',
	'c29e44a11f866cda5faf164d73d58da628c17c214b177a815cf6205a55af5990',
	'cff0b10a342175f6f6655575d52de9f7d18890ba8250a126a37abe82a65892b8',
	'9a52501583f165b43de7a46ed9aee695e61fc8ecf1178cf7eb784e9b67eebcd8',
	'd2ed6ba11bdf05bee0802555276ede16184ec89ad4cfc22721b5604b951b8bf5',
	'c2005fb5916ce668745780eb1ebcc8c647d87871ab71afe83da6a1359a278146',
	'ceceebf136a369937b6988bdc09e1d01e0cf90a10699259b1a267251af645f78',
	'5d57d76f2f1b28e0f9fcdc5b44841825f042a04d733e99a53ed9544f4e4f09b6',
	'ee30a912ba6160845358ee8fd7b70efead287a04f259855d26f54b7955e5ec3d',
	'426103d878a17824d6aa9327ce08a036cf690efffaa0f8bccfa1f10b1c0b64f2',
	'd7cebf201cbc76d1960723169a864ce0619690d6a71f8251db1d6ba6510404fa',
	'29ed175a2e2dd1d0e4c86c06a9a25d5e5f0a3368cb34ffc9f6f464f79d7decfe',
	'bee5dfc9e2dca043c3fe898199f5acfc510c274d98f463a0660aca0c375242ca',
	'27bac3eec40f65394197a93c93e3e03f427ec04271ec3e45d933b9550c8ab015',
	'46a1fd90a5456842bb7610b5374e71df7753b7767e9d36c54f27faeae429ffcb',
	'91062babc4fd527fa188291ca9f192e7883282ff71fb2a03fac916a6479a48e6',
	'b6a9d09c258b8c466106f322b74fd46bc17dea2cda28ea6dae3079f57f8ad2d2',
	'52f4d4d727d3e8d2b8c587b170c4b3ad969895e2ab22adf21a9d7059b88bce10',
	'4985f0dfcffb7a4bc50165690df46cc64c756e27236badd4f94e2ec9e129ab08',
	'6e5facdb7ff8f63180c964d691adab01789b2cf066a33ee36c2cff5d043306be',
	'6bb5c79dfebc9949968b7ff5244ed8bed0635c77c3ad03561a9fe99a9e6e3e25',
	'33cafc7fd4db2b555e52117b7799b6d8a0df23800ae64faaac1877a444ed1d91',
	'72552906ccedd73fe26ea924350b5fa15dbe5c70e575952733846e86f99ffd8d',
	'6982c3bbe9642de43d3d0c17d2dbfc12fbe5d8f24050570406081a6b31f5aba4',
	'7e6b5381e9d57f3d18365fc0a9190fe369fcbb83a0c8f6ba53d3ea75721942d5',
	'4da26f13cdd734813980366d3875053d5d894193004dbdc0b741dd5a9fa825b1',
	'f986b272cdecc68cc7f6210874fa237c58d658d8db41b260075db5ca4c6f3296',
	'20baf02c9642c2463027396a5ec694418b6243b68a16793fc3f191ab1585aab6',
];

module.exports = {
	Round,
	rounds,
};