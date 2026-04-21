import { Injectable, NgZone } from '@angular/core';
import { RenderService } from './render.service';
import * as THREE from 'three';
import { Socket } from 'ngx-socket-io';
import { Player } from '../../game/entities/player';
import { RemotePlayer } from '../../game/entities/remote-player';
import { MapGenerator } from '../../game/world/map-generator';
import { PhysicsSystem } from '../../game/systems/physics.system';
import { GameStateService, Scene } from './game-state.service';

@Injectable({ providedIn: 'root' })
export class GameLoopService {
  private animationId: number | null = null;
  private player!: Player;
  private gunMesh!: THREE.Group;

  private remotePlayers: Map<string, RemotePlayer> = new Map();

  private keys: { [key: string]: boolean } = {
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  };

  private lastEmitTime = 0;
  constructor(
    private ngZone: NgZone,
    private renderService: RenderService,
    private socket: Socket,
    private gameState: GameStateService, // <--- 1. Inyectar el servicio
  ) {
    // 2. Escuchar cambios de escena de forma automática
    this.gameState.scene$.subscribe((scene) => {
      if (scene === Scene.PLAYING) {
        this.start(); // Arranca el juego si pasamos a PLAYING
      } else {
        this.stop(); // Detiene el loop si volvemos al MENU
      }
    });
  }
  start() {
    this.ngZone.runOutsideAngular(() => {
      this.player = new Player(this.renderService.getScene());
      MapGenerator.create(this.renderService.getScene());

      this.initGun();
      this.setupControls();
      this.setupNetwork();
      this.animate();
    });
  }

  private initGun() {
    this.gunMesh = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222222 }),
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
      // Si el mouse no está bloqueado, bloquéalo primero
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      } else {
        if (e.button === 0) this.shoot();
      }
    });

    // USAR DOCUMENT en lugar de WINDOW para el mousemove ayuda con la fluidez en el bloqueo
    document.addEventListener('mousemove', (e) => {
      // IMPORTANTE: Solo mover si el canvas tiene el foco del mouse
      if (document.pointerLockElement === canvas) {
        const sensitivity = 0.002; // Ajusta este número a tu gusto

        // Usamos movementX/Y que es la delta de movimiento, no la posición absoluta
        this.player.yaw -= e.movementX * sensitivity;
        this.player.pitch -= e.movementY * sensitivity;

        // Limitar el cabeceo (mirar arriba/abajo) para no dar la vuelta completa
        const limit = Math.PI / 2 - 0.05;
        this.player.pitch = Math.max(
          -limit,
          Math.min(limit, this.player.pitch),
        );
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') e.preventDefault();
      this.handleKey(e.key, true);
    });

    window.addEventListener('keyup', (e) => this.handleKey(e.key, false));
  }

  private handleKey(key: string, isPressed: boolean) {
    const k = key.toLowerCase();
    if (k === ' ') this.keys['space'] = isPressed;
    else this.keys[k] = isPressed;
  }

  private setupNetwork() {
    this.socket.fromEvent('currentPlayers').subscribe((players: any) => {
      Object.keys(players).forEach((id) => {
        if (id !== this.socket.ioSocket.id) {
          this.addRemotePlayer(id, players[id].color);
        }
      });
    });

    this.socket.fromEvent('newPlayer').subscribe((data: any) => {
      this.addRemotePlayer(data.id, data.color);
    });

    this.socket.fromEvent('playerMoved').subscribe((data: any) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote) {
        remote.update(data, data.yaw);
      }
    });

    this.socket.fromEvent('playerDisconnected').subscribe((id: string) => {
      const remote = this.remotePlayers.get(id);
      if (remote) {
        this.renderService.getScene().remove(remote.mesh);
        this.remotePlayers.delete(id);
      }
    });
  }

  private addRemotePlayer(id: string, color: number) {
    if (!this.remotePlayers.has(id)) {
      const remote = new RemotePlayer(this.renderService.getScene(), color);
      this.remotePlayers.set(id, remote);
    }
  }

  private shoot() {
    const raycaster = new THREE.Raycaster();
    const camera = this.renderService.getCamera();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = raycaster.intersectObjects(
      this.renderService.getScene().children,
    );

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;

      if (hitObject.name === 'target') {
        const mat = (hitObject as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(0xffffff);
        setTimeout(() => mat.emissive.setHex(0x000000), 100);
      }

      const hitPoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        new THREE.MeshBasicMaterial({ color: 0xffff00 }),
      );
      hitPoint.position.copy(intersects[0].point);
      this.renderService.getScene().add(hitPoint);
      setTimeout(() => this.renderService.getScene().remove(hitPoint), 500);
    }
    this.gunMesh.position.z += 0.15;
  }

  private update() {
    PhysicsSystem.applyMovement(this.player, this.keys, 0.15);

    if (this.keys['space'] && this.player.isGrounded) {
      this.player.velocityY = 0.25;
    }

    const camera = this.renderService.getCamera();
    camera.position.set(
      this.player.position.x,
      this.player.position.y + 0.6,
      this.player.position.z,
    );
    camera.rotation.order = 'YXZ';
    camera.rotation.y = this.player.yaw;
    camera.rotation.x = this.player.pitch;

    this.gunMesh.position.z += (0 - this.gunMesh.position.z) * 0.15;
    this.player.update(this.player.yaw);

    const now = Date.now();
    if (now - this.lastEmitTime > 30) {
      this.socket.emit('playerMovement', {
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z,
        yaw: this.player.yaw,
      });
      this.lastEmitTime = now;
    }
  }

  private animate() {
    this.update();
    this.renderService.render();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);

    // Limpiar la escena para que no se acumulen objetos
    const scene = this.renderService.getScene();

    // Quitar mi jugador
    if (this.player) scene.remove(this.player.mesh);

    // Quitar jugadores remotos
    this.remotePlayers.forEach((remote) => scene.remove(remote.mesh));
    this.remotePlayers.clear();

    // Opcional: desconectar o simplemente dejar de escuchar
    // this.socket.disconnect();
  }
}
