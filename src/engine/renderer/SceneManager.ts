import * as THREE from 'three'

const GRID_SIZE = 12
const BOARD_CENTER = GRID_SIZE / 2 - 0.5
// Half-frustum that guarantees the 12-unit board fits with padding on both axes
const F = 7.5

export class SceneManager {
  public readonly scene: THREE.Scene
  public readonly camera: THREE.OrthographicCamera
  public readonly renderer: THREE.WebGLRenderer

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0d1117)

    const { fW, fH } = SceneManager._frustum()
    this.camera = new THREE.OrthographicCamera(-fW, fW, fH, -fH, 0.1, 120)
    this.camera.up.set(0, 0, -1)
    this.camera.position.set(BOARD_CENTER, 25, BOARD_CENTER)
    this.camera.lookAt(BOARD_CENTER, 0, BOARD_CENTER)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this._applySize()
    this._setupLights()

    window.addEventListener('resize', () => this._onResize())
  }

  // Ensures the board always fits regardless of portrait/landscape
  private static _frustum() {
    const aspect = window.innerWidth / window.innerHeight
    return {
      fW: Math.max(F, F * aspect),
      fH: Math.max(F, F / aspect)
    }
  }

  private _applySize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h, false)
  }

  private _onResize() {
    const { fW, fH } = SceneManager._frustum()
    this.camera.left   = -fW
    this.camera.right  =  fW
    this.camera.top    =  fH
    this.camera.bottom = -fH
    this.camera.updateProjectionMatrix()
    this._applySize()
  }

  private _setupLights() {
    const ambient = new THREE.AmbientLight(0x8899bb, 1.2)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(6, 20, 4)
    sun.castShadow = true
    sun.shadow.camera.left = -16
    sun.shadow.camera.right = 16
    sun.shadow.camera.top = 16
    sun.shadow.camera.bottom = -16
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
