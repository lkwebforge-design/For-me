import compositeImg from '../assets/images/alpine_final_composite_1791336284950.jpg';
import distantPeaksImg from '../assets/images/alpine_distant_peaks_study_1791336300166.jpg';
import riverValleyImg from '../assets/images/alpine_river_valley_study_1791336312740.jpg';
import stagForegroundImg from '../assets/images/alpine_stag_foreground_study_1791336323810.jpg';

export interface DepthLayerSpec {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  depthMeters: number;
  scrollRange: [number, number]; // e.g. [0.0, 0.16]
  riseOffsetPx: number;
  dominantHex: string;
  secondaryHex: string;
  polygonCount: number;
  layerCategory: 'atmosphere' | 'geology' | 'hydrology' | 'flora' | 'fauna';
  description: string;
  technicalNotes: string;
  imageAsset: string;
}

export interface ColorSwatchSpec {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  coveragePercent: number;
  sceneRegion: string;
  layerIndex: number;
  role: string;
}

export interface ProjectStudyPlate {
  id: string;
  title: string;
  kicker: string;
  imageUrl: string;
  aspectRatio: '16:9' | '4:3';
  depthSpan: string;
  focalLength: string;
  aperture: string;
  summary: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

export const GENERATED_ASSETS = {
  composite: compositeImg,
  distantPeaks: distantPeaksImg,
  riverValley: riverValleyImg,
  stagForeground: stagForegroundImg,
};

export const DEPTH_LAYERS: DepthLayerSpec[] = [
  {
    id: 'layer-01-sky',
    index: 1,
    title: '01. Zenith Sky & Golden Cloud Strata',
    subtitle: 'Farthest Atmospheric Horizon Plane',
    depthMeters: 4800,
    scrollRange: [0.0, 0.16],
    riseOffsetPx: 140,
    dominantHex: '#1D6D86',
    secondaryHex: '#F3B678',
    polygonCount: 42,
    layerCategory: 'atmosphere',
    description:
      'The sequence opens with the furthest celestial plane: a deep cerulean-teal upper sky transitioning smoothly into horizontal bands of warm amber, apricot, and cream cloudbanks illuminated by a low western sun.',
    technicalNotes:
      'Initiates upward vertical translation first (0%–16% scroll progress) with a soft atmospheric gradient bloom and slow parallax drift factor (0.12x).',
    imageAsset: GENERATED_ASSETS.distantPeaks,
  },
  {
    id: 'layer-02-peaks',
    index: 2,
    title: '02. Faceted Alpenglow Summit Massif',
    subtitle: 'Distant Geological Crown & Snow Cap',
    depthMeters: 3200,
    scrollRange: [0.12, 0.32],
    riseOffsetPx: 220,
    dominantHex: '#F06E4B',
    secondaryHex: '#1E4E79',
    polygonCount: 168,
    layerCategory: 'geology',
    description:
      'Rising directly from behind the horizon mist, the primary granite massif features sharp geometric planes—coral-orange and vermilion on the sunlit left ridges, contrasted against deep cobalt-indigo shadow facets on the eastern slopes and a sunlit ivory snow peak.',
    technicalNotes:
      'Ascends 220px vertically with cubic-bezier(0.22, 1, 0.36, 1) easing as scroll crosses 12%–32%, locking the iconic triangular silhouette against the cloud strata.',
    imageAsset: GENERATED_ASSETS.distantPeaks,
  },
  {
    id: 'layer-03-foothills',
    index: 3,
    title: '03. Slate-Blue Foothills & Distant Treeline',
    subtitle: 'Mid-Far Atmospheric Ridge & Mist Belt',
    depthMeters: 1850,
    scrollRange: [0.28, 0.46],
    riseOffsetPx: 260,
    dominantHex: '#255682',
    secondaryHex: '#0F2E4D',
    polygonCount: 214,
    layerCategory: 'geology',
    description:
      'Layered cerulean and navy-slate foothills emerge beneath the glacial mist, crowned by a dense serrated silhouette of subalpine firs that bridge the high rock faces and the fertile valley floor below.',
    technicalNotes:
      'Includes an integrated translucent valley mist band that separates the high warm peaks from the cool mid-ground timberline.',
    imageAsset: GENERATED_ASSETS.composite,
  },
  {
    id: 'layer-04-river',
    index: 4,
    title: '04. S-Curve Glacial River & Sunlit Meadows',
    subtitle: 'Central Valley Hydrology & Terraces',
    depthMeters: 920,
    scrollRange: [0.42, 0.62],
    riseOffsetPx: 300,
    dominantHex: '#3AA3BF',
    secondaryHex: '#8EC149',
    polygonCount: 195,
    layerCategory: 'hydrology',
    description:
      'The turquoise alpine river winds from the misty basin in a sweeping S-curve toward the lower right foreground, bordered by vibrant chartreuse and emerald-green terraced meadows and a pale golden sandbar.',
    technicalNotes:
      'Features animated specular water ribbons whose horizontal shimmer rate scales proportionally with user scroll velocity.',
    imageAsset: GENERATED_ASSETS.riverValley,
  },
  {
    id: 'layer-05-grove',
    index: 5,
    title: '05. Right Bank Conifer Grove & River Boulders',
    subtitle: 'Mid-Near Flora & Alluvial Rock Beds',
    depthMeters: 380,
    scrollRange: [0.58, 0.76],
    riseOffsetPx: 340,
    dominantHex: '#184A45',
    secondaryHex: '#D96B38',
    polygonCount: 280,
    layerCategory: 'flora',
    description:
      'Along the right riverbank, faceted blue-grey alluvial boulders anchor a vibrant stand of dark spruce, cedar, and a striking autumn-amber larch tree that echoes the warm coral tones of the distant mountain summit.',
    technicalNotes:
      'Individual tree crowns stagger their upward entrance by 2.5% scroll increments to create organic depth separation.',
    imageAsset: GENERATED_ASSETS.riverValley,
  },
  {
    id: 'layer-06-embankment',
    index: 6,
    title: '06. Terracotta Foreground Slope & Sentinel Pines',
    subtitle: 'Near-Field Framing Ridge & Tall Conifers',
    depthMeters: 65,
    scrollRange: [0.72, 0.90],
    riseOffsetPx: 390,
    dominantHex: '#C84B28',
    secondaryHex: '#0C2D2C',
    polygonCount: 310,
    layerCategory: 'flora',
    description:
      'A bold diagonal embankment of rust-terracotta earth and angular indigo foreground rocks rises across the lower-left frame, anchored by a towering dark-green sentinel pine tree on the far left and its counterpart on the far right.',
    technicalNotes:
      'High-parallax near plane (1.45x displacement ratio) establishes the classic national-park poster framing corridor.',
    imageAsset: GENERATED_ASSETS.stagForeground,
  },
  {
    id: 'layer-07-stag',
    index: 7,
    title: '07. Noble Stag Silhouette & Golden Antlers',
    subtitle: 'Nearest Focal Subject (18m Foreground)',
    depthMeters: 18,
    scrollRange: [0.85, 1.0],
    riseOffsetPx: 420,
    dominantHex: '#3B1E26',
    secondaryHex: '#FCE092',
    polygonCount: 124,
    layerCategory: 'fauna',
    description:
      'Completing the farthest-to-nearest emergence sequence, a silhouetted mountain stag in deep plum-umber steps onto the sunlit terracotta ridge, its branching antlers catching the final golden-hour rim light as it gazes across the turquoise rapids.',
    technicalNotes:
      'Finalizes the 7-stage video sequence at 100% scroll progress, triggering the smooth editorial handoff to the Project Details documentation below.',
    imageAsset: GENERATED_ASSETS.stagForeground,
  },
];

export const COLOR_PALETTE_DATA: ColorSwatchSpec[] = [
  {
    id: 'swatch-cerulean',
    name: 'Zenith Cerulean',
    hex: '#1D6D86',
    rgb: '29, 109, 134',
    hsl: '194°, 64%, 32%',
    coveragePercent: 18,
    sceneRegion: 'Upper Sky Canopy & River Shadow Reflections',
    layerIndex: 1,
    role: 'Cool Atmospheric Base',
  },
  {
    id: 'swatch-amber',
    name: 'Horizon Apricot Glow',
    hex: '#F3B678',
    rgb: '243, 182, 120',
    hsl: '30°, 84%, 71%',
    coveragePercent: 14,
    sceneRegion: 'Sunset Cloud Strata & Upper Lake Glaze',
    layerIndex: 1,
    role: 'Solar Luminance Highlight',
  },
  {
    id: 'swatch-coral',
    name: 'Alpenglow Vermilion',
    hex: '#F06E4B',
    rgb: '240, 110, 75',
    hsl: '13°, 85%, 62%',
    coveragePercent: 16,
    sceneRegion: 'Western Mountain Facets & Autumn Larch',
    layerIndex: 2,
    role: 'Primary Warm Focal Accent',
  },
  {
    id: 'swatch-cobalt',
    name: 'Glacial Shadow Cobalt',
    hex: '#1E4E79',
    rgb: '30, 78, 121',
    hsl: '208°, 60%, 30%',
    coveragePercent: 15,
    sceneRegion: 'Eastern Peak Facets & Mid-Distance Foothills',
    layerIndex: 3,
    role: 'Structural Geological Depth',
  },
  {
    id: 'swatch-turquoise',
    name: 'Cascade Turquoise',
    hex: '#3AA3BF',
    rgb: '58, 163, 191',
    hsl: '193°, 53%, 49%',
    coveragePercent: 13,
    sceneRegion: 'Winding Alpine River Channel & Rapids',
    layerIndex: 4,
    role: 'Dynamic Leading-Line Vector',
  },
  {
    id: 'swatch-meadow',
    name: 'Subalpine Chartreuse',
    hex: '#8EC149',
    rgb: '142, 193, 73',
    hsl: '86°, 49%, 52%',
    coveragePercent: 11,
    sceneRegion: 'Sunlit Valley Terraces & Riverbanks',
    layerIndex: 4,
    role: 'Mid-Plane Chromatic Bridge',
  },
  {
    id: 'swatch-terracotta',
    name: 'Embankment Terracotta',
    hex: '#C84B28',
    rgb: '200, 75, 40',
    hsl: '13°, 67%, 47%',
    coveragePercent: 8,
    sceneRegion: 'Left Foreground Ridge & Warm Rim Light',
    layerIndex: 6,
    role: 'Foreground Grounding Anchor',
  },
  {
    id: 'swatch-umber',
    name: 'Stag Silhouette Umber',
    hex: '#3B1E26',
    rgb: '59, 30, 38',
    hsl: '343°, 33%, 17%',
    coveragePercent: 5,
    sceneRegion: 'Foreground Stag & Deepest Boulders',
    layerIndex: 7,
    role: 'High-Contrast Subject Silhouette',
  },
];

export const STUDY_PLATES: ProjectStudyPlate[] = [
  {
    id: 'plate-composite',
    title: 'Full 7-Plane Alpine Sunset Synthesis',
    kicker: 'Master Scene Reconstruction · 16:9',
    imageUrl: GENERATED_ASSETS.composite,
    aspectRatio: '16:9',
    depthSpan: '18m – 4,800m',
    focalLength: '28mm Wide Editorial',
    aperture: 'f/8.0 Deep Focus',
    summary:
      'Complete master assembly combining the distant coral-lit alpine peaks, winding turquoise river, sunlit valley meadows, and the foreground terracotta ridge with the silhouetted stag.',
    metrics: [
      { label: 'Total Depth Planes', value: '7 Discrete Layers' },
      { label: 'Vector Polygons', value: '1,333 Facets' },
      { label: 'Scroll Track Span', value: '480vh Sticky Stage' },
    ],
  },
  {
    id: 'plate-peaks',
    title: 'Alpenglow Massif & Horizon Strata Study',
    kicker: 'Layers 01–03 · Far Distance Plate',
    imageUrl: GENERATED_ASSETS.distantPeaks,
    aspectRatio: '16:9',
    depthSpan: '1,850m – 4,800m',
    focalLength: '70mm Telephoto Compression',
    aperture: 'f/11 Atmospheric',
    summary:
      'Isolated study of the first three objects to emerge during scroll: the cerulean-to-amber sky gradient, horizontal cloud shelves, and polygonal granite peaks split between warm solar coral and cool cobalt shadow.',
    metrics: [
      { label: 'Scroll Window', value: '0% – 46% Progress' },
      { label: 'Peak Elevation', value: '3,420m ASL' },
      { label: 'Solar Azimuth', value: '262° WSW' },
    ],
  },
  {
    id: 'plate-valley',
    title: 'Serpentine River & Conifer Terrace Study',
    kicker: 'Layers 04–05 · Mid-Ground Hydrology',
    imageUrl: GENERATED_ASSETS.riverValley,
    aspectRatio: '4:3',
    depthSpan: '380m – 920m',
    focalLength: '35mm Natural Field',
    aperture: 'f/5.6 Mid-Plane',
    summary:
      'Mid-ground decomposition capturing the S-curve glacial waterway, chartreuse meadow terraces, smooth blue-grey river boulders, and the mixed evergreen and autumn-orange spruce grove.',
    metrics: [
      { label: 'Scroll Window', value: '42% – 76% Progress' },
      { label: 'Water Velocity', value: 'Scroll-Linked Shimmer' },
      { label: 'Flora Species', value: 'Spruce & Western Larch' },
    ],
  },
  {
    id: 'plate-stag',
    title: 'Foreground Stag & Sentinel Pine Study',
    kicker: 'Layers 06–07 · Near-Field Focal Subject',
    imageUrl: GENERATED_ASSETS.stagForeground,
    aspectRatio: '4:3',
    depthSpan: '18m – 65m',
    focalLength: '50mm Portrait Frame',
    aperture: 'f/4.0 Foreground Rim',
    summary:
      'Final foreground emergence study detailing the diagonal terracotta embankment, angular slate boulders, towering left-edge pine, and the backlit stag with sunlit ivory antlers.',
    metrics: [
      { label: 'Scroll Window', value: '72% – 100% Progress' },
      { label: 'Parallax Ratio', value: '1.45x Near-Plane' },
      { label: 'Rim Contrast', value: '14.2:1 Luminance' },
    ],
  },
];
