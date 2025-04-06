import React from 'react';
import './App.css';
import search from './assets/search.png';
import arrow_right from './assets/arrow_right.png';
import bg_one from './assets/img_one.png';
import bg_two from './assets/img_two.png';
import bg_three from './assets/img_three.png';
import bg_four from './assets/img_four.png';
import tree_big from './assets/tree_big.png';
import tree_small from './assets/tree_small.png';
import tree_bottom from './assets/tree_bottom.png';
import NavBar from "./NavBar";
import Footer from "./Footer";
import PredictionForm from './components/PredictionForm';

function App() {
    const handleScroll = () => {
        const classifierContainer = document.getElementById('classifier-container');
        if (classifierContainer) {
            classifierContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="App">
            <div className="main-content">
                <div className="split-container">
                    <NavBar />

                    <div className="bg_top">
                        <img
                            src={bg_one}
                            alt="bg_one_img"
                            className="bg_one"
                        />
                        <img
                            src={bg_two}
                            alt="bg_two_img"
                            className="bg_two"
                        />
                    </div>
                    <div className="full-flex">
                        <div className="description-container">
                            <h2>Treatment Outcome Prediction</h2>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="description"></label>
                                    <p>Predict Treatment Success<br/>
                                    and Estimated Recovery Time<br/>
                                    Based on Your Specific<br/>
                                    Disease and Treatment</p>

                                    <img
                                        src={search}
                                        alt="Illustration of search"
                                        className="search"
                                    />
                                </div>
                                <div className="button-and-icon">
                                    <button
                                        type="button"
                                        className="desc-btn"
                                        onClick={handleScroll}
                                    >
                                        Get Started
                                    </button>
                                    <div className="arrow_btn">
                                        <img
                                            src={arrow_right}
                                            alt="Arrow"
                                            className="arrow_right"
                                            onClick={handleScroll}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="bg_bottom">
                        <img
                            src={bg_three}
                            alt="bg_three_img"
                            className="bg_three"
                        />
                        <img
                            src={bg_four}
                            alt="bg_four_img"
                            className="bg_four"
                        />
                    </div>
                    <div className="tree_container">
                        <img src={tree_big} alt="img_tree" className="tree_big" />
                        <img src={tree_small} alt="img_tree_2" className="tree_small"/>
                        <img src={tree_bottom} alt="img_tree_3" className="tree_bottom"/>
                    </div>

                    <div id="classifier-container" className="classifier-container">
                        <div className="treatment-form">
                            <PredictionForm />
                        </div>
                    </div>
                </div>
                <div className="spacer" style={{height: '700px'}}></div>
            </div>
            <div className="footer-container">
                <Footer />
            </div>
        </div>
    );
}

export default App;