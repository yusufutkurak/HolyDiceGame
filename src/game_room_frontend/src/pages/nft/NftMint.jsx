import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuthClient";
import { Principal } from "@dfinity/principal";
import "../style/nft.css"

function NftMint() {
    const [characters, setCharacters] = useState(null); 
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletPrincipal, setWalletPrincipal] = useState(null);
    const { game_roomActor } = useAuth();
    const backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1, // Arka planda kalmasını sağlar
        backgroundImage: `
            linear-gradient(135deg, rgba(255, 0, 0, 0.5), rgba(64, 0, 255, 0.5), rgba(0, 255, 85, 0.5)), 
            url('img/navbar-4.jpg')
        `,
        backgroundSize: "cover", // Resmi tüm alana yayar
        backgroundPosition: "center", // Resmi ortalar
        backgroundRepeat: "no-repeat", // Resmin tekrar etmesini engeller
        opacity: 0.2, // Arka planın opaklığını ayarlar
    };
    const whitelist = ["bkyz2-fmaaa-aaaaa-qaaaq-cai"];
    const host = "https://plugwallet.ic0.app";

    // ✅ Plug Wallet Bağlantı Kontrolü ve Bağlantı İsteği
    const connectWallet = async () => {
        try {
            const connected = await window.ic?.plug?.requestConnect({
                whitelist: ["bkyz2-fmaaa-aaaaa-qaaaq-cai"],
                host: "https://plugwallet.ic0.app",
            });
    
            if (connected) {
                const principalId = await window.ic?.plug?.getPrincipal();
                console.log("Formatted Wallet Principal ID:", principalId.toString());
                setWalletConnected(true);
                setWalletPrincipal(principalId.toString());
            }
        } catch (error) {
            console.error("Wallet Connection Failed:", error);
        }
    };
    
    
    
    // ✅ Wallet Bağlantı Kontrolü ve Agent
    const verifyConnection = async () => {
        try {
            const connected = await window.ic?.plug?.isConnected();
            if (!connected) {
                await window.ic?.plug?.requestConnect({ whitelist, host });
            }
            if (connected && !window.ic?.plug?.agent) {
                await window.ic?.plug?.createAgent({ whitelist, host });
            }

            if (connected) {
                const principalId = await window.ic?.plug?.getPrincipal();
                setWalletConnected(true);
                setWalletPrincipal(principalId.toString());
            }
        } catch (error) {
            console.error("Wallet Verification Failed:", error);
        }
    };

    const disconnectWallet = async () => {
        try {
            await window.ic?.plug?.disconnect();
            setWalletConnected(false);
            setWalletPrincipal(null);
            console.log("Wallet Disconnected");
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    // ✅ Eski Koddan Alınan Karakter Getirme Mekanizması
    const getCharacters = async () => {
        if (game_roomActor) {
            try {
                const count = await game_roomActor.count_characters();
                console.log("Character Count:", count);

                const loadedCharacters = [];
                if (count !== 0) {
                    for (let i = 0; i < count; i++) {
                        const tempCharacter = await game_roomActor.get_character_by_id(i);
                        if (tempCharacter) {
                            loadedCharacters.push(tempCharacter);
                        }
                    }
                }
                console.log("Loaded Characters:", loadedCharacters);
                setCharacters(loadedCharacters.flat()); // Düzleştirilmiş dizi
            } catch (error) {
                console.error("Failed to fetch characters:", error);
            }
        } else {
            console.warn("game_roomActor is not available.");
        }
    };
        // Principal ID doğrulama regex'i
    const validatePrincipal = (principalId) => {
        const principalRegex = /^[a-z0-9\-]+$/;
        return principalRegex.test(principalId);
    };

    
    // ✅ NFT Mintleme ve Transfer
    const mintCharacterNFT = async (character) => {
        try {
            if (!walletConnected || !walletPrincipal) {
                throw new Error("Cüzdan bağlı değil veya Principal ID eksik!");
            }
    
            const recipientPrincipal = Principal.fromText(walletPrincipal);
            const result = await game_roomActor.mint_character_nft(character);
            if (result < 0 || result == null) {
                throw new Error("Backend'den geçerli bir NFT ID'si alınamadı.");
            }
    
            console.log("Mint NFT ID:", result);
    
            const nftActor = await window.ic.plug.createActor({
                canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
                interfaceFactory: ({ IDL }) => {
                    return IDL.Service({
                        'transfer': IDL.Func(
                            [IDL.Principal, IDL.Int32],
                            [IDL.Bool],
                            []
                        ),
                    });
                }
            });

            console.log("Nft Actor:", nftActor);

    
            const nftId = result;
    
            // ✅ Transfer NFT to Plug Wallet Principal
            const transferResponse = await nftActor.transfer(
                recipientPrincipal,
                nftId
            );

            const deneme = await game_roomActor.transfer(
                recipientPrincipal,
                nftId
            );

            
            console.log("deneme",deneme);
            if (deneme) {
                console.log("NFT başarıyla Plug Wallet'a aktarıldı!");
                alert("NFT başarıyla Plug Wallet'a aktarıldı!");
            } else {
                throw new Error("NFT transfer işlemi başarısız oldu!",transferResponse);
            }
        } catch (error) {
            console.error("NFT Mintleme/Transfer Hatası:", error.message || error);
            alert(`NFT mintleme işlemi sırasında bir hata oluştu: ${error.message || error}`);
        }
    };
    
    const copyWallet = () => {
        if (walletPrincipal) {
            navigator.clipboard.writeText(walletPrincipal)
                .then(() => {
                    alert('Cüzdan adresi başarıyla kopyalandı!');
                })
                .catch((err) => {
                    console.error('Kopyalama hatası:', err);
                });
        } else {
            alert('Kopyalanacak cüzdan adresi bulunamadı!');
        }
    };
    
    
    

    useEffect(() => {
        verifyConnection();
    }, []);

    useEffect(() => {
        if (game_roomActor) {
            getCharacters();
        }
    }, [game_roomActor]);

    // Uint8Array'i Base64 string'e çeviren fonksiyon
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return `data:image/jpeg;base64,${window.btoa(binary)}`;
    };

    // Render kontrolü
    if (characters === null) {
        return(
            <div className="loading-container">
                <div className="characters">
                    <div className="background-2"></div>
                </div>
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="characters">
            <div className="background-2" style={backgroundStyle}> 
            </div>
            <div className="walletContainer">
                {!walletConnected ? (
                    <>
                    <div class="walletInfoContainer">
                                <div class="walletAddress">Wallet Is Not Connected</div>
                    </div>        
                    <button onClick={connectWallet} className="connectWalletButton">
                        Connect Wallet
                    </button>
                    </>
                ) : (
                    <div>
                            <div class="walletInfoContainer">
                                <div class="walletAddress">Wallet Connected: {walletPrincipal}</div>
                                <button class="walletCopyButton"  onClick={copyWallet}>Copy</button>
                            </div>                        
                            <button onClick={disconnectWallet} className="disconnectWalletButton">
                            Disconnect Wallet
                        </button>
                    </div>
                )}
            </div>
            <div className="characterList">
            {characters?.length > 0 ? (
    <div className="allCharacterNft">
        {characters.map((character, index) => {
            // Avatar URL'sini dönüştürme
            const avatarUrl = character.avatar && character.avatar.length > 0
                ? arrayBufferToBase64(character.avatar[0])
                : null;

            // Yetenekleri kontrol et ve yedek değerler kullan
            const abilities = character.abilitys || {
                strength: 'N/A',
                intelligence: 'N/A',
                wisdom: 'N/A',
                charisma: 'N/A',
                constitution: 'N/A',
                dexterity: 'N/A'
            };

            return (
                <div className="nftCard" key={index}>
                    {/* Avatar Görseli */}
                    <div className="imgFrameNft">
                        {avatarUrl ? (
                            <img 
                                className="characterImgNft" 
                                src={avatarUrl} 
                                alt={`${character.character?.name || 'Unknown'}'s avatar`} 
                            />
                        ) : (
                            <div>No Avatar</div>
                        )}
                    </div>

                    {/* Karakter Bilgileri */}
                    <div className="nftCardStats">
                        <div className="tripleContainer">
                            <div className="labelTop">Name: {character.character?.name || 'Unknown'}</div>
                            <div className="labelTop">Race: {character.race || 'Unknown'}</div>
                            <div className="labelTop">Class: {character.classes || 'Unknown'}</div>
                        </div>
                        
                        <div className="tripleContainer">
                            <div className="statLabel">Strength: {abilities.strength}</div>
                            <div className="statLabel">Intelligence: {abilities.intelligence}</div>
                            <div className="statLabel">Wisdom: {abilities.wisdom}</div>
                        </div>

                        <div className="tripleContainer">
                            <div className="statLabel">Charisma: {abilities.charisma}</div>
                            <div className="statLabel">Constitution: {abilities.constitution}</div>
                            <div className="statLabel">Dexterity: {abilities.dexterity}</div>
                        </div>
                        
                        {/* NFT Mint Butonu */}
                        <button 
                            className="mintButton" 
                            onClick={() => mintCharacterNFT(character)}
                        >
                            <span>Mint NFT</span>
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
) : (
    <p>No characters found.</p>
)}

            </div>
        </div>
    );
}

export default NftMint;
