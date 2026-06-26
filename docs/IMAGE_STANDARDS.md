# Image Standards — Visión Lego

## Why a pipeline

The droplet is a single-core, 1 GB RAM machine serving customers on Colombian mobile networks.
A raw 3024×3024 iPhone photo weighs 2–4 MB. Serving that on every catalog grid request would
saturate the connection and make the store unusable on mobile. Instead, each upload is processed
once on the server into three pre-sized WebP variants. The browser receives exactly what it needs
for the current viewport — nothing more.

Secondary motivation: WebP at the target quality settings produces files 30–50% smaller than
JPEG at equivalent visual quality, with native support across all modern browsers.

---

## Source image requirements

| Property | Requirement |
|---|---|
| Formats accepted | JPG, JPEG, PNG, WebP |
| Minimum dimensions | 1200 × 1200 px |
| Expected dimensions | 3024 × 3024 px (iPhone Square mode) |
| Maximum file size | 5 MB per file |
| Aspect ratio | Square (1:1) preferred; non-square is auto-cropped |

Images below 1200 × 1200 px are rejected at upload time with a Spanish error message:
> "La imagen es demasiado pequeña. Mínimo 1200×1200 píxeles."

Corrupt or unreadable files are rejected with:
> "El archivo no es una imagen válida o está dañado."

---

## Client-side crop before upload

Owners crop each image to a 1:1 frame in a modal at `/negocio/productos/[id]` before
upload begins. The cropper enforces:

- Square aspect ratio (locked)
- Minimum 1200×1200 px source (validated client-side via `createImageBitmap`; rejected before the cropper opens)
- Maximum zoom: 100% of original (no upscaling)
- Output: 1600×1600 WebP at quality 0.92, sent to the server as one Blob per image

The server pipeline (`processProductImage`) still runs on the cropped output — it
generates the thumb/medium/large variants from the 1600×1600 source. The 1200 px
minimum check in `processProductImage` remains as a defense-in-depth guarantee
(always passes for client-cropped uploads, but catches direct API calls or future
upload paths that bypass the cropper).

**Component**: `src/lib/components/ui/ImageCropper.svelte` — wraps cropperjs v1.6.x.
Uses a Svelte attachment (`{@attach initCropper}`) for third-party DOM initialization.

---

## Processed outputs

Each upload generates four files on disk. They share a UUID:

| Suffix | Dimensions | Format | Quality | Use |
|---|---|---|---|---|
| `-thumb.webp` | 400 × 400 | WebP | 80 | Catalog grid, cart, wishlist, order lines |
| `-medium.webp` | 800 × 800 | WebP | 85 | Admin image preview, product detail default |
| `-large.webp` | 1600 × 1600 | WebP | 85 | Product detail zoom / lightbox |
| `-original.<ext>` | native | source format | lossless | Archive for future reprocessing |

All WebP variants are square. If the source is not square (e.g. 2000 × 1500), sharp
center-crops to square before resizing (`fit: 'cover', position: 'centre'`). The original
file retains its native dimensions.

---

## Storage layout

```
static/uploads/products/
└── [productId]/
    ├── [uuid]-original.jpg     ← source upload (unchanged)
    ├── [uuid]-thumb.webp
    ├── [uuid]-medium.webp
    └── [uuid]-large.webp
```

The `productImages.url` column in the database stores the **base path without extension**:

```
/uploads/products/abc-123/def-456
```

Consumers append the suffix they need:

```ts
const thumbUrl  = basePath + '-thumb.webp';
const mediumUrl = basePath + '-medium.webp';
const largeUrl  = basePath + '-large.webp';
const origUrl   = basePath + '-original.jpg'; // ext varies
```

---

## Why we preserve the original

The original is stored so that future format or size changes can be applied without asking
the owner to re-upload every photo. Examples:

- Adding an `xlarge.webp` (2400 × 2400) variant for retina displays
- Switching to AVIF when browser support matures
- Adjusting quality settings after profiling real-world performance

Without the original, any pipeline change would require the owner to re-photograph every product.

---

## `processProductImage()` contract

**Location**: `src/lib/server/imageProcessing.ts`

```ts
async function processProductImage(
  buffer: Buffer,
  originalExt: string,  // e.g. 'jpg', 'png', 'webp'
  productId: string,
): Promise<{ uuid: string; basePath: string }>
```

