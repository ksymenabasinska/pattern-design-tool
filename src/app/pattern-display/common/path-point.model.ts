import { Point } from './point.model';
import { CurveType } from './curve-type.enum';
import { LinePurpose } from './line-purpose.enum';


export interface Curve {
  type: CurveType;
  endType?: CurveType;
  rotation?: number;
  radius?: number;
}
export interface PathPoint {
    point: Point;
    curve: Curve;
    linePurposes: LinePurpose[];
}
