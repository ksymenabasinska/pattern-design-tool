import { Point } from './point.model';
import { CurveType } from './curve-type.enum';
import { LinePurpose } from './line-purpose.enum';

export interface PathPoint {
    point: Point;
    curve: CurveType;
    curveEnd?: CurveType;
    linePurposes: LinePurpose[];
    // pieceIds?: number[];
    // seamAllowance?: number;
}
