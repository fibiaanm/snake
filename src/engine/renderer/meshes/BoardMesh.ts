import * as THREE from 'three'

export class BoardMesh {
  constructor(scene: THREE.Scene, gridSize: number) {
    const center = gridSize / 2 - 0.5

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.9, metalness: 0.0 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(center, -0.01, center)
    floor.receiveShadow = true
    scene.add(floor)

    // Grid lines
    const grid = new THREE.GridHelper(gridSize, gridSize, 0x0f3460, 0x0f3460)
    grid.position.set(center, 0, center)
    scene.add(grid)

    // Border glow lines
    this._buildBorders(scene, gridSize)
  }

  private _buildBorders(scene: THREE.Scene, g: number) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xe53935,
      emissive: 0xe53935,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7
    })

    const segments: { geo: THREE.BufferGeometry; x: number; z: number }[] = [
      { geo: new THREE.BoxGeometry(g, 0.08, 0.08), x: g / 2 - 0.5, z: -0.5 },
      { geo: new THREE.BoxGeometry(g, 0.08, 0.08), x: g / 2 - 0.5, z: g - 0.5 },
      { geo: new THREE.BoxGeometry(0.08, 0.08, g), x: -0.5,       z: g / 2 - 0.5 },
      { geo: new THREE.BoxGeometry(0.08, 0.08, g), x: g - 0.5,    z: g / 2 - 0.5 },
    ]

    segments.forEach(({ geo, x, z }) => {
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, 0, z)
      scene.add(mesh)
    })
  }
}
