import { Board } from './board.js';
import { getPoliceMoves } from './police.js';
import { canMoveToNode, getNeighbors } from './utils.js';

export class Game {
  constructor({ canvas, stages, ui }) {
    this.stages = stages;
    this.currentStageIndex = 0;
    this.ui = ui;
    this.board = new Board(canvas);
    this.state = null;
    this.isAnimating = false;
    this.totalMoveCount = 0;
    this.stageTryCounts = new Map();
  }

  start() {
    this.loadStage(0);
    this.board.onNodeClick((nodeId) => this.tryMovePlayer(nodeId));
    this.ui.onReset(() => this.resetStage());
    this.ui.onRestart(() => this.resetStage());
    this.ui.onNextStage(() => this.loadNextStage());
  }

  loadStage(stageIndex) {
    const stage = this.stages[stageIndex];
    const tryCount = this.stageTryCounts.get(stage.id) ?? 1;

    this.currentStageIndex = stageIndex;
    this.state = {
      status: 'playing',
      playerNodeId: stage.playerStart,
      policeNodeIds: [...stage.policeStarts],
      availableNodeIds: getNeighbors(stage, stage.playerStart),
      stageMoveCount: 0,
      tryCount,
    };
    this.isAnimating = false;

    this.ui.hideResult();
    this.ui.setStageNumber(`${stage.id} / ${this.stages.length}`);
    this.ui.setStatus(`${stage.title} · Par ${stage.parMoves}`);
    this.updateStats();
    this.render();
  }

  resetStage() {
    const stage = this.currentStage;
    this.stageTryCounts.set(stage.id, (this.stageTryCounts.get(stage.id) ?? 1) + 1);
    this.loadStage(this.currentStageIndex);
  }

  tryMovePlayer(nextNodeId) {
    if (this.state.status !== 'playing' || this.isAnimating) {
      return;
    }

    const stage = this.currentStage;

    if (!canMoveToNode(stage, this.state.playerNodeId, nextNodeId)) {
      return;
    }

    this.isAnimating = true;
    this.state.availableNodeIds = [];

    this.board.animatePlayerMove(stage, this.state, this.state.playerNodeId, nextNodeId, () => {
      this.state.playerNodeId = nextNodeId;
      this.totalMoveCount += 1;
      this.state.stageMoveCount += 1;
      this.updateStats();

      if (this.isPlayerCaught()) {
        this.finishStage('failed');
        return;
      }

      if (this.hasPlayerEscaped()) {
        this.finishStage('cleared');
        return;
      }

      this.movePolice();
    });
  }

  movePolice() {
    const stage = this.currentStage;
    const nextPoliceNodeIds = getPoliceMoves(stage, this.state.policeNodeIds, this.state.playerNodeId);

    this.board.animatePoliceMove(stage, this.state, this.state.policeNodeIds, nextPoliceNodeIds, () => {
      this.state.policeNodeIds = nextPoliceNodeIds;

      if (this.isPlayerCaught()) {
        this.finishStage('failed');
        return;
      }

      this.state.availableNodeIds = getNeighbors(stage, this.state.playerNodeId);
      this.isAnimating = false;
      this.ui.setStatus('이동 가능한 노드를 선택하세요.');
      this.render();
    });
  }

  finishStage(status) {
    this.state.status = status;
    this.state.availableNodeIds = [];
    this.isAnimating = false;

    if (status === 'cleared') {
      const isFinalStage = this.currentStageIndex === this.stages.length - 1;

      this.ui.setStatus(isFinalStage ? '최종 클리어!' : '탈출 성공!');
      this.ui.showResult(
        isFinalStage
          ? {
              title: '최종 클리어',
              message: '12스테이지를 모두 탈출했습니다.',
              action: 'final',
            }
          : {
              title: '탈출 성공',
              message: '출구까지 도착했습니다.',
              action: 'next',
            },
      );
    } else {
      this.ui.setStatus('잡혔다!');
      this.ui.showResult({
        title: '잡혔다',
        message: '경찰이 같은 노드에 도착했습니다.',
        action: 'restart',
      });
    }

    this.render();
  }

  loadNextStage() {
    const nextStageIndex = this.currentStageIndex + 1;

    if (nextStageIndex >= this.stages.length) {
      this.resetStage();
      return;
    }

    this.loadStage(nextStageIndex);
  }

  hasPlayerEscaped() {
    return this.state.playerNodeId === this.currentStage.exitNode;
  }

  isPlayerCaught() {
    return this.state.policeNodeIds.includes(this.state.playerNodeId);
  }

  render() {
    this.board.render(this.currentStage, this.state);
  }

  updateStats() {
    this.ui.setStats({
      totalMoveCount: this.totalMoveCount,
      stageMoveCount: this.state.stageMoveCount,
      tryCount: this.state.tryCount,
    });
  }

  get currentStage() {
    return this.stages[this.currentStageIndex];
  }
}
