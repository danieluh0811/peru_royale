import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RenderService } from '../../../core/services/render.service';
import { GameLoopService } from '../../../core/services/game-loop.service';

@Component({
  selector: 'app-game',
  standalone: false,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private renderService: RenderService,
    private gameLoop: GameLoopService
  ) {}

  ngAfterViewInit() {
    this.renderService.init(this.canvasRef);
    this.gameLoop.start();
    this.setupResizeListener();
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => this.renderService.onResize());
  }

  ngOnDestroy() {
    this.gameLoop.stop();
  }
}