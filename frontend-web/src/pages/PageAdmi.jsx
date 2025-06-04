import React, { useState } from "react";

import CreaModelo from "../pages/CrearModelo.jsx";
import CrearCate from "../components/CrearCate.jsx";
function PageAdmi() {
  return (
    <div className="page-admi">
      <h1>Panel de Administración</h1>
      <div className="admin-actions">
        <CreaModelo />
        <CrearCate />
      </div>
    </div>
  );
}
export default PageAdmi;
