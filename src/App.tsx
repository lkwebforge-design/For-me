import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Maximize2,
  X,
  Check,
  Copy,
  Mountain,
  Trees,
  Waves,
  Compass,
} from 'lucide-react';
import { AlpineVideoCanvas } from './components/AlpineVideoCanvas';
import { ResilientImage } from './components/ResilientImage';
import {
  DEPTH_LAYERS,
  COLOR_PALETTE_DATA,
  STUDY_PLATES,
  ProjectStudyPlate,
} from './data/sceneData';

export default function App() {
  const [heroProgress, setHeroProgress] = useState<number>(0);
  const [scrollVelocity, setScrollVelocity] = useState<number>(0);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeLightboxPlate, setActiveLightboxPlate] = useState<ProjectStudyPlate | null>(null);

  const heroTrackRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(performance.now());
  const velocityDecayTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dt = Math.max(8, now - lastScrollTimeRef.current) / 1000;
      const dy = currentY - lastScrollYRef.current;
      const rawVelocity = dy / dt;

      lastScrollYRef.current = currentY;
      lastScrollTimeRef.current = now;

      setScrollVelocity((prev) => prev * 0.4 + rawVelocity * 0.6);

      if (velocityDecayTimerRef.current) {
        window.clearTimeout(velocityDecayTimerRef.current);
      }
      velocityDecayTimerRef.current = window.setTimeout(() => {
        setScrollVelocity(0);
      }, 120);

      if (heroTrackRef.current) {
        const rect = heroTrackRef.current.getBoundingClientRect();
        const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
        const scrolled = -rect.top;
        const normalized = Math.max(0, Math.min(1, scrolled / scrollableDistance));
        setHeroProgress(normalized);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (velocityDecayTimerRef.current) {
        window.clearTimeout(velocityDecayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveLightboxPlate(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1600);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070B10] text-[#F4F4F0] selection:bg-[#F06E4B] selection:text-white">
      {/* =====================================================================
          TOP NAVIGATION BAR
         ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 lg:px-12 py-5 bg-[#070B10]/70 backdrop-blur-md border-b border-white/10 transition-all">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-xl tracking-tight text-white font-semibold cursor-pointer"
        >
          Cascadia
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
          <button
            type="button"
            onClick={() => scrollToSection('sanctuary')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Sanctuary
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('gallery')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('horizons')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Horizons
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('palette')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Palette
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => scrollToSection('sanctuary')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#F06E4B] hover:bg-[#e05d3a] rounded-lg transition-colors cursor-pointer"
          >
            Explore Valley
          </button>
        </div>
      </header>

      {/* =====================================================================
          HERO SCROLL-DRIVEN BACKGROUND VIDEO SECTION
          As you scroll, the video plays smoothly and adjusts speed naturally
          with scroll velocity. Objects rise smoothly from farthest to nearest.
         ===================================================================== */}
      <section
        id="hero"
        ref={heroTrackRef}
        className="relative h-[360vh] w-full bg-[#070B10]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Background Video Canvas */}
          <div className="absolute inset-0 w-full h-full">
            <AlpineVideoCanvas
              progress={heroProgress}
              scrollVelocity={scrollVelocity}
              renderMode="hybrid"
              highlightedLayer={null}
            />
          </div>

          {/* Cinematic Lighting Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070B10] via-transparent to-[#070B10]/30" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#070B10]/70 via-transparent to-transparent" />

          {/* Hero Typography Overlay */}
          <div className="relative z-10 h-full max-w-[1380px] mx-auto px-6 lg:px-12 flex flex-col justify-between pt-32 pb-12 pointer-events-none">
            <div className="max-w-xl">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#F3B678]">
                Pacific Northwest · Alpine Sanctuary
              </span>
            </div>

            <div className="max-w-2xl">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08] text-balance">
                Where Earth Touches the Sky
              </h1>
              <p className="mt-6 text-base sm:text-lg text-stone-200 leading-relaxed max-w-xl font-normal">
                A cinematic journey into the mountain wilderness. As you descend, the landscape
                unfolds before you—from the glowing sunset peaks to the untamed river valley.
              </p>

              <div className="mt-8 flex items-center gap-4 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => scrollToSection('sanctuary')}
                  className="px-6 py-3 text-xs font-semibold text-white bg-[#F06E4B] hover:bg-[#e05d3a] rounded-lg transition-colors cursor-pointer shadow-lg shadow-[#F06E4B]/20"
                >
                  Discover the Landscape
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-300">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-white/40" />
                <span className="tracking-wide uppercase text-[11px] font-medium">
                  Scroll down to descend into the valley
                </span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#F3B678]" />
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-stone-400">
                3,420m Elevation · Pristine Wilderness
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PROJECT DETAILS & STORYTELLING
         ===================================================================== */}
      <main className="relative z-20 bg-[#070B10]">
        {/* SECTION 01: SANCTUARY */}
        <section
          id="sanctuary"
          className="max-w-[1380px] mx-auto px-6 lg:px-12 py-28 border-t border-white/10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#F3B678]">
                The Sanctuary
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                An Untamed High-Mountain Corridor
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-stone-300 text-base sm:text-lg leading-relaxed font-normal">
              <p>
                Carved by ancient glacial waters and shielded by granite peaks, Cascadia stands as
                a monument to the quiet majesty of the Pacific Northwest. Here, the low western sun
                ignites faceted volcanic rock in vibrant alpenglow, while mist settles over ancient
                fir groves and winding glacial currents.
              </p>
              <p className="text-stone-400 text-base">
                Every element of this landscape is interconnected: the icy headwaters nourish the
                emerald meadows below, ancient cedar stands anchor the steep terracotta ridges, and
                native elk and stag roam the tranquil shores undisturbed.
              </p>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
            <div className="p-8 rounded-2xl bg-[#0E151F] border border-white/10">
              <Mountain className="w-6 h-6 text-[#F06E4B] mb-5" />
              <h3 className="font-display text-xl font-semibold text-white">The High Peaks</h3>
              <p className="mt-3 text-sm text-stone-300 leading-relaxed font-normal">
                Glaciated granite summits soaring to 3,420 meters, catching the first golden-hour
                rays of dawn and the final coral alpenglow of twilight.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0E151F] border border-white/10">
              <Waves className="w-6 h-6 text-[#3AA3BF] mb-5" />
              <h3 className="font-display text-xl font-semibold text-white">Glacial Waters</h3>
              <p className="mt-3 text-sm text-stone-300 leading-relaxed font-normal">
                A pristine, turquoise meltwater river flowing through sunlit chartreuse meadows and
                alluvial stone gardens toward the lower valley.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0E151F] border border-white/10">
              <Trees className="w-6 h-6 text-[#8EC149] mb-5" />
              <h3 className="font-display text-xl font-semibold text-white">Old-Growth Timber</h3>
              <p className="mt-3 text-sm text-stone-300 leading-relaxed font-normal">
                Dense subalpine fir, towering western red cedar, and autumn-tinted larch trees that
                frame the canyon slopes in vivid green and amber.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 02: BENTO VISUAL GALLERY */}
        <section
          id="gallery"
          className="max-w-[1380px] mx-auto px-6 lg:px-12 py-28 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#F3B678]">
                Visual Studies
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                Captured Perspectives
              </h2>
            </div>
            <p className="text-stone-400 text-sm max-w-md">
              Select any composition to inspect the artwork in full resolution with detailed field
              notes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {STUDY_PLATES.map((plate, index) => {
              const isLarge = index === 0;
              return (
                <article
                  key={plate.id}
                  onClick={() => setActiveLightboxPlate(plate)}
                  className={`group relative rounded-2xl overflow-hidden bg-[#0E151F] border border-white/10 hover:border-white/25 transition-all cursor-pointer flex flex-col justify-between ${
                    isLarge ? 'lg:col-span-2 lg:row-span-2' : 'lg:col-span-1'
                  }`}
                >
                  <div
                    className={`relative w-full overflow-hidden bg-[#0A1018] ${
                      isLarge ? 'aspect-video lg:h-[480px]' : 'aspect-[4/3]'
                    }`}
                  >
                    <ResilientImage
                      src={plate.imageUrl}
                      alt={plate.title}
                      fallbackTitle={plate.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E151F] via-transparent to-transparent opacity-80" />
                    <button
                      type="button"
                      aria-label={`Open ${plate.title}`}
                      className="absolute top-4 right-4 p-2.5 rounded-lg bg-[#070B10]/70 text-stone-200 hover:text-white border border-white/15 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                        {plate.kicker}
                      </span>
                      <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                        {plate.title}
                      </h3>
                      <p className="mt-3 text-sm text-stone-300 leading-relaxed font-normal">
                        {plate.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                      <span>{plate.depthSpan} Depth</span>
                      <span className="inline-flex items-center gap-1 text-[#F06E4B] font-medium group-hover:translate-x-0.5 transition-transform">
                        Inspect study <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION 03: THE HORIZONS */}
        <section
          id="horizons"
          className="max-w-[1380px] mx-auto px-6 lg:px-12 py-28 border-t border-white/10"
        >
          <div className="max-w-xl mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#F3B678]">
              Natural Architecture
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              The Seven Landscape Horizons
            </h2>
            <p className="mt-4 text-stone-400 text-base leading-relaxed">
              Ascending from the quiet riverbanks up to the glaciated peaks, each layer represents a
              unique ecological stratum of the sanctuary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPTH_LAYERS.map((layer) => (
              <div
                key={layer.id}
                className="p-7 rounded-2xl bg-[#0E151F] border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                    <span className="uppercase tracking-wider font-medium">
                      Horizon 0{layer.index}
                    </span>
                    <span className="font-mono text-stone-300">{layer.depthMeters}m Elevation</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {layer.title.replace(/^\d+\.\s*/, '')}
                  </h3>
                  <p className="mt-3 text-sm text-stone-300 leading-relaxed font-normal">
                    {layer.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                  <span className="capitalize">{layer.layerCategory}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: layer.dominantHex }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: layer.secondaryHex }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 04: NATURAL PALETTE */}
        <section
          id="palette"
          className="max-w-[1380px] mx-auto px-6 lg:px-12 py-28 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#F3B678]">
                Chromatic Harmony
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                The Pigments of Cascadia
              </h2>
            </div>
            <p className="text-stone-400 text-sm max-w-md">
              A distinctive balance of warm sunset coral and golden amber set against deep glacial
              cobalt, turquoise rapids, and forest earth.
            </p>
          </div>

          <div className="w-full h-4 rounded-full overflow-hidden flex border border-white/15 mb-10">
            {COLOR_PALETTE_DATA.map((swatch) => (
              <div
                key={swatch.id}
                style={{
                  width: `${swatch.coveragePercent}%`,
                  backgroundColor: swatch.hex,
                }}
                className="h-full"
              />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {COLOR_PALETTE_DATA.map((swatch) => {
              const isCopied = copiedHex === swatch.hex;
              return (
                <div
                  key={swatch.id}
                  className="rounded-2xl bg-[#0E151F] border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  <div
                    className="h-32 w-full p-4 flex items-end justify-end"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyHex(swatch.hex)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070B10]/80 hover:bg-[#070B10] text-xs font-mono text-white transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#8EC149]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{swatch.hex}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-5">
                    <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                      {swatch.role}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-semibold text-white">
                      {swatch.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-300 leading-relaxed font-normal">
                      {swatch.sceneRegion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 05: EXPEDITION CALL TO ACTION */}
        <section className="max-w-[1380px] mx-auto px-6 lg:px-12 py-24 border-t border-white/10">
          <div className="rounded-3xl bg-gradient-to-br from-[#0E151F] via-[#121B27] to-[#1C161D] border border-white/10 p-10 sm:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#F3B678]">
                Preservation & Study
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Preserving the Alpine Horizon
              </h2>
              <p className="mt-4 text-stone-300 text-base leading-relaxed font-normal">
                Cascadia remains an untouched ecosystem dedicated to conservation, ecological
                research, and visual preservation. Experience the untamed wild with minimal human
                footprint.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3.5 text-xs font-semibold text-white bg-[#F06E4B] hover:bg-[#e05d3a] rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-lg shadow-[#F06E4B]/20"
              >
                Replay Horizon Sequence
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER
         ===================================================================== */}
      <footer className="border-t border-white/10 bg-[#05080C] py-12 px-6 lg:px-12">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-[#F06E4B]" />
            <span className="font-display text-base font-semibold text-white">Cascadia</span>
            <span className="text-stone-500">·</span>
            <span className="text-xs text-stone-400">Alpine Sunset Visual Reconstruction</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-400">
            <button
              type="button"
              onClick={() => scrollToSection('sanctuary')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sanctuary
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('gallery')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Gallery
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('horizons')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Horizons
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          FULLSCREEN LIGHTBOX MODAL
         ===================================================================== */}
      {activeLightboxPlate && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveLightboxPlate(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#0E151F] border border-white/15 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                  {activeLightboxPlate.kicker}
                </span>
                <h3 className="font-display text-lg font-semibold text-white">
                  {activeLightboxPlate.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightboxPlate(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#070B10] max-h-[70vh] overflow-hidden flex items-center justify-center">
              <ResilientImage
                src={activeLightboxPlate.imageUrl}
                alt={activeLightboxPlate.title}
                className="w-full h-full max-h-[70vh] object-contain"
              />
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-stone-300 max-w-2xl leading-relaxed font-normal">
                {activeLightboxPlate.summary}
              </p>
              <div className="flex items-center gap-6 shrink-0 text-xs text-stone-300 font-mono">
                <div>
                  <span className="text-stone-500 block">Perspective</span>
                  <span>{activeLightboxPlate.focalLength}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Depth Span</span>
                  <span>{activeLightboxPlate.depthSpan}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