**Steps**:
1. Reads metadata with `sharp(buffer).metadata()` — throws on corrupt files.
2. Validates width and height ≥ 1200. Throws with Spanish error if below.
3. Generates a UUID with `crypto.randomUUID()`.
4. Creates `static/uploads/products/[productId]/` with `mkdir({ recursive: true })`.
5. Writes the original buffer as `[uuid]-original.[ext]`.
6. Runs three independent sharp pipelines (each `sharp(buffer)` re-reads from buffer):
   - `.resize({ width: 400, height: 400, fit: 'cover', position: 'centre' }).webp({ quality: 80 })`
   - `.resize({ width: 800, height: 800, fit: 'cover', position: 'centre' }).webp({ quality: 85 })`
   - `.resize({ width: 1600, height: 1600, fit: 'cover', position: 'centre' }).webp({ quality: 85 })`
7. Returns `{ uuid, basePath }` where `basePath = '/uploads/products/[productId]/[uuid]'`.

**Throws**: `Error` with a Spanish message for both validation failures and sharp errors.
The upload action calls this in a try/catch and returns `fail(422, { message })` to the form.

---

## `ProductImage` component

**Location**: `src/lib/components/ui/ProductImage.svelte`

```svelte
<ProductImage
  basePath="/uploads/products/abc/def"
  alt="Marco Aviador Negro Mate"
  size="thumb"
  class="h-full w-full object-cover"
  loading="lazy"
/>
```

**Props**:

| Prop | Type | Default | Description |
|---|---|---|---|
| `basePath` | `string` | required | Base path from `productImages.url` |
| `alt` | `string` | required | Alt text for the `<img>` |
| `size` | `'thumb' \| 'medium' \| 'large'` | `'medium'` | Controls `src` and `sizes` attribute |
| `class` | `string` | `''` | CSS classes forwarded to the inner `<img>` |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Forwarded to the inner `<img>` |

**Renders**:

```html
<picture class="contents">
  <source
    type="image/webp"
    srcset="{basePath}-thumb.webp 400w, {basePath}-medium.webp 800w, {basePath}-large.webp 1600w"
    sizes="..."
  />
  <img src="{basePath}-{size}.webp" alt="..." loading="..." class="..." />
</picture>
```

`<picture class="contents">` makes the element transparent in the box model — the `<img>`
participates directly in the parent's layout, so width/height constraints on the wrapper div
work exactly as they did with a plain `<img>`.

---

## `sizes` attribute logic

The `sizes` attribute tells the browser how wide the image will actually render, so it can
pick the right srcset entry before layout is known (at preload time).

| `size` prop | `sizes` value | Reasoning |
|---|---|---|
| `thumb` | `(min-width: 1024px) 25vw, 50vw` | Grid is 4-col on desktop (≈25vw), 2-col on mobile (50vw) |
| `medium` | `(min-width: 1024px) 50vw, 100vw` | Half-width on desktop (product detail left column), full on mobile |
| `large` | `100vw` | Full-width in all contexts (lightbox / main gallery) |

On a 390 px mobile screen requesting the catalog grid, the browser sees:
- sizes = `50vw` → ≈195 px → picks `400w` (thumb) ✓

On a 1440 px desktop:
- sizes = `25vw` → ≈360 px → still picks `400w` (thumb) ✓

On a 1440 px desktop product detail page:
- sizes = `50vw` → ≈720 px → picks `800w` (medium) ✓

---

## How to add a new size variant

1. **`src/lib/server/imageProcessing.ts`** — add a new `sharp(buffer)` call:
   ```ts
   await sharp(buffer)
     .resize({ width: 2400, height: 2400, fit: 'cover', position: 'centre' })
     .webp({ quality: 85 })
     .toFile(join(dir, `${uuid}-xlarge.webp`));
   ```

2. **`src/lib/components/ui/ProductImage.svelte`** — extend the union type and maps:
   ```ts
   size?: 'thumb' | 'medium' | 'large' | 'xlarge';
   
   const sizesMap = {
     // ...existing entries...
     xlarge: '100vw',
   };
   ```
   Update the `srcset` string to include the new entry:
   ```html
   srcset="..., {basePath}-xlarge.webp 2400w"
   ```

3. **Write a reprocessing script** to generate the new variant from stored originals:
   ```ts
   // scripts/generate-xlarge.ts
   // Walk static/uploads/products/**/
   // For each *-original.* file found, derive the UUID and productId,
   // then run the new sharp pipeline to generate *-xlarge.webp.
   ```
   Run once: `npx tsx scripts/generate-xlarge.ts`

No DB migration needed — the `url` column stays unchanged (basePath only).
