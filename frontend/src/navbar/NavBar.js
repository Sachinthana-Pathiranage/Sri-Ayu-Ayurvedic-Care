import React from 'react';
import './NavBar.css';
import logo_3 from './navbar_img/logo_3.png';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav className="navbar">
            <div className="logo-container">
                <img src={logo_3} alt="Logo" className="logo"/>
            </div>
            <ul className="navbar-links">
                <li>
                    <a href='/#content'>Home</a>
                </li>
                <li>
                    <a href='/#about-desc'>About Us</a>
                </li>
                <li>
                    <a href='/#services'>Services</a>
                </li>
                <li>
                    <a href="/#contact">Contact</a>
                </li>

                <li>
                <a href="http://localhost:3008/login">
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