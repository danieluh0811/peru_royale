import * as THREE from 'three';

export class Player {
  public mesh!: THREE.Mesh;
  public position = new THREE.Vector3(0, 0.8, 0);
  public velocityY = 0;
  public yaw = 0;
  public pitch = 0;
  public isGrounded = false;

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.BoxGeometry(0.8, 1.6, 0.8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
  }

  update(yaw: number) {
    this.yaw = yaw;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.yaw;
  }
}