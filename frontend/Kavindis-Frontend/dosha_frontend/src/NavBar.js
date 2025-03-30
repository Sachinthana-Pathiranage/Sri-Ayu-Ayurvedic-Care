import React from 'react';
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