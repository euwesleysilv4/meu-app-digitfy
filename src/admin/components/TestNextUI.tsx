import React from 'react';
import { Button, Spinner } from '@nextui-org/react';

const TestNextUI: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Teste do NextUI</h1>
      <div className="flex gap-4 items-center">
        <Button color="primary">Botão NextUI</Button>
        <Spinner />
      </div>
    </div>
  );
};

export default TestNextUI; 