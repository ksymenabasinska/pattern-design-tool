import { Point } from './point.model';
import { PathPoint } from './path-point.model';

export const PathTransformer = {
    makeTranslatedBy(paths: PathPoint[],  vector: Point): PathPoint[] {
        return paths.map(path => {
            const newPointLocation = {
                x: path.point.x + vector.x,
                y: path.point.y + vector.y
            };
            return {...path,
                point: newPointLocation
            };
        });
    },
    makeRotatedBy(vectorObject: PathPoint[],  angleInDegrees: number, pivotPoint: Point) {

    },
    makeScaledBy(vectorObject: PathPoint[],  scale: number) {

    },
    // @TODO make flipped by any line
    makeFlippedVertically(paths: PathPoint[], x: number) {
      return paths.map(path => {
        const newPointLocation = {
            x: (x - path.point.x) + x,
            y: path.point.y
        };
        return {...path,
            point: newPointLocation
        };
    });
    }
};
