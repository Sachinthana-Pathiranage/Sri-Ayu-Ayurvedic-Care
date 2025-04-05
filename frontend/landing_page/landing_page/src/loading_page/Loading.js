import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


import './Loading.css';
import logo from '../assets/loading_img/logo.png'
import flower from '../assets/loading_img/flower.png'
import cat from '../assets/loading_img/cat.png'
import girl from '../assets/loading_img/girl.png'
import leaf from '../assets/loading_img/leaf.png'
import big_leaf from '../assets/loading_img/big_leaf.png'
import small_leaf from '../assets/loading_img/small_leaf.png'
import bar from '../assets/loading_img/bar.gif'

function Loading() {
     const location = useLocation();
        const navigate = useNavigate();
        const targetUrl = location.state?.target;

        useEffect(() => {
            if (!targetUrl) {
                // If no target passed, go back to home immediately (prevents stuck state)
                navigate('/');
                return;
            }

            const timer = setTimeout(() => {
                window.location.replace(targetUrl);
            }, 2000); // Delay in ms

            return () => clearTimeout(timer);
        }, [navigate, targetUrl]);


    return (
        <div className="Big">

            <div className="split-container">

                <div className="bg_top">


                </div>
                <div className="full-flex"> {/**/}
                    <div className="big_leaf">
                        <img
                            src={big_leaf}
                            alt="big_leaf"
                            className="big_leaf_img"
                        />

                    </div>
                    <div className="small_leaf">
                        <img
                            src={small_leaf}
                            alt="small_leaf"
                            className="small_leaf_img"
                        />

                    </div>
                    <div className="description-container">
                        <img
                            src={logo}
                            alt="logo"
                            className="logo"
                        />
                        <h2>Ayurvedic Care Application</h2>
                        <p>" Experience authentic<br/>
                            Ayurvedic balance - <br/>
                            ignite natural wellness power "</p>
                    </div>
                    <div className="bar">


                        <img
                            src={bar}
                            alt="gif"
                            className="gif"
                        />

                    </div>

                </div>

                <div className="flower">
                    <img
                        src={flower}
                        alt="flower"
                        className="flower_img"
                    />
                </div>
                <div className="cat">

                    <img
                        src={cat}
                        alt="cat"
                        className="cat_img"
                    />
                </div>
                <div className="girl">
                    <img
                        src={girl}
                        alt="girl"
                        className="girl_img"
                    />
                </div>
                <div className="leaf">
                    <img
                        src={leaf}
                        alt="leaf"
                        className="leaf_img"
                    />
                </div>
            </div>
        </div>
    );
}


export default Loading;

/* <video
                            className="loading_bar"
                            src={loading_bar}
                            muted
                            autoPlay
                            /*loop*/
/* playsInline
 >
</video>

import loading_bar from '../assets/bar.mp4'
*/
