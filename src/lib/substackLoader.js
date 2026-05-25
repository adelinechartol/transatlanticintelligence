const FEED_URL = 'https://transatlanticintelligence.substack.com/feed';
const PROXY_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`;

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
            author: item.author ?? 'Suzanne and Adeline Chartol',
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
