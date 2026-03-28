export interface Wall {
  x: number
  y: number
  length: number
  axis: 'x' | 'y'
}

export interface LevelObstacles {
  mode: 'fixed' | 'random'
  walls?: Wall[]
  count?: number
  minLength?: number
  maxLength?: number
}

export interface Level {
  id: number
  pointsToAdvance: number
  arena: { cols: number; rows: number }
  obstacles: LevelObstacles
}
