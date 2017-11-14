import { Component, OnInit, Input, Output } from '@angular/core';
import { Point, SVGPathFactory, LinePurpose, CurveType, Transformer, PathPoint, SVGPath } from './vector-point';
import { MeasurmentsService } from '../../measurments/measurments.service';
import { ModificationsService } from '../../pattern-modifications/modifications.service';
import { Subscription } from 'rxjs/Rx';


@Component({
  selector: 'pd-pattern-vector-image',
  templateUrl: './pattern-vector-image.component.html',
  styleUrls: ['./pattern-vector-image.component.css']
})
export class PatternVectorImageComponent implements OnInit {

  public imageWidth: 400;
  public imageHeight: 600;

  // this should be a separate object
  private height = 172;
  private waist = 64;
  private hips = 95;
  public viewbox: string;

  private modifications;
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
    this.svgPaths = SVGPathFactory.createSVG(this.vectorPoints);
    this.viewbox = '0 0 ' + this.backSeamX + ' 100';

  }

  private createHelpers() {
    const verticalHelpers = this.createVerticalHelpers();
    const horizontalHelpers = this.createHorizontalHelpers();

    this.vectorPoints = this.vectorPoints.concat(verticalHelpers, horizontalHelpers);

  }

  private createVerticalHelpers(): PathPoint[] {
    const vHelper: PathPoint[] = this.getVerticalHelperPoints();
    const middleVHelper: PathPoint[] = Transformer
      .makeTranslatedBy(vHelper, this.hipsTopPoint);
    const backVHelper: PathPoint[] = Transformer
      .makeTranslatedBy(vHelper, this.backTopPoint);

    const dartHelper: PathPoint[] = this.getDartHelperPoints();
    const backDartHelper = Transformer
      .makeTranslatedBy(dartHelper, this.backDartTopPoint);
    const frontDartHelper = Transformer
      .makeTranslatedBy(dartHelper, this.frontDartTopPoint);

    return vHelper.concat(middleVHelper, backVHelper, backDartHelper, frontDartHelper);
  }

  private createHorizontalHelpers(): PathPoint[] {
    const hHelper: PathPoint[] = this.getHorizontalHelperPoints();
    const hipsHelper: PathPoint[] = Transformer
      .makeTranslatedBy(hHelper, this.hipsLeftPoint);
    const bottomHelper: PathPoint[] = Transformer
      .makeTranslatedBy(hHelper, this.bottomPoint);

    return hHelper.concat(hipsHelper, bottomHelper);
  }

  private get hipHeight() {
    return (this.hips / 5) - 1;
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
      x: this.backSeamX / 2 - 1,
      y: 0,
    };
  }

  private get backTopPoint(): Point {
    return {
      x: this.backSeamX,
      y: 0,
    };
  }

  private get hipsLeftPoint(): Point {
    return {
      x: 0,
      y: this.hipHeight
    };
  }

  private get bottomPoint(): Point {
    return {
      x: 0,
      y: this.totalHeight
    };
  }

  get backSeamX() {
    return this.hips / 2 + 1;
  }

  get backWidth() {
    return  this.backSeamX - this.hipsTopPoint.x;
  }

  get startingPoint() {
    return {x: 0, y: 0};
  }

  get backDartTopPoint(): Point {
    return {
      x: 0.5 * this.hipsTopPoint.x - 1,
      y: 0
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
      x: this.hipsTopPoint.x + (this.backWidth / 2) - 2,
      y: 0
    };
  }

  get frontDartStartPoint(): Point {
    return {
      x: this.frontDartTopPoint.x,
      y: this.hipHeight - 6
    };
  }

  get hipDartWidth() {
     return this.avgDartWidth / 2 - 0.5;
  }

  get hipDartStartPoint(): Point {
    return {
      x: this.hipsTopPoint.x - this.hipDartWidth / 2,
      y: 0
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

  get avgDartWidth() {
    const nOfDarts = 3;
    return this.hipsWaistDiff / nOfDarts;
  }

  get yokeLengthPoint() {
    return { x: this.hipDartWidth / 2, y: this.hipHeight };
  }

  // @TODO add piece id and symetry purpose
  private getHorizontalHelperPoints(): PathPoint[] {
    const frontPoint = { y: 0, x: 0 };
    // hip height
    const sidePoint = { y: 0, x: this.hipsTopPoint.x };
    const backPoint = { y: 0, x: this.backSeamX };

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
    const hipHeightPoint = { x: 0, y: this.hipHeight };
    const bottomPoint = { x: 0, y: this.totalHeight };

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
    const hipHeightPoint = { x: 0, y: this.hipHeight };

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


  private createBackPiece() {
    const sideLine = this.createSideLine();
    this.vectorPoints = this.vectorPoints.concat(sideLine);
  }

  private createHipDart() {
    const waist = this.startingPoint;

    const yokeLengthPoint = this.yokeLengthPoint;

    const curveType = CurveType.HIP_CURVE;
    const linePurpose = LinePurpose.YOKE_SIDE;

    return [{
      point: waist,
      curve: curveType,
      linePurposes: [linePurpose]
    }];
  }

  private createSideLine() {

    const hipDart = this.createHipDart();
    const backHipDartPoint: PathPoint[] = Transformer
      .makeTranslatedBy(hipDart, this.hipDartStartPoint);


    const sideMiddlePoint = {
      x: this.hipsTopPoint.x,
      y: this.hipsLeftPoint.y
    };

    const sideBottomPoint = {
      x: this.hipsTopPoint.x,
      y: this.totalHeight
    };

    const backBottomPoint = {
      x: this.startingPoint.x,
      y: this.totalHeight
    };

    // @TODO flip it, make a createDartMethod
    const dartA = {
      x: this.backDartTopPoint.x - this.backDartWidth / 2,
      y: this.backDartTopPoint.y
    };
    const dartB = {
      x: this.backDartTopPoint.x + this.backDartWidth / 2,
      y: this.backDartTopPoint.y
    };

    return backHipDartPoint.concat([
        {
          point: sideMiddlePoint,
          curve: CurveType.LINE,
          linePurposes: [LinePurpose.SIDE_SEAM]
        },
        {
          point: sideBottomPoint,
          curve: CurveType.LINE,
          linePurposes: [LinePurpose.HEM, LinePurpose.SIDE_SEAM]
        },
        {
          point: backBottomPoint,
          curve: CurveType.LINE,
          linePurposes: [LinePurpose.HEM, LinePurpose.SYMETRY_FOLD]
        },
        {
          point: this.startingPoint,
          curve: CurveType.LINE,
          linePurposes: [LinePurpose.SYMETRY_FOLD]
        },
        {
          point: dartA,
          curve: CurveType.LINE,
          linePurposes: [LinePurpose.DART_TOP_A, LinePurpose.YOKE_TOP]
        },
        {
          point: this.backDartStartPoint,
          curve: CurveType.LINE,
          linePurposes: [LinePurpose.DART_TOP_A, LinePurpose.YOKE_TOP]
        },
        {
          point: dartB,
          curve: CurveType.LINE,
          linePurposes: [LinePurpose.DART_TOP_A, LinePurpose.YOKE_TOP]
        },
        {
          point: this.hipDartStartPoint,
          curve: CurveType.NONE,
          linePurposes: [LinePurpose.SIDE_SEAM]
        }
      ]
    );
  }
}
