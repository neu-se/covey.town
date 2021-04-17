import React from 'react';
import { useQuery, gql } from '@apollo/client';

const EXCHANGE_RATES = gql`
query GetBooks {
  books {
    title
    author
  }
}
`;

type Book = {
  title: string,
  author: string,
};

export default function GQLExample(): JSX.Element {
  const { loading, error, data } = useQuery(EXCHANGE_RATES);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  return data.books.map(({ title, author }:Book) => (
    <div key={title}>
      <p>
        {title}: {author}
      </p>
    </div>
  ));
}
