import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game/game.component';
// 1. IMPORTA EL ARCHIVO DE RUTAS AQUÍ
import { AppRoutingModule } from './app-routing.module'; 

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule // 2. AGRÉGALO A LA LISTA DE IMPORTS
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }