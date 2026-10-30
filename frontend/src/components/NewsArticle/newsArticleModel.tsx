import { useState } from 'react';

export function useNewsArticleModel() {
  const [message, setMessage] = useState('News article view works');

  return {
    message,
    onChangeMessage: setMessage,
  };
}