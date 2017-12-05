import { Component, OnInit, Input, Output } from '@angular/core';
import { Point } from '../common/point.model';
import { SVGPathFactory } from '../common/svg-path.factory';
import { LinePurpose } from '../common/line-purpose.enum';
import { CurveType } from '../common/curve-type.enum';
import { PathTransformer } from '../common/path-transformer';
import { PathPoint } from '../common/path-point.model';
import { SVGPath } from '../common/svg-path.model';
import { MeasurmentsService } from '../../measurments/measurments.service';
import { ModificationsService } from '../../pattern-modifications/modifications.service';
import { Subscription } from 'rxjs/Rx';
import { PointTransformer } from '../common/point-transformer';

import 'snapsvg-cjs';
declare var Snap: any;

import * as testPoints from '../common/path-d.factory';

@Component({
  selector: 'pd-pattern-vector-image',
  templateUrl: './pattern-vector-image.component.html',
  styleUrls: ['./pattern-vector-image.component.css']
})
export class PatternVectorImageComponent implements OnInit {

  public imageWidth: 400;
  public imageHeight: 600;
  public testPoints = testPoints.points;
  // this should be a separate object
  private height = 172;
  private waist = 64;
  private hips = 95;
  public viewbox: string;

  private modifications = {
    skirtLength: 0.5,
    showFullSkirt: false,
    waistLevel: 0
  };
  private mStream: Subscription;

  @Input()
  vectorPoints: PathPoint[] = [];

  @Input()
  position: Point;

  public svgPaths: SVGPath[] = [];


  constructor(
    private measurmentsService: MeasurmentsService,
    private modificationsService: ModificationsService
  ) {
    this.mStream = this.measurmentsService.measurments$.subscribe(m => {
      this.height = m.height;
      this.waist = m.waist;
      this.hips = m.hips;
      this.refresh();
    });

    this.modificationsService.modifications$.subscribe(m => {
      this.modifications = m;
      this.refresh();
    });
  }

  ngOnInit() {
    this.refresh();
  }

  private refresh() {
    this.vectorPoints = [];
    this.svgPaths = [];

    this.createHelpers();
    this.createBackPiece();
    this.createFrontPiece();
    this.svgPaths = SVGPathFactory.createSVG(this.vectorPoints);
    this.viewbox = '0 0 ' + this.frontSymetyX + ' 100';

  }

  private createHelpers() {
    const verticalHelpers = this.createVerticalHelpers();
    const horizontalHelpers = this.createHorizontalHelpers();

    this.vectorPoints = this.vectorPoints.concat(verticalHelpers, horizontalHelpers);

  }

  private createVerticalHelpers(): PathPoint[] {
    const vHelper: PathPoint[] = this.getVerticalHelperPoints();
    const middleVHelper: PathPoint[] = PathTransformer
      .makeTranslatedBy(vHelper, this.hipsTopPoint);
    const backVHelper: PathPoint[] = PathTransformer
      .makeTranslatedBy(vHelper, this.frontTopPoint);

    const dartHelper: PathPoint[] = this.getDartHelperPoints();
    const backDartHelper = PathTransformer
      .makeTranslatedBy(dartHelper, this.backDartTopPoint);
    const frontDartHelper = PathTransformer
      .makeTranslatedBy(dartHelper, {
        x: this.frontDartTopPoint.x + this.hipsTopPoint.x + 2,
        y: this.frontDartTopPoint.y
      });

    return vHelper.concat(middleVHelper, backVHelper, backDartHelper, frontDartHelper);
  }

  private createHorizontalHelpers(): PathPoint[] {
    const hHelper: PathPoint[] = this.getHorizontalHelperPoints();
    const hipsHelper: PathPoint[] = PathTransformer
      .makeTranslatedBy(hHelper, this.hipsLeftPoint);
    const bottomHelper: PathPoint[] = PathTransformer
      .makeTranslatedBy(hHelper, this.bottomPoint);

    const hipDartHelper: PathPoint[] = [{
      point: this.hipDartAPoint,
      curve: CurveType.LINE,
      linePurposes: [LinePurpose.HELPER]
    },
    {
      point: this.sideMiddlePoint,
      curve: CurveType.NONE,
      linePurposes: [LinePurpose.HELPER]
    }];
    const frontHipDartHelper = PathTransformer.makeFlippedVertically(hipDartHelper, this.backPieceWidth);

    return hHelper.concat(hipsHelper, bottomHelper, hipDartHelper, frontHipDartHelper);
  }

