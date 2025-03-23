import React from 'react';
import {Link} from 'react-router-dom';
import './NavBar.css';
import logo from './assets/navbar_img/logo.png';
import logo_2 from './assets/navbar_img/logo_2.png';
import logo_3 from './assets/navbar_img/logo_3.png';

function NavBar() {
    return (
        <nav className="navbar">
            <div className="logo-container">
                <img src={logo_3} alt="Logo" className="logo"/>
            </div>
            <ul className="navbar-links">
{/*                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/services">Services</Link>
                </li>
                <li>
                    <Link to="/contact">Contact</Link>
                </li>*/}
                <li>
                    <a>Home</a>
                </li>
                <li>
                    <a>About</a>
                </li>
                <li>
                    <a>Services</a>
                </li>
                <li>
                    <a>Contact</a>
                </li>

                <div className="navbar-button">
                <button
                    type="button"
                    className="sign-up"
                >
                    Sign-up / Log-in
                </button>
                </div>


            </ul>
        </nav>

    );
}

export default NavBar;