import { Point } from './point.model';
import { CurveType } from './curve-type.enum';
import { PointTransformer } from './point-transformer';


import 'snapsvg-cjs';
declare var Snap: any;


export const points: Point[] = [];

export function createPathD(from: Point, to: Point, curveType: CurveType,
    endCurveType = null, curveAngle = 0, r = 3000): string {
    endCurveType = endCurveType ? endCurveType : curveType;
    if (curveType === CurveType.ARCH) {
        return createBrezierA(from, to, r);
    }
    console.log(curveType, endCurveType);
    return createBrezierLine(from, to, curveType, endCurveType, curveAngle);
}

export function createBrezierLine(from: Point, to: Point, startCurveType, endCurveType, angle): string {
    const c1 = getBrezierPoint(from, to, startCurveType, false, angle);
    const c2 = getBrezierPoint(from, to, endCurveType, true, angle);

    // points.push(c1);
    // points.push(c2);
    return createBrezierD(from, to, c1, c2);
}

function getBrezierPoint(from, to, curveType, isEndPoint, angle): Point {
    if (curveType === CurveType.LINE) {
        return getLineBrezierPoint(from, to);
    } else if (curveType === CurveType.HOR_LINE) {
        return getHorLineBrezierPoint(from, to, isEndPoint);
    } else if (curveType === CurveType.VER_LINE) {
        return getVerLineBrezierPoint(from, to, isEndPoint, angle);
    } else if (curveType === CurveType.WAIST_CURVE) {
        return getWaistBrezierPoint(from, to, isEndPoint);
    } else if (curveType === CurveType.HIP_CURVE) {
        return getHipBrezierPoint(from, to, isEndPoint, angle);
    }
    return isEndPoint ? to : from;
}

export function getWaistBrezierPoint(from: Point, to: Point, isEndPoint, angle = 0): Point {
    const pullStrength = Snap.len(from.x, from.y, to.x, to.y) / 10;
    const direction = isEndPoint ? -1 : 1;
    const point = isEndPoint ? to : from;
    const rotateAngle = 45 * direction;

    const rotated = {
        y: point.y + direction * (to.y - from.y) / (12),
        x: point.x + direction * (to.x - from.x) / (12)
    };
    return PointTransformer.rotate(rotated, point, rotateAngle);
}

    // const x = (rotated.x - point.x) * Snap.cos(rotateAngle) - (rotated.y - point.y) * Snap.sin(rotateAngle) + point.x;
    // const y = (rotated.x - point.x) * Snap.sin(rotateAngle) - (rotated.y - point.y) * Snap.cos(rotateAngle) + point.y;
export function getHipBrezierPoint(from: Point, to: Point, isEndPoint, angle = 0): Point {
    const point = isEndPoint ? to : from;
    const endPoint = isEndPoint ? from : to;
    angle = isEndPoint ? -1 * angle : angle;

    const pullStrength = isEndPoint ? -2.0 : 2.0;
    return PointTransformer.rotate({
        x: pullStrength + point.x,
        y: Math.abs(pullStrength) + point.y
    }, point, angle);

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

export function getVerLineBrezierPoint(from: Point, to: Point, isEndPoint, angle = 0): Point {
    const point = isEndPoint ? to : from;
    const endPoint = isEndPoint ? from : to;

    angle = isEndPoint ? angle : angle * -1;
    return PointTransformer.rotate({
        x: point.x,
        y: point.y - (point.y - endPoint.y) / 2
    }, point, angle);
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

export function getLineValueAt(lineAPoint, lineBPoint, x) {
    let slope = (lineBPoint.y - lineAPoint.y) / (lineBPoint.x - lineAPoint.x);
    slope = isFinite(slope) ? slope : Number.MAX_SAFE_INTEGER;
    const b = lineAPoint.y - (slope * lineAPoint.x);

    const y = isFinite(slope) ? slope * x + b : Number.MAX_SAFE_INTEGER;
    const len = Snap.len(lineAPoint.x, lineAPoint.y, x, y);
    points.push({x: x, y: slope * x + b});
    return y;
}

export function createBrezierD(from: Point, to: Point, c1: Point, c2: Point): string {
    return 'M ' + from.x + ' ' + from.y + ' C ' +
        c1.x + ' ' + c1.y + ' ' + c2.x + ' ' + c2.y + ' ' + to.x + ' ' +  to.y;
}

export function createBrezierA(from: Point, to: Point, r: number): string {
    const MAX_RADIUS = 3000;
    const flip = from.y < 10 ? '0' : '1';
    r = Math.min(r, MAX_RADIUS);
    r = Math.max(r, -1 * MAX_RADIUS);
    return 'M ' + from.x + ' ' + from.y + ' A ' +
        r + ' ' + r + ' 0 0 ' + flip + ' ' + to.x + ' ' +  to.y;
}