  private get hipHeight() {
    return (this.hips / 5) - 1;
  }

  private get frontDartHeight() {
    return this.hipHeight - 6;
  }

  private get waistLowering() {
     return this.modifications.waistLevel * this.frontDartHeight;
  }

  private get skirtLength() {
    if (this.modifications) {
      return this.legsLength * this.modifications.skirtLength;
    }
    return  this.legsLength * 0.5;
  }

  private get legsLength() {
    return this.height * 0.45;
  }

  private get totalHeight() {
    return  this.skirtLength + this.hipHeight;
  }

  private get hipsTopPoint(): Point {
    return {
      x: this.frontSymetyX / 2 - 1,
      y: this.startingPoint.y
    };
  }

  private get backPieceWidth(): number {
    return this.totalWidth - this.frontPieceWidth;
  }

  private get frontTopPoint(): Point {
    return {
      x: this.frontSymetyX,
      y: this.startingPoint.y,
    };
  }

  private get visualFrontDart() {
    return {
      x: this.frontDartStartPoint.x + this.hipsTopPoint.x + 2,
      y: this.frontDartStartPoint.y
    };
  }

  private get hipsLeftPoint(): Point {
    return {
      x: this.startingPoint.x,
      y: this.hipHeight
    };
  }

  private get bottomPoint(): Point {
    return {
      x: this.startingPoint.x,
      y: this.totalHeight
    };
  }

  get totalWidth() {
    return this.modifications.showFullSkirt ? this.frontSymetyX * 2 : this.frontSymetyX;
  }

  get frontSymetyX() {
    return this.hips / 2 + 1;
  }

  get frontPieceWidth() {
    return  this.frontSymetyX - this.hipsTopPoint.x;
  }

  get startingPoint() {
    return {x: 0, y: 0};
  }

  get maxDartWidth() {
    return 1;
  }
  get backDartTopPoint(): Point {
    return {
      x: 0.5 * this.hipsTopPoint.x - 1,
      y: this.hipsTopPoint.y
    };
  }

  get backDartStartPoint(): Point {
    return {
      x: this.backDartTopPoint.x,
      y: this.hipHeight - 3
    };
  }

  // @TODO define all pieces separately and than just move them
  get frontDartTopPoint(): Point {
    return {
      x: (this.frontPieceWidth / 2) - 2,
      y: this.hipsTopPoint.y
    };
  }

  get frontDartStartPoint(): Point {
    return {
      x: this.frontDartTopPoint.x,
      y: this.frontDartHeight
    };
  }

  get hipDartWidth() {
     return this.avgDartWidth / 2 - 0.5;
  }

  get hipDartAPoint(): Point {
    return {
      x: this.hipsTopPoint.x - this.hipDartWidth / 2,
      y: this.hipsTopPoint.y
    };
  }

  get backDartWidth() {
    return this.avgDartWidth * (3 / 10) + 0.5;
  }

  get frontDartWidth() {
    return this.avgDartWidth * (2 / 10);
  }

  get hipsWaistDiff() {
    return this.hips - this.waist;
  }

  get sideMiddlePoint() {
    return {
      x: this.hipsTopPoint.x,
      y: this.hipsLeftPoint.y
    };
  }

  get avgDartWidth() {
    const nOfDarts = 3;
    return this.hipsWaistDiff / nOfDarts;
  }

  get yokeLengthPoint() {
    return { x: this.hipDartWidth / 2, y: this.hipHeight };
  }

  private getHipRaisedPoint(dartWidth = this.hipDartWidth): Point {
    const directionPoint: Point = {
      x: dartWidth,
      y: this.hipHeight
    };
    const raised = PointTransformer.moveAlongLineVer(
      {
        x: this.hipsTopPoint.x - dartWidth / 2,
        y: this.hipsTopPoint.y
      },
      this.sideMiddlePoint,
      -1
    );

    return PointTransformer.moveAlongBrezVer(
      raised,
      this.sideMiddlePoint,
      CurveType.HIP_CURVE,
      this.waistLowering
    );

    // return raised;
  }

