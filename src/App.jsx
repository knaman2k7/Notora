import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

import Login from "./Login/Login"
import Dashboard from "./dashboard/Dashboard"
import ProtectedRoute from "./ProtectedRoute"

function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>

        } />
      </Routes>
    </BrowserRouter>

  )
}

export default App
