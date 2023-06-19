/**
 * Split types
{
  from: "",
  to: "",
},
 */
const replsSplit = [
	{
		from: '{Array|string}',
		to: '{Array} | {string}',
	},
	{
		from: '{ArrayBuffer|SharedArrayBuffer}',
		to: '{ArrayBuffer} | {SharedArrayBuffer}',
	},
	{
		from: '{Buffer|Uint8Array}',
		to: '{Buffer} | {Uint8Array}',
	},
	{
		from: '{Buffer|string}',
		to: '{Buffer} | {string}',
	},
	{
		from: '{boolean|string}',
		to: '{boolean} | {string}',
	},
	{
		from: '{integer|string}',
		to: '{integer} | {string}',
	},
	{
		from: '{integer|undefined}',
		to: '{integer} | {undefined}',
	},
	{
		from: '{Function|undefined}',
		to: '{Function} | {undefined}',
	},
	{
		from: '{Function|Promise}',
		to: '{Function} | {Promise}',
	},
	{
		from: '{number|bigint}',
		to: '{number} | {bigint}',
	},
	{
		from: '{number|null}',
		to: '{number} | {null}',
	},
	{
		from: '{number|string}',
		to: '{number} | {string}',
	},
	{
		from: '{RegExp|Function}',
		to: '{RegExp} | {Function}',
	},
	{
		from: '{RegExp|Function|Object|Error}',
		to: '{RegExp} | {Function} | {Object} | {Error}',
	},
	{
		from: '{stream.Readable|null|undefined}',
		to: '{stream.Readable} | {null} | {undefined}',
	},
	{
		from: '{stream.Writable|null|undefined}',
		to: '{stream.Writable} | {null} | {undefined}',
	},
	{
		from: '{string|Array}',
		to: '{string} | {Array}',
	},
	{
		from: '{string|null}',
		to: '{string} | {null}',
	},
	{
		from: '{string|Buffer|TypedArray|DataView}',
		to:
			'{string} | {Buffer} | {TypedArray} | {DataView}',
	},
	{
		from: '{string|URL}',
		to: '{string} | {URL}',
	},
	{
		from: '{string|integer}',
		to: '{string} | {integer}',
	},
	{
		from: '{string|Buffer}',
		to: '{string} | {Buffer}',
	},
	{
		from: '{string|Buffer|Uint8Array|integer}',
		to:
			'{string} | {Buffer} | {Uint8Array} | {integer}',
	},
	{
		from: '{string\\[\\]|Buffer\\[\\]|fs.Dirent\\[\\]}',
		to:
			'{string\\[\\]} | {Buffer\\[\\]} | {fs.Dirent\\[\\]}',
	},
	{
		from:
			'{string\\[\\]|ArrayBuffer\\[\\]|TypedArray\\[\\]|DataView\\[\\]|Blob\\[\\]}',
		to:
			'{string\\[\\]} | {ArrayBuffer\\[\\]} | {TypedArray\\[\\]} | {DataView\\[\\]} | {Blob\\[\\]}',
	},
	{
		from: '{string|Error}',
		to: '{string} | {Error}',
	},
	{
		from:
			'{string|Buffer|TypedArray|DataView|ArrayBuffer|SharedArrayBuffer}',
		to:
			'{string} | {Buffer} | {TypedArray} | {DataView} | {ArrayBuffer} | {SharedArrayBuffer}',
	},
];

/**
 * Inner links
{
  from: "",
  to: "",
},
 */
const replsInner = [
	{
		from: '{AbortSignal}',
		to: '[`<AbortSignal>`](globals.md#abortsignal)',
	},
	{
		from: '{AsyncResource}',
		to:
			'[`<AsyncResource>`](async_hooks.md#asyncresource)',
	},
	{
		from: '{AsyncHook}',
		to: '`AsyncHook`',
	},
	{
		from: '{Blob}',
		to: '[`<Blob>`](buffer.md#blob)',
	},
	{
		from: '{Blob\\[\\]}',
		to: '[`<Blob[]>`](buffer.md#blob)',
	},
	{
		from: '{Buffer}',
		to: '[`<Buffer>`](buffer.md#buffer)',
	},
	{
		from: '{Буфер}',
		to: '[`<Buffer>`](buffer.md#buffer)',
	},
	{
		from: '{Buffer\\[\\]}',
		to: '[`<Buffer[]>`](buffer.md#buffer)',
	},
	{
		from: '{ChildProcess}',
		to: '`ChildProcess`',
	},
	{
		from: '{errors.Error}',
		to: '[`<errors.Error>`](errors.md#error)',
	},
	{
		from: '{EventEmitter}',
		to: '[`<EventEmitter>`](events.md#eventemitter)',
	},
	{
		from: '{FileHandle}',
		to: '[`<FileHandle>`](fs.md#filehandle)',
	},
	{
		from: '{fs.Dirent}',
		to: '[`<fs.Dirent>`](fs.md#fsdirent)',
	},
	{
		from: '{fs.Dirent\\[\\]}',
		to: '[`<fs.Dirent[]>`](fs.md#fsdirent)',
	},
	{
		from: '{fs.ReadStream}',
		to: '[`<fs.ReadStream>`](fs.md#fsreadstream)',
	},
	{
		from: '{fs.Stats}',
		to: '[`<fs.Stats>`](fs.md#fsstats)',
	},
	{
		from: '{fs.StatFs}',
		to: '[`<fs.StatFs>`](fs.md#fsstatfs)',
	},
	{
		from: '{fs.StatWatcher}',
		to: '[`<fs.StatWatcher>`](fs.md#fsstatwatcher)',
	},
	{
		from: '{fs.FSWatcher}',
		to: '[`<fs.FSWatcher>`](fs.md#fsfswatcher)',
	},
	{
		from: '{fs.WriteStream}',
		to: '[`<fs.WriteStream>`](fs.md#fswritestream)',
	},
	{
		from: '{Handle}',
		to: '`Handle`',
	},
	{
		from: '{net.Socket}',
		to: '[`<net.Socket>`](net.md#netsocket)',
	},
	{
		from: '{Stream}',
		to: '[`<Stream>`](stream.md#stream)',
	},
	{
		from: '{stream.Readable}',
		to:
			'[`<stream.Readable>`](stream.md#streamreadable)',
	},
	{
		from: '{stream.Writable}',
		to:
			'[`<stream.Writable>`](stream.md#streamwritable)',
	},
	{
		from: '{ReadableStream}',
		to:
			'[`<ReadableStream>`](webstreams.md#readablestream)',
	},
	{
		from: '{URL}',
		to: '[`<URL>`](url.md#the-whatwg-url-api)',
	},
];

