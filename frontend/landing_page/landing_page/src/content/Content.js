import React, { useRef, useEffect } from 'react';

import './Content.css';
import { useNavigate } from 'react-router-dom';

//import React, { useRef, useState, useEffect } from 'react';
//import LoadingLink from '../loading_page/LoadingLink';
//import Loading from "../loading_page/Loading";


import img_4 from '../assets/content_img/img_4.jpg'
import img_5 from '../assets/content_img/img_5.jpg'
import img_6 from '../assets/content_img/img_6.jpg'
import img_7 from '../assets/content_img/img_7.jpg'
import img_8 from '../assets/content_img/img_8.jpg'
import img_10 from '../assets/content_img/img_10.jpg'
import img_11 from '../assets/content_img/img_11.jpg'
import img_13 from '../assets/content_img/img_13.jpg'
import img_16 from '../assets/content_img/img_16.jpg'
import img_22 from '../assets/content_img/img_22.jpg'
import img_26 from '../assets/content_img/img_26.jpg'
import img_31 from '../assets/content_img/box_6/img_31.jpg'
import lotus from '../assets/content_img/lotus.png'

import kavindi from '../assets/content_img/photos/kavindi.png'
import nabeeha from '../assets/content_img/photos/nabeeha.png'
import pathirana from '../assets/content_img/photos/pathirana.png'
import prabhavi from '../assets/content_img/photos/prabhavi.png'



/*import img_1 from '../assets/content_img/img_1.jpg'
import img_2 from '../assets/content_img/img_2.jpg'
import img_3 from '../assets/content_img/img_3.jpg'
import img_29 from '../assets/content_img/img_29.jpg'
import img_30 from '../assets/content_img/img_30.jpg'
import img_23 from '../assets/content_img/img_23.jpg'
import img_17 from '../assets/content_img/img_17.jpg'
import img_18 from '../assets/content_img/img_18.jpg'
import img_15 from '../assets/content_img/img_15.jpg'
import img_14 from '../assets/content_img/img_14.jpg'
import img_9 from '../assets/content_img/img_9.jpg'
import img_12 from '../assets/content_img/img_12.jpg'
import male from '../assets/content_img/photos/male.jpg'
import female from '../assets/content_img/photos/female.png'
*/

function Content(){
// Reference to the element we want to animate
    const elementRef = useRef(null);


    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;


        // Create an Intersection Observer instance with options
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    // When the element is in the viewport, add the animation class
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    } else {
                        // When the element leaves the viewport, remove the animation class
                        entry.target.classList.remove('animate');
                    }
                });
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
            }
        );


        // Start observing the element
        observer.observe(element);


        // Cleanup: unobserve the element when the component unmounts
        return () => {
            observer.unobserve(element);
        };
    }, []); // Runs the effect only once on mount


