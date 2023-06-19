import { parse } from '@textlint/markdown-to-ast';
import { readFileSync, writeFileSync } from 'fs';
// eslint-disable-next-line import/extensions
import repls from './repls_data.mjs';

const inputPath = process.argv[2];
const markdown = readFileSync(inputPath, 'utf8');

const ast = parse(markdown);

// какие блоки парсим
const replTypes = [
	'Paragraph',
	'BlockQuote',
	'Header',
	'List',
	'Table',
];

let result = '';

ast.children.forEach((child, index) => {
	if (replTypes.includes(child.type)) {
		let tmpResult = child.raw;
		repls.forEach((repl) => {
			tmpResult = tmpResult.replaceAll(
				repl.from,
				repl.to
			);
		});
		result += `${tmpResult}\n\n`;
	} else {
		result += `${child.raw}\n\n`;
	}
	// eslint-disable-next-line no-console
	console.log(
		`${index + 1}/${ast.children.length} replaced`
	);
});

writeFileSync(inputPath, result, 'utf8');
// eslint-disable-next-line no-console
console.log(`===========================`);
