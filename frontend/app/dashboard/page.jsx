'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async (token) => {
    const response = await fetch('http://localhost:3001/api/loan-requests', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se pudieron cargar las solicitudes');
    setRequests(data.data || []);
  };

  useEffect(() => {
    const token = localStorage.getItem('bibliouni_token');
    const savedUser = localStorage.getItem('bibliouni_user');

    if (!token || !savedUser) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.rol === 'Administrador') {
        loadRequests(token).catch((error) => setMessage(error.message));
      }
    } catch {
      localStorage.removeItem('bibliouni_token');
      localStorage.removeItem('bibliouni_user');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const manageRequest = async (requestId, estado) => {
    const token = localStorage.getItem('bibliouni_token');
    setProcessingId(requestId);
    setMessage('');
    try {
      const response = await fetch(`http://localhost:3001/api/loan-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detalle || data.error || 'No se pudo actualizar la solicitud');
      setMessage(data.message);
      await loadRequests(token);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bibliouni_token');
    localStorage.removeItem('bibliouni_user');
    router.replace('/login');
  };

  if (loading || !user) return <p className="loading">Cargando sesión...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Panel de administración</h1>
          <p className="welcome-subtitle">Sesión iniciada como {user.nombre}</p>
        </div>

        <section className="dashboard-card profile-card">
          <h2>Mi perfil</h2>
          <div className="profile-info">
            <div className="info-item"><span className="label">Nombre:</span><span className="value">{user.nombre}</span></div>
            <div className="info-item"><span className="label">Correo:</span><span className="value">{user.email}</span></div>
            <div className="info-item"><span className="label">Rol:</span><span className="value badge">{user.rol}</span></div>
          </div>
        </section>

        {user.rol === 'Administrador' ? (
          <section className="requests-section">
            <div className="requests-heading">
              <div>
                <h2>Solicitudes de préstamo</h2>
                <p>Revisa los datos y aprueba o rechaza cada solicitud pendiente.</p>
              </div>
              <span className="requests-count">{requests.filter((request) => request.estado === 'pendiente').length} pendientes</span>
            </div>
            {message && <p className="request-message">{message}</p>}
            {requests.length === 0 ? (
              <p className="empty-message">Todavía no hay solicitudes registradas.</p>
            ) : (
              <div className="requests-list">
                {requests.map((request) => (
                  <article className="request-card" key={request.id}>
                    <div className="request-card-title">
                      <h3>{request.libro_titulo}</h3>
                      <span className={`request-status ${request.estado}`}>{request.estado}</span>
                    </div>
                    <p><strong>Solicitante:</strong> {request.nombre_solicitante}</p>
                    <p><strong>Correo:</strong> {request.email_solicitante}</p>
                    <p><strong>Documento:</strong> {request.cedula_solicitante}</p>
                    {request.telefono_solicitante && <p><strong>Teléfono:</strong> {request.telefono_solicitante}</p>}
                    <p><strong>Fecha:</strong> {new Date(request.fecha_solicitud).toLocaleString('es-CO')}</p>
                    {request.estado === 'pendiente' && (
                      <div className="request-actions">
                        <button className="btn btn-primary btn-small" onClick={() => manageRequest(request.id, 'aprobada')} disabled={processingId === request.id}>
                          {processingId === request.id ? 'Procesando...' : 'Aprobar'}
                        </button>
                        <button className="btn btn-reject btn-small" onClick={() => manageRequest(request.id, 'rechazada')} disabled={processingId === request.id}>
                          Rechazar
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="error">Esta cuenta no tiene permisos de administración.</p>
        )}

        <div className="action-buttons">
          <button onClick={handleLogout} className="btn btn-logout">Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
