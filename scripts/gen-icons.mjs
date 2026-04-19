import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = resolve(__dirname, '../public/icons')
const sourceSvg = resolve(iconsDir, 'icon.svg')

const targets = [
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 32, file: 'favicon-32.png' },
]

const svg = await readFile(sourceSvg)

for (const { size, file } of targets) {
  const out = resolve(iconsDir, file)
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log(`✓ ${file} (${size}x${size})`)
}
