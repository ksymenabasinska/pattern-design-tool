import { Point } from './point.model';
import { PathPoint } from './path-point.model';
import { CurveType } from './curve-type.enum';
import { createPathD } from './path-d.factory';


import 'snapsvg-cjs';
declare var Snap: any;

export const PointTransformer = {
    addPoints(a: Point,  b: Point): Point {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
    },
    moveAlongLineVer(point: Point, directionPoint: Point, yDiff: number): Point {
        const tg = (directionPoint.x - point.x) / (directionPoint.y - point.y);

        return {
            x: point.x + yDiff * tg,
            y: yDiff + point.y
        };
    },
    moveAlongBrezVer(point: Point, directionPoint: Point, curveType: CurveType, yDiff: number) {
        console.log(yDiff);
        const path = createPathD(point, directionPoint, CurveType.HIP_CURVE);
        const iPointA = PointTransformer.addPoints(point, {
            x: - 10,
            y: yDiff
        });
        const iPointB = PointTransformer.addPoints(point, {
            x: 10,
            y: yDiff
        });
        const intersectionLine = createPathD(iPointA, iPointB, CurveType.LINE);

        console.log('path: ', iPointA, 'intersectionLine: ', iPointB);
        const iPoint = Snap.path.intersection(path, intersectionLine)[0];
        console.log(Snap.path.intersection(path, intersectionLine));
        return {
            x: iPoint.x,
            y: iPoint.y
        };
    },
    moveAlongLineHor(point: Point, directionPoint: Point, xDiff: number) {
        const ctg = directionPoint.y / directionPoint.x;
        // raise hip by 1cm
        return {
            x: xDiff + point.x,
            y: xDiff * ctg + point.y
        };
    },
};


// Snap.path.getTotalLength(path)
// Snap.path.getPointAtLength(path, length)
// Snap.path.getSubpath(path, from, to) ⚓ ➭
// Returns the subpath of a given path between given start and end lengths
// Element.getTotalLength() ⚓ ➭
// Returns the length of the path in pixels (only works for path elements)
// Element.getPointAtLength(length)
// Element.getSubpath(from, to)
// Snap.path.intersection(path1, path2)
// Returns:arraydots of intersection
