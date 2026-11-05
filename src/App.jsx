import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Jugar from './pages/Jugar';
import Resultado from './pages/Resultado';
import Estimador from './pages/Estimador';
import Puntajes from './pages/Puntajes';
import Configuracion from './pages/Configuracion';
// Add page imports here

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jugar" element={<Jugar />} />
      <Route path="/resultado/:id" element={<Resultado />} />
      <Route path="/estimador" element={<Estimador />} />
      <Route path="/puntajes" element={<Puntajes />} />
      <Route path="/configuracion" element={<Configuracion />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App