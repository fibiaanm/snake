import type { direction, size } from '@/types/translation'
import { ApplicationMode } from '../types/applicationMode'
import { Snake } from './snake'
import moment from 'moment'
import { Coin } from './coin'
import { Log } from '@/facade/Logger'
import { reactive } from 'vue'
import { score } from './score'
import { ThreeRenderer } from './renderer/ThreeRenderer'

export class Application {
  private static _instance: Application | undefined

  public _lastRefresh = 0
  private readonly _speedRatio = 200

  private _status: ApplicationMode = ApplicationMode.dev
  private _snake: Snake
  private _coin: Coin
  private readonly _square = 30
  private readonly _container: size = { width: 360, height: 360 }
  private _running = false
  private _renderer: ThreeRenderer | undefined

  constructor() {
    this._coin = new Coin(this._container, this._square)
    this._snake = new Snake()
  }

  public static getInstance(): Application {
    if (!Application._instance) Application._instance = new Application()
    return Application._instance
  }

  public initRenderer(canvas: HTMLCanvasElement) {
    this._renderer = new ThreeRenderer(canvas)
    this._renderer.startLoop(
      () => this._snake.howToDraw,
      () => this._coin.position
    )
  }

  public restart() {
    this._snake = new Snake()
    this._coin = new Coin(this._container, this._square)
    this._renderer?.reset()
    this._running = true
    application.end = false
    score().restore()
    requestAnimationFrame(app().refresh)
  }

  public refresh() {
    const ctx = app()
    if (application.paused || application.end) return

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
    }

    if (ctx._snake.validateCollition() && !ctx._snake.bonus) {
      Log.info('self collision')
      application.end = true
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

  get mode(): ApplicationMode { return this._status }
  set mode(m: ApplicationMode) { this._status = m }

  get snake() { return this._snake }
  set snakeDirection(d: direction) { this._snake[d]() }

  get coin() { return this._coin }

  get square() { return this._square }
  get container() { return this._container }

  get isRuning() { return this._running }
  set isRuning(v: boolean) { this._running = v }

  get speed() { return this._speedRatio / application.speed }
  get paused() { return application.paused }
}

export const application = reactive({
  points: 0,
  paused: true,
  end: true,
  speed: 1.5
})

export const app = (canvas?: HTMLCanvasElement): Application => {
  const instance = Application.getInstance()
  if (canvas) instance.initRenderer(canvas)
  return instance
}
