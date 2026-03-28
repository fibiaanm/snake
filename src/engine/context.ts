import type { direction, size } from '@/types/translation'
import { ApplicationMode } from '../types/applicationMode'
import { Snake } from './snake'
import moment from 'moment'
import { Coin } from './coin'
import { Log } from '@/facade/Logger'
import { reactive } from 'vue'
import { score } from './score'
import { ThreeRenderer } from './renderer/ThreeRenderer'
import type { Level } from '@/types/level'
import { generateWalls, type WallCell } from './walls'

const DEFAULT_LEVEL: Level = {
  id: 1, pointsToAdvance: 20,
  arena: { cols: 12, rows: 12 },
  obstacles: { mode: 'fixed', walls: [] }
}

export class Application {
  private static _instance: Application | undefined

  public _lastRefresh = 0
  private readonly _speedRatio = 200

  private _status: ApplicationMode = ApplicationMode.dev
  private _snake: Snake
  private _coin: Coin
  private readonly _square = 30
  private _container: size = { width: 360, height: 360 }
  private _running = false
  private _renderer: ThreeRenderer | undefined

  // Level system
  private _levels: Level[] = [DEFAULT_LEVEL]
  private _levelIndex = 0
  private _nextThreshold = 20
  private _wallCells: WallCell[][] = []

  constructor() {
    this._coin  = new Coin(this._container, this._square)
    this._snake = new Snake()
  }

  public static getInstance(): Application {
    if (!Application._instance) Application._instance = new Application()
    return Application._instance
  }

  // ── Init ──────────────────────────────────────────────────────────

  public initRenderer(canvas: HTMLCanvasElement) {
    this._renderer = new ThreeRenderer(canvas)
    this._renderer.startLoop(
      () => this._snake.howToDraw,
      () => this._coin.position
    )
  }

  public async loadLevels(): Promise<void> {
    try {
      const res  = await fetch(`${import.meta.env.BASE_URL}levels.json`)
      const data = await res.json()
      this._levels = data.levels as Level[]
    } catch {
      this._levels = [DEFAULT_LEVEL]
    }
  }

  // ── Level management ──────────────────────────────────────────────

  private _applyLevel(index: number) {
    this._levelIndex = index
    const lvl = this._currentLevel
    this._container  = { width: lvl.arena.cols * this._square, height: lvl.arena.rows * this._square }
    this._wallCells  = generateWalls(lvl)
    this._nextThreshold = application.points + lvl.pointsToAdvance
    application.level        = lvl.id
    application.levelComplete = false
  }

  private get _currentLevel(): Level {
    return this._levels[this._levelIndex] ?? this._levels[this._levels.length - 1] ?? DEFAULT_LEVEL
  }

  get isLastLevel(): boolean {
    return this._levelIndex >= this._levels.length - 1
  }

  public advanceLevel() {
    this._applyLevel(Math.min(this._levelIndex + 1, this._levels.length - 1))
    this._snake = new Snake()
    this._coin  = new Coin(this._container, this._square)
    this._renderer?.reset()
    this._renderer?.onLevelLoaded(
      this._currentLevel.arena.cols,
      this._currentLevel.arena.rows,
      this._wallCells
    )
    this._running = true
    requestAnimationFrame(app().refresh)
  }

  public stayInLevel() {
    this._nextThreshold += this._currentLevel.pointsToAdvance
    application.levelComplete = false
    requestAnimationFrame(app().refresh)
  }

  // ── Game loop ─────────────────────────────────────────────────────

  public restart() {
    score().restore()
    this._applyLevel(0)
    this._snake = new Snake()
    this._coin  = new Coin(this._container, this._square)
    this._renderer?.reset()
    this._renderer?.onLevelLoaded(
      this._currentLevel.arena.cols,
      this._currentLevel.arena.rows,
      this._wallCells
    )
    this._running     = true
    application.end   = false
    requestAnimationFrame(app().refresh)
  }

  public refresh() {
    const ctx = app()
    if (application.paused || application.end || application.levelComplete) return

    const now = moment().valueOf()
    if (now - ctx._lastRefresh <= ctx.speed) {
      requestAnimationFrame(ctx.refresh)
      return
    }

    ctx._snake.bonus = false
    ctx._snake.nextStep()

    if (ctx._snake.bonus) {
      ctx._renderer?.onCoinEaten(ctx._coin.position)
      Log.info('coin eaten')
      if (application.points >= ctx._nextThreshold) {
        application.levelComplete = true
        return
      }
    }

    // Wall + self collision
    const head    = ctx._snake.path[ctx._snake.path.length - 1]
    const wallHit = head
      ? ctx.wallPixelPositions.some(w => w.x === head.x && w.y === head.y)
      : false

    if ((ctx._snake.validateCollition() && !ctx._snake.bonus) || wallHit) {
      if (application.points > application.record) {
        application.record = application.points
        localStorage.setItem('snake-record', String(application.points))
      }
      Log.info('collision')
      application.end    = true
      application.paused = false
      ctx._renderer?.onDeath(ctx._snake.path)
      return
    }

    ctx._lastRefresh = now
    if (ctx._running && !application.paused)
      requestAnimationFrame(ctx.refresh)
  }

  public pause() {
    if (application.end) return
    if (application.paused) {
      application.paused = false
      requestAnimationFrame(app().refresh)
    } else {
      application.paused = true
    }
  }

  public registerCoinCollition() {
    this._coin.createNew()
    score().addPoint()
  }

  // ── Getters ───────────────────────────────────────────────────────

  get wallPixelPositions(): { x: number; y: number }[] {
    return this._wallCells.flat().map(c => ({
      x: c.x * this._square,
      y: c.y * this._square
    }))
  }

  get mode(): ApplicationMode { return this._status }
  set mode(m: ApplicationMode) { this._status = m }

  get snake()  { return this._snake }
  set snakeDirection(d: direction) { this._snake[d]() }

  get coin()      { return this._coin }
  get square()    { return this._square }
  get container() { return this._container }

  get isRuning()          { return this._running }
  set isRuning(v: boolean) { this._running = v }

  get speed()  { return this._speedRatio / application.speed }
  get paused() { return application.paused }
}

export const application = reactive({
  points:        0,
  level:         1,
  record:        parseInt(localStorage.getItem('snake-record') ?? '0'),
  paused:        true,
  end:           true,
  levelComplete: false,
  speed:         1.5
})

export const app = (canvas?: HTMLCanvasElement): Application => {
  const instance = Application.getInstance()
  if (canvas) instance.initRenderer(canvas)
  return instance
}
