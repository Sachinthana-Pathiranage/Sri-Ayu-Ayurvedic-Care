import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import NavBar from './navbar/NavBar';
import Footer from './footer/Footer';
import Content from './content/Content';
import Loading from './loading_page/Loading';

function LayoutWrapper() {
    const location = useLocation();

    const hideLayout = location.pathname === '/loading';

    return (
        <>
            {!hideLayout && <NavBar />}

            <Routes>
                <Route path="/" element={<Content />} />
                <Route path="/loading" element={<Loading />} />
                {/* Add more routes here if needed in the future */}
            </Routes>

            {!hideLayout && <Footer />}
        </>
    );
}


function App() {
    return (
        <div className="App">
            <Router>
                <LayoutWrapper />
            </Router>
        </div>
    );
}

export default App;
