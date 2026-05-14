const TOKEN_IMAGES = {
  player: './assets/bfree-token.png',
  police: './assets/police-token.png',
  exit: './assets/exit-icon.png',
};

const NODE_RADIUS = 16;
const NODE_HIT_RADIUS = 42;
const PLAYER_SIZE = 60;
const POLICE_SIZE = 56;

export class Board {
  constructor(canvas) {
    this.canvas = canvas;
    this.logicalWidth = Number(canvas.getAttribute('width'));
    this.logicalHeight = Number(canvas.getAttribute('height'));
    this.ctx = canvas.getContext('2d');
    this.setupCanvasScale();
    this.images = this.loadImages();
    this.clickHandler = null;
    this.canvas.addEventListener('click', (event) => this.handleClick(event));
    window.addEventListener('resize', () => {
      this.setupCanvasScale();
      this.lastRender?.();
    });
  }

  render(stage, state, options = {}) {
    this.setupCanvasScale();
    this.lastStage = stage;
    this.lastState = state;
    this.lastRender = () => this.render(stage, state);

    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
    this.drawBackground();
    this.drawEdges(stage, state);
    this.drawNodes(stage, state);
    this.drawExit(stage);
    this.drawPolice(stage, state, options.policePositions);
    this.drawPlayer(stage, state, options.playerPosition);
  }

