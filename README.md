# B-Free Run

HTML, CSS, Vanilla JavaScript 기반 모바일 웹 퍼즐 게임 뼈대입니다.

## 파일 역할

- `index.html`: 앱 진입점입니다. CSS와 ES module JavaScript를 연결하고 모바일 화면용 기본 UI를 제공합니다.
- `styles/style.css`: 모바일 세로 화면 중심의 레이아웃, 보드, 상태 영역, 결과 팝업 스타일을 관리합니다.
- `src/main.js`: DOM 요소를 찾고 `Game` 인스턴스를 생성해 앱을 시작합니다.
- `src/game.js`: 게임 상태, 스테이지 로딩, 인접 노드 클릭 이동, 경찰 턴, 승패 판정을 담당합니다.
- `src/board.js`: `nodes`와 `edges` 데이터를 기반으로 캔버스에 보드, 출구, 플레이어/경찰 토큰, 이동 가능 노드 하이라이트를 그립니다.
- `src/police.js`: BFS 기반 경찰 추격 AI를 담당합니다.
- `src/stages.js`: 12개 스테이지의 노드, 선, 시작 위치, 경찰 위치, 출구, `parMoves` 데이터를 관리합니다.
- `src/ui.js`: 버튼 입력, 상태 문구, 스테이지 표시, 결과 팝업 표시를 담당합니다.
- `src/utils.js`: 노드 이웃 찾기, 이동 가능 여부, 거리 계산 같은 공통 함수를 제공합니다.
- `assets/`: `bfree-token.png`, `police-token.png`, `exit-icon.png` 같은 이미지 에셋을 관리합니다.

## 실행

정적 파일만 사용하므로 로컬 서버에서 열면 됩니다.

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속하세요.

## GitHub Pages 배포

이 프로젝트는 `.github/workflows/deploy-pages.yml`로 GitHub Pages 배포를 설정합니다.

1. GitHub 저장소 `Settings > Pages`에서 `Source`를 `GitHub Actions`로 설정합니다.
2. `main` 브랜치에 push하면 Pages 배포 워크플로우가 실행됩니다.
3. 배포 후 저장소의 Pages URL에서 게임을 플레이할 수 있습니다.

## 스테이지 추가 방식

`src/stages.js`의 `STAGES` 배열에 `makeStage` 설정을 추가하거나 수정하면 됩니다.

```js
makeStage({
  id: 2,
  pathLength: 4,
  policeAnchors: [2],
  policeTailLength: 4,
  trapAnchors: [1],
  parMoves: 4,
})
```
