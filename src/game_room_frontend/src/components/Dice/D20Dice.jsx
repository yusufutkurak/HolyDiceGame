import React, { useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';

const D20Dice = () => {
  const diceBoxRef = useRef(null);

  useEffect(() => {
    const initDiceBox = async () => {
      const diceBox = new DiceBox('#dice-box', {
        assetPath: '/assets/dice-box', // Varlıklarınızın yolu
      });

      // Zar kutusunu başlat
      await diceBox.init();

      // Zar atma işlemi
      await diceBox.roll('2d20').then((result) => {
        console.log('Roll result:', result);
      });
    };

    initDiceBox();
  }, []);

  return (
    <div>
      <div id="dice-box" ref={diceBoxRef} style={{ width: '100%', height: '500px', position: 'relative' }}></div>
      <button
        onClick={async () => {
          // Zar atma işlemi
          const diceBox = new DiceBox('#dice-box', {
            assetPath: '/assets/dice-box',
          });
          await diceBox.init();
          diceBox.roll('2d20').then((result) => {
            console.log('Roll result:', result);
          });
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Roll D20 Dice
      </button>
    </div>
  );
};

export default D20Dice;
