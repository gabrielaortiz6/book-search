// import React, { useState } from 'react';
// import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
// import { useMutation } from '@apollo/client';
// import { SAVE_BOOK } from '../utils/mutations';
// import Auth from '../utils/auth';

// // STARTER CODE**
// const SearchBooks = () => {
//   // create state for holding returned google api data
//   const [searchedBooks, setSearchedBooks] = useState([]);
//   // create state for holding our search field data
//   const [searchInput, setSearchInput] = useState('');

//   // create state to hold saved bookId values
//   const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

//   // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
//   // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
//   useEffect(() => {
//     return () => saveBookIds(savedBookIds);
//   });

//   // create method to search for books and set state on form submit
//   const handleFormSubmit = async (event) => {
//     event.preventDefault();

//     if (!searchInput) {
//       return false;
//     }

//     try {
//       const response = await searchGoogleBooks(searchInput);

//       if (!response.ok) {
//         throw new Error('something went wrong!');
//       }

//       const { items } = await response.json();

//       const bookData = items.map((book) => ({
//         bookId: book.id,
//         authors: book.volumeInfo.authors || ['No author to display'],
//         title: book.volumeInfo.title,
//         description: book.volumeInfo.description,
//         image: book.volumeInfo.imageLinks?.thumbnail || '',
//       }));

//       setSearchedBooks(bookData);
//       setSearchInput('');
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // create function to handle saving a book to our database
//   const handleSaveBook = async (bookId) => {
//     // find the book in `searchedBooks` state by the matching id
//     const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

//     // get token
//     const token = Auth.loggedIn() ? Auth.getToken() : null;

//     if (!token) {
//       return false;
//     }

//     try {
//       const response = await saveBook(bookToSave, token);

//       if (!response.ok) {
//         throw new Error('something went wrong!');
//       }

//       // if book successfully saves to user's account, save book id to state
//       setSavedBookIds([...savedBookIds, bookToSave.bookId]);
//     } catch (err) {
//       console.error(err);
//     }
//   };

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