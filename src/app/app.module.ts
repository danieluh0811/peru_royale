import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // <--- 1. IMPORTANTE: Agrega esta línea

import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game/game.component';
import { AppRoutingModule } from './app-routing.module'; 
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { MenuComponent } from './components/game/menu/menu/menu.component';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MenuComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule, // <--- 2. Y AGREGA ESTA AQUÍ
    AppRoutingModule,
    SocketIoModule.forRoot(config) 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }