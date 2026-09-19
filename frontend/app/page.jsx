'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [requestData, setRequestData] = useState({ nombre: '', email: '', cedula: '', telefono: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const submitLoanRequest = async (event) => {
    event.preventDefault();
    if (!selectedBook) return;

    setSubmittingRequest(true);
    try {
      const response = await fetch('http://localhost:3001/api/loan-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libroId: selectedBook.id, ...requestData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No fue posible enviar la solicitud');
      alert(data.message);
      setSelectedBook(null);
      setRequestData({ nombre: '', email: '', cedula: '', telefono: '' });
    } catch (requestError) {
      alert(requestError.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/books');
        if (!response.ok) {
          throw new Error('Error al obtener los libros');
        }
        const data = await response.json();
        setBooks(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('No se pudieron cargar los libros. Por favor, intenta más tarde.');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <h1>Bienvenido a BiblioUni</h1>
        <p>Consulta los libros disponibles en la biblioteca</p>
        <div className="cta-buttons">
          <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
        </div>
      </section>

      <section className="features">
        <h2>¿Qué puedes hacer?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📚 Consulta el catálogo</h3>
            <p>Revisa los libros y cuántos ejemplares hay disponibles.</p>
          </div>
          <div className="feature-card">
            <h3>📋 Solicita préstamos</h3>
            <p>Envía una solicitud con tus datos para pedir un libro.</p>
          </div>
          <div className="feature-card">
            <h3>📌 Revisa el estado del libro</h3>
            <p>Mira si el libro está disponible antes de enviar la solicitud.</p>
          </div>
        </div>
      </section>

      <section className="books-section">
        <h2>Catálogo</h2>
        {loading && <p className="loading">Cargando libros...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && books.length > 0 && (
          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <h3>{book.titulo}</h3>
                <p><strong>Autor:</strong> {book.autores || 'Desconocido'}</p>
                <p><strong>Editorial:</strong> {book.editorial}</p>
                <p><strong>Categoría:</strong> {book.categoria}</p>
                <p><strong>Año:</strong> {book.ano_publicacion}</p>
                <p><strong>Disponibles:</strong> {book.cantidad_disponible} de {book.cantidad_total}</p>
                <p className="description">{book.descripcion}</p>
                <button
                  className="btn btn-small"
                  onClick={() => setSelectedBook(book)}
                  disabled={book.cantidad_disponible < 1}
                >
                  {book.cantidad_disponible < 1 ? 'No disponible' : 'Solicitar Préstamo'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="info">
        <h2>¿Cómo funciona?</h2>
        <ol>
          <li>Busca un libro en el catálogo.</li>
          <li>Completa el formulario de solicitud con tus datos.</li>
          <li>La biblioteca revisa la solicitud.</li>
          <li>Si se aprueba, puedes retirar el libro en la biblioteca.</li>
        </ol>
      </section>

      {selectedBook && (
        <div className="modal-backdrop" role="presentation">
          <form className="loan-request-form" onSubmit={submitLoanRequest}>
            <button type="button" className="modal-close" onClick={() => setSelectedBook(null)} aria-label="Cerrar">×</button>
            <h2>Solicitar préstamo</h2>
            <p className="request-book">Libro: <strong>{selectedBook.titulo}</strong></p>
            <label htmlFor="request-name">Nombre completo</label>
            <input id="request-name" value={requestData.nombre} onChange={(event) => setRequestData({ ...requestData, nombre: event.target.value })} required />
            <label htmlFor="request-email">Correo electrónico</label>
            <input id="request-email" type="email" value={requestData.email} onChange={(event) => setRequestData({ ...requestData, email: event.target.value })} required />
            <label htmlFor="request-id">Documento</label>
            <input id="request-id" value={requestData.cedula} onChange={(event) => setRequestData({ ...requestData, cedula: event.target.value })} required />
            <label htmlFor="request-phone">Teléfono</label>
            <input id="request-phone" type="tel" value={requestData.telefono} onChange={(event) => setRequestData({ ...requestData, telefono: event.target.value })} />
            <button className="btn btn-primary" type="submit" disabled={submittingRequest}>
              {submittingRequest ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
