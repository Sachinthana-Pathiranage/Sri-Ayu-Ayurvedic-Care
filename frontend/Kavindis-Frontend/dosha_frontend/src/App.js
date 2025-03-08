import React, { useState, useEffect, useRef } from 'react';
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
/*import woman from './assets/woman.png';*/
/*import woman_2 from './assets/woman_2.png'*/




function App() {


    const [formData, setFormData] = useState({
        bodyFrame_Breadth: '',
        bodyBuild_Size:'',
        shoulder_Breadth:'',
        chest_Breadth:'',
        walking_style:'',
        skin_Type:'',
        sleep_Quality: '',
        working_Quality:'',
        appetite_Frequency:'',
        working_style:'',


    });
    const [doshaResult, setDoshaResult] = useState(null);

    // State to trigger animation
    const [animationKey, setAnimationKey] = useState(0);

    // Ref for classifier container for Intersection Observer
    const classifierRef = useRef(null);

    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiUrl = 'http://localhost:8000/predict';


        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });


            const result = await response.json();
            setDoshaResult(result.dosha_prediction);
        } catch (error) {
            console.error('Error fetching dosha type:', error);
        }


    };

    const triggerAnimation = () => {
        // Force re-mount of both form parts
        setAnimationKey(prev => prev + 1);
    };

    const handleScroll = () => {
        // Trigger the animation (re-mount using the animation key)
        triggerAnimation();
        // Scroll smoothly to classifier container
        if (classifierRef.current) {
            classifierRef.current.scrollIntoView({ behavior: 'smooth' });
        }

    };

    // Use Intersection Observer so if user manually scrolls into view, we trigger the animation too
    useEffect(() => {
        const currentRef = classifierRef.current;
        if (!currentRef) return;

        const observerOptions = { root: null, threshold: 0.2 };
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    triggerAnimation();
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(currentRef);

        return () => {
            observer.unobserve(currentRef);
        };
    }, []);

    return (
        <div className="App">
            <div className="split-container">
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
                <div className="full-flex"> {/**/}
                    <div className="description-container">
                        <h2>Dosha Classification</h2>
                        <form>
                            <div className="form-group">
                                <label htmlFor="description"></label>
                                <p> Discover your unique Ayurvedic<br/>
                                    Dosha Type - Vata, Pitta, or Kapha<br/>
                                    to get a glimpse of<br/>
                                    your natural<br/>
                                    mind-body constitution.</p>

                                <img
                                    src={search}
                                    alt="Illustrasion of woman"
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


                <div id="classifier-container" className="classifier-container" ref={classifierRef}>
                    <h1>Let's Discover Your Dosha Type !</h1> {/*Important Line Don't remove*/}
                    <form onSubmit={handleSubmit} className="classifier-form">
                        <div className="form-group-two">
                            <div key={animationKey} className="form-part-one animate">
                                {/*1_bodyFrane_Breadth*/}
                            <div>
                                <label htmlFor="bodyFrame_Breadth">Body Frame Breadth</label>
                                <select
                                    id="1"
                                    name="bodyFrame_Breadth"
                                    value={formData.bodyFrame_Breadth}
                                    onChange={handleMainChange}
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Thin/Narrow">Thin/Narrow</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Broad">Broad</option>
                                </select>
                            </div>


                            {/*2_bodyBuild_Size*/}
                            <div>
                                <label htmlFor="bodyBuild_Size">Body Build Size</label>
                                <select
                                    id="2"
                                    name="bodyBuild_Size"
                                    value={formData.bodyBuild_Size}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Weaklydeveloped">Weakly Developed</option>
                                    <option value="Moderatelydeveloped">Moderately Developed</option>
                                    <option value="Welldeveloped">Well Developed</option>
                                </select>
                            </div>


                            {/*3_shoulder_Breadth*/}
                            <div>
                                <label htmlFor="shoulder_Breadth">Soulder Breadth</label>
                                <select
                                    id="3"
                                    name="shoulder_Breadth"
                                    value={formData.shoulder_Breadth}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Thin/Narrow">Thin/Narrow</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Broad">Broad</option>
                                </select>
                            </div>


                            {/*4_chest_Breadth*/}
                            <div>
                                <label htmlFor="chest_Breadth">Chest Breadth</label>
                                <select
                                    id="4"
                                    name="chest_Breadth"
                                    value={formData.chest_Breadth}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Thin/Narrow">Thin/Narrow</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Broad">Broad</option>
                                </select>
                            </div>


                            {/*5_walking_style*/}
                            <div>
                                <label htmlFor="walking_style">Walking Style</label>
                                <select
                                    id="5"
                                    name="walking_style"
                                    value={formData.walking_style}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Unsteady">Unsteady</option>
                                    <option value="Firm/Steady">Firm/Steady</option>
                                    <option value="Sharp/Accurate">Sharp/Accurate</option>
                                </select>
                            </div>
                            </div>

                            <div key={animationKey + "-2"} className="form-part-two animate">
                            {/*6_skin_Type*/}
                            <div>
                                <label htmlFor="skin_Type">Skin Type</label>
                                <select
                                    id="6"
                                    name="skin_Type"
                                    value={formData.skin_Type}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Thin">Thin</option>
                                    <option value="Thick">Thick</option>
                                </select>
                            </div>


                            {/*7_sleeep_Quality*/}
                            <div>
                                <label htmlFor="sleep_Quality">Sleep Quality:</label>
                                <select
                                    id="7"
                                    name="sleep_Quality"
                                    value={formData.sleep_Quality}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Deep">Deep</option>
                                    <option value="Shallow">Shallow</option>
                                    <option value="Sound">Sound</option>
                                </select>
                            </div>


                            {/*8_working_Quality*/}
                            <div>
                                <label htmlFor="working_Quality">Working Quality</label>
                                <select
                                    id="8"
                                    name="working_Quality"
                                    value={formData.working_Quality}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Wavering/Easilydeviated">Wavering/Easily Deviated</option>
                                    <option value="Wellthoughtof">Well thought of</option>
                                    <option value="Sharp/Accurate/Spontaneous">Sharp/Accurate/Spontaneous</option>
                                </select>
                            </div>


                            {/*9_appetite_Frequency*/}
                            <div>
                                <label htmlFor="appetite_Frequency">Appetite Frequency</label>
                                <select
                                    id="9"
                                    name="appetite_Frequency"
                                    value={formData.appetite_Frequency}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Irregular">Irregular</option>
                                </select>
                            </div>


                            {/*10_working_style*/}
                            <div>
                                <label htmlFor="working_style">Working Style</label>
                                <select
                                    id="10"
                                    name="working_style"
                                    value={formData.working_style}
                                    onChange={handleMainChange
                                    }
                                    required
                                >
                                    <option value="" disabled selected hidden>Select</option>
                                    <option value="Unsteady">Unsteady</option>
                                    <option value="Firm/Steady">Firm/Steady</option>
                                    <option value="Sharp/Accurate">Sharp/Accurate</option>
                                </select>
                            </div>
                            </div>
                        </div>
                        <button type="submit" className="dosha-btn">Predict Dosha</button>


                    </form>
                </div>
            </div>
            {doshaResult && (
                <div className="result">
                    <h2>Predicted Dosha Type:</h2>
                    <p>{doshaResult}</p>
                </div>
            )}
        </div>
    );
}


export default App;

