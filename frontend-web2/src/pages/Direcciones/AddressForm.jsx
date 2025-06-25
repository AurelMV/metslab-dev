import React, { useState, useEffect } from "react";
import env from "../../config/env" ;
import {
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Globe,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Navigation,
} from "lucide-react";
import MapSelector from "../../components/MapSelector";
import "./AddressForm.css";

const API_URL = env.BASE_URL_API;

const distritosCusco = [
  "Cusco",
  "San Sebastián",
  "San Jerónimo",
  "Santiago",
  "Wanchaq",
  "Saylla",
  "Poroy",
  "Ccorca"
];

export default function AddressForm({ onSuccess, address }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    street_name: "",
    department: "Cusco",
    province: "Cusco",
    district: "",
    postal_code: "",
    phone_number: "",
    latitude: "",
    longitude: "",
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Puedes obtener el token desde tu contexto de autenticación
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (address) {
      setForm(address);
    }
  }, [address]);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value.trim()) {
          errors[name] = 'Este campo es requerido';
        } else if (value.length < 2) {
          errors[name] = 'Debe tener al menos 2 caracteres';
        } else {
          delete errors[name];
        }
        break;
      case 'phone_number':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
        if (!value.trim()) {
          errors[name] = 'Este campo es requerido';
        } else if (!phoneRegex.test(value)) {
          errors[name] = 'Formato de teléfono inválido';
        } else {
          delete errors[name];
        }
        break;
      case 'postal_code':
        const postalRegex = /^[0-9]{5}$/;
        if (!value.trim()) {
          errors[name] = 'Este campo es requerido';
        } else if (!postalRegex.test(value)) {
          errors[name] = 'Código postal debe tener 5 dígitos';
        } else {
          delete errors[name];
        }
        break;
      default:
        if (!value.trim()) {
          errors[name] = 'Este campo es requerido';
        } else {
          delete errors[name];
        }
    }
    
    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const handleLocationChange = (latlng) => {
    setForm({ ...form, latitude: latlng.lat, longitude: latlng.lng });
  };

  const isFormValid = () => {
    const requiredFields = [
      'first_name', 'last_name', 'street_name', 'department',
      'province', 'district', 'postal_code', 'phone_number'
    ];
    
    return requiredFields.every(field => form[field].trim()) &&
           Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!isFormValid()) {
      setError("Por favor, completa todos los campos correctamente");
      return;
    }

    setIsLoading(true);
    
    try {
      const url = address
        ? `${API_URL}/addresses/${address.id}`
        : `${API_URL}/addresses`;
      const method = address ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        throw new Error("Error al guardar la dirección");
      }
      
      // Simular un pequeño delay para mejor UX
      setTimeout(() => {
        onSuccess();
      }, 500);
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Información Personal",
      fields: ['first_name', 'last_name', 'phone_number']
    },
    {
      id: 2,
      title: "Dirección",
      fields: ['street_name', 'department', 'province', 'district', 'postal_code']
    },
    {
      id: 3,
      title: "Ubicación",
      fields: ['latitude', 'longitude']
    }
  ];

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderFormField = (name, placeholder, icon, type = "text") => (
    <div className="form-group">
      <label className="form-label">
        {icon}
        {placeholder}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        className={`form-input ${fieldErrors[name] ? 'error' : ''}`}
        required
      />
      {fieldErrors[name] && (
        <div className="field-error">
          <AlertCircle className="error-icon" />
          {fieldErrors[name]}
        </div>
      )}
    </div>
  );

  return (
    <div className="address-form-container">
      <div className="form-header">
        <h2 className="form-title">
          {address ? "Editar Dirección" : "Nueva Dirección"}
        </h2>
        <p className="form-subtitle">
          {address 
            ? "Actualiza los datos de tu dirección" 
            : "Agrega una nueva dirección a tu perfil"
          }
        </p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="step-circle">
              {currentStep > step.id ? (
                <CheckCircle className="step-icon completed" />
              ) : (
                <span className="step-number">{step.id}</span>
              )}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="address-form">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="form-section">
            <div className="section-header">
              <User className="section-icon" />
              <h3>Información Personal</h3>
            </div>
            
            <div className="form-grid">
              {renderFormField("first_name", "Nombres", <User className="input-icon" />)}
              {renderFormField("last_name", "Apellidos", <User className="input-icon" />)}
              {renderFormField("phone_number", "Teléfono", <Phone className="input-icon" />, "tel")}
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={nextStep}
                className="btn-primary"
                disabled={!form.first_name || !form.last_name || !form.phone_number}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {currentStep === 2 && (
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">🏢</span>
              <h3>Información de Dirección</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Dirección completa</label>
                <input
                  className="form-input"
                  name="street_name"
                  placeholder="Dirección completa"
                  value={form.street_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Departamento</label>
                <input
                  className="form-input"
                  name="department"
                  value="Cusco"
                  disabled
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label">Provincia</label>
                <input
                  className="form-input"
                  name="province"
                  value="Cusco"
                  disabled
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label">Distrito</label>
                <select
                  className="form-input"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un distrito</option>
                  {distritosCusco.map((distrito) => (
                    <option key={distrito} value={distrito}>
                      {distrito}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Código Postal</label>
                <input
                  className="form-input"
                  name="postal_code"
                  placeholder="Código Postal"
                  value={form.postal_code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={prevStep}
                className="btn-secondary"
              >
                Anterior
              </button>
              <button 
                type="button" 
                onClick={nextStep}
                className="btn-primary"
                disabled={!form.street_name || !form.department || !form.province || !form.district || !form.postal_code}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Map Selection */}
        {currentStep === 3 && (
          <div className="form-section">
            <div className="section-header">
              <Navigation className="section-icon" />
              <h3>Ubicación en el Mapa</h3>
              <p className="section-description">
                Selecciona la ubicación exacta en el mapa para entregas más precisas
              </p>
            </div>

            <div className="map-container">
              <MapSelector onLocationChange={handleLocationChange} />
              {form.latitude && form.longitude && (
                <div className="location-info">
                  <CheckCircle className="location-icon" />
                  <span>Ubicación seleccionada correctamente</span>
                </div>
              )}
            </div>

            <div className="form-actions final-actions">
              <button 
                type="button" 
                onClick={prevStep}
                className="btn-secondary"
              >
                Anterior
              </button>
              <button 
                type="button" 
                onClick={onSuccess}
                className="btn-ghost"
              >
                <X className="btn-icon" />
                Cancelar
              </button>
              <button 
                type="submit"
                className="btn-success"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <Loader2 className="btn-icon spin" />
                ) : (
                  <Save className="btn-icon" />
                )}
                {isLoading ? 'Guardando...' : 'Guardar Dirección'}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}