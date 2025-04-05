import React from 'react';
import {Link} from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import './NavBar.css';
import logo from '../assets/navbar_img/logo.png';
import logo_2 from '../assets/navbar_img/logo_2.png';
import logo_3 from '../assets/navbar_img/logo_3.png';

function NavBar() {
    return (
        <nav className="navbar">
            <div className="logo-container">
                <img src={logo_3} alt="Logo" className="logo"/>
            </div>
            <ul className="navbar-links">
                <li>
                    <HashLink smooth to="/#content">Home</HashLink>
                </li>
                <li>
                    <HashLink smooth to="/#about-desc">About Us</HashLink>
                </li>
                <li>
                    <HashLink smooth to="/#services">Services</HashLink>
                </li>
                <li>
                    <HashLink smooth to="/#contact">Contact</HashLink>
                </li>


                <li>
                <a href="/signinpage">
                <div className="navbar-button">
                <button
                    type="button"
                    className="sign-up"
                >
                    Sign-up / Log-in
                </button>
                </div>
                </a>
                </li>
            </ul>
        </nav>

    );
}

export default NavBar;