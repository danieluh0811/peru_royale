import { Component } from '@angular/core';
import { GameStateService } from './core/services/game-state.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'peru-royale';

  constructor(public gameState: GameStateService) {}
}