  drawBackground() {
    this.ctx.fillStyle = '#d6d2c8';
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    this.ctx.strokeStyle = 'rgba(63, 71, 62, 0.12)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.logicalWidth; x += 36) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.logicalHeight);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.logicalHeight; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.logicalWidth, y);
      this.ctx.stroke();
    }
  }

  drawEdges(stage, state) {
    this.ctx.lineCap = 'round';

    stage.edges.forEach(([fromId, toId]) => {
      const from = this.getNode(stage, fromId);
      const to = this.getNode(stage, toId);
      const isPoliceLane = from.kind === 'police' || to.kind === 'police';
      const isAvailableEdge = (
        fromId === state.playerNodeId && state.availableNodeIds.includes(toId)
      ) || (
        toId === state.playerNodeId && state.availableNodeIds.includes(fromId)
      );
      const hasToken = (
        fromId === state.playerNodeId
        || toId === state.playerNodeId
        || state.policeNodeIds.includes(fromId)
        || state.policeNodeIds.includes(toId)
      );

      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.strokeStyle = isAvailableEdge
        ? '#b91f2b'
        : hasToken
          ? '#4f5c54'
          : isPoliceLane
            ? '#b7b1a4'
            : '#7c8279';
      this.ctx.lineWidth = isAvailableEdge ? 5 : hasToken ? 3 : isPoliceLane ? 1 : 2;
      this.ctx.stroke();
    });
  }

  drawNodes(stage, state) {
    stage.nodes.forEach((node) => {
      const isCurrent = node.id === state.playerNodeId;
      const isAvailable = state.availableNodeIds.includes(node.id);
      const isExit = node.id === stage.exitNode;
      const hasPolice = state.policeNodeIds.includes(node.id);
      const shouldDrawNode = node.kind !== 'police' || isCurrent || isAvailable || hasPolice;

      if (!shouldDrawNode) {
        return;
      }

      if (isAvailable) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(185, 31, 43, 0.18)';
        this.ctx.fill();
      }

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, isCurrent ? 19 : NODE_RADIUS, 0, Math.PI * 2);
      this.ctx.fillStyle = isExit ? '#d8e6c8' : isAvailable ? '#e5d7ad' : '#e4e1d8';
      this.ctx.fill();
      this.ctx.strokeStyle = isCurrent ? '#b91f2b' : isExit ? '#3f5f3b' : '#1f2924';
      this.ctx.lineWidth = isCurrent || isExit ? 5 : isAvailable ? 3 : 2.5;
      this.ctx.stroke();
    });
  }

  drawExit(stage) {
    const node = this.getNode(stage, stage.exitNode);

    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, 34, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(63, 95, 59, 0.2)';
    this.ctx.fill();
    this.ctx.fillStyle = '#26342c';
    this.ctx.font = '900 13px system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText('EXIT', node.x, node.y - 37);
    this.drawTokenAt(node, 'exit', 38);
  }

  drawPlayer(stage, state, playerPosition) {
    const node = playerPosition ?? this.getNode(stage, state.playerNodeId);
    this.drawStandeeAt(node, 'player', PLAYER_SIZE);
  }

  drawPolice(stage, state, policePositions) {
    const positions = policePositions ?? state.policeNodeIds.map((nodeId) => this.getNode(stage, nodeId));

    positions.forEach((position) => {
      this.drawStandeeAt(position, 'police', POLICE_SIZE);
    });
  }

  drawToken(stage, nodeId, type, size = 58) {
    const node = this.getNode(stage, nodeId);
    this.drawTokenAt(node, type, size);
  }

  drawTokenAt(node, type, size = 58) {
    const image = this.images[type];
    const radius = size / 2;
    const x = node.x - radius;
    const y = node.y - radius;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    this.ctx.clip();

    if (image.complete && image.naturalWidth > 0) {
      this.drawImageContained(image, x, y, size, size);
    } else {
      this.drawFallbackToken(node, type, radius);
    }

    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    const strokeColors = {
      player: '#d3282f',
      police: '#1f5c9b',
      exit: '#1d8f58',
    };

    this.ctx.strokeStyle = strokeColors[type];
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
  }

  drawStandeeAt(node, type, size) {
    const image = this.images[type];
    const width = size;
    const height = Math.round(size * 1.28);
    const footY = node.y + 12;
    const x = node.x - width / 2;
    const y = footY - height;
    const baseColor = type === 'player' ? '#b91f2b' : '#1f3f65';

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(node.x, footY + 4, width * 0.32, 8, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(31, 35, 40, 0.24)';
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(node.x, footY, width * 0.44, 9, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = baseColor;
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    if (image.complete && image.naturalWidth > 0) {
      this.ctx.shadowColor = 'rgba(31, 35, 40, 0.25)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetY = 5;
      this.drawImageContained(image, x, y, width, height, 'bottom');
    } else {
      this.drawFallbackStandee(node, type, width, height);
    }

    this.ctx.restore();
  }

  drawFallbackStandee(node, type, width, height) {
    const baseColor = type === 'player' ? '#b91f2b' : '#1f3f65';
    const footY = node.y + 12;
    const x = node.x - width / 2;
    const y = footY - height;

    this.ctx.fillStyle = baseColor;
    this.ctx.beginPath();
    this.ctx.roundRect(x + width * 0.18, y, width * 0.64, height * 0.82, 10);
    this.ctx.fill();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '700 20px system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(type === 'player' ? 'B' : 'P', node.x, y + height * 0.4);
  }

  drawFallbackToken(node, type, radius) {
    const colors = {
      player: '#b91f2b',
      police: '#1f3f65',
      exit: '#3f5f3b',
    };

    this.ctx.fillStyle = colors[type];
    this.ctx.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '700 20px system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(type === 'exit' ? 'EXIT' : type[0].toUpperCase(), node.x, node.y);
  }

  animatePlayerMove(stage, state, fromNodeId, toNodeId, onComplete) {
    const from = this.getNode(stage, fromNodeId);
    const to = this.getNode(stage, toNodeId);
    const duration = 180;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const playerPosition = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
      };

      this.render(stage, state, { playerPosition });

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      onComplete();
    };

    requestAnimationFrame(tick);
  }

  animatePoliceMove(stage, state, fromNodeIds, toNodeIds, onComplete) {
    const fromNodes = fromNodeIds.map((nodeId) => this.getNode(stage, nodeId));
    const toNodes = toNodeIds.map((nodeId) => this.getNode(stage, nodeId));
    const duration = 180;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const policePositions = fromNodes.map((from, index) => {
        const to = toNodes[index];

        return {
          x: from.x + (to.x - from.x) * eased,
          y: from.y + (to.y - from.y) * eased,
        };
      });

      this.render(stage, state, { policePositions });

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      onComplete();
    };

    requestAnimationFrame(tick);
  }

  onNodeClick(callback) {
    this.clickHandler = callback;
  }

  handleClick(event) {
    if (!this.clickHandler || !this.lastStage) {
      return;
    }

    const point = this.getCanvasPoint(event);
    const clickedNode = this.getClosestClickableNode(point);

    if (clickedNode) {
      this.clickHandler(clickedNode.id);
    }
  }

  getClosestClickableNode(point) {
    const candidates = this.lastStage.nodes
      .map((node) => ({
        node,
        distance: Math.hypot(node.x - point.x, node.y - point.y),
        isAvailable: this.lastState?.availableNodeIds.includes(node.id),
      }))
      .filter(({ distance }) => distance <= NODE_HIT_RADIUS)
      .sort((a, b) => {
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1;
        }

        return a.distance - b.distance;
      });

    return candidates[0]?.node;
  }

  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (this.logicalWidth / rect.width),
      y: (event.clientY - rect.top) * (this.logicalHeight / rect.height),
    };
  }

  getNode(stage, nodeId) {
    return stage.nodes.find((node) => node.id === nodeId);
  }

  loadImages() {
    return Object.entries(TOKEN_IMAGES).reduce((images, [key, src]) => {
      const image = new Image();
      image.src = src;
      image.onload = () => this.lastRender?.();
      images[key] = image;
      return images;
    }, {});
  }

  setupCanvasScale() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const scaledWidth = Math.round(this.logicalWidth * dpr);
    const scaledHeight = Math.round(this.logicalHeight * dpr);

    if (this.canvas.width !== scaledWidth || this.canvas.height !== scaledHeight) {
      this.canvas.width = scaledWidth;
      this.canvas.height = scaledHeight;
    }

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  drawImageContained(image, x, y, width, height, verticalAlign = 'center') {
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    let drawWidth = width;
    let drawHeight = drawWidth / aspectRatio;

    if (drawHeight > height) {
      drawHeight = height;
      drawWidth = drawHeight * aspectRatio;
    }

    const drawX = x + (width - drawWidth) / 2;
    const drawY = verticalAlign === 'bottom'
      ? y + height - drawHeight
      : y + (height - drawHeight) / 2;

    this.ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }
}
