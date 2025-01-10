import React, { useEffect, useState } from 'react';
//import PlugConnect from '@psychedelic/plug-connect';

const Wallet = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [principalId, setPrincipalId] = useState(null);

//   // Plug cüzdanına bağlantıyı doğrulayan ve agent oluşturmayı yöneten işlev
//   const verifyConnectionAndAgent = async () => {
//     const whitelist = ['canisterid-1', 'canisterid-2']; // Kullanmak istediğiniz canister ID'leri
//     const host = 'https://mainnet.dfinity.network'; // Ana ağ veya belirlediğiniz host

//     try {
//       const connected = await window.ic.plug.isConnected();
//       if (!connected) {
//         await window.ic.plug.requestConnect({ whitelist, host });
//       }
//       if (connected && !window.ic.plug.agent) {
//         await window.ic.plug.createAgent({ whitelist, host });
//       }

//       // Bağlantı başarılıysa kullanıcı ID'sini (principal) kaydet
//       if (connected) {
//         const principal = await window.ic.plug.agent.getPrincipal();
//         setIsConnected(true);
//         setPrincipalId(principal.toText());
//       }
//     } catch (error) {
//       console.error('Plug bağlantısı sırasında hata oluştu:', error);
//     }
//   };

//   // İlk yüklemede bağlantıyı kontrol et
//   useEffect(() => {
//     verifyConnectionAndAgent();
//   }, []);

//   // Bağlandığında çalışacak geri çağırma (callback) işlevi
//   const onConnectCallback = async () => {
//     await verifyConnectionAndAgent();
//   };

//   return (
//     <div>
//       <h1>Plug Cüzdan Bağlantısı</h1>
//       {isConnected ? (
//         <div>
//           <p>Bağlı: {principalId}</p>
//           <p>Plug cüzdanına başarıyla bağlandınız!</p>
//         </div>
//       ) : (
//         <PlugConnect
//           whitelist={['canisterid-1', 'canisterid-2']}
//           onConnectCallback={onConnectCallback}
//           dark
//           title="Plug Cüzdana Bağlan"
//           host="https://mainnet.dfinity.network"
//         />
//       )}
//     </div>
//   );
};

export default Wallet;
