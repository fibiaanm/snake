import type { position } from '@/types/translation'
import type { WallCell } from '@/engine/walls'
import { SceneManager } from './SceneManager'
import { SnakeMesh } from './meshes/SnakeMesh'
import { CoinMesh } from './meshes/CoinMesh'
import { BoardMesh } from './meshes/BoardMesh'
import { WallMesh } from './meshes/WallMesh'
import { ParticleSystem } from '../effects/ParticleSystem'
import { CameraEffects } from '../effects/CameraEffects'

export class ThreeRenderer {
  private readonly _scene: SceneManager
  private readonly _snakeMesh: SnakeMesh
  private readonly _coinMesh: CoinMesh
  private readonly _wallMesh: WallMesh
  private readonly _particles: ParticleSystem
  private readonly _cameraFx: CameraEffects
  private _board: BoardMesh

  private _running = false
  private _getSnakePath: (() => position[]) | null = null
  private _getCoinPos: (() => position) | null = null

  constructor(canvas: HTMLCanvasElement) {
    this._scene    = new SceneManager(canvas)
    this._board    = new BoardMesh(this._scene.scene, 12, 12)
    this._snakeMesh = new SnakeMesh(this._scene.scene)
    this._coinMesh  = new CoinMesh(this._scene.scene)
    this._wallMesh  = new WallMesh(this._scene.scene)
    this._particles = new ParticleSystem(this._scene.scene)
    this._cameraFx  = new CameraEffects(this._scene.camera)

    // Position camera for initial 12×12 arena
    this._scene.updateArena(12, 12)
    this._cameraFx.syncBase()
  }

  public startLoop(getSnakePath: () => position[], getCoinPos: () => position) {
    this._getSnakePath = getSnakePath
    this._getCoinPos   = getCoinPos
    if (this._running) return
    this._running = true
    this._loop()
  }

  private _loop() {
    if (!this._running) return
    const path    = this._getSnakePath?.()
    const coinPos = this._getCoinPos?.()
    if (path)    this._snakeMesh.update(path)
    if (coinPos) this._coinMesh.update(coinPos)
    this._particles.update()
    this._cameraFx.update()
    this._scene.render()
    requestAnimationFrame(() => this._loop())
  }

  // ── Level transition ──────────────────────────────────────────────

  public onLevelLoaded(cols: number, rows: number, walls: WallCell[][]) {
    this._board.dispose(this._scene.scene)
    this._board = new BoardMesh(this._scene.scene, cols, rows)
    this._wallMesh.update(walls)
    this._scene.updateArena(cols, rows)
    this._cameraFx.syncBase()
  }

  // ── Game events ───────────────────────────────────────────────────

  public onCoinEaten(coinPos: position) {
    this._coinMesh.burst()
    this._snakeMesh.flash()
    this._particles.burst(coinPos)
    this._cameraFx.zoom(0.93, 200)
  }

  public onDeath(snakePath: position[]) {
    this._snakeMesh.explode(snakePath)
    this._particles.deathBurst(snakePath)
    this._cameraFx.shake(0.45, 25)
  }

  public reset() {
    this._snakeMesh.reset()
  }

  public dispose() {
    this._running = false
    this._snakeMesh.dispose()
    this._wallMesh.dispose()
    this._scene.dispose()
  }
}
