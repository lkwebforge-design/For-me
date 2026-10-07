import React, { useEffect, useRef, useState } from 'react';
import { GENERATED_ASSETS } from '../data/sceneData';

export type RenderMode = 'hybrid' | 'vector' | 'sliced-image' | 'wireframe';

interface AlpineVideoCanvasProps {
  /** Normalized progress from 0 (start of hero) to 1 (video finished, ready for project details) */
  progress: number;
  /** Instantaneous smoothed scroll velocity in px/sec */
  scrollVelocity: number;
  /** Render style mode */
  renderMode: RenderMode;
  /** Optional isolated or highlighted layer index (1..7) */
  highlightedLayer: number | null;
  /** Callback when user requests exporting a WebM video file */
  isRecordingVideo?: boolean;
  onVideoExportComplete?: (url: string) => void;
}

/** Smooth cubic ease-out for each layer's upward rise */
function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

/** Compute normalized 0..1 progress for a specific layer window [start, end] */
export function getLayerProgress(globalProgress: number, start: number, end: number): number {
  if (globalProgress <= start) return 0;
  if (globalProgress >= end) return 1;
  return easeOutCubic((globalProgress - start) / (end - start));
}

export const AlpineVideoCanvas: React.FC<AlpineVideoCanvasProps> = ({
  progress,
  scrollVelocity,
  renderMode,
  highlightedLayer,
  isRecordingVideo = false,
  onVideoExportComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeImgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const ambientTimeRef = useRef<number>(0);

  // Load the generated high-res alpine composite image for hybrid & sliced-image modes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = GENERATED_ASSETS.composite;
    img.onload = () => {
      compositeImgRef.current = img;
      setImgLoaded(true);
    };
  }, []);

  // Handle one-click WebM video generation from the 7-stage farthest-to-nearest animation
  useEffect(() => {
    if (!isRecordingVideo || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let recorder: MediaRecorder | null = null;
    const chunks: BlobPart[] = [];

    try {
      const stream = canvas.captureStream(60);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6000000 });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onVideoExportComplete?.(url);
      };
      recorder.start();
    } catch {
      onVideoExportComplete?.('');
    }

    return () => {
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    };
  }, [isRecordingVideo, onVideoExportComplete]);

  // Main 60fps animation loop driven by scroll progress + scroll velocity
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Ambient motion speed scales dynamically with user's scroll velocity!
      const velocityBoost = 1 + Math.min(8, Math.abs(scrollVelocity) / 220);
      ambientTimeRef.current += dt * velocityBoost;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawAlpineScene(
            ctx,
            canvas.width,
            canvas.height,
            progress,
            ambientTimeRef.current,
            scrollVelocity,
            renderMode,
            highlightedLayer,
            imgLoaded ? compositeImgRef.current : null
          );
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [progress, scrollVelocity, renderMode, highlightedLayer, imgLoaded]);

  return (
    <canvas
      ref={canvasRef}
      width={1600}
      height={950}
      className="w-full h-full object-cover select-none"
      aria-label="Interactive scroll-velocity background video reconstructing the alpine mountain landscape from farthest horizon peaks to nearest foreground stag"
    />
  );
};

/**
 * Draws a stylized layered pine tree matching the uploaded illustration's geometry
 */
function drawStylizedPine(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number,
  width: number,
  darkColor: string,
  litColor: string,
  trunkColor: string,
  swayOffset: number,
  tiers = 7
) {
  // Trunk
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.06, baseY);
  ctx.lineTo(x + width * 0.06, baseY);
  ctx.lineTo(x + width * 0.02 + swayOffset * 0.3, baseY - height * 0.85);
  ctx.lineTo(x - width * 0.02 + swayOffset * 0.3, baseY - height * 0.85);
  ctx.closePath();
  ctx.fill();

  // Tiered boughs from top to bottom
  const topY = baseY - height;
  const usableHeight = height * 0.86;
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const tierTopY = topY + t * usableHeight * 0.78;
    const tierBottomY = tierTopY + usableHeight * (0.22 + t * 0.08);
    const tierHalfW = width * (0.14 + t * 0.42);
    const tierSway = swayOffset * (1 - t * 0.65);

    // Shadow / Base bough
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(x + tierSway, tierTopY);
    ctx.lineTo(x + tierHalfW + tierSway * 0.6, tierBottomY);
    ctx.lineTo(x + tierHalfW * 0.35, tierBottomY - 6);
    ctx.lineTo(x, tierBottomY + 4);
    ctx.lineTo(x - tierHalfW * 0.35, tierBottomY - 6);
    ctx.lineTo(x - tierHalfW + tierSway * 0.6, tierBottomY);
    ctx.closePath();
    ctx.fill();

    // Sunlit Rim facet
    ctx.fillStyle = litColor;
    ctx.beginPath();
    ctx.moveTo(x + tierSway, tierTopY);
    ctx.lineTo(x - tierHalfW * 0.88 + tierSway * 0.6, tierBottomY - 2);
    ctx.lineTo(x - tierHalfW * 0.15, tierBottomY - 4);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Draws a faceted angular rock boulder matching the foreground/riverbank stones
 */
function drawFacetedRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  litColor: string,
  midColor: string,
  darkColor: string
) {
  // Left sunlit facet
  ctx.fillStyle = litColor;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.48, y);
  ctx.lineTo(x - w * 0.12, y - h);
  ctx.lineTo(x + w * 0.08, y - h * 0.72);
  ctx.lineTo(x - w * 0.05, y);
  ctx.closePath();
  ctx.fill();

  // Center mid facet
  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.12, y - h);
  ctx.lineTo(x + w * 0.32, y - h * 0.82);
  ctx.lineTo(x + w * 0.18, y);
  ctx.lineTo(x - w * 0.05, y);
  ctx.closePath();
  ctx.fill();

  // Right dark facet
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.32, y - h * 0.82);
  ctx.lineTo(x + w * 0.52, y);
  ctx.lineTo(x + w * 0.18, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Master 7-Stage Farthest-to-Nearest Scene Renderer
 */
function drawAlpineScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  progress: number,
  ambientTime: number,
  scrollVelocity: number,
  renderMode: RenderMode,
  highlightedLayer: number | null,
  sourceImage: HTMLImageElement | null
) {
  ctx.clearRect(0, 0, W, H);

  // Dark cinema stage under-canvas before Layer 1 fully emerges
  ctx.fillStyle = '#070B10';
  ctx.fillRect(0, 0, W, H);

  // Calculate individual 0..1 emergence progress for each of the 7 depth layers (Farthest -> Nearest)
  // Layer 1 (Sky & Horizon) is gracefully primed so the canvas is never black on initial load
  const p1 = Math.max(0.65, getLayerProgress(progress, 0.0, 0.16));
  const p2 = getLayerProgress(progress, 0.10, 0.30);  // 02: Distant Faceted Mountain Peaks
  const p3 = getLayerProgress(progress, 0.26, 0.45);  // 03: Misty Blue Foothills & Distant Treeline
  const p4 = getLayerProgress(progress, 0.40, 0.60);  // 04: Winding Turquoise River & Green Valley
  const p5 = getLayerProgress(progress, 0.56, 0.75);  // 05: Right-Bank Conifer Grove & River Boulders
  const p6 = getLayerProgress(progress, 0.70, 0.88);  // 06: Left Terracotta Embankment & Tall Sentinel Pines
  const p7 = getLayerProgress(progress, 0.84, 1.0);   // 07: Foreground Stag Silhouette with Golden Antlers

  const layerAlpha = (layerIdx: number, baseProgress: number) => {
    if (baseProgress <= 0.001) return 0;
    const rawAlpha = layerIdx === 1 ? Math.min(1, Math.max(0.75, baseProgress * 1.35)) : Math.min(1, baseProgress * 1.35);
    if (highlightedLayer !== null && highlightedLayer !== layerIdx) {
      return rawAlpha * 0.22;
    }
    return rawAlpha;
  };

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // ============================================================================
  // LAYER 01 (FARTHEST): SKY GRADIENT & GOLDEN HOUR CLOUD STRATA (4,800m)
  // ============================================================================
  if (p1 > 0) {
    const yOffset1 = (1 - p1) * 160;
    ctx.save();
    ctx.globalAlpha = layerAlpha(1, p1);
    ctx.translate(0, yOffset1);

    // Sky gradient matching IMG_2243.webp
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.56);
    skyGrad.addColorStop(0, '#16637D');
    skyGrad.addColorStop(0.32, '#2B8094');
    skyGrad.addColorStop(0.64, '#8BA995');
    skyGrad.addColorStop(0.84, '#F1B374');
    skyGrad.addColorStop(1, '#FCE1A8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, -160, W, H * 0.75);

    // Subtle source image blend on sky if in hybrid or sliced-image mode
    if ((renderMode === 'hybrid' || renderMode === 'sliced-image') && sourceImage) {
      ctx.save();
      ctx.globalAlpha *= renderMode === 'sliced-image' ? 0.88 : 0.28;
      ctx.beginPath();
      ctx.rect(0, 0, W, H * 0.45);
      ctx.clip();
      ctx.drawImage(sourceImage, 0, 0, W, H);
      ctx.restore();
    }

    // Horizontal stylized cloud shelves & cumulus puffs
    const cloudDrift = Math.sin(ambientTime * 0.35) * 18;

    // Warm peach upper cloud bands on left & right
    ctx.fillStyle = '#E59A69';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.16);
    ctx.lineTo(W * 0.32 + cloudDrift * 0.5, H * 0.175);
    ctx.lineTo(W * 0.25 + cloudDrift * 0.5, H * 0.205);
    ctx.lineTo(0, H * 0.195);
    ctx.closePath();
    ctx.fill();

    // Sculpted cream-apricot cloud billow behind left peaks
    ctx.fillStyle = '#FADCB0';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.36);
    ctx.quadraticCurveTo(W * 0.08, H * 0.26, W * 0.16 + cloudDrift, H * 0.31);
    ctx.quadraticCurveTo(W * 0.21, H * 0.25, W * 0.27 + cloudDrift, H * 0.32);
    ctx.quadraticCurveTo(W * 0.34, H * 0.28, W * 0.39 + cloudDrift, H * 0.35);
    ctx.lineTo(W * 0.58, H * 0.35);
    ctx.quadraticCurveTo(W * 0.54, H * 0.13, W * 0.61 + cloudDrift, H * 0.16);
    ctx.lineTo(W, H * 0.22);
    ctx.lineTo(W, H * 0.48);
    ctx.lineTo(0, H * 0.48);
    ctx.closePath();
    ctx.fill();

    // Right-side golden cloud puffs
    ctx.fillStyle = '#F6C28B';
    ctx.beginPath();
    ctx.arc(W * 0.85 - cloudDrift * 0.6, H * 0.22, 56, Math.PI, 0);
    ctx.arc(W * 0.93 - cloudDrift * 0.6, H * 0.23, 68, Math.PI, 0);
    ctx.lineTo(W, H * 0.32);
    ctx.lineTo(W * 0.74, H * 0.32);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ============================================================================
  // LAYER 02: FACETED ALPENGLOW MOUNTAIN PEAKS (3,200m)
  // ============================================================================
  if (p2 > 0) {
    const yOffset2 = (1 - p2) * 240;
    ctx.save();
    ctx.globalAlpha = layerAlpha(2, p2);
    ctx.translate(0, yOffset2);

    // Define the mountain silhouette polygon path (matches IMG_2243.webp peaks)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W * 0.08, H * 0.48);
    ctx.lineTo(W * 0.20, H * 0.31); // Far-left smaller peak
    ctx.lineTo(W * 0.25, H * 0.35);
    ctx.lineTo(W * 0.385, H * 0.235); // Mid-left peak
    ctx.lineTo(W * 0.46, H * 0.29);
    ctx.lineTo(W * 0.605, H * 0.145); // Secondary high shoulder
    ctx.lineTo(W * 0.645, H * 0.098); // Main snow-capped summit
    ctx.lineTo(W * 0.835, H * 0.32);  // Right slope descent
    ctx.lineTo(W * 0.895, H * 0.295); // Far-right shoulder peak
    ctx.lineTo(W * 0.98, H * 0.38);
    ctx.lineTo(W * 0.98, H * 0.52);
    ctx.lineTo(W * 0.08, H * 0.52);
    ctx.closePath();

    // Base fill in deep mountain cobalt
    ctx.fillStyle = '#1E4C78';
    ctx.fill();

    // Leftmost peak coral sunlit facet
    ctx.fillStyle = '#F27955';
    ctx.beginPath();
    ctx.moveTo(W * 0.08, H * 0.48);
    ctx.lineTo(W * 0.20, H * 0.31);
    ctx.lineTo(W * 0.215, H * 0.36);
    ctx.lineTo(W * 0.14, H * 0.48);
    ctx.closePath();
    ctx.fill();

    // Leftmost peak shadow facet
    ctx.fillStyle = '#5B5979';
    ctx.beginPath();
    ctx.moveTo(W * 0.20, H * 0.31);
    ctx.lineTo(W * 0.25, H * 0.35);
    ctx.lineTo(W * 0.22, H * 0.45);
    ctx.lineTo(W * 0.14, H * 0.48);
    ctx.closePath();
    ctx.fill();

    // Mid-left peak bright coral-orange face
    ctx.fillStyle = '#F3754E';
    ctx.beginPath();
    ctx.moveTo(W * 0.23, H * 0.37);
    ctx.lineTo(W * 0.385, H * 0.235);
    ctx.lineTo(W * 0.39, H * 0.33);
    ctx.lineTo(W * 0.27, H * 0.45);
    ctx.closePath();
    ctx.fill();

    // Mid-left peak lavender-slate shadow face
    ctx.fillStyle = '#5D6185';
    ctx.beginPath();
    ctx.moveTo(W * 0.385, H * 0.235);
    ctx.lineTo(W * 0.46, H * 0.29);
    ctx.lineTo(W * 0.45, H * 0.43);
    ctx.lineTo(W * 0.34, H * 0.45);
    ctx.closePath();
    ctx.fill();

    // Main Summit Snow Cap (Warm Cream Left + Ice Cyan Right)
    ctx.fillStyle = '#FFF8E7';
    ctx.beginPath();
    ctx.moveTo(W * 0.59, H * 0.16);
    ctx.lineTo(W * 0.645, H * 0.098);
    ctx.lineTo(W * 0.67, H * 0.19);
    ctx.lineTo(W * 0.605, H * 0.145);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4CB7DC';
    ctx.beginPath();
    ctx.moveTo(W * 0.645, H * 0.098);
    ctx.lineTo(W * 0.74, H * 0.21);
    ctx.lineTo(W * 0.70, H * 0.22);
    ctx.lineTo(W * 0.67, H * 0.19);
    ctx.closePath();
    ctx.fill();

    // Main Massif Primary Sunlit Vermilion-Coral Ridges
    ctx.fillStyle = '#F06A46';
    ctx.beginPath();
    ctx.moveTo(W * 0.45, H * 0.30);
    ctx.lineTo(W * 0.605, H * 0.145);
    ctx.lineTo(W * 0.625, H * 0.29);
    ctx.lineTo(W * 0.56, H * 0.44);
    ctx.lineTo(W * 0.44, H * 0.44);
    ctx.closePath();
    ctx.fill();

    // Secondary sunlit coral ridge on lower-right of main peak
    ctx.fillStyle = '#EB5E3E';
    ctx.beginPath();
    ctx.moveTo(W * 0.66, H * 0.30);
    ctx.lineTo(W * 0.715, H * 0.235);
    ctx.lineTo(W * 0.745, H * 0.33);
    ctx.lineTo(W * 0.68, H * 0.38);
    ctx.closePath();
    ctx.fill();

    // Deep indigo-cobalt geometric shadow facets on eastern flank
    ctx.fillStyle = '#183E69';
    ctx.beginPath();
    ctx.moveTo(W * 0.605, H * 0.145);
    ctx.lineTo(W * 0.67, H * 0.19);
    ctx.lineTo(W * 0.715, H * 0.235);
    ctx.lineTo(W * 0.66, H * 0.30);
    ctx.lineTo(W * 0.615, H * 0.44);
    ctx.lineTo(W * 0.56, H * 0.44);
    ctx.lineTo(W * 0.625, H * 0.29);
    ctx.closePath();
    ctx.fill();

    // If hybrid or sliced-image, blend source image clipped inside the mountain polygon
    if ((renderMode === 'hybrid' || renderMode === 'sliced-image') && sourceImage) {
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = renderMode === 'sliced-image' ? 0.85 : 0.26;
      ctx.drawImage(sourceImage, 0, 0, W, H);
      ctx.restore();
    }
    ctx.restore();

    // Soft atmospheric valley mist at base of peaks
    const mistGrad = ctx.createLinearGradient(0, H * 0.36, 0, H * 0.52);
    mistGrad.addColorStop(0, 'rgba(195, 224, 232, 0)');
    mistGrad.addColorStop(0.65, 'rgba(182, 216, 226, 0.72)');
    mistGrad.addColorStop(1, 'rgba(142, 189, 209, 0.9)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(W * 0.05, H * 0.36, W * 0.92, H * 0.16);

    ctx.restore();
  }

  // ============================================================================
  // LAYER 03: SLATE-BLUE FOOTHILLS & DISTANT CONIFER RIDGE (1,850m)
  // ============================================================================
  if (p3 > 0) {
    const yOffset3 = (1 - p3) * 280;
    ctx.save();
    ctx.globalAlpha = layerAlpha(3, p3);
    ctx.translate(0, yOffset3);

    // Mid-distance cerulean foothills left & center
    ctx.fillStyle = '#256693';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.38);
    ctx.lineTo(W * 0.16, H * 0.39);
    ctx.lineTo(W * 0.31, H * 0.45);
    ctx.lineTo(W * 0.44, H * 0.49);
    ctx.lineTo(W * 0.51, H * 0.455);
    ctx.lineTo(W * 0.65, H * 0.51);
    ctx.lineTo(W * 0.86, H * 0.43);
    ctx.lineTo(W, H * 0.36);
    ctx.lineTo(W, H * 0.58);
    ctx.lineTo(0, H * 0.58);
    ctx.closePath();
    ctx.fill();

    // Darker navy forested ridge with serrated distant pine tops
    ctx.fillStyle = '#103962';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.46);
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = t * W;
      const valleyDip = Math.sin(t * Math.PI) * (H * 0.065);
      const sawtooth = (i % 2 === 0 ? -10 : 4) * (1 - Math.sin(t * Math.PI) * 0.45);
      ctx.lineTo(px, H * 0.46 + valleyDip + sawtooth);
    }
    ctx.lineTo(W, H * 0.62);
    ctx.lineTo(0, H * 0.62);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ============================================================================
  // LAYER 04: WINDING TURQUOISE ALPINE RIVER & SUNLIT MEADOWS (920m)
  // ============================================================================
  if (p4 > 0) {
    const yOffset4 = (1 - p4) * 320;
    ctx.save();
    ctx.globalAlpha = layerAlpha(4, p4);
    ctx.translate(0, yOffset4);

    // Base glacial lake & winding S-curve river channel
    const riverGrad = ctx.createLinearGradient(0, H * 0.50, 0, H);
    riverGrad.addColorStop(0, '#FFF1C1');
    riverGrad.addColorStop(0.14, '#79D1D9');
    riverGrad.addColorStop(0.55, '#3AA2BF');
    riverGrad.addColorStop(1, '#196C8E');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(0, H * 0.51, W, H * 0.5);

    // Animated water shimmer ribbons (speed responds directly to scrollVelocity!)
    ctx.fillStyle = 'rgba(218, 248, 245, 0.38)';
    for (let i = 0; i < 8; i++) {
      const ry = H * (0.54 + i * 0.052);
      const waveShift = Math.sin(ambientTime * 1.8 + i * 1.3) * 28;
      const rw = 130 + (i % 3) * 65;
      const rx = W * (0.43 - i * 0.012) + waveShift;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, 5 + i * 0.7, 4);
      ctx.fill();
    }

    // Left sunlit valley hillside & emerald meadow terraces
    ctx.fillStyle = '#9BC854';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.52);
    ctx.quadraticCurveTo(W * 0.25, H * 0.49, W * 0.49, H * 0.56);
    ctx.quadraticCurveTo(W * 0.55, H * 0.58, W * 0.45, H * 0.62);
    ctx.lineTo(0, H * 0.66);
    ctx.closePath();
    ctx.fill();

    // Deeper emerald left riverbank terrace
    ctx.fillStyle = '#2B7D48';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.56);
    ctx.quadraticCurveTo(W * 0.22, H * 0.58, W * 0.39, H * 0.64);
    ctx.quadraticCurveTo(W * 0.26, H * 0.68, W * 0.22, H * 0.72);
    ctx.lineTo(0, H * 0.74);
    ctx.closePath();
    ctx.fill();

    // Mid-left small conifer stand on the green meadow
    const smallLeftTrees = [
      { x: W * 0.16, y: H * 0.64, h: 78, w: 34 },
      { x: W * 0.19, y: H * 0.645, h: 92, w: 38 },
      { x: W * 0.225, y: H * 0.65, h: 72, w: 30 },
      { x: W * 0.255, y: H * 0.645, h: 80, w: 32 },
      { x: W * 0.28, y: H * 0.64, h: 68, w: 28 },
      { x: W * 0.305, y: H * 0.64, h: 62, w: 26 },
      { x: W * 0.35, y: H * 0.65, h: 58, w: 28 },
    ];
    for (const st of smallLeftTrees) {
      drawStylizedPine(ctx, st.x, st.y, st.h, st.w, '#0F3838', '#1F5C4E', '#1F1B24', 0, 5);
    }

    // Golden-cream sandbar s-curve ribbon in the river
    ctx.strokeStyle = '#EEDBA6';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(W * 0.42, H * 0.68);
    ctx.bezierCurveTo(W * 0.31, H * 0.73, W * 0.30, H * 0.76, W * 0.39, H * 0.82);
    ctx.stroke();

    // Right sunlit meadow point jutting into the river
    ctx.fillStyle = '#89BF42';
    ctx.beginPath();
    ctx.moveTo(W, H * 0.56);
    ctx.quadraticCurveTo(W * 0.72, H * 0.57, W * 0.54, H * 0.65);
    ctx.quadraticCurveTo(W * 0.68, H * 0.69, W * 0.56, H * 0.74);
    ctx.quadraticCurveTo(W * 0.42, H * 0.76, W * 0.41, H * 0.785);
    ctx.quadraticCurveTo(W * 0.66, H * 0.82, W * 0.78, H * 0.88);
    ctx.lineTo(W, H * 0.88);
    ctx.closePath();
    ctx.fill();

    // Deeper green shadow band on right meadow
    ctx.fillStyle = '#36823B';
    ctx.beginPath();
    ctx.moveTo(W * 0.41, H * 0.785);
    ctx.quadraticCurveTo(W * 0.62, H * 0.79, W * 0.76, H * 0.86);
    ctx.lineTo(W, H * 0.86);
    ctx.lineTo(W, H * 0.92);
    ctx.lineTo(W * 0.72, H * 0.89);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ============================================================================
  // LAYER 05: RIGHT-BANK CONIFER GROVE & ALLUVIAL BOULDERS (380m)
  // ============================================================================
  if (p5 > 0) {
    const yOffset5 = (1 - p5) * 350;
    ctx.save();
    ctx.globalAlpha = layerAlpha(5, p5);
    ctx.translate(0, yOffset5);

    const sway5 = Math.sin(ambientTime * 1.1) * 3.5;

    // Small dark red-brown shrub cluster on the central river point
    for (let i = 0; i < 6; i++) {
      const bx = W * (0.53 + i * 0.015);
      const by = H * 0.745;
      const bh = 32 + (i % 3) * 14;
      drawStylizedPine(ctx, bx, by, bh, 18, '#3B1D24', '#6E322C', '#241418', sway5 * 0.3, 4);
    }

    // Right-bank grove of spruce, fir, and autumn-amber larch (matching IMG_2243.webp)
    const rightGrove = [
      { x: W * 0.655, y: H * 0.715, h: 110, w: 46, dark: '#103938', lit: '#246858' },
      { x: W * 0.69, y: H * 0.725, h: 175, w: 68, dark: '#0D3332', lit: '#2A755E' },
      { x: W * 0.735, y: H * 0.73, h: 138, w: 52, dark: '#4A2426', lit: '#C85D36' }, // Warm rust-red pine
      { x: W * 0.77, y: H * 0.72, h: 245, w: 86, dark: '#2E1E22', lit: '#6C4234' },  // Tall dark-brown spruce
      { x: W * 0.81, y: H * 0.73, h: 210, w: 78, dark: '#2A2323', lit: '#5D4838' },
      { x: W * 0.865, y: H * 0.74, h: 225, w: 88, dark: '#B84D28', lit: '#F28C48' }, // Bright autumn-orange tree
    ];

    for (const tree of rightGrove) {
      drawStylizedPine(
        ctx,
        tree.x,
        tree.y,
        tree.h,
        tree.w,
        tree.dark,
        tree.lit,
        '#2B191B',
        sway5,
        7
      );
    }

    // Faceted blue-grey boulders along the right riverbank
    drawFacetedRock(ctx, W * 0.67, H * 0.835, 84, 34, '#8BA6B9', '#526E86', '#1E354D');
    drawFacetedRock(ctx, W * 0.75, H * 0.865, 118, 56, '#9BB3C4', '#5A768E', '#1B3148');
    drawFacetedRock(ctx, W * 0.83, H * 0.89, 136, 64, '#8CA4B6', '#4B6780', '#162A3F');
    drawFacetedRock(ctx, W * 0.92, H * 0.91, 128, 52, '#7D96AA', '#3F5972', '#132438');

    ctx.restore();
  }

  // ============================================================================
  // LAYER 06: LEFT TERRACOTTA EMBANKMENT & TALL SENTINEL PINES (65m)
  // ============================================================================
  if (p6 > 0) {
    const yOffset6 = (1 - p6) * 400;
    ctx.save();
    ctx.globalAlpha = layerAlpha(6, p6);
    ctx.translate(0, yOffset6);

    const sway6 = Math.sin(ambientTime * 0.9) * 5;

    // Towering Right-Edge Sentinel Pine Tree
    drawStylizedPine(
      ctx,
      W * 0.94,
      H * 0.83,
      H * 0.58,
      165,
      '#0B2829',
      '#357B5A',
      '#4D2522',
      sway6 * 0.8,
      9
    );

    // Left Foreground Diagonal Terracotta-Orange Embankment Slope
    const slopeGrad = ctx.createLinearGradient(0, H * 0.72, W * 0.56, H);
    slopeGrad.addColorStop(0, '#D9582A');
    slopeGrad.addColorStop(0.55, '#E47138');
    slopeGrad.addColorStop(1, '#B33B22');
    ctx.fillStyle = slopeGrad;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.725);
    ctx.lineTo(W * 0.24, H * 0.81);
    ctx.lineTo(W * 0.53, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Dark shadow under-ledge along bottom left
    ctx.fillStyle = '#251720';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.79);
    ctx.lineTo(W * 0.16, H * 0.85);
    ctx.lineTo(W * 0.42, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Foreground angular slate-blue & cream boulders at bottom-left
    drawFacetedRock(ctx, W * 0.06, H * 0.96, 155, 68, '#B8C4C8', '#6B7E8C', '#182A3E');
    drawFacetedRock(ctx, W * 0.16, H * 0.99, 130, 56, '#9BAAB2', '#4F6577', '#142334');
    drawFacetedRock(ctx, W * 0.31, H * 0.995, 195, 92, '#4E7C96', '#214A6B', '#0D2138');

    // Towering Left-Edge Sentinel Pine Tree (iconic vertical anchor on left)
    drawStylizedPine(
      ctx,
      W * 0.075,
      H * 0.82,
      H * 0.71,
      230,
      '#0A2426',
      '#286A58',
      '#2E181D',
      sway6,
      10
    );

    ctx.restore();
  }

  // ============================================================================
  // LAYER 07 (NEAREST): FOREGROUND STAG SILHOUETTE & GOLDEN ANTLERS (18m)
  // ============================================================================
  if (p7 > 0) {
    const yOffset7 = (1 - p7) * 440;
    ctx.save();
    ctx.globalAlpha = layerAlpha(7, p7);
    ctx.translate(0, yOffset7);

    // Subtle breathing / head posture micro-motion
    const headNod = Math.sin(ambientTime * 1.4) * 1.5;

    const sx = W * 0.155; // Stag center X on the left terracotta slope
    const sy = H * 0.815; // Stag hooves base Y

    // Warm golden rim shadow cast on the terracotta slope
    ctx.fillStyle = 'rgba(42, 18, 24, 0.55)';
    ctx.beginPath();
    ctx.ellipse(sx + 10, sy + 6, 68, 9, 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit Golden-Ivory Antlers (catching the western sunset glow)
    ctx.strokeStyle = '#FCE296';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    // Main left beam
    ctx.moveTo(sx + 52, sy - 92 + headNod);
    ctx.quadraticCurveTo(sx + 38, sy - 118 + headNod, sx + 56, sy - 142 + headNod);
    // Tines
    ctx.moveTo(sx + 46, sy - 108 + headNod);
    ctx.lineTo(sx + 34, sy - 122 + headNod);
    ctx.moveTo(sx + 48, sy - 122 + headNod);
    ctx.lineTo(sx + 42, sy - 138 + headNod);
    // Main right beam
    ctx.moveTo(sx + 56, sy - 92 + headNod);
    ctx.quadraticCurveTo(sx + 74, sy - 114 + headNod, sx + 92, sy - 134 + headNod);
    ctx.moveTo(sx + 68, sy - 108 + headNod);
    ctx.lineTo(sx + 64, sy - 125 + headNod);
    ctx.moveTo(sx + 78, sy - 118 + headNod);
    ctx.lineTo(sx + 80, sy - 134 + headNod);
    ctx.stroke();

    // Stag Body Silhouette in Deep Plum-Umber (#3B1E26)
    ctx.fillStyle = '#3B1E26';
    ctx.beginPath();
    // Rump & tail
    ctx.moveTo(sx - 56, sy - 64);
    ctx.quadraticCurveTo(sx - 64, sy - 62, sx - 60, sy - 48);
    // Hind leg back
    ctx.lineTo(sx - 50, sy - 28);
    ctx.lineTo(sx - 54, sy - 2);
    ctx.lineTo(sx - 47, sy - 2);
    ctx.lineTo(sx - 40, sy - 32);
    // Second hind leg
    ctx.lineTo(sx - 30, sy + 2);
    ctx.lineTo(sx - 23, sy + 2);
    ctx.lineTo(sx - 28, sy - 38);
    // Belly line
    ctx.quadraticCurveTo(sx, sy - 36, sx + 22, sy - 38);
    // Front left leg (stepping down slope)
    ctx.lineTo(sx + 16, sy + 10);
    ctx.lineTo(sx + 23, sy + 10);
    ctx.lineTo(sx + 32, sy - 34);
    // Front right leg (extended forward down the ridge)
    ctx.lineTo(sx + 46, sy + 16);
    ctx.lineTo(sx + 53, sy + 16);
    ctx.lineTo(sx + 44, sy - 42);
    // Chest & neck
    ctx.quadraticCurveTo(sx + 56, sy - 56, sx + 58, sy - 74 + headNod);
    // Jaw & snout looking out over the river
    ctx.lineTo(sx + 78, sy - 74 + headNod);
    ctx.lineTo(sx + 80, sy - 81 + headNod);
    ctx.lineTo(sx + 60, sy - 90 + headNod);
    // Ears
    ctx.lineTo(sx + 46, sy - 98 + headNod);
    ctx.lineTo(sx + 44, sy - 90 + headNod);
    // Back of neck & withers
    ctx.quadraticCurveTo(sx + 34, sy - 68, sx + 12, sy - 68);
    ctx.quadraticCurveTo(sx - 24, sy - 66, sx - 56, sy - 64);
    ctx.closePath();
    ctx.fill();

    // Warm Golden Rim Highlight along Stag's Back, Neck & Snout
    ctx.strokeStyle = '#F7A456';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sx - 54, sy - 64);
    ctx.quadraticCurveTo(sx - 15, sy - 66, sx + 16, sy - 68);
    ctx.quadraticCurveTo(sx + 36, sy - 68, sx + 48, sy - 90 + headNod);
    ctx.stroke();

    ctx.restore();
  }

  // ============================================================================
  // OPTIONAL WIREFRAME / Z-DEPTH TELEMETRY OVERLAY MODE
  // ============================================================================
  if (renderMode === 'wireframe') {
    ctx.save();
    ctx.strokeStyle = 'rgba(58, 163, 191, 0.35)';
    ctx.lineWidth = 1;
    // Draw horizon & depth plane guide lines
    const planes = [
      { y: H * 0.18, label: 'Z-01 · 4,800m · Zenith Sky & Cloud Strata', p: p1 },
      { y: H * 0.28, label: 'Z-02 · 3,200m · Faceted Alpenglow Massif', p: p2 },
      { y: H * 0.44, label: 'Z-03 · 1,850m · Slate Foothills & Mist Belt', p: p3 },
      { y: H * 0.62, label: 'Z-04 · 920m · S-Curve Glacial River', p: p4 },
      { y: H * 0.73, label: 'Z-05 · 380m · Right-Bank Conifer Grove', p: p5 },
      { y: H * 0.82, label: 'Z-06 · 65m · Terracotta Slope & Sentinel Pines', p: p6 },
      { y: H * 0.88, label: 'Z-07 · 18m · Foreground Stag Silhouette', p: p7 },
    ];
    ctx.font = '600 13px "JetBrains Mono", monospace';
    for (const pl of planes) {
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.moveTo(0, pl.y);
      ctx.lineTo(W, pl.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(7, 11, 16, 0.78)';
      ctx.fillRect(24, pl.y - 22, 410, 20);
      ctx.fillStyle = pl.p >= 1 ? '#8EC149' : '#F3B678';
      ctx.fillText(`${pl.label} [${Math.round(pl.p * 100)}%]`, 32, pl.y - 8);
    }
    ctx.restore();
  }
}
