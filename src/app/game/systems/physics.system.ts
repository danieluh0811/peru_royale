import * as THREE from 'three';
import { Player } from '../entities/player';
import { MapGenerator } from '../world/map-generator';

export class PhysicsSystem {
  private static gravity = -0.012;

  static applyMovement(player: Player, keys: any, speed: number) {
    const nextPos = player.position.clone();
    const direction = new THREE.Vector3();

    if (keys['w']) direction.z -= 1;
    if (keys['s']) direction.z += 1;
    if (keys['a']) direction.x -= 1;
    if (keys['d']) direction.x += 1;

    direction.normalize();
    if (direction.length() > 0) {
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
      
      // Intentar mover en X
      const testPosX = player.position.clone();
      testPosX.x += direction.x * speed;
      if (!this.checkCollision(testPosX)) {
        player.position.x = testPosX.x;
      }

      // Intentar mover en Z
      const testPosZ = player.position.clone();
      testPosZ.z += direction.z * speed;
      if (!this.checkCollision(testPosZ)) {
        player.position.z = testPosZ.z;
      }
    }

    // Gravedad (Y)
    player.velocityY += this.gravity;
    player.position.y += player.velocityY;

    if (player.position.y <= 0.8) {
      player.position.y = 0.8;
      player.velocityY = 0;
      player.isGrounded = true;
    } else {
      player.isGrounded = false;
    }
  }

  // MÉTODO MÁGICO: Comprueba si un punto choca con los objetos del mapa
  private static checkCollision(pos: THREE.Vector3): boolean {
    const playerRadius = 0.4; // El ancho del jugador (mitad de 0.8)
    
    for (const obj of MapGenerator.collidableObjects) {
      // Creamos una caja alrededor del objeto para detectar el choque
      const box = new THREE.Box3().setFromObject(obj);
      
      // Expandimos la caja un poco con el radio del jugador para que no se "entierre"
      const playerBox = new THREE.Box3(
        new THREE.Vector3(pos.x - playerRadius, pos.y - 0.8, pos.z - playerRadius),
        new THREE.Vector3(pos.x + playerRadius, pos.y + 0.8, pos.z + playerRadius)
      );

      if (box.intersectsBox(playerBox)) {
        return true; // ¡CHOCAMOS!
      }
    }
    return false;
  }
}