// Reference to the element we want to animate
    const newRef = useRef(null);


    useEffect(() => {
        const element = newRef.current;
        if (!element) return;


        // Create an Intersection Observer instance with options
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    // When the element is in the viewport, add the animation class
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    } else {
                        // When the element leaves the viewport, remove the animation class
                        entry.target.classList.remove('animate');
                    }
                });
            },
            {
                threshold: 0.05, // Trigger when 10% of the element is visible
            }
        );


        // Start observing the element
        observer.observe(element);


        // Cleanup: unobserve the element when the component unmounts
        return () => {
            observer.unobserve(element);
        };
    }, []); // Runs the effect only once on mount


    /*---------------------------------------------------------------------FIRST 4 IMAGES CONTAINER-----------------------------------------------------------------------*/
    // Intersection observer for the typewriter effect in .mid-desc h1
    const typewriterRef = useRef(null);


    useEffect(() => {
        const typedEl = typewriterRef.current;
        if (!typedEl) return;


        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // --- SCROLLING INTO VIEW ---
                        // 1) Reset to 0ch so we can see the typing from the start
                        typedEl.style.width = '0ch';
                        // 2) Remove and re-add the .animate class to restart the animation
                        typedEl.classList.remove('animate');
                        // Force a reflow so the browser registers the width reset
                        void typedEl.offsetWidth;
                        typedEl.classList.add('animate');
                    } else {
                        // --- SCROLLING OUT OF VIEW ---
                        // 1) Remove the animation class so it won't hold the final width
                        typedEl.classList.remove('animate');
                        // 2) Manually set width to 11ch so the text remains fully typed
                        typedEl.style.width = '11ch';
                    }
                });
            },
            { threshold: 0.1 }
        );


        observer.observe(typedEl);
        return () => observer.unobserve(typedEl);
    }, []);


    /*----------------------------------------------------------------ABOUT-US---------------------------------------------------------------------------------*/
    // Array to store our circle elements.
    const circleRefs = useRef([]);


    // Callback to add each element to our ref array.
    const circleRef = (el) => {
        if (el && !circleRefs.current.includes(el)) {
            circleRefs.current.push(el);
        }
    };


    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // When the element is visible, add the "animate" class.
                    if (entry.isIntersecting) {
                        // You can add the class to each circle individually.
                        circleRefs.current.forEach((circle) => {
                            circle.classList.add('animate');
                        });
                        // Optionally disconnect if you only want the animation to trigger once.
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.1 }
        );


        // Observe each circle element.
        circleRefs.current.forEach((circle) => {
            observer.observe(circle);
        });


        return () => {
            observer.disconnect();
        };
    }, []);


    /*-----------------------------------------------------------------------LOADING-LINK------------------------------------------------------------------------------*/
    const navigate = useNavigate();

    const handleNavigate = (target) => (e) => {
        e.preventDefault();
        navigate('/loading', { state: { target } });
    };
    /*-------------------------------------------------------directs-to-homepage------------------------------------------------------------*/
    useEffect(() => {
        const scrollToHash = () => {
            const hash = window.location.hash;
            if (hash) {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        // Scroll on load
        setTimeout(scrollToHash, 100);

        // Scroll on hash change
        window.addEventListener('hashchange', scrollToHash);
        return () => window.removeEventListener('hashchange', scrollToHash);
    }, []);


    return(
        <div className="content" id="content">
            <div className="box-2">
                <div className="box-2-images">
                    <div className="image-1" class="slide-up">
                        <img
                            src={img_4}
                            alt="img_4"
                            className="img_4"
                        />
                    </div>
                    <div className="image-2" class="slide-up">
                        <img
                            src={img_5}
                            alt="img_5"
                            className="img_5"
                        />
                    </div>


                    <div className="image-3" class="slide-up">
                        <img
                            src={img_6}
                            alt="img_6"
                            className="img_6"
                        />
                    </div>


                    <div className="image-4" class="slide-up">
                        <img
                            src={img_7}
                            alt="img_7"
                            className="img_7"
                        />
                    </div>
                </div>
            </div>


            <div className="box-2-desc">
                <div className="in-words">
                    <h1>Welcome to Sri-Āyu!</h1>
                    <p>
                        Ayurvedic Care Application<br/><br/>
                    </p>
                    <p1>
                        " Experience authentic Ayurvedic balance – Ignite natural<br/>
                        wellness power "
                    </p1>
                </div>
            </div>


            <div className="box-3" id="services">
                <div className="box-3-desc animate" ref={elementRef}>
                    <h1>OUR SERVICES</h1>
                    "Personalized Ayurvedic Wellness – Tailored <br/> Insights,
                    Holistic Healing, <br/>and Data-Driven Care for Your Unique <br/>
                    Well-Being. Experience the perfect blend <br/> of ancient
                    wisdom and modern science <br/> to foster balance and vitality."
                </div>
                <div className="new" ref={newRef} >
                    <div className="new-1">
                        <a href="/dosha_frontend"  onClick={handleNavigate("/dosha_frontend")}  className="leaf-1-cont" >
                            <img src={img_10} alt="leaf-shaped" className="leaf-1"/>
                            <div className="desc">
                                <p>Dosha<br/>
                                    Classification
                                </p>
                            </div>
                        </a>


                        <a href="/recommendation_frontend"  onClick={handleNavigate("/recommendation_frontend")}  className="leaf-2-cont" >
                            <img src={img_11} alt="leaf-shaped" className="leaf-2"/>
                            <div className="desc">
                                <p>Treatment<br/>
                                    Recommendation
                                </p>
                            </div>
                        </a>


                    </div>


                    <div className="new-2">
                        <a href="/outcome_frontend"  onClick={handleNavigate("/outcome_frontend")}  className="leaf-3-cont" >
                            <img src={img_13} alt="leaf-shaped" className="leaf-3"/>
                            <div className="desc">
                                <p>Treatment<br/>
                                    Outcome<br/>
                                    Prediction<br/>
                                </p>
                            </div>
                        </a>


                        <a href="/tourism_frontend"  onClick={handleNavigate("/tourism_frontend")}  className="leaf-4-cont" >
                            <img src={img_8} alt="leaf-shaped" className="leaf-4"/>
                            <div className="desc">
                                <p>Time Series<br/>
                                    Forecasting<br/>for<br/>
                                    Ayurvedic Tourism
                                </p>
                            </div>
                        </a>
                    </div>

                    <div className="logo-cont">
                        <img
                            src={lotus}
                            alt="leaf-shaped"
                            className="lotus"
                        />
                    </div>
                </div>
            </div>


            <div className="box-4">
                <div className="mid_img">
                    <img
                        src={img_16}
                        alt="img_new"
                        className="img_mid_1"
                    />
                    <img
                        src={img_22}
                        alt="img_new"
                        className="img_mid_2"
                    />
                    <img
                        src={img_26}
                        alt="img_new"
                        className="img_mid_3"
                    />


                </div>
                <div className="mid-desc">
                    <h1 ref={typewriterRef}>About Sri-Āyu...</h1>
                    <p>
                        "Sri Āyu: Where AI Meets Ayurveda – Harnessing the Power<br/>
                        of Data Science to Predict Trends,<br/>
                        Personalize Treatments,<br/>
                        and<br/>
                        Elevate Sri Lanka’s Ayurvedic Tourism Experience."
                    </p>
                    <div className="design-box">
                    </div>
                </div>
            </div>


            <div className="box-5">
                <div className="about-desc" id="about-desc">
                    <h1>OUR TEAM</h1>
                    <p>
                        We are a team of four passionate individuals
                        dedicated to bridging the gap between traditional<br/>
                        Ayurvedic wisdom and modern technology.<br/>
                        Our project leverages AI and data-driven insights to make
                        Ayurvedic wellness more <br/>accessible, personalized, and effective. <br/>
                        With expertise spanning machine learning, software development,<br/>
                        and Ayurvedic research, we aim to empower users with<br/>
                        valuable health insights while preserving the
                        authenticity of Ayurveda in a modern, user-friendly platform.
                    </p>
                </div>
                <div className="us-container">
                    <div className="photo-1-circle" ref={circleRef}>
                        <img src={kavindi} alt="circle" className="photo-1"/>
                        <h3>W.M. Kavindi Rangana<br/>Fullstack Developer</h3>
                    </div>
                    <div className="photo-2-circle" ref={circleRef}>
                        <img src={prabhavi} alt="circle" className="photo-2"/>
                        <h3>Prabhavi Walallawita<br/>Fullstack Developer</h3>
                    </div>
                    <div className="photo-3-circle" ref={circleRef}>
                        <img src={pathirana} alt="circle" className="photo-3"/>
                        <h3>Sachinthana Pathirana<br/>Fullstack Developer</h3>
                    </div>
                    <div className="photo-4-circle" ref={circleRef}>
                        <img src={nabeeha} alt="circle" className="photo-4"/>
                        <h3>Nabeeha Thushan<br/>Fullstack Developer</h3>
                    </div>
                </div>
            </div>


            <div className="box-6">
                <img src={img_31} alt="img_31" className="img_31"/>
                <div className="img_31_desc">
                    <h1>"Healing begins where harmony resides, <br/>within the whispers of the wind,<br/>
                        the warmth of the sun, and the wisdom of Ayurveda."
                    </h1>
                    <p1>"Ayurveda is the art of aligning with nature’s<br/>
                        wisdom to unlock the best version of yourself."


                    </p1>




                    <h2>"You are not separate from nature;<br/>
                        you are woven into its story, <br/>
                        let Ayurveda help you read the pages."
                    </h2>
                    <p2>"The wisdom of the earth flows through every leaf, <br/>
                        every spice, every breath—Ayurveda is simply <br/>
                        the key to understanding it."


                    </p2>
                </div>
            </div>


        </div>
    );
}


export default Content;



