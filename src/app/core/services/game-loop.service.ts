import { Injectable, NgZone } from '@angular/core';
import { RenderService } from './render.service';
import * as THREE from 'three';
// Importamos nuestras nuevas piezas
import { Player } from '../../game/entities/player';
import { MapGenerator } from '../../game/world/map-generator';
import { PhysicsSystem } from '../../game/systems/physics.system';

@Injectable({ providedIn: 'root' })
export class GameLoopService {
  private animationId: number | null = null;
  private player!: Player;
  private gunMesh!: THREE.Group;
  
  // Estado de inputs (Esto luego lo podrías mover a un InputService)
  private keys: { [key: string]: boolean } = { 
    w: false, s: false, a: false, d: false, space: false 
  };

  constructor(
    private ngZone: NgZone,
    private renderService: RenderService
  ) {}

  start() {
    this.ngZone.runOutsideAngular(() => {
      // 1. Inicializar Entidades y Mundo
      this.player = new Player(this.renderService.getScene());
      MapGenerator.create(this.renderService.getScene());
      
      this.initGun();
      this.setupControls();
      this.animate();
    });
  }

  private initGun() {
    this.gunMesh = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    body.position.set(0.25, -0.2, -0.4);
    this.gunMesh.add(body);

    const camera = this.renderService.getCamera();
    camera.add(this.gunMesh);
    this.renderService.getScene().add(camera);
  }

  private setupControls() {
    const canvas = this.renderService.getRenderer().domElement;

    canvas.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement === canvas) {
        if (e.button === 0) this.shoot();
      } else {
        canvas.requestPointerLock();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvas) {
        const sensitivity = 0.0015;
        this.player.yaw -= e.movementX * sensitivity;
        this.player.pitch -= e.movementY * sensitivity;
        
        const limit = Math.PI / 2 - 0.1;
        this.player.pitch = Math.max(-limit, Math.min(limit, this.player.pitch));
      }
    });

    window.addEventListener('keydown', (e) => this.handleKey(e.key, true));
    window.addEventListener('keyup', (e) => this.handleKey(e.key, false));
  }

  private handleKey(key: string, isPressed: boolean) {
    const k = key.toLowerCase();
    if (k === ' ') this.keys['space'] = isPressed;
    else this.keys[k] = isPressed;
  }

  private shoot() {
    const raycaster = new THREE.Raycaster();
    const camera = this.renderService.getCamera();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = raycaster.intersectObjects(this.renderService.getScene().children);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      
      if (hitObject.name === "target") {
        const mat = (hitObject as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(0xffffff);
        setTimeout(() => mat.emissive.setHex(0x000000), 100);
      }
      
      // Mini marca de impacto
      const hitPoint = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
      hitPoint.position.copy(intersects[0].point);
      this.renderService.getScene().add(hitPoint);
      setTimeout(() => this.renderService.getScene().remove(hitPoint), 500);
    }
    this.gunMesh.position.z += 0.15;
  }

  private update() {
    // Aplicar movimiento y gravedad a través del sistema de físicas
    PhysicsSystem.applyMovement(this.player, this.keys, 0.15);

    // Lógica de salto (se queda aquí por ahora por ser un input directo)
    if (this.keys['space'] && this.player.isGrounded) {
      this.player.velocityY = 0.25;
    }

    // Actualizar cámara y visuales del jugador
    const camera = this.renderService.getCamera();
    camera.position.set(this.player.position.x, this.player.position.y + 0.6, this.player.position.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = this.player.yaw;
    camera.rotation.x = this.player.pitch;

    // Suavizar retroceso del arma
    this.gunMesh.position.z += (0 - this.gunMesh.position.z) * 0.15;

    // Sincronizar el mesh del jugador (lo que ven los demás)
    this.player.update(this.player.yaw);
  }

  private animate() {
    this.update();
    this.renderService.render();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}