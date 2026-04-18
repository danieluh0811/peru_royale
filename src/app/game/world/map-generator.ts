import * as THREE from 'three';

export class MapGenerator {
  // Aquí guardaremos todo lo que el jugador NO puede atravesar
  public static collidableObjects: THREE.Object3D[] = [];

  static create(scene: THREE.Scene) {
    this.collidableObjects = []; // Limpiar lista al iniciar

    // Luces (Mantener las que pusimos antes)
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    // Suelo (No se añade a colisiones porque caminamos SOBRE él)
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x44aa44 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- OBSTÁCULOS CON COLISIÓN ---

    // 1. Cubos objetivo (ahora tienen colisión)
    for (let i = 0; i < 15; i++) {
      const target = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x5555ff })
      );
      target.position.set(Math.random() * 60 - 30, 1, Math.random() * 60 - 30);
      target.name = "target";
      
      scene.add(target);
      this.collidableObjects.push(target); // <--- REGISTRAR PARA COLISIÓN
    }

    // 2. Paredes de los bordes del mapa
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const wallGeom = new THREE.BoxGeometry(100, 5, 1);

    const walls = [
      { pos: [0, 2.5, 50], rot: [0, 0, 0] },    // Norte
      { pos: [0, 2.5, -50], rot: [0, 0, 0] },   // Sur
      { pos: [50, 2.5, 0], rot: [0, Math.PI / 2, 0] }, // Este
      { pos: [-50, 2.5, 0], rot: [0, Math.PI / 2, 0] } // Oeste
    ];

    walls.forEach(w => {
      const wall = new THREE.Mesh(wallGeom, wallMat);
      wall.position.set(w.pos[0], w.pos[1], w.pos[2]);
      wall.rotation.set(w.rot[0], w.rot[1], w.rot[2]);
      scene.add(wall);
      this.collidableObjects.push(wall); // <--- REGISTRAR PAREDES
    });
  }
}