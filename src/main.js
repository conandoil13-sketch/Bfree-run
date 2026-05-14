import { Game } from './game.js';
import { createUI } from './ui.js';
import { STAGES } from './stages.js';

const canvas = document.querySelector('#game-board');
const ui = createUI({
  statusText: document.querySelector('#status-text'),
  stageNumber: document.querySelector('#stage-number'),
  resetButton: document.querySelector('#reset-button'),
  resultModal: document.querySelector('#result-modal'),
  resultTitle: document.querySelector('#result-title'),
  resultMessage: document.querySelector('#result-message'),
  restartButton: document.querySelector('#restart-button'),
  nextStageButton: document.querySelector('#next-stage-button'),
  totalMoves: document.querySelector('#total-moves'),
  stageMoves: document.querySelector('#stage-moves'),
  tryCount: document.querySelector('#try-count'),
});

const game = new Game({
  canvas,
  stages: STAGES,
  ui,
});

game.start();
