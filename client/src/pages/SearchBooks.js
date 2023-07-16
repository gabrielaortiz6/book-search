import React, { useState, useEffect } from 'react';
import { searchGoogleBooks } from '../utils/API';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBooks, setSavedBooks] = useState([]);
  const [savedBookIds, setSavedBookIds] = useState([]);

  const [saveBookMutation] = useMutation(SAVE_BOOK);

  useEffect(() => {
    const bookIds = savedBooks.map((book) => book.bookId);
    setSavedBookIds(bookIds);
  }, [savedBooks]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    try {
      const { data } = await saveBookMutation({
        variables: { input: bookToSave },
      });

      setSavedBooks([...savedBooks, data.saveBook]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for a book"
        />
        <button type="submit">Search</button>
      </form>

      {/* Display searched books */}
      {searchedBooks.map((book) => (
        <div key={book.bookId}>
          <h3>{book.title}</h3>
          <p>{book.authors.join(', ')}</p>
          <p>{book.description}</p>
          <button disabled={savedBookIds.includes(book.bookId)} onClick={() => handleSaveBook(book.bookId)}>
            {savedBookIds.includes(book.bookId) ? 'Book Saved' : 'Save Book'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SearchBooks;