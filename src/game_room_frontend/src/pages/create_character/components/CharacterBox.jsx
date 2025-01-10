import React, { useState } from "react";

const CharacterBox = (props) => {
  const { imageUrl, name, setName, prompt, setPrompt, generateImage } = props;
  const [loading, setLoading] = useState(false); // Loading durumunu ekledik

  const handleGenerateImage = async () => {
    setLoading(true); // Yükleme başladığında loading true olur
    try {
      await generateImage();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false); // Resim yüklendiğinde veya hata olduğunda loading false olur
    }
  };

  return (
    <div className="characterBox">
      <div className="boxItem1">
        <div className="avatar">
          {loading ? (
            <div className="loadingSpinner"></div> // Yükleme ekranı burada
          ) : (
            <img
              src={imageUrl ? imageUrl : "img/avatars/unknow3.jpg"}
              alt="Generated"
              className="generatedImg"
            />
          )}
        </div>
        <label className="labelName">Character Name</label>
        <input
          className="nameInput"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="boxItem2">
        <textarea
          className="textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt"
        />
        <button className="submitButton" onClick={handleGenerateImage}>
          Generate
        </button>
      </div>
    </div>
  );
};

export default CharacterBox;
