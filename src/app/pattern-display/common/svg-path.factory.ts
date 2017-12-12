import { Point } from './point.model';
import { PathPoint } from './path-point.model';
import { SVGPath } from './svg-path.model';
import { CurveType } from './curve-type.enum';
import { LinePurpose } from './line-purpose.enum';
import { StrokeStyles } from './stroke-styles.config';
import { createPathD } from './path-d.factory';

// connect paths instead of creating new
export const SVGPathFactory = {
    createSVG(pathPoints: PathPoint[]) {
        const svg: SVGPath[] = [];
        pathPoints.forEach((path, i) => {
            if (path.curve !== CurveType.NONE) {
                let stroke;
                if (path.linePurposes.find(lineP => lineP === LinePurpose.HELPER)) {
                    stroke = StrokeStyles.HELPER;
                } else if (path.linePurposes.find(lineP => lineP === LinePurpose.SYMETRY_FOLD)) {
                    stroke = StrokeStyles.FOLD;
                } else if (path.linePurposes.find(lineP => lineP === LinePurpose.COPY)) {
                    stroke = StrokeStyles.COPY;
                } else {
                    stroke = StrokeStyles.NORMAL;
                }
                if (pathPoints[i + 1]) {
                    svg.push({
                        strokeColor: stroke.colorHash,
                        strokeWidth: stroke.width,
                        strokeDasharray: stroke.dasharray,
                        d: createPathD(path.point, pathPoints[i + 1].point, path.curve, path.curveEnd, path.curveRotation, path.curveR)
                    });
                }
            }
        });
        return svg;
    }
};
