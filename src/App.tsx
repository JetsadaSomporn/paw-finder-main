import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {
  FoundPetForm,
  FoundPetsSearch,
  LostCatForm,
  LostPetsSearch,
  RewardsPage,
  SignIn,
  SignUp,
} from './screens';
import Footer from './shared/components/Footer';
import FoundPetsList from './shared/components/FoundPetsList';
import Header from './shared/components/Header';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <Toaster position="top-center" />
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LostCatForm />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/lost-pets" element={<LostCatForm />} />
              <Route path="/found-pets" element={<FoundPetForm />} />
              <Route path="/found-list" element={<FoundPetsList />} />
              <Route path="/found-search" element={<FoundPetsSearch />} />
              <Route path="/search" element={<LostPetsSearch />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
