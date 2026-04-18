import * as THREE from 'three';

export class MapGenerator {
  static create(scene: THREE.Scene) {
    // Suelo
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x44aa44 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    scene.add(new THREE.GridHelper(100, 50, 0x88ff88, 0x226622));

    // Cubos objetivo
    for (let i = 0; i < 10; i++) {
      const target = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x5555ff })
      );
      target.position.set(Math.random() * 40 - 20, 1, Math.random() * 40 - 20);
      target.name = "target";
      scene.add(target);
    }
  }
}