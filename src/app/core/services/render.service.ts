import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class RenderService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  // Cambiamos a true por defecto para que el primer frame se vea
  private needsRender = true;

  init(canvasRef: ElementRef<HTMLCanvasElement>) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); 

    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    
    // IMPORTANTE: Para FPS, la cámara no debe tener una posición inicial fija aquí,
    // ya que el GameLoopService la sobreescribirá.
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.nativeElement,
      antialias: false, // Mantén el look retro/pixelado
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras más suaves
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  // Necesitamos el renderer en el GameLoop para el Pointer Lock
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  // Forzamos que siempre se renderice cuando el loop lo pida
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}