import React, { useState, useContext } from 'react';
import ApiContext from '../../context/apiContext';
import { showToast } from '../../utils/toast';
import AssignTireModal from './modals/AssignTireModal';
import UnassignTireModal from './modals/UnassignTireModal';
import SendToRecapModal from './modals/SendToRecapModal';
import MarkRecapDoneModal from './modals/FinishRecapModal.jsx';
import DiscardTireModal from './modals/ConfirmDiscardModal.jsx';

const QuickActions = ({ tire, refreshTire }) => {
  const { triggerGlobalRefresh } = useContext(ApiContext);
  const [modal, setModal] = useState(null);

  const canDo = {
    assign: !tire.vehicle,
    unassign: !!tire.vehicle,
    sendToRecap: !['A recapar', 'Descartada'].includes(tire.status),
    markRecapDone: tire.status === 'A recapar',
    discard: tire.status !== 'Descartada',
  };

  return (
    <div className="mt-6 flex flex-col gap-4">

      <div className="mx-auto flex gap-2 flex-wrap">

        {/* ASIGNAR */}
        <button
          onClick={() => setModal('assign')}
          disabled={!canDo.assign}
          title="Asignar cubierta a un vehículo"
          className={`p-2 rounded ${canDo.assign ? 'bg-blue-500 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Asignar
        </button>

        {/* DESASIGNAR */}
        <button
          onClick={() => setModal('unassign')}
          disabled={!canDo.unassign}
          title={canDo.unassign ? 'Desasignar cubierta del vehículo actual' : 'La cubierta no está asignada'}
          className={`p-2 rounded ${canDo.unassign ? 'bg-yellow-500 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Desasignar
        </button>

        {/* ENVIAR A RECAPAR */}
        <button
          onClick={() => setModal('recapar')}
          disabled={!canDo.sendToRecap}
          title="Enviar cubierta a recapado"
          className={`p-2 rounded ${canDo.sendToRecap ? 'bg-purple-600 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Enviar a recapar
        </button>

        {/* RECAPADO LISTO */}
        <button
          onClick={() => setModal('recapDone')}
          disabled={!canDo.markRecapDone}
          title="Marcar recapado como completado"
          className={`p-2 rounded ${canDo.markRecapDone ? 'bg-green-600 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Recapado listo
        </button>

        {/* DESCARTAR */}
        <button
          onClick={() => setModal('discard')}
          disabled={!canDo.discard}
          title="Marcar como descartada"
          className={`p-2 rounded ${canDo.discard ? 'bg-red-600 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Descartar
        </button>
      </div>

      {/* Modales condicionales */}
      {modal === 'assign' && (
        <AssignTireModal
          tire={tire}
          onClose={() => setModal(null)}
          refreshTire={refreshTire}
          triggerGlobalRefresh={triggerGlobalRefresh}
        />
      )}

      {modal === 'unassign' && (
        <UnassignTireModal
          tire={tire}
          onClose={() => setModal(null)}
          refreshTire={refreshTire}
          triggerGlobalRefresh={triggerGlobalRefresh}
        />
      )}

      {modal === 'recapar' && (
        <SendToRecapModal
          tire={tire}
          onClose={() => setModal(null)}
          refreshTire={refreshTire}
          triggerGlobalRefresh={triggerGlobalRefresh}
        />
      )}

      {modal === 'recapDone' && (
        <MarkRecapDoneModal
          tire={tire}
          onClose={() => setModal(null)}
          refreshTire={refreshTire}
          triggerGlobalRefresh={triggerGlobalRefresh}
        />
      )}

      {modal === 'discard' && (
        <DiscardTireModal
          tire={tire}
          onClose={() => setModal(null)}
          refreshTire={refreshTire}
          triggerGlobalRefresh={triggerGlobalRefresh}
        />
      )}

    </div>
  );
};

export default QuickActions;
