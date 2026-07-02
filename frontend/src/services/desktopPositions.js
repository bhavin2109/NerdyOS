const STORAGE_KEY = 'nerdyos-desktop-positions';

export function getDesktopPositions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getDesktopPosition(path, index = 0) {
  const positions = getDesktopPositions();
  if (positions[path]) return positions[path];
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { x: 20 + col * 100, y: 20 + row * 100 };
}

export function setDesktopPosition(path, position) {
  const positions = getDesktopPositions();
  positions[path] = position;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}
