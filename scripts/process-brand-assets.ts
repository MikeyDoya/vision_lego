import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '_brand_source');
const BRAND_OUT = path.join(ROOT, 'static', 'brand');
const STATIC_OUT = path.join(ROOT, 'static');

const SOURCES = {
	logoDark: 'sin_fondo_logo_Mesa_de_trabajo_1.png',
	logoLight: 'sin_fondo_logo-08.png',
	logoOrange: 'sin_fondo_logo-05.png',
	profilePhoto: 'Foto_de_perfil.jpg',
} as const;

interface OutputRecord {
	file: string;
	width: number;
	height: number;
	sizeKb: number;
}

const written: OutputRecord[] = [];

async function record(file: string): Promise<void> {
	const meta = await sharp(file).metadata();
	const s = await stat(file);
	written.push({
		file: path.relative(ROOT, file),
		width: meta.width ?? 0,
		height: meta.height ?? 0,
		sizeKb: s.size / 1024,
	});
}

// --- verify source files ---
function verifySources(): void {
	const missing: string[] = [];
	for (const [key, name] of Object.entries(SOURCES)) {
		const full = path.join(SRC, name);
		if (!existsSync(full)) missing.push(`  ${key}: ${full}`);
	}
	if (missing.length) {
		console.error('ERROR: Missing source files:\n' + missing.join('\n'));
		process.exit(1);
	}
}

// --- logo variants (3 widths, WebP, transparent) ---
async function processLogo(srcName: string, prefix: string): Promise<void> {
	const src = path.join(SRC, srcName);
	const widths: [number, number][] = [
		[240, 90],
		[480, 90],
		[720, 88],
	];
	for (const [width, quality] of widths) {
		const out = path.join(BRAND_OUT, `${prefix}-${width}.webp`);
		await sharp(src)
			.resize({ width, fit: 'inside', withoutEnlargement: true })
			.webp({ quality, alphaQuality: 90 })
			.toFile(out);
		await record(out);
	}
}

// --- favicon PNGs ---
async function processFavicons(): Promise<void> {
	const src = path.join(SRC, SOURCES.profilePhoto);

	const sizes: [string, number][] = [
		['favicon-16.png', 16],
		['favicon-32.png', 32],
		['favicon-48.png', 48],
		['favicon-192.png', 192],
		['favicon-512.png', 512],
		['apple-touch-icon.png', 180],
	];

	for (const [name, size] of sizes) {
		const out = path.join(STATIC_OUT, name);
		await sharp(src).resize(size, size).png().toFile(out);
		await record(out);
	}
}

// --- og-image 1200×630 ---
async function processOgImage(): Promise<void> {
	const src = path.join(SRC, SOURCES.profilePhoto);
	const out = path.join(STATIC_OUT, 'og-image.png');

	// resize source to fit inside 600×600, then composite onto 1200×630 black canvas
	const resizedBuffer = await sharp(src)
		.resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
		.toBuffer();

	await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
		.composite([{ input: resizedBuffer, gravity: 'center' }])
		.png()
		.toFile(out);

	await record(out);
}

// --- print summary ---
async function printSummary(): Promise<void> {
	const colFile = Math.max(50, ...written.map((r) => r.file.length));
	const header = `${'File'.padEnd(colFile)}  ${'Dimensions'.padEnd(14)}  ${'Size (KB)'.padStart(9)}`;
	const sep = '-'.repeat(header.length);

	console.log('\n' + sep);
	console.log(header);
	console.log(sep);
	for (const r of written) {
		const dims = `${r.width}×${r.height}`;
		console.log(`${r.file.padEnd(colFile)}  ${dims.padEnd(14)}  ${r.sizeKb.toFixed(1).padStart(9)}`);
	}
	console.log(sep);
	console.log(`\nTotal files written: ${written.length}`);

	const totalKb = written.reduce((acc, r) => acc + r.sizeKb, 0);
	console.log(`Total size: ${(totalKb / 1024).toFixed(2)} MB (${totalKb.toFixed(1)} KB)\n`);
}

async function main(): Promise<void> {
	console.log('Verifying source files…');
	verifySources();
	console.log('All 4 source files found.\n');

	console.log('Creating output directories…');
	await mkdir(BRAND_OUT, { recursive: true });

	console.log('Processing logo-dark (3 widths)…');
	await processLogo(SOURCES.logoDark, 'logo-dark');

	console.log('Processing logo-light (3 widths)…');
	await processLogo(SOURCES.logoLight, 'logo-light');

	console.log('Processing logo-orange — reserve (3 widths)…');
	await processLogo(SOURCES.logoOrange, 'logo-orange');

	console.log('Processing favicon PNG family…');
	await processFavicons();

	console.log('Processing og-image…');
	await processOgImage();

	await printSummary();
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
