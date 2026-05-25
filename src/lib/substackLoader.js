import Parser from 'rss-parser';

const FEED_URL = 'https://transatlanticintelligence.substack.com/feed';

export function substackLoader() {
  return {
    name: 'substack-rss-loader',
    load: async ({ store, logger }) => {
      const parser = new Parser({
        customFields: {
          item: [['content:encoded', 'contentEncoded']],
        },
      });

      let feed;
      try {
        const res = await fetch(FEED_URL, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RSS reader)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        feed = await parser.parseString(xml);
      } catch (err) {
        logger.error(`Failed to fetch Substack RSS: ${err.message}`);
        return;
      }

      for (const item of feed.items) {
        const slug =
          item.link?.split('/p/').at(1)?.replace(/\/$/, '') ??
          item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const snippet = item.contentSnippet ?? '';
        const description =
          snippet.length > 200 ? snippet.slice(0, 200).trimEnd() + '…' : snippet || item.title;

        store.set({
          id: slug,
          data: {
            title: item.title ?? 'Untitled',
            description,
            pubDate: new Date(item.pubDate ?? Date.now()),
            author: item.creator ?? 'Suzanne and Adeline Chartol',
            substackUrl: item.link,
            draft: false,
          },
          body: item.contentEncoded ?? '',
          rendered: item.contentEncoded
            ? { html: item.contentEncoded }
            : undefined,
        });
      }

      logger.info(`Loaded ${feed.items.length} posts from Substack`);
    },
  };
}
