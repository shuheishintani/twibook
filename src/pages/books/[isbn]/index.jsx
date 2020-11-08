import { useState, useEffect } from 'react';
import Image from 'next/image';
import { dbAdmin } from '@/firebase/admin';
import { fetchBookByIsbn } from '@/lib/rakutenBookApi';
import { Avatar } from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';

const BookDetail = ({ book, readers }) => {
  return (
    <>
      <Image
        src={book.coverImageUrl}
        alt="Picture of the author"
        width={105}
        height={148}
        loading="lazy"
      />
      <p>{book.title}</p>
      <p>{book.author}</p>
      <a
        href={`https://www.amazon.co.jp/s?k=${book.isbn}`}
        target="_blank"
        rel="noreferrer"
      >
        Amazon
      </a>
      {readers && (
        <AvatarGroup max={5}>
          {readers.map(reader => (
            <Avatar
              alt="profile-img"
              src={reader.profileImageUrl}
              key={reader.uid}
            />
          ))}
        </AvatarGroup>
      )}
    </>
  );
};

export default BookDetail;

export const getServerSideProps = async ctx => {
  const { isbn } = ctx.query;

  const bookData = await fetchBookByIsbn(isbn);
  const { title, author, publisherName, coverImageUrl } = bookData;

  const readerIds = await dbAdmin
    .collectionGroup('books')
    .where('isbn', '==', isbn)
    .get()
    .then(snapshot => {
      let readerIds = [];
      snapshot.forEach(doc => {
        readerIds.push(doc.data().ownerId);
      });
      return readerIds;
    });

  const readerRefs = readerIds.map(id => dbAdmin.doc(`users/${id}`));
  const readers = await dbAdmin.getAll(...readerRefs).then(snapshot => {
    return snapshot.map(doc => doc.data());
  });

  return {
    props: {
      book: { isbn, title, author, publisherName, coverImageUrl },
      readers,
    },
  };
};
