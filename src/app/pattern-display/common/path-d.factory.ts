import { Point } from './point.model';
import { CurveType } from './curve-type.enum';

export function createPathD(from: Point, to: Point, curveType: CurveType, curveConfig = null): string {
    if (curveType === CurveType.LINE) {
        return createStraightLine(from, to);
    } else if (curveType === CurveType.HIP_CURVE) {
        return createHipLine(from, to);
    } else if (curveType === CurveType.WAIST_CURVE) {
        return createWaistLine(from, to);
    }
}

export function createStraightLine(from: Point, to: Point) {
    return 'M ' + from.x + ' ' + from.y + ' l ' + (to.x - from.x) + ' ' + (to.y - from.y);
}

export function createHipLine(from: Point, to: Point) {
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
    return createBrezierCurve(from, to, topCurvePoint, bottomCurvePoint);
}

export function createWaistLine(from: Point, to: Point) {
    // should be 90deg
    // y = ax + b
    const pullStrength = (to.x - from.x) / 20;
    const fromCurvePoint = {
        x: pullStrength + from.x,
        y: Math.abs(pullStrength) + from.y
    };

    const toCurvePoint = {
        x: to.x - pullStrength,
        y: Math.abs(pullStrength) + to.y
    };
    return createBrezierCurve(from, to, fromCurvePoint, toCurvePoint);
}

export function createBrezierCurve(from: Point, to: Point, c1: Point, c2: Point) {
    return 'M ' + from.x + ' ' + from.y + ' C ' +
        c1.x + ' ' + c1.y + ' ' + c2.x + ' ' + c2.y + ' ' + to.x + ' ' +  to.y;
}
