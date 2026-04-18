import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './components/game/game/game.component';

const routes: Routes = [
  { path: '', component: GameComponent }, // Ruta principal al juego
  { path: '**', redirectTo: '' }          // Si escriben cualquier cosa, al juego
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }