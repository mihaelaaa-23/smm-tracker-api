import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/ui/Layout'
import ClientsPage from './pages/ClientsPage'
import TasksPage from './pages/TasksPage'
import PaymentsPage from './pages/PaymentsPage'

function App() {
  return (
    <BrowserRouter basename="/smm-tracker">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/clients" replace />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App