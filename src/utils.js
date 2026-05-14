export function getNodeById(stage, nodeId) {
  return stage.nodes.find((node) => node.id === nodeId);
}

export function getNeighbors(stage, nodeId) {
  return stage.edges
    .filter(([fromId, toId]) => fromId === nodeId || toId === nodeId)
    .map(([fromId, toId]) => (fromId === nodeId ? toId : fromId));
}

export function canMoveToNode(stage, fromNodeId, toNodeId) {
  return getNeighbors(stage, fromNodeId).includes(toNodeId);
}

export function getNodeDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
