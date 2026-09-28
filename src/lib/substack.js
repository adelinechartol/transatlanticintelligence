import { getCollection } from 'astro:content';

export async function getPosts() {
  const entries = await getCollection('posts', ({ data }) => !data.draft);

  return entries
    .map((entry) => ({
      slug: entry.id.replace(/\.mdx?$/, ''),
      title: entry.data.title,
      titleFr: entry.data.titleFr,
      description: entry.data.description,
      descriptionFr: entry.data.descriptionFr,
      pubDate: entry.data.pubDate,
      creator: entry.data.author,
      substackUrl: entry.data.substackUrl,
      entry,
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}
