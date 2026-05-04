import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

// Processes an uploaded product image: validates minimum size, saves the original,
// and generates three square WebP variants (thumb/medium/large) from it.
export async function processProductImage(
	buffer: Buffer,
	originalExt: string,
	productId: string,
): Promise<{ uuid: string; basePath: string }> {
	let metadata: sharp.Metadata;
	try {
		metadata = await sharp(buffer).metadata();
	} catch {
		throw new Error('El archivo no es una imagen válida o está dañado.');
	}

	const { width, height } = metadata;
	if (!width || !height || width < 1200 || height < 1200) {
		throw new Error('La imagen es demasiado pequeña. Mínimo 1200×1200 píxeles.');
	}

	const uuid = crypto.randomUUID();
	const dir = join('static', 'uploads', 'products', productId);
	await mkdir(dir, { recursive: true });

	// Preserve original so future size/format changes can reprocess without re-upload
	await writeFile(join(dir, `${uuid}-original.${originalExt}`), buffer);

	await sharp(buffer)
		.resize({ width: 400, height: 400, fit: 'cover', position: 'centre' })
		.webp({ quality: 80 })
		.toFile(join(dir, `${uuid}-thumb.webp`));

	await sharp(buffer)
		.resize({ width: 800, height: 800, fit: 'cover', position: 'centre' })
		.webp({ quality: 85 })
		.toFile(join(dir, `${uuid}-medium.webp`));

	await sharp(buffer)
		.resize({ width: 1600, height: 1600, fit: 'cover', position: 'centre' })
		.webp({ quality: 85 })
		.toFile(join(dir, `${uuid}-large.webp`));

	const basePath = `/uploads/products/${productId}/${uuid}`;
	return { uuid, basePath };
}