/**
 * MDN common types
{
  from: "",
  to: "",
},
 */
const replsMDNCommon = [
	{
		from: '{any}',
		to:
			'[`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)',
	},
	{
		from: '{любой}',
		to:
			'[`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)',
	},
	{
		from: '{любое}',
		to:
			'[`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)',
	},
	{
		from: '{boolean}',
		to:
			'[`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)',
	},
	{
		from: '{булево}',
		to:
			'[`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)',
	},
	{
		from: '{integer}',
		to:
			'[`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)',
	},
	{
		from: '{целое}',
		to:
			'[`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)',
	},
	{
		from: '{целое число}',
		to:
			'[`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)',
	},
	{
		from: '{целое число\\[\\]}',
		to:
			'[`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)',
	},
	{
		from: '{число}',
		to:
			'[`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)',
	},
	{
		from: '{number}',
		to:
			'[`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)',
	},
	{
		from: '{null}',
		to:
			'[`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type)',
	},
	{
		from: '{string}',
		to:
			'[`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)',
	},
	{
		from: '{string\\[\\]}',
		to:
			'[`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)',
	},
	{
		from: '{строка}',
		to:
			'[`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)',
	},
	{
		from: '{undefined}',
		to:
			'[`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)',
	},
];

/**
 * MDN Global Objects
{
  from: "",
  to: "",
},
 */
const replsMDNGlobalObjects = [
	{
		from: '{AggregateError}',
		to:
			'[`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)',
	},
	{
		from: '{Массив}',
		to:
			'[`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)',
	},
	{
		from: '{Array}',
		to:
			'[`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)',
	},
	{
		from: '{ArrayBuffer}',
		to:
			'[`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)',
	},
	{
		from: '{ArrayBuffer\\[\\]}',
		to:
			'[`<ArrayBuffer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)',
	},
	{
		from: '{bigint}',
		to:
			'[`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)',
	},
	{
		from: '{DataView}',
		to:
			'[`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)',
	},
	{
		from: '{DataView\\[\\]}',
		to:
			'[`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)',
	},
	{
		from: '{Date}',
		to:
			'[`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)',
	},
	{
		from: '{Дата}',
		to:
			'[`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)',
	},
	{
		from: '{Ошибка}',
		to:
			'[`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)',
	},
	{
		from: '{Error}',
		to:
			'[`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)',
	},
	{
		from: '{Iterable}',
		to:
			'[`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)',
	},
	{
		from: '{Итератор}',
		to:
			'[`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)',
	},
	{
		from: '{Функция}',
		to:
			'[`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)',
	},
	{
		from: '{функция}',
		to:
			'[`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)',
	},
	{
		from: '{Function}',
		to:
			'[`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)',
	},
	{
		from: '{Object}',
		to:
			'[`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)',
	},
	{
		from: '{Объект}',
		to:
			'[`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)',
	},
	{
		from: '{Promise}',
		to:
			'[`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)',
	},
	{
		from: '{обещание}',
		to:
			'[`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)',
	},
	{
		from: '{RegExp}',
		to:
			'[`<RegExp>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp)',
	},
	{
		from: '{SharedArrayBuffer}',
		to:
			'[`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)',
	},
	{
		from: '{TypedArray}',
		to:
			'[`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)',
	},
	{
		from: '{TypedArray\\[\\]}',
		to:
			'[`<TypedArray[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)',
	},
	{
		from: '{Uint8Array}',
		to:
			'[`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)',
	},
	{
		from: '{Uint8Array\\[\\]}',
		to:
			'[`<Uint8Array[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)',
	},
];

/**
 * MDN API
 */
const replsMDNAPI = [
	{
		from: '{ArrayBufferView}',
		to:
			'[`<ArrayBufferView>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)',
	},
	{
		from: '{ArrayBufferView\\[\\]}',
		to:
			'[`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)',
	},
];

/**
 * TC39
 */
const replsTC39 = [
	{
		from: '{AsyncIterable}',
		to:
			'[`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)',
	},
	{
		from: '{AsyncIterator}',
		to:
			'[`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)',
	},
];

const repls = [
	...replsSplit,
	...replsInner,
	...replsMDNCommon,
	...replsMDNGlobalObjects,
	...replsMDNAPI,
	...replsTC39,
];

export default repls;
