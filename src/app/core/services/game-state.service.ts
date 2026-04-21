import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum Scene {
  MENU = 'MENU',
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING'
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private currentScene = new BehaviorSubject<Scene>(Scene.MENU);
  scene$ = this.currentScene.asObservable();

  changeScene(scene: Scene) {
    this.currentScene.next(scene);
  }
}