import * as THREE from 'three';

export class RemotePlayer {
  public mesh: THREE.Mesh;

  constructor(scene: THREE.Scene, color: number) {
    const geometry = new THREE.BoxGeometry(0.8, 1.6, 0.8);
    const material = new THREE.MeshStandardMaterial({ color: color });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  update(position: {x: number, y: number, z: number}, yaw: number) {
    // Aquí es donde luego pondremos el LERP para que se mueva suave
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.rotation.y = yaw;
  }
}