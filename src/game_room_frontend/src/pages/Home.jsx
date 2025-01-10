import React, { useEffect, useRef, useState } from "react";
import "./style/home.css";
import { useAuth } from "./auth/useAuthClient";

function Home() {
    const { isAuthenticated } = useAuth();
    const heroRef = useRef(null); // Sadece hero için referans tanımlandı
    const [imageNumber, setImageNumber] = useState(1); // Dinamik görsel numarası için state

    // Görsel değişikliği için effect
    useEffect(() => {
        if (heroRef.current) {
            heroRef.current.style.backgroundImage = 'url(img/Banner6.webp)';
        }
    }, [imageNumber]);

    const handleClick = () => {
        if (isAuthenticated) {
            window.location.href = `/create-character`;
        } else {
            window.location.href = `/auth`;
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section ref={heroRef} className="hero">
                <div className="hero-content">
                    <h1>Welcome to the DnD Blockchain Game</h1>
                    <p>Design your unique DnD character and let AI bring it to life!</p>
                    <button className="cta-button" onClick={handleClick}>
                        Get Started
                    </button>
                </div>
            </section>

            {/* About Section */}
            <section className="about">
                <div className="about-content">
                    <h2>Turn your characters into NFTs</h2>
                    <p>Design and transform your characters into NFTs. Join the game with your custom-made heroes.</p>
                </div>
                <img src="img/nf3.webp" alt="About Image" className="about-img" />
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="features-content">
                    <h2>Features</h2>
                    <div className="feature-box">
                        <img src="img/cr1.webp" alt="Character Design" />
                        <h3>Create Characters</h3>
                        <p>Use our advanced tools to create unique characters.</p>
                    </div>
                    <div className="feature-box">
                        <img src="img/ai2.webp" alt="AI Art" />
                        <h3>AI-Generated Art</h3>
                        <p>Let AI generate stunning visuals for your DnD character.</p>
                    </div>
                    <div className="feature-box">
                        <img src="img/nf3.webp" alt="NFT Conversion" />
                        <h3>Convert to NFTs</h3>
                        <p>Convert your characters into NFTs and join the future of digital assets.</p>
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section className="demo">
                <h2>Play the Demo</h2>
                <p>Try a short demo of the game. Experience the magic of your created characters in action.</p>
                <img src="img/demo1.webp" alt="Demo Image" className="demo-img" />
            </section>
        </div>
    );
}

export default Home;
