import { Point } from './point.model';
import { CurveType } from './curve-type.enum';


import 'snapsvg-cjs';
declare var Snap: any;


export const points: Point[] = [];

export function createPathD(from: Point, to: Point, curveType: CurveType, endCurveType = null): string {
    if (curveType === CurveType.HIP_CURVE) {
        return createHipLine(from, to);
    }

    endCurveType = endCurveType ? endCurveType : curveType;
    return createBrezierLine(from, to, curveType, endCurveType);

}

export function createBrezierLine(from: Point, to: Point, startCurveType, endCurveType): string {
    const c1 = getBrezierPoint(from, to, startCurveType, false);
    const c2 = getBrezierPoint(from, to, endCurveType, true);

    // points.push(c1);
    // points.push(c2);
    return createBrezierD(from, to, c1, c2);
}

function getBrezierPoint(from, to, curveType, isEndPoint): Point {
    if (curveType === CurveType.LINE) {
        return getLineBrezierPoint(from, to);
    } else if (curveType === CurveType.HOR_LINE) {
        return getHorLineBrezierPoint(from, to, isEndPoint);
    } else if (curveType === CurveType.WAIST_CURVE) {
        return getWaistBrezierPoint(from, to, isEndPoint);
    }
    return isEndPoint ? to : from;
}

export function getWaistBrezierPoint(from: Point, to: Point, isEndPoint, angle = 0): Point {
    const pullStrength = Snap.len(from.x, from.y, to.x, to.y) / 10;
    const direction = isEndPoint ? -1 : 1;
    const point = isEndPoint ? to : from;
    const rotateAngle = 45 * direction;

    const rotated3 = {...point, x: point.x + direction * pullStrength};
    const rotated = {
        y: point.y + direction * (to.y - from.y) / (15),
        x: point.x + direction * (to.x - from.x) / (15)
    };

    const x = (rotated.x - point.x) * Snap.cos(rotateAngle) - (rotated.y - point.y) * Snap.sin(rotateAngle) + point.x;
    const y = Math.abs((rotated.x - point.x) * Snap.sin(rotateAngle) - (rotated.y - point.y) * Snap.cos(rotateAngle)) + point.y;

    return {
        x: x,
        y: y
    };
}

export function getLineBrezierPoint(from: Point, to: Point): Point {

    return {
        x: to.x + (from.x - to.x) / 2,
        y: to.y + (from.y - to.y) / 2
    };
}

export function getHorLineBrezierPoint(from: Point, to: Point, isEndPoint): Point {
    const point = isEndPoint ? to : from;

    return {
        x: to.x + (from.x - to.x) / 2,
        y: point.y
    };
}



export function createHipLine(from: Point, to: Point): string {
    // should be 45deg
    // y = x
    const pullStrength = (to.x - from.x) / 2;
    const topCurvePoint = {
        x: pullStrength + from.x,
        y: Math.abs(pullStrength) + from.y
    };

    const bottomCurvePoint = {
        x: to.x,
        y: (to.y - from.y) / 2 + from.y
    };
    return createBrezierD(from, to, topCurvePoint, bottomCurvePoint);
}

export function createBrezierD(from: Point, to: Point, c1: Point, c2: Point): string {
    return 'M ' + from.x + ' ' + from.y + ' C ' +
        c1.x + ' ' + c1.y + ' ' + c2.x + ' ' + c2.y + ' ' + to.x + ' ' +  to.y;
}


