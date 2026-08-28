/** Load versioned content from /content (CDN) with fallback. */
const MANIFEST = '/content/manifest.json';

export async function loadContent() {
  try {
    const man = await fetch(MANIFEST).then(r => r.json());
    const [q, m] = await Promise.all([
      fetch(`/content/${man.questions}`).then(r => r.json()),
      fetch(`/content/${man.milestones}`).then(r => r.json()),
    ]);
    return {
      contentVersion: man.contentVersion,
      questions: q.questions || [],
      milestones: m.milestones || [],
      icons: m.icons || [],
      population: m.population || [],
    };
  } catch (err) {
    console.warn('Content CDN load failed; using embedded bank if present', err);
    return null;
  }
}
