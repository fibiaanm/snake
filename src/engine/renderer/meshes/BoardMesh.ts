import * as THREE from 'three'

export class BoardMesh {
  private readonly _objects: THREE.Object3D[] = []

  constructor(scene: THREE.Scene, cols: number, rows: number) {
    const cx = cols / 2 - 0.5
    const cz = rows / 2 - 0.5

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(cols, rows),
      new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.9, metalness: 0.0 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(cx, -0.01, cz)
    floor.receiveShadow = true
    this._add(scene, floor)

    // Grid
    const grid = new THREE.GridHelper(Math.max(cols, rows), Math.max(cols, rows), 0x0f3460, 0x0f3460)
    grid.position.set(cx, 0, cz)
    this._add(scene, grid)

    // Border glow
    this._buildBorders(scene, cols, rows)
  }

  private _buildBorders(scene: THREE.Scene, cols: number, rows: number) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xe53935,
      emissive: 0xe53935,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7
    })
    const cx = cols / 2 - 0.5
    const cz = rows / 2 - 0.5

    const defs = [
      { g: new THREE.BoxGeometry(cols, 0.08, 0.08), x: cx, z: -0.5 },
      { g: new THREE.BoxGeometry(cols, 0.08, 0.08), x: cx, z: rows - 0.5 },
      { g: new THREE.BoxGeometry(0.08, 0.08, rows), x: -0.5,      z: cz },
      { g: new THREE.BoxGeometry(0.08, 0.08, rows), x: cols - 0.5, z: cz },
    ]
    defs.forEach(({ g, x, z }) => {
      const m = new THREE.Mesh(g, mat)
      m.position.set(x, 0, z)
      this._add(scene, m)
    })
  }

  private _add(scene: THREE.Scene, obj: THREE.Object3D) {
    scene.add(obj)
    this._objects.push(obj)
  }

  public dispose(scene: THREE.Scene) {
    this._objects.forEach(o => scene.remove(o))
    this._objects.length = 0
  }
}
