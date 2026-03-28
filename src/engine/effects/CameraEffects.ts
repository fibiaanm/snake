import * as THREE from 'three'

export class CameraEffects {
  private readonly _camera: THREE.OrthographicCamera
  private readonly _basePos: THREE.Vector3
  private _origFrustum: { l: number; r: number; t: number; b: number }

  private _shakeIntensity = 0
  private _shakeTTL = 0
  private _zoomTarget = 1
  private _zoomCurrent = 1

  constructor(camera: THREE.OrthographicCamera) {
    this._camera = camera
    this._basePos = camera.position.clone()
    this._origFrustum = this._captureFrustum()
  }

  /** Call after the camera is intentionally moved (e.g. arena resize). */
  public syncBase() {
    this._basePos.copy(this._camera.position)
    this._origFrustum = this._captureFrustum()
  }

  public shake(intensity = 0.3, frames = 20) {
    this._shakeIntensity = intensity
    this._shakeTTL = frames
  }

  public zoom(factor: number, durationMs = 180) {
    this._zoomTarget = factor
    setTimeout(() => { this._zoomTarget = 1 }, durationMs)
  }

  public update() {
    if (this._shakeTTL > 0) {
      const s = this._shakeIntensity * (this._shakeTTL / 20)
      this._camera.position.x = this._basePos.x + (Math.random() - 0.5) * s
      this._camera.position.y = this._basePos.y + (Math.random() - 0.5) * s
      this._camera.position.z = this._basePos.z + (Math.random() - 0.5) * s
      this._shakeTTL--
    } else {
      this._camera.position.lerp(this._basePos, 0.15)
    }

    this._zoomCurrent += (this._zoomTarget - this._zoomCurrent) * 0.12
    const z = this._zoomCurrent
    const o = this._origFrustum
    this._camera.left   = o.l * z
    this._camera.right  = o.r * z
    this._camera.top    = o.t * z
    this._camera.bottom = o.b * z
    this._camera.updateProjectionMatrix()
  }

  private _captureFrustum() {
    return {
      l: this._camera.left,
      r: this._camera.right,
      t: this._camera.top,
      b: this._camera.bottom
    }
  }
}
