import { useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useCaptureStore } from '@/stores/captureStore';
import { ImagePicker } from './ImagePicker';
import { CaptureToolbar } from './CaptureToolbar';
import { CalibrationOverlay } from './CalibrationOverlay';
import { PoaMarker } from './PoaMarker';
import { ShotMarker } from './ShotMarker';
import type { TargetPreset } from '@/lib/constants';

interface CaptureCanvasProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function CaptureCanvas({ onComplete, onCancel }: CaptureCanvasProps) {
  const transformRef = useRef<{ state: { scale: number } } | null>(null);

  const {
    mode,
    imageDataUrl,
    imageWidth,
    imageHeight,
    distanceYards,
    poaPixelX,
    poaPixelY,
    shotsPixels,
    setImage,
    setMode,
    setDistanceYards,
    setCalibrationPreset,
    setCustomCalibrationPoint,
    setCustomRefInches,
    applyCustomCalibration,
    setPoa,
    addShot,
    removeShot,
    undoLastShot,
    reset,
  } = useCaptureStore();

  const handleImageSelected = useCallback(
    (dataUrl: string, width: number, height: number) => {
      setImage(dataUrl, width, height);
    },
    [setImage]
  );

  const handlePresetCalibrate = useCallback(
    (preset: TargetPreset, renderedPixelDimension: number) => {
      setCalibrationPreset(preset, renderedPixelDimension);
    },
    [setCalibrationPreset]
  );

  const handleCustomCalibrate = useCallback(
    (
      point1: { x: number; y: number },
      point2: { x: number; y: number },
      inches: number
    ) => {
      setCustomCalibrationPoint(1, point1.x, point1.y);
      setCustomCalibrationPoint(2, point2.x, point2.y);
      setCustomRefInches(inches);
      applyCustomCalibration();
    },
    [setCustomCalibrationPoint, setCustomRefInches, applyCustomCalibration]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (mode !== 'setting-poa' && mode !== 'marking-shots') return;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();

      // Get click position relative to the SVG
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to image coordinates considering the current transform
      const scale = transformRef.current?.state?.scale ?? 1;
      const imageX = x / scale;
      const imageY = y / scale;

      if (mode === 'setting-poa') {
        setPoa(imageX, imageY);
      } else if (mode === 'marking-shots') {
        addShot(imageX, imageY);
      }
    },
    [mode, setPoa, addShot]
  );

  const handleBack = useCallback(() => {
    if (mode === 'marking-shots' && shotsPixels.length > 0) {
      // Go back to POA setting
      setMode('setting-poa');
    } else if (mode === 'setting-poa') {
      // Go back to calibration
      setMode('calibrating');
    } else if (mode === 'calibrating') {
      // Clear image and go back to idle
      reset();
    } else {
      onCancel();
    }
  }, [mode, shotsPixels.length, setMode, reset, onCancel]);

  const handleDone = useCallback(() => {
    if (shotsPixels.length > 0) {
      setMode('review');
      onComplete();
    }
  }, [shotsPixels.length, setMode, onComplete]);

  const handleReset = useCallback(() => {
    // Clear all shots and go back to POA setting
    while (shotsPixels.length > 0) {
      undoLastShot();
    }
  }, [shotsPixels.length, undoLastShot]);

  const currentScale = transformRef.current?.state?.scale ?? 1;

  // Show image picker if no image
  if (mode === 'idle' || !imageDataUrl) {
    return (
      <div className="relative h-full bg-background">
        <CaptureToolbar
          mode="idle"
          shotCount={0}
          onBack={onCancel}
          onUndo={() => {}}
          onDone={() => {}}
          onReset={() => {}}
          canUndo={false}
          canDone={false}
        />
        <ImagePicker onImageSelected={handleImageSelected} />
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black overflow-hidden">
      <CaptureToolbar
        mode={mode}
        shotCount={shotsPixels.length}
        onBack={handleBack}
        onUndo={undoLastShot}
        onDone={handleDone}
        onReset={handleReset}
        canUndo={shotsPixels.length > 0}
        canDone={shotsPixels.length > 0}
      />

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        disabled={mode === 'calibrating'}
        onTransformed={(ref) => {
          transformRef.current = ref;
        }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
          }}
          contentStyle={{
            width: imageWidth,
            height: imageHeight,
          }}
        >
          <div className="relative" style={{ width: imageWidth, height: imageHeight }}>
            {/* Target image */}
            <img
              src={imageDataUrl}
              alt="Target"
              className="block"
              style={{ width: imageWidth, height: imageHeight }}
              draggable={false}
            />

            {/* Interactive SVG overlay */}
            <svg
              className="absolute top-0 left-0"
              width={imageWidth}
              height={imageHeight}
              style={{ touchAction: 'none' }}
              onClick={handleCanvasClick}
            >
              {/* POA Marker */}
              {poaPixelX !== null && poaPixelY !== null && (
                <PoaMarker x={poaPixelX} y={poaPixelY} scale={currentScale} />
              )}

              {/* Shot Markers */}
              {shotsPixels.map((shot, index) => (
                <ShotMarker
                  key={index}
                  x={shot.x}
                  y={shot.y}
                  sequenceNumber={shot.sequenceNumber}
                  scale={currentScale}
                  onRemove={
                    mode === 'marking-shots' ? () => removeShot(index) : undefined
                  }
                />
              ))}
            </svg>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Calibration overlay */}
      {mode === 'calibrating' && (
        <CalibrationOverlay
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          distanceYards={distanceYards}
          onDistanceChange={setDistanceYards}
          onPresetCalibrate={handlePresetCalibrate}
          onCustomCalibrate={handleCustomCalibrate}
          onCancel={() => reset()}
        />
      )}
    </div>
  );
}
