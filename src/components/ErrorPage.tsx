import { useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-lg text-gray-700 mb-2">Desculpe, ocorreu um erro inesperado.</p>
      <p className="text-sm text-gray-500">
        {error.statusText || error.message}
      </p>
      <a 
        href="/" 
        className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
      >
        Voltar para a página inicial
      </a>
    </div>
  );
};

export default ErrorPage; 