  get raisedBackDartAPoint(): Point {
    return this.getDartA(
      this.backDartTopPoint,
      this.backDartStartPoint,
      this.backDartWidth,
      this.waistLowering - 0.5
    );
  }

  get raisedBackDartBPoint(): Point {
    return this.getDartB(
      this.backDartTopPoint,
      this.backDartStartPoint,
      this.backDartWidth,
      this.waistLowering - 0.5
    );
  }

  get loweredFrontMiddlePoint(): Point {
    const lowerBy = {
      x: this.startingPoint.x,
      y: 0.8
    };
    return PointTransformer.addPoints(
      this.frontTopPoint,
      lowerBy
    );
  }

  private getDartA(dartTopPoint: Point, dartBottomPoint: Point, dartWidth, dartHeightMod = 0): Point {

    const dartA = {
      x: dartTopPoint.x - dartWidth / 2,
      y: dartTopPoint.y
    };

    return PointTransformer.moveAlongLineVer(dartA, dartBottomPoint, dartHeightMod);
  }

  private getDartB(dartTopPoint: Point, dartBottomPoint: Point, dartWidth, dartHeightMod = 0) {
    const dartB = {
      x: dartTopPoint.x + dartWidth / 2,
      y: dartTopPoint.y
    };

    return PointTransformer.moveAlongLineVer(dartB, dartBottomPoint, dartHeightMod);
  }

  private getFrontHipDartWidth() {
    const dartA = this.getDartA(this.frontDartTopPoint, this.frontDartStartPoint, this.frontDartWidth, this.waistLowering);
    const dartB = this.getDartB(this.frontDartTopPoint, this.frontDartStartPoint, this.frontDartWidth, this.waistLowering);

    if (Snap.len(dartA.x, dartA.y, dartB.x, dartB.y) <= this.maxDartWidth) {
      return this.frontDartWidth + this.hipDartWidth;
    } else {
      return this.hipDartWidth;
    }
  }

  private getBackHipDartWidth() {
    const dartA = this.getDartA(this.backDartTopPoint, this.backDartStartPoint, this.backDartWidth, this.waistLowering);
    const dartB = this.getDartB(this.backDartTopPoint, this.backDartStartPoint, this.backDartWidth, this.waistLowering);

    if (Snap.len(dartA.x, dartA.y, dartB.x, dartB.y) <= this.maxDartWidth) {
      return this.backDartWidth + this.hipDartWidth;
    } else {
      return this.hipDartWidth;
    }
  }

  // @TODO add piece id and symetry purpose
  private getHorizontalHelperPoints(): PathPoint[] {
    const frontPoint = { y: this.startingPoint.y, x: this.startingPoint.x };
    // hip height
    const sidePoint = { y: this.startingPoint.y, x: this.hipsTopPoint.x };
    const backPoint = { y: this.startingPoint.y, x: this.frontSymetyX };

    const curveType = CurveType.LINE;
    const linePurpose = LinePurpose.HELPER;

    return [{
      point: frontPoint,
      curve: curveType,
      linePurposes: [linePurpose]
    },
    {
      point: sidePoint,
      curve: curveType,
      linePurposes: [linePurpose]
    },
    {
      point: backPoint,
      curve: CurveType.NONE,
      linePurposes: [linePurpose]
    }];
  }

  // @TODO move these literals to getters or object
  private getVerticalHelperPoints(): PathPoint[] {
    const waistPoint = this.startingPoint;
    // hip height
    const hipHeightPoint = { x: this.startingPoint.x, y: this.hipHeight };
    const bottomPoint = { x: this.startingPoint.x, y: this.totalHeight };

    const curveType = CurveType.LINE;
    const linePurpose = LinePurpose.HELPER;

    return [{
      point: waistPoint,
      curve: curveType,
      linePurposes: [linePurpose]
    },
    {
      point: hipHeightPoint,
      curve: curveType,
      linePurposes: [linePurpose]
    },
    {
      point: bottomPoint,
      curve: CurveType.NONE,
      linePurposes: [linePurpose]
    }];
  }

