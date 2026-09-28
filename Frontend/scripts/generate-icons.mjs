import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

function crc32(buffer) {
  let crc = ~0
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index]
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const name = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, crc])
}

function inRoundRect(x, y, left, top, width, height, radius) {
  const right = left + width
  const bottom = top + height
  const innerLeft = left + radius
  const innerRight = right - radius
  const innerTop = top + radius
  const innerBottom = bottom - radius
  if (x >= innerLeft && x <= innerRight && y >= top && y <= bottom) return true
  if (y >= innerTop && y <= innerBottom && x >= left && x <= right) return true
  const corners = [
    [innerLeft, innerTop],
    [innerRight, innerTop],
    [innerLeft, innerBottom],
    [innerRight, innerBottom],
  ]
  return corners.some(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2)
}

function inDiamond(x, y, cx, cy, size) {
  return Math.abs(x - cx) / size + Math.abs(y - cy) / size <= 1
}

function createIcon(size) {
  const pixels = Buffer.alloc(size * size * 4)
  const cardX = size * 0.22
  const cardY = size * 0.14
  const cardW = size * 0.56
  const cardH = size * 0.72
  const radius = size * 0.07
  const stroke = Math.max(2, size * 0.025)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4
      let red = 12
      let green = 11
      let blue = 9
      let alpha = 255

      const outer = inRoundRect(x, y, cardX, cardY, cardW, cardH, radius)
      const inner = inRoundRect(
        x,
        y,
        cardX + stroke,
        cardY + stroke,
        cardW - stroke * 2,
        cardH - stroke * 2,
        Math.max(1, radius - stroke),
      )
      if (outer && !inner) {
        red = 224
        green = 177
        blue = 90
      }

      if (inDiamond(x, y, size / 2, size * 0.46, size * 0.11)) {
        red = 224
        green = 177
        blue = 90
      }

      pixels[offset] = red
      pixels[offset + 1] = green
      pixels[offset + 2] = blue
      pixels[offset + 3] = alpha
    }
  }

  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

fs.mkdirSync(root, { recursive: true })
fs.writeFileSync(path.join(root, 'pwa-192x192.png'), createIcon(192))
fs.writeFileSync(path.join(root, 'pwa-512x512.png'), createIcon(512))
fs.writeFileSync(path.join(root, 'apple-touch-icon.png'), createIcon(180))
console.log('Ícones PWA gerados em public/')
