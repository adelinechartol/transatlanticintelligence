import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

const FEED_URL = 'https://transatlanticintelligence.substack.com/feed';

export async function getPosts() {
  const response = await fetch(FEED_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    console.error(`Substack feed returned ${response.status}`);
    return [];
  }

  const xml = await response.text();
  const feed = await parser.parseString(xml);

  return feed.items.map((item) => ({
    title: item.title,
    link: item.link,
    pubDate: new Date(item.pubDate),
    description: item.contentSnippet,
    content: item.contentEncoded || item.content,
    slug: item.link.split('/p/')[1]?.replace(/\/$/, ''),
    creator: item.creator,
  }));
}
