import * as THREE from 'three'

export class SceneManager {
  public readonly scene: THREE.Scene
  public readonly camera: THREE.OrthographicCamera
  public readonly renderer: THREE.WebGLRenderer

  private _currentF = 7.5

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0d1117)

    const { fW, fH } = this._frustum()
    this.camera = new THREE.OrthographicCamera(-fW, fW, fH, -fH, 0.1, 120)
    this.camera.up.set(0, 0, -1)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this._applySize()
    this._setupLights()

    window.addEventListener('resize', () => this._onResize())
  }

  public updateArena(cols: number, rows: number) {
    const cx = cols / 2 - 0.5
    const cz = rows / 2 - 0.5
    this._currentF = Math.max(cols, rows) / 2 + 2

    const { fW, fH } = this._frustum()
    this.camera.left   = -fW
    this.camera.right  =  fW
    this.camera.top    =  fH
    this.camera.bottom = -fH
    this.camera.position.set(cx, 25, cz)
    this.camera.lookAt(cx, 0, cz)
    this.camera.updateProjectionMatrix()
  }

  private _frustum() {
    const f = this._currentF
    const aspect = window.innerWidth / window.innerHeight
    return {
      fW: Math.max(f, f * aspect),
      fH: Math.max(f, f / aspect)
    }
  }

  private _applySize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight, false)
  }

  private _onResize() {
    const { fW, fH } = this._frustum()
    this.camera.left   = -fW
    this.camera.right  =  fW
    this.camera.top    =  fH
    this.camera.bottom = -fH
    this.camera.updateProjectionMatrix()
    this._applySize()
  }

  private _setupLights() {
    this.scene.add(new THREE.AmbientLight(0x8899bb, 1.2))

    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(6, 20, 4)
    sun.castShadow = true
    sun.shadow.camera.left = -20
    sun.shadow.camera.right = 20
    sun.shadow.camera.top = 20
    sun.shadow.camera.bottom = -20
    sun.shadow.mapSize.set(2048, 2048)
    this.scene.add(sun)

    const fill = new THREE.DirectionalLight(0x334488, 0.5)
    fill.position.set(-6, 10, -4)
    this.scene.add(fill)
  }

  public render() {
    this.renderer.render(this.scene, this.camera)
  }

  public dispose() {
    this.renderer.dispose()
  }
}
