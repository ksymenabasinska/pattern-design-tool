import { StrokeStyle } from './stroke-style.model';

const basicStrokeWidth = 0.2;
export const StrokeStyles = {
    HELPER: <StrokeStyle> {
        colorHash: '#666',
        width: basicStrokeWidth,
        dasharray: '0.5, 0.2'
    },
    FOLD: <StrokeStyle> {
        colorHash: '#673ab7',
        width: basicStrokeWidth,
        dasharray: ''
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
    COPY: <StrokeStyle> {
        colorHash: '#666',
        width: basicStrokeWidth,
        dasharray: ''
    },
};
