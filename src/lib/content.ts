import { getSectors, Sector, MediaItem } from "../data/sectors";
import { getStore, applyOrderAndHidden } from "./overrides";

export async function getDisplaySectors(): Promise<Sector[]> {
  const store = await getStore();
  const baseSectors = getSectors(); // returns base + uploads.json

  // Map base sectors with overrides
  const mappedBaseSectors = baseSectors.map((sector) => {
    const ov = store.overrides[sector.slug];
    let media = [...sector.media];
    let cover = sector.cover;
    let accent = sector.accent;
    let name = { ...sector.name };
    let tagline = { ...sector.tagline };

    if (ov) {
      if (ov.cover) cover = ov.cover;
      if (ov.accent) accent = ov.accent;
      if (ov.name) name = { tr: ov.name, en: ov.name };
      if (ov.tagline) tagline = { tr: ov.tagline, en: ov.tagline };

      // 1. Merge added media from dashboard
      if (ov.added) {
        const addedMediaItems: MediaItem[] = ov.added.map((m) => ({
          id: m.id,
          type: m.type,
          src: m.src,
          ratio: m.ratio,
          title: { tr: m.title, en: m.title },
        }));
        media = [...media, ...addedMediaItems];
      }

      // 1b. Apply source overrides
      if (ov.sources) {
        media = media.map((item) => {
          const overriddenSrc = ov.sources?.[item.id];
          if (overriddenSrc) {
            return {
              ...item,
              src: overriddenSrc,
            };
          }
          return item;
        });
      }

      // 2. Apply title overrides
      if (ov.titles) {
        media = media.map((item) => {
          const overridenTitle = ov.titles?.[item.id];
          if (overridenTitle) {
            return {
              ...item,
              title: { tr: overridenTitle, en: overridenTitle },
            };
          }
          return item;
        });
      }

      // 3. Apply order and visibility
      media = applyOrderAndHidden(media, ov);
    }

    return {
      ...sector,
      name,
      tagline,
      cover,
      accent,
      media,
    };
  });

  // Map custom sectors from the dashboard store
  const mappedCustomSectors: Sector[] = store.custom.map((cs) => {
    const ov = store.overrides[cs.slug];
    let media: MediaItem[] = [];

    if (ov) {
      if (ov.added) {
        media = ov.added.map((m) => ({
          id: m.id,
          type: m.type,
          src: m.src,
          ratio: m.ratio,
          title: { tr: m.title, en: m.title },
        }));
      }

      if (ov.titles) {
        media = media.map((item) => {
          const overridenTitle = ov.titles?.[item.id];
          if (overridenTitle) {
            return {
              ...item,
              title: { tr: overridenTitle, en: overridenTitle },
            };
          }
          return item;
        });
      }

      media = applyOrderAndHidden(media, ov);
    }

    return {
      slug: cs.slug,
      name: { tr: cs.name, en: cs.name },
      tagline: { tr: cs.tagline, en: cs.tagline },
      cover: cs.cover,
      accent: cs.accent,
      media,
    };
  });

  return [...mappedBaseSectors, ...mappedCustomSectors];
}

export async function getDisplaySector(slug: string): Promise<Sector | undefined> {
  const displaySectors = await getDisplaySectors();
  return displaySectors.find((s) => s.slug === slug);
}
