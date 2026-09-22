const FEED_URL = 'https://transatlanticintelligence.substack.com/feed';
const PROXY_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

// Every post is co-authored by both Suzanne and Adeline Chartol on Substack,
// but Substack's RSS feed only ever exposes a single primary-author name per
// item (rss2json confirms this — there's no field carrying the full
// co-author list), so that single name can't be trusted as the full byline.
// Always credit both, which matches actual Substack authorship.
const AUTHOR = 'Suzanne Chartol and Adeline Chartol';

export function substackLoader() {
  return {
    name: 'substack-rss-loader',
    load: async ({ store, logger }) => {
      let data;
      try {
        const res = await fetch(PROXY_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
        if (data.status !== 'ok') throw new Error(`rss2json: ${data.message}`);
      } catch (err) {
        logger.error(`Failed to fetch Substack feed: ${err.message}`);
        return;
      }

      for (const item of data.items) {
        const slug =
          item.link?.split('/p/').at(1)?.replace(/\/$/, '') ??
          item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const description =
          item.description?.length > 200
            ? item.description.slice(0, 200).trimEnd() + '…'
            : item.description || item.title;

        store.set({
          id: slug,
          data: {
            title: item.title ?? 'Untitled',
            description,
            pubDate: new Date(item.pubDate.replace(' ', 'T') + 'Z'),
            author: AUTHOR,
            substackUrl: item.link,
            draft: false,
          },
          body: item.content ?? '',
          rendered: item.content ? { html: item.content } : undefined,
        });
      }

      logger.info(`Loaded ${data.items.length} posts from Substack`);
    },
  };
}
