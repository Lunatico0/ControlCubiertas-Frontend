import React, { useContext, useState } from 'react';
import apiContext from '../context/apiContext.jsx';
import TireDetails from './utils/TireDetails.jsx';
import Card from './Card.jsx';
import UpdateTire from './utils/UpdateTire.jsx';
import Swal from 'sweetalert2';

const CardList = () => {
  const {
    filteredTireData,
    loading,
    error,
    fetchTireById,
    selectedTire,
    selectedLoading
  } = useContext(apiContext);

  const [tireToUpdate, setTireToUpdate] = useState(null)
  const [isTireModalOpen, setIsTireModalOpen] = useState(false);
  const [isUpdateTireModalOpen, setIsUpdateTireModalOpen] = useState(false);

  const handleCardClick = async (id) => {
    setIsTireModalOpen(true);
    await fetchTireById(id);
  };

  const handlePasswordCheck = () => {
    Swal.fire({
      title: 'Para editar un elemento',
      input: 'password',
      inputPlaceholder: "Ingresa la contraseña",
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: "off"
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value === 'TMBCLogistica') {
            resolve();
          } else {
            resolve('Contraseña incorrecta');
          }
        });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setIsUpdateTireModalOpen(true);
      } else {
        setIsUpdateTireModalOpen(false);
      }
    });
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-fit mx-auto mt-4 gap-2'>
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
