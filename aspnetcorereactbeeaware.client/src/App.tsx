import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/home/Home';
import Hives from './pages/beekeeping/Hives/Hives';
import Apiaries from './pages/beekeeping/Apiaries/Apiaries';
import Inspections from './pages/beekeeping/Inspections/Inspections';
import './styles/global.css';

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/beekeeping/hives" element={<Hives />} />
                    <Route path="/beekeeping/apiaries" element={<Apiaries />} />
                    <Route path="/beekeeping/inspections" element={<Inspections />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;