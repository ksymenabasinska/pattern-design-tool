
// no line is also a connection type
// this way we dont have to create new objects
export enum CurveType {
    ARCH,
    LINE,
    HIP_CURVE,
    NONE
}

export enum LinePurpose {
    HEM,
    CUT,
    HELPER,
    DART_TOP_A,
    DART_TOP_B,
    DART_BOTTOM,
    YOKE_TOP,
    YOKE_SIDE,
    SYMETRY_FOLD,
    SIDE_SEAM
}

const basicStrokeWidth = 0.2;
export const StrokeStyles = {
    HELPER: <StrokeStyle> {
        colorHash: '#666',
        width: basicStrokeWidth,
        dasharray: '0.5, 0.2'
    },
    FOLD: <StrokeStyle> {
        colorHash: '#000',
        width: basicStrokeWidth / 2,
        dasharray: '0.2, 0.2'
    },
    SEAM_ALLOWANCE: <StrokeStyle> {
        colorHash: '#000',
        width: basicStrokeWidth / 2,
        dasharray: '0.8, 0.1'
    },
    DART: <StrokeStyle> {
        colorHash: '#000',
        width: basicStrokeWidth / 2,
        dasharray: ''
    },
    NORMAL: <StrokeStyle> {
        colorHash: '#000',
        width: basicStrokeWidth,
        dasharray: ''
    },
};

export interface StrokeStyle {
    colorHash: string;
    width: number;
    dasharray: string;
}

export interface Point {
    x: number;
    y: number;
}

export interface PathPoint {
    point: Point;
    curve: CurveType;
    linePurposes: LinePurpose[];
    pieceIds?: number[];
    seamAllowance?: number;
}

export interface Curve {
   curveType: CurveType;
   curvePoints: Point[];
}

export interface SVGPath {
    strokeColor: string;
    strokeWidth: number;
    strokeDasharray: string;
    d: string;
}

export interface FabricPiece {
    id: number;
    position: Point;
}

export function VectorPointFactory(x, y, curveType, linePurpose) {
    return {
        x: x,
        y: y,
        d: CurveFactory.createCurve(curveType),
        stroke: {
            color: 'black',
            width: '2',
            dasharray: '5  5'
        }
    };
}

// is this really necessary?
export const CurveFactory = {
    createCurve(test) {
        return '';
    },
    createHipCurve: function name(startPoint: Point, endPoint: Point): Curve {
        return null;
    },
    createStraightLine: function name(startPoint: Point, endPoint: Point): Curve {
        const curvePoints = [{
            x: endPoint.x - startPoint.x,
            y: endPoint.y - startPoint.y
        }];
        return {
            curveType: CurveType.LINE,
            curvePoints: curvePoints
        };
    }
};



// @TODO make it a service
// connect paths instead of creating new
export const SVGPathFactory = {
    createSVG(pathPoints: PathPoint[]) {
        const svg: SVGPath[] = [];
        pathPoints.forEach((path, i) => {
            if (path.curve !== CurveType.NONE) {
                let stroke;
                if (path.linePurposes.find(lineP => lineP === LinePurpose.HELPER)) {
                    stroke = StrokeStyles.HELPER;
                } else {
                    stroke = StrokeStyles.NORMAL;
                }
                svg.push({
                    strokeColor: stroke.colorHash,
                    strokeWidth: stroke.width,
                    strokeDasharray: stroke.dasharray,
                    d: createPathD(path.point, pathPoints[i + 1].point, path.curve)
                });
            }
        });
        return svg;
    }
};


export function createPathD(from: Point, to: Point, curveType: CurveType): string {
    if (curveType === CurveType.LINE) {
        return createStraightLine(from, to);
    } else if (curveType === CurveType.HIP_CURVE) {
        return createHipLine(from, to);
    }
}

export function createStraightLine(from: Point, to: Point) {
    return 'M ' + from.x + ' ' + from.y + ' l ' + (to.x - from.x) + ' ' + (to.y - from.y);
}

export function createHipLine(from: Point, to: Point) {
    // should be 45deg
    // y = -x
    const pullStrength = (to.x - from.x) / 2;
    const topCurvePoint = {
        x: pullStrength + from.x,
        y: pullStrength + from.y
    };

    const bottomCurvePoint = {
        x: to.x,
        y: (to.y - from.y) / 2 + from.y
    };
    return createBrezierCurve(from, to, topCurvePoint, bottomCurvePoint);
}

export function createBrezierCurve(from: Point, to: Point, c1: Point, c2: Point) {
    return 'M ' + from.x + ' ' + from.y + ' C ' +
        c1.x + ' ' + c1.y + ' ' + c2.x + ' ' + c2.y + ' ' + to.x + ' ' +  to.y;
}

export const Transformer = {
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

    }
};

export const PieceFactory = {
    _id: 0,

    createBlankPiece(): FabricPiece {
        return {
            id: this._id++,
            position: {
                    x: 0,
                    y: 0
                }
        };
    }
};
