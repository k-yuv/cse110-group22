import { useNewsArticleModel } from './newsArticleModel';

export default function NewsArticle() {
  const { message } = useNewsArticleModel();

  return (
    <section>
      <h1>News Article</h1>
      <p>{message}</p>
    </section>
  );
}