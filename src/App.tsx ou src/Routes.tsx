import RequestService from './pages/members/RequestService';

function App() {
  return (
    <Routes>
      {/* ... existing routes ... */}
      <Route path="/members/request-service" element={<RequestService />} />
    </Routes>
  );
}

export default App; 