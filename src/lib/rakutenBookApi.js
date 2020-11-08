const rakutenAppId = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID;

export const fetchBooksByKeyword = async (title, author, page) => {
  let url;

  if (title && author) {
    url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${rakutenAppId}&title=${title}&author=${author}&page=${page}`;
  } else if (title) {
    url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${rakutenAppId}&title=${title}&page=${page}`;
  } else if (author) {
    url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${rakutenAppId}&author=${author}&page=${page}`;
  } else {
    throw new Error('No keyword');
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const booksData = data.Items.map(val => val.Item);
    const books = booksData.map(bookData => {
      const {
        isbn,
        title,
        author,
        publisherName,
        largeImageUrl: coverImageUrl,
      } = bookData;
      return { isbn, title, author, publisherName, coverImageUrl };
    });
    return books;
  } catch (e) {
    throw new Error('Failed data fetching');
  }
};

export const fetchBookByIsbn = async isbnInput => {
  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${rakutenAppId}&isbn=${isbnInput}`;

  const response = await fetch(url);
  const data = await response.json();
  const bookData = data.Items.map(val => val.Item)[0];

  console.log(bookData);

  const {
    isbn,
    title,
    author,
    publisherName,
    largeImageUrl: coverImageUrl,
    itemCaption: description,
    itemPrice: price,
    salesDate,
  } = bookData;

  return {
    isbn,
    title,
    author,
    publisherName,
    coverImageUrl,
    description,
    price,
    salesDate,
  };
};
