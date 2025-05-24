import React, { useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Card from './Card.jsx';
import UpdateTire from '../UpdateTire/UpdateTire.jsx';
import TireDetails from '../TireDetails/TireDetails.jsx';
import ApiContext from '../../context/apiContext.jsx';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Swal from 'sweetalert2';

const CardList = () => {
  const {
    error,
    loading,
    tireCount,
    loadTires,
    refreshFlag,
    loadTireById,
    selectedTire,
    selectedLoading,
    filteredTireData,
  } = useContext(ApiContext);

  const [tireToUpdate, setTireToUpdate] = useState(null)
  const [isTireModalOpen, setIsTireModalOpen] = useState(false);
  const [isUpdateTireModalOpen, setIsUpdateTireModalOpen] = useState(false);

  const handleCardClick = async (id) => {
    setIsTireModalOpen(true);
    await loadTireById(id);
  };

  const handlePasswordCheck = async () => {
    return Swal.fire({
      title: 'Para editar un elemento',
      input: 'password',
      inputPlaceholder: "Ingresa la contraseña",
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off',
        id: 'swal-password-input'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      didOpen: () => {
        const input = Swal.getInput();

        // Crear contenedor React para el botón
        const btnContainer = document.createElement('div');
        btnContainer.id = 'toggle-password-icon';
        btnContainer.style.position = 'absolute';
        btnContainer.style.right = '3rem';
        btnContainer.style.top = '48%';
        btnContainer.style.transform = 'translateY(-50%)';
        btnContainer.style.cursor = 'pointer';

        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(btnContainer);

        let show = false;

        const renderIcon = () => {
          const root = createRoot(btnContainer);
          root.render(show ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />);
        };

        btnContainer.onclick = () => {
          show = !show;
          input.type = show ? 'text' : 'password';
          renderIcon();
        };

        renderIcon();
      },
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value === '1234') resolve();
          else resolve('Contraseña incorrecta');
        });
      }
    }).then((result) => result.isConfirmed);
  };

  useEffect(() => {
    loadTires();
  }, [refreshFlag]);

  if (loading) return <p>Cargando...</p>;
  if (tireCount == 0) return <p>No hay datos para mostrar</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-fit mx-auto mt-4 gap-3'>
        <Card
          data={filteredTireData}
          handlePasswordCheck={handlePasswordCheck}
          handleCardClick={handleCardClick}
          setTireToUpdate={setTireToUpdate}
          setIsUpdateTireModalOpen={setIsUpdateTireModalOpen}
        />
      </div>
      {isTireModalOpen && selectedTire && (
        <TireDetails
          handlePasswordCheck={handlePasswordCheck}
          selectedLoading={selectedLoading}
          selectedTire={selectedTire}
          setIsTireModalOpen={setIsTireModalOpen}
          setTireToUpdate={setTireToUpdate}
          setIsUpdateTireModalOpen={setIsUpdateTireModalOpen}
        />
      )}

      {isUpdateTireModalOpen && (
        < UpdateTire
          id={tireToUpdate}
          setIsUpdateTireModalOpen={setIsUpdateTireModalOpen}
        />
      )}

    </div>
  )
}

export default CardList
