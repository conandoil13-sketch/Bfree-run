export function createUI({
  statusText,
  stageNumber,
  resetButton,
  resultModal,
  resultTitle,
  resultMessage,
  restartButton,
  nextStageButton,
  totalMoves,
  stageMoves,
  tryCount,
}) {
  return {
    setStatus(message) {
      statusText.textContent = message;
    },

    setStageNumber(number) {
      stageNumber.textContent = number;
    },

    setStats({ totalMoveCount, stageMoveCount, tryCount: currentTryCount }) {
      totalMoves.textContent = totalMoveCount;
      stageMoves.textContent = stageMoveCount;
      tryCount.textContent = currentTryCount;
    },

    onReset(callback) {
      resetButton.addEventListener('click', callback);
    },

    onRestart(callback) {
      restartButton.addEventListener('click', callback);
    },

    onNextStage(callback) {
      nextStageButton.addEventListener('click', callback);
    },

    showResult({ title, message, action }) {
      resultTitle.textContent = title;
      resultMessage.textContent = message;
      restartButton.textContent = action === 'final' ? '처음부터' : '재시작';
      nextStageButton.textContent = '다음 스테이지';
      restartButton.hidden = action !== 'restart' && action !== 'final';
      nextStageButton.hidden = action !== 'next';
      resultModal.hidden = false;
    },

    hideResult() {
      resultModal.hidden = true;
    },
  };
}
