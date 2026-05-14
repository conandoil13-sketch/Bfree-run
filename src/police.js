import { getNeighbors } from './utils.js';

export function getPoliceMove(stage, policeNodeId, playerNodeId, blockedNodeIds = new Set()) {
  const distances = getBfsDistances(stage, playerNodeId);
  const neighbors = getNeighbors(stage, policeNodeId)
    .filter((nodeId) => !blockedNodeIds.has(nodeId))
    .sort(compareNodeIds);

  if (neighbors.length === 0) {
    return policeNodeId;
  }

  return neighbors
    .map((nodeId) => ({ nodeId, distance: distances.get(nodeId) ?? Infinity }))
    .sort((a, b) => a.distance - b.distance || compareNodeIds(a.nodeId, b.nodeId))[0].nodeId;
}

export function getPoliceMoves(stage, policeNodeIds, playerNodeId) {
  const occupiedNodeIds = new Set(policeNodeIds);

  return policeNodeIds.map((policeNodeId) => {
    occupiedNodeIds.delete(policeNodeId);

    const nextPoliceNodeId = getPoliceMove(stage, policeNodeId, playerNodeId, occupiedNodeIds);

    occupiedNodeIds.add(nextPoliceNodeId);
    return nextPoliceNodeId;
  });
}

function getBfsDistances(stage, startNodeId) {
  const distances = new Map([[startNodeId, 0]]);
  const queue = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    const nextDistance = distances.get(nodeId) + 1;

    getNeighbors(stage, nodeId).forEach((neighborId) => {
      if (distances.has(neighborId)) {
        return;
      }

      distances.set(neighborId, nextDistance);
      queue.push(neighborId);
    });
  }

  return distances;
}

function compareNodeIds(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true });
}
