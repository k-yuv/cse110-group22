import { useNewsArticleModel } from './newsArticleModel';
import { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type Konva from 'konva';

// Define the NewsArticle component
export default function NewsArticle() {
  const { message } = useNewsArticleModel();

  //Setup window dimensions 
  const [dimensions, setDimensions] = useState({
    width: 0, height: 0 
  });

  //return message
  return (
    <section>
      <h1>News Article</h1>
      <p>{message}</p>
    </section>
  );
}