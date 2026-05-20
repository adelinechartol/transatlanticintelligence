import rss from '@astrojs/rss';
import { getPosts } from '../lib/substack';

export async function GET(context) {
  const posts = await getPosts();

  return rss({
    title: 'Transatlantic Intelligence',
    description: 'The business and governance of AI — from both sides of the Atlantic.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      link: `/posts/${post.slug}`,
    })),
  });
}
