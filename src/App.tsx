import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/common/Header/Header";
import Footer from "./components/common/Footer/Footer";
import SarahChat from "./components/SarahChat/SarahChat";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Product from "./pages/Product/Product";
import NotFound from "./pages/NotFound/NotFound";
import SalesAgent from "./pages/SalesAgent/SalesAgent";
import AgenticAI from "./pages/AgenticAI/AgenticAI";
import ModelTrain from "./pages/ModelTrain/ModelTrain";
import LLMEnt from "./pages/LLMEnt/LLMEnt";
import Partners from "./pages/Partners/Partners";
import Compliance from "./pages/Compliance/Compliance";
import Privacy from "./pages/Privacy/Privacy";
import Event from "./pages/Event/Event";
import LianelaInfo from "./pages/LianelaInfo/LianelaInfo";

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <Header>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </Header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/product" element={<Product />} />
        <Route path="/salesagent" element={<SalesAgent />} />
        <Route path="/agenticai" element={<AgenticAI />} />
        <Route path="/model-train" element={<ModelTrain />} />
        <Route path="/llm-ent" element={<LLMEnt />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/event" element={<Event />} />
        <Route path="/lianela-info" element={<LianelaInfo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <SarahChat />
    </Router>
  );
}

export default App;
