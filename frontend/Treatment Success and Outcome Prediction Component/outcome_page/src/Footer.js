import React from 'react';
import './Footer.css';
import logo_3 from './assets/footer_img/logo_3.png';
import instagram from './assets/footer_img/instagram.png';
import facebook from './assets/footer_img/facebook.png';
import youtube from './assets/footer_img/youtube.png';
import twitter from './assets/footer_img/twitter.png';

function Footer() {
    return (
        <footer className="footer">
            <div className="box">
                <div className="box-one">
                    <div className="logo-footer">
                        <div className="logo_slogan">
                            <img src={logo_3} alt="logo" className="footer-logo" />
                            <p1>" Experience authentic Ayurvedic balance - Ignite natural wellness power "</p1>
                            <p2>Sri-Ayu Ayurvedic Care Application</p2>
                        </div>
                        <div className="navbar-content">
                            <a href="#content">Home</a>
                            <a href="#about-desc">About Us</a>
                            <a href="#services">Services</a>
                        </div>
                    </div>
                </div>
                <hr />
            </div>

            <div className="box-two">
                <h1>Stay Connected</h1>
                <p>Follow us on social media for updates and wellness tips.</p>
                <div className="social-media">
                    <img src={instagram} alt="instagram" className="instagram" />
                    <img src={facebook} alt="facebook" className="facebook" />
                    <img src={youtube} alt="youtube" className="youtube" />
                    <img src={twitter} alt="twitter" className="twitter" />
                </div>
            </div>
            <hr />

            <div className="box-three">
                <div className="footer-links">
                    <ul>Privacy Policy</ul>
                    <ul>Terms & Services</ul>
                    <div className="copyright">
                        <ul className="copyright">&copy; 2025 Sri-Āyu Ayurvedic Care. All rights reserved.</ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
