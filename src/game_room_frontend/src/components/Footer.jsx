import React from 'react';

const Footer = () => {
    return (
        <div className='footer'>
            <div className='footer-section'>
                <h4>Contact Us</h4>
                <label>Email: holydicegame@gmail.com</label>
                <label>X: holydice</label>
            </div>
            <div className='footer-section'>
                
            </div>
            <div className='footer-section'>
                <h4>Follow Us</h4>
                <label>
                <a href="https://www.youtube.com/@holydicegame/featured" target="_blank" rel="noopener noreferrer">Youtube: @holydicegame</a>
                </label>
                <label>
                <a 
                    href="https://x.com/HolyDice2024" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    >
                    X: @HolyDice2024
                    </a>                
            </label>
            </div>
        </div>
    );
}

export default Footer;
