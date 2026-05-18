import { getCollection } from 'astro:content';

export async function getPosts() {
  const entries = await getCollection('posts', ({ data }) => !data.draft);

  return entries
    .map((entry) => ({
      slug: entry.id.replace(/\.mdx?$/, ''),
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      creator: entry.data.author,
      substackUrl: entry.data.substackUrl,
      entry,
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}
