import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Tile {
  id: number;
  correctIndex: number;
  currentIndex: number;
}

export default function JigsawPuzzle({ onSolved }: { onSolved?: () => void }) {
  const totalTiles = 9;
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shuffledTiles = Array.from({ length: totalTiles }, (_, i) => i).sort(() => Math.random() - 0.5);
    setTiles(
      shuffledTiles.map((tileIndex, i) => ({
        id: i,
        correctIndex: tileIndex,
        currentIndex: i
      }))
    );
  }, []);

  useEffect(() => {
    if (tiles.every(t => t.currentIndex === t.correctIndex)) {
      setIsSolved(true);
      if (onSolved) onSolved();
    }
  }, [tiles, onSolved]);

  const handleTileClick = (index: number) => {
    if (selected === null) {
      setSelected(index);
    } else {
      const newTiles = [...tiles];
      const temp = newTiles[selected].currentIndex;
      newTiles[selected].currentIndex = newTiles[index].currentIndex;
      newTiles[index].currentIndex = temp;
      setTiles(newTiles);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-center text-xl font-semibold text-gray-700">🧩 Complete the Puzzle</h2>
      <div ref={containerRef} className="grid grid-cols-3 gap-1 w-[300px] h-[300px] relative">
        <Image
          src="https://i.imgur.com/vF0iFJ1.jpeg"
          alt="Puzzle"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover rounded-lg"
          priority
        />
        {tiles.map((tile, i) => (
          <div
            key={i}
            onClick={() => handleTileClick(i)}
            className={`absolute transition-all duration-300 border border-white cursor-pointer hover:scale-105 ${
              selected === i ? 'ring-2 ring-blue-400' : ''
            }`}
            style={{
              width: '100px',
              height: '100px',
              backgroundImage: `url('https://i.imgur.com/vF0iFJ1.jpeg')`,
              backgroundSize: '300px 300px',
              backgroundPosition: `-${(tiles[i].correctIndex % 3) * 100}px -${Math.floor(tiles[i].correctIndex / 3) * 100}px`,
              left: `${(tiles[i].currentIndex % 3) * 100}px`,
              top: `${Math.floor(tiles[i].currentIndex / 3) * 100}px`,
              zIndex: 10
            }}
          ></div>
        ))}
      </div>
      {isSolved && <p className="text-green-600 text-center font-medium mt-2">🎉 Puzzle Completed!</p>}
    </div>
  );
}
