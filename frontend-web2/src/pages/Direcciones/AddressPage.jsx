import React, { useEffect, useState } from "react";
import env from "../../config/env" ;
import AddressForm from "./AddressForm";
import Modal from "../../components/Modal";
import {
  MapPin,
  Phone,
  User,
  Edit,
  Trash2,
  PlusCircle,
  Home,
  Copy,
} from "lucide-react";
import "./AddressPage.css";

const API_URL = env.BASE_URL_API;

export default function AddressPage({ onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/addresses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setAddresses)
      .catch(console.error);
  }, [showForm, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta dirección?")) return;
    try {
      await fetch(`${API_URL}/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      alert("Error al eliminar la dirección");
    }
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setShowForm(true);
  };

  const handleCopy = (address) => {
    const text = `${address.street_name}, ${address.district}, ${address.province}, ${address.department}, ${address.postal_code}`;
    navigator.clipboard.writeText(text);
    alert("Dirección copiada al portapapeles");
  };

  const handleSelect = (address) => {
    setSelectedAddress(address);
    if (onSelect) onSelect(address);
  };

  return (
    <div className="address-page-container">
      <div className="address-header">
        <h2>
          <Home className="header-icon" />
          Mis Direcciones
        </h2>
        <button
          className="btn-add-address"
          onClick={() => {
            setEditAddress(null);
            setShowForm(true);
          }}
        >
          <PlusCircle className="btn-icon" />
          Agregar nueva dirección
        </button>
      </div>
      <p className="address-note">
        <span className="secure-icon">🔒</span> Todos los datos se cifrarán
      </p>
      <div className="address-list">
        {addresses.length === 0 ? (
          <div className="address-empty">
            <MapPin size={48} />
            <p>No tienes direcciones registradas.</p>
          </div>
        ) : (
          addresses.map((address, idx) => (
            <div
              className={`address-card ${
                selectedAddress && selectedAddress.id === address.id ? "selected" : ""
              }`}
              key={address.id}
              onClick={() => handleSelect(address)}
              style={{ cursor: "pointer" }}
            >
              <div className="address-card-header">
                <span className="recent-badge">
                  {idx === 0 ? "Usada recientemente" : ""}
                </span>
                <span className="address-user">
                  <User className="user-icon" />
                  <b>
                    {address.first_name} {address.last_name}
                  </b>
                  &nbsp;|&nbsp;
                  <Phone className="user-icon" />
                  {address.phone_number}
                </span>
              </div>
              <div className="address-details">
                <span>
                  {address.street_name}
                  <br />
                  {address.district}, {address.province}, {address.department}, {address.postal_code}
                </span>
              </div>
              <div className="address-actions">
                <button
                  className="btn-action"
                  title="Eliminar"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="btn-icon" />
                  Eliminar
                </button>
                <button
                  className="btn-action"
                  title="Copiar"
                  onClick={() => handleCopy(address)}
                >
                  <Copy className="btn-icon" />
                  Copiar
                </button>
                <button
                  className="btn-action"
                  title="Editar"
                  onClick={() => handleEdit(address)}
                >
                  <Edit className="btn-icon" />
                  Editar
                </button>
              </div>
              {idx === 0 && (
                <div className="address-default">
                  <span className="default-dot"></span> Predeterminado
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditAddress(null); }}>
        <AddressForm
          onSuccess={() => {
            setShowForm(false);
            setEditAddress(null);
          }}
          address={editAddress}
        />
      </Modal>
    </div>
  );
}