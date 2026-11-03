import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Batch from './pages/Batch';
import Metrics from './pages/Metrics';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        <NavBar />
        <main style={{ paddingBottom: '48px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/batch" element={<Batch />} />
            <Route path="/metrics" element={<Metrics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;