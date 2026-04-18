import * as THREE from 'three';
import { Player } from '../entities/player';

export class PhysicsSystem {
  private static gravity = -0.012;

  static applyMovement(player: Player, keys: any, speed: number) {
    const direction = new THREE.Vector3();
    if (keys['w']) direction.z -= 1;
    if (keys['s']) direction.z += 1;
    if (keys['a']) direction.x -= 1;
    if (keys['d']) direction.x += 1;

    direction.normalize();
    if (direction.length() > 0) {
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
      player.position.x += direction.x * speed;
      player.position.z += direction.z * speed;
    }

    // Gravedad
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
}