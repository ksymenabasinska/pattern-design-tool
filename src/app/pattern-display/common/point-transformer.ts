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

        const iPoint = Snap.path.intersection(path, intersectionLine)[0];
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
    rotate(rotated: Point, pivot: Point, angle) {
        const p = {... rotated};
        const cx = pivot.x;
        const cy = pivot.y;
        const s = Snap.sin(angle);
        const c = Snap.cos(angle);

        // translate point back to origin:
        p.x -= cx;
        p.y -= cy;

        // rotate point
        const xnew = p.x * c - p.y * s;
        const ynew = p.x * s + p.y * c;

        // translate point back:
        p.x = xnew + cx;
        p.y = ynew + cy;
        return p;
    }
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
