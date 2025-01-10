import React from "react";

const Background = () =>{
    const leftContainerStyle = {
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "20.33%", // Sol konteynerin genişliği
        backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0), rgba(249, 249, 247, 1)), url('img/cc2.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -1, // Arka planda kalmasını sağlar
    };

    const middleContainerStyle = {
        position: "absolute",
        left: "16%", // Sol konteynerin ardından başlar
        right: "16%", // Sağ konteynerin öncesinde biter
        top: 0,
        bottom: 0,
        width: "auto", // Kalan alanı alır
        backgroundImage: "url('img/createbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.1,
        zIndex: -1, // Arka planda kalmasını sağlar
    };

    const rightContainerStyle = {
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "20.33%", // Sağ konteynerin genişliği
        backgroundImage: "linear-gradient(to left, rgba(255, 255, 255, 0), rgba(251, 251, 248, 1)), url('img/cc3.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -1, // Arka planda kalmasını sağlar
    };

    return(
        <div className="background">
            <div style={leftContainerStyle}></div>
            <div style={middleContainerStyle}></div>
            <div style={rightContainerStyle}></div>
        </div>
    )    
}

export default Background;