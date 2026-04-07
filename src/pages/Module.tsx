import { useParams, Navigate } from 'react-router-dom';
import GenericModuleView from './GenericModuleView';

// Import local data
import apuntesM1 from '../data/apuntesM1.json';
import apuntesM2 from '../data/apuntesM2.json';
import apuntesM3 from '../data/apuntesM3.json';
import apuntesM4 from '../data/apuntesM4.json';

const moduleDataMap: Record<string, any> = {
  '1': apuntesM1,
  '2': apuntesM2,
  '3': apuntesM3,
  '4': apuntesM4
};

export default function Module() {
  const { id } = useParams();

  if (!id || !moduleDataMap[id]) {
    return <Navigate to="/dashboard" replace />;
  }

  const currentData = moduleDataMap[id];

  return <GenericModuleView key={currentData.moduloId} data={currentData} />;
}
