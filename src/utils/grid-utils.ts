import { DIRECTION } from '../common/direction';
import { TILE_SIZE } from '../config';
import { Coordinate } from '../types';
import { exhaustiveGuard } from './guard';

export const getTargetPositionFromGameObjectPositionAndDirection = (
  currentPosition: Coordinate,
  direction: DIRECTION
) => {
  let targetPosition = { ...currentPosition };

  switch (direction) {
    case DIRECTION.DOWN:
      targetPosition.y += TILE_SIZE;
      break;
    case DIRECTION.UP:
      targetPosition.y -= TILE_SIZE;
      break;
    case DIRECTION.LEFT:
      targetPosition.x -= TILE_SIZE;
      break;
    case DIRECTION.RIGHT:
      targetPosition.x += TILE_SIZE;
      break;
    case DIRECTION.NONE:
      break;
    default:
      exhaustiveGuard(direction);
  }

  return targetPosition;
};