  private getDartHelperPoints(): PathPoint[] {
    const waistPoint = this.startingPoint;
    // hip height
    const hipHeightPoint = { x: this.startingPoint.x, y: this.hipHeight };

    const curveType = CurveType.LINE;
    const linePurpose = LinePurpose.HELPER;

    return [{
      point: waistPoint,
      curve: curveType,
      linePurposes: [linePurpose]
    },
    {
      point: hipHeightPoint,
      curve: CurveType.NONE,
      linePurposes: [linePurpose]
    }];
  }


  private getBackPiecePoints(): PathPoint[] {
    const skirtPoints = [];
    const hipDartWidth = this.getBackHipDartWidth();

    const side = this.createSide(hipDartWidth);
    const bottom = this.createBottom(this.backPieceWidth);
    const top = this.createBackTop(hipDartWidth === this.hipDartWidth);

    return side.concat(bottom, top);
  }

  private getFrontPiecePoints(): PathPoint[] {
    const skirtPoints = [];
    const hipDartWidth = this.getFrontHipDartWidth();

    const side = this.createSide(hipDartWidth);
    const bottom = this.createBottom(this.frontPieceWidth);
    const sLine = this.createFrontSymetryLine(this.frontPieceWidth);
    const top = this.createFrontTop(hipDartWidth === this.hipDartWidth);

    return side.concat(bottom, sLine, top);
  }


  private createSide(dartWidth = this.hipDartWidth): PathPoint[] {
    const hipDart = this.createHipDart(dartWidth);
    const backHipDartPoint: PathPoint[] = hipDart;

    const sideMiddlePoint = {
      x: this.hipsTopPoint.x,
      y: this.hipsLeftPoint.y
    };

    return hipDart.concat([
      {
        point: sideMiddlePoint,
        curve: CurveType.LINE,
        linePurposes: [LinePurpose.SIDE_SEAM]
      }
    ]);
  }

  get sideBottomPoint(): Point {
    return {
      x: this.hipsTopPoint.x,
      y: this.totalHeight
    };
  }

  private createBottom(pieceWidth): PathPoint[] {

    const backBottomPoint = {
      x: this.sideBottomPoint.x - pieceWidth,
      y: this.sideBottomPoint.y
    };

    return [
      {
        point: this.sideBottomPoint,
        curve: CurveType.LINE,
        linePurposes: [LinePurpose.HEM, LinePurpose.SIDE_SEAM]
      },
      {
        point: backBottomPoint,
        curve: CurveType.LINE,
        linePurposes: [LinePurpose.SYMETRY_FOLD]
    }];
  }

  private createFrontSymetryLine(pieceWidth): PathPoint[] {
    const startingPoint = {
      x: this.hipsTopPoint.x - pieceWidth,
      y: this.hipsTopPoint.y + 0.8 + this.waistLowering
    };
    return [];
  }

  private createBackTop(showFrontDart = true): PathPoint[] {
    const startingPoint = {
      x: this.hipsTopPoint.x - this.backPieceWidth,
      y: this.hipsTopPoint.y + this.waistLowering
    };

    if (showFrontDart) {
      return [{
            point: startingPoint,
            curve: CurveType.HOR_LINE,
            curveEnd: CurveType.WAIST_CURVE,
            linePurposes: [LinePurpose.HEM]
          },
          {
            point: this.raisedBackDartAPoint,
            curve: CurveType.LINE,
            linePurposes: [LinePurpose.DART_TOP_A, LinePurpose.YOKE_TOP]
          },
          {
            point: this.backDartStartPoint,
            curve: CurveType.LINE,
            linePurposes: [LinePurpose.DART_BOTTOM, LinePurpose.YOKE_TOP]
          },
          {
            point: this.raisedBackDartBPoint,
            curve: CurveType.WAIST_CURVE,
            linePurposes: [LinePurpose.DART_TOP_B, LinePurpose.YOKE_TOP]
          },
          {
            point: this.getHipRaisedPoint(),
            curve: CurveType.NONE,
            linePurposes: [LinePurpose.SIDE_SEAM]
          }
        ];
    } else {
        return [{
            point: startingPoint,
            curve: CurveType.HOR_LINE,
            curveEnd: CurveType.WAIST_CURVE,
            linePurposes: [LinePurpose.HEM]
          },
          {
            point: this.getHipRaisedPoint(this.getBackHipDartWidth()),
            curve: CurveType.NONE,
            linePurposes: [LinePurpose.SIDE_SEAM]
          }
        ];
    }
  }

