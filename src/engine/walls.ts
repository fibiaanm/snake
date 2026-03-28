import type { Level, Wall } from '@/types/level'

export interface WallCell { x: number; y: number }

export function generateWalls(level: Level): WallCell[][] {
  if (level.obstacles.mode === 'fixed') {
    return (level.obstacles.walls ?? []).map(_wallCells)
  }
  return _generateRandom(
    level.obstacles.count    ?? 2,
    level.obstacles.minLength ?? 2,
    level.obstacles.maxLength ?? 4,
    level.arena.cols,
    level.arena.rows
  )
}

function _wallCells(w: Wall): WallCell[] {
  const cells: WallCell[] = []
  for (let i = 0; i < w.length; i++) {
    cells.push({
      x: w.x + (w.axis === 'x' ? i : 0),
      y: w.y + (w.axis === 'y' ? i : 0)
    })
  }
  return cells
}

function _generateRandom(
  count: number, minLen: number, maxLen: number,
  cols: number, rows: number
): WallCell[][] {
  const occupied = new Set<string>()
  const result: WallCell[][] = []
  const margin = 2
  let attempts = 0

  while (result.length < count && attempts < 200) {
    attempts++
    const len  = minLen + Math.floor(Math.random() * (maxLen - minLen + 1))
    const axis = Math.random() > 0.5 ? 'x' : 'y'

    const maxX = axis === 'x' ? cols - len - margin : cols - 1 - margin
    const maxY = axis === 'y' ? rows - len - margin : rows - 1 - margin
    if (maxX < margin || maxY < margin) continue

    const x = margin + Math.floor(Math.random() * (maxX - margin + 1))
    const y = margin + Math.floor(Math.random() * (maxY - margin + 1))

    const cells = _wallCells({ x, y, length: len, axis })
    const keys  = cells.map(c => `${c.x},${c.y}`)
    if (keys.some(k => occupied.has(k))) continue

    keys.forEach(k => occupied.add(k))
    result.push(cells)
  }

  return result
}
