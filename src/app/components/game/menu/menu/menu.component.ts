import { Component, OnInit } from '@angular/core';
import { GameStateService } from '../../../../core/services/game-state.service';
import { Scene } from '../../../../core/services/game-state.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  // Estado local del menú
  mode: string = 'dm'; // Deathmatch por defecto
  playerId: string = 'Conectando...';
  currentRoomId: string | null = null;
  rooms: any[] = [];
  showRooms: boolean = false;

  constructor(
    private gameState: GameStateService,
    private socket: Socket
  ) {}

  ngOnInit(): void {
    this.socket.on('connect', () => {
     this.playerId = this.socket.ioSocket.id ?? 'Desconectado';
    });
    
    // Si ya estaba conectado
    if (this.socket.ioSocket.id) {
      this.playerId = this.socket.ioSocket.id;
    }

    // Escuchar lista de salas
    this.socket.on('roomsList', (rooms: any[]) => {
      console.log('Salas disponibles:', rooms);
      this.rooms = rooms;
    });
  }

  selectMode(selectedMode: string): void {
    this.mode = selectedMode;
  }

  startGame(): void {
    console.log(`Iniciando partida en modo: ${this.mode}`);
    
    // Generar un ID único para la sala
    this.currentRoomId = 'room_' + Math.random().toString(36).substr(2, 9);
    
    // 1. Avisar al servidor que creamos una sala
    this.socket.emit('createRoom', {
      roomId: this.currentRoomId,
      mode: this.mode,
      playerId: this.playerId
    });

    // 2. Unirse a la sala creada
    this.socket.emit('joinRoom', {
      room: this.currentRoomId,
      mode: this.mode
    });

    // 3. Cambiar la escena global a PLAYING
    this.gameState.changeScene(Scene.PLAYING);
  }

  searchRooms(): void {
    this.socket.emit('getRooms');
    this.showRooms = true;
  }

  joinRoom(roomId: string): void {
    this.currentRoomId = roomId;
    this.socket.emit('joinRoom', {
      room: roomId,
      mode: this.mode
    });
    this.gameState.changeScene(Scene.PLAYING);
  }
}