  private createFrontTop(showFrontDart = true): PathPoint[] {
    const startingPoint = {
      x: this.hipsTopPoint.x - this.frontPieceWidth,
      y: this.hipsTopPoint.y + 0.8 + this.waistLowering
    };

    if (showFrontDart) {
      return [{
            point: startingPoint,
            curve: CurveType.HOR_LINE,
            curveEnd: CurveType.WAIST_CURVE,
            linePurposes: [LinePurpose.HEM]
          },
          {
            point: this.getDartA(this.frontDartTopPoint, this.frontDartStartPoint, this.frontDartWidth, this.waistLowering),
            curve: CurveType.LINE,
            linePurposes: [LinePurpose.DART_TOP_A, LinePurpose.YOKE_TOP]
          },
          {
            point: this.frontDartStartPoint,
            curve: CurveType.LINE,
            linePurposes: [LinePurpose.DART_BOTTOM, LinePurpose.YOKE_TOP]
          },
          {
            point: this.getDartB(this.frontDartTopPoint, this.frontDartStartPoint, this.frontDartWidth, this.waistLowering),
            curve: CurveType.WAIST_CURVE,
            linePurposes: [LinePurpose.DART_TOP_B, LinePurpose.YOKE_TOP]
          },
          {
            point: this.getHipRaisedPoint(this.getFrontHipDartWidth()),
            curve: CurveType.NONE,
            linePurposes: [LinePurpose.SIDE_SEAM]
          }
        ];
    } else {
      return [{
            point: startingPoint,
            curve: CurveType.HOR_LINE,
            curveEnd: CurveType.WAIST_CURVE,
            linePurposes: [LinePurpose.HEM]
          },
          {
            point: this.getHipRaisedPoint(this.getFrontHipDartWidth()),
            curve: CurveType.NONE,
            linePurposes: [LinePurpose.SIDE_SEAM]
          }
        ];
    }
  }

  private createBackPiece() {
    // if (this.modifications.showFullSkirt) {
    //   const pieceCopy = this.unfoldPiece(piece, 0);
    //   this.vectorPoints = this.vectorPoints.concat(pieceCopy);
    // }

    const backPiece = this.getBackPiecePoints();
    this.vectorPoints = this.vectorPoints.concat(this.getBackPiecePoints(), backPiece);

    this.getBackPiecePoints();
  }

  private unfoldPiece(piece, x) {
    const flippedPiece = PathTransformer.makeFlippedVertically(piece, x);
    flippedPiece.map((path: PathPoint) => {
      path.linePurposes.push(LinePurpose.COPY);
    });
    return flippedPiece;
  }

  private createFrontPiece() {
    const frontPiece = PathTransformer
      .makeFlippedVertically(this.getFrontPiecePoints(), this.hipsTopPoint.x);
    this.vectorPoints = this.vectorPoints.concat(frontPiece);

    console.log( this.getFrontRotatedPoints(frontPiece));
    const rotatedFrontPiece = this.getFrontRotatedPoints(frontPiece).map(p => {
      console.log( this.modifications.skirtLength * 36);
      const angle =  this.modifications.waistLevel * 20 * -1;
      testPoints.points.push( PointTransformer.rotate(p.point, this.visualFrontDart, angle));
      return {
        ...p,
        point: PointTransformer.rotate(p.point, this.visualFrontDart, angle)
      };
    });

    this.vectorPoints = this.vectorPoints.concat(rotatedFrontPiece);
  }

  private createHipDart(dartWidth) {

    const curveType = CurveType.HIP_CURVE;
    const linePurpose = LinePurpose.YOKE_SIDE;

    return [{
      point: this.getHipRaisedPoint(dartWidth),
      curve: curveType,
      linePurposes: [linePurpose]
    }];
  }

  private getFrontRotatedPoints(frontPiece): PathPoint[] {
    return frontPiece.filter(p => {
      console.log('p.point.x > this.frontDartStartPoint.x', p.point.x , this.visualFrontDart.x);
      testPoints.points.push(this.frontDartStartPoint);
      return p.point.x >= this.visualFrontDart.x;
    });
  }

}
