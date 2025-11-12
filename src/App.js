// BARU: Impor useCallback dan useMemo
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Hapus XLSX, sudah tidak diperlukan
// import * as XLSX from 'xlsx'; 
import './App.css'; 

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfF9o5t1rOT0NQWce79OryRc9rOwhqHLmiCN0ASFxL5c-EY1JvJeT6LWeAV7TgcZ0/exec";

function App() {
  // BARU: masterList adalah satu-satunya sumber kartu
  const [masterList, setMasterList] = useState([]);
  
  // BARU: Kita hanya melacak kartu yang SUDAH DITARIK
  const [drawnCards, setDrawnCards] = useState([]);
  
  const [currentCard, setCurrentCard] = useState(null); // (Mengganti drawnCard)
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // BARU: Dek yang tersedia sekarang adalah data turunan (derived state)
  // Ini adalah kartu di masterList YANG BELUM ada di drawnCards
  const availableCards = useMemo(() => {
    return masterList.filter(card => !drawnCards.includes(card));
  }, [masterList, drawnCards]);

  // FUNGSI 1: fetchCards sekarang JAUH lebih sederhana
  // Hanya mengambil data dan mengatur masterList.
  const fetchCards = useCallback(() => {
    setIsLoading(true);
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setMasterList(data.cards); // Langsung set master list
        } else {
          alert('Gagal mengambil data dari Google Sheet.');
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Terjadi error saat menyambung ke Google Sheet.');
        setIsLoading(false);
      });
  }, []); // Tetap kosong, fungsi ini tidak perlu dependensi

  // EFEK: (Tidak berubah)
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // HAPUS FUNGSI 2 (handleAddCard) dan FUNGSI 3 (handleFileUpload)
  // Kita tidak lagi mengizinkan input manual/excel

  // FUNGSI 4: Logika Ambil Kartu (diubah)
  const handleDrawCard = () => {
    // Kita cek dari availableCards
    if (availableCards.length === 0) {
      alert('Kartu sudah habis!');
      return;
    }
    setIsShuffling(true);
    setTimeout(() => {
      // Ambil kartu acak dari dek yang TERSEDIA
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCard = availableCards[randomIndex];
      
      setCurrentCard(selectedCard); // Set kartu untuk popup
      
      // BARU: Tambahkan kartu ini ke daftar yang sudah ditarik
      setDrawnCards(prevDrawn => [...prevDrawn, selectedCard]);
      
      setIsShuffling(false);
      setShowPopup(true);
    }, 2000); 
  };

  // FUNGSI 5: Tutup popup
  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => setCurrentCard(null), 300);
  };

  // Tampilan JSX (disederhanakan)
  return (
    <div className="App">
      <div className="container">
        <img src="/logoBem.png" alt="Logogram BEM" className="logo" />
        
        <h1>BONDING SGE 3.0</h1>

        {isLoading ? (
          <p className="loading-text">Memuat kartu dari GSheet...</p>
        ) : (
          <>
            {/* DIUBAH: Menampilkan jumlah kartu yang tersedia */}
            <p className="card-count">Tersisa {availableCards.length} kartu di dek.</p>
            <button onClick={fetchCards} className="refresh-button">
              Refresh Kartu (dari GSheet)
            </button>
          </>
        )}
        
        {/* HAPUS: Bagian Excel dan Tambah Manual */}
        {/* <div className="import-section"> ... </div> */}
        {/* <form ... </form> */}

        <div className="deck-container">
          {/* DIUBAH: Cek 'availableCards.length' untuk 'empty' */}
          <div className={`deck ${isShuffling ? 'shuffling' : ''} ${availableCards.length === 0 ? 'empty' : ''}`}>
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
          </div>
          
          <button 
            onClick={handleDrawCard} 
            // DIUBAH: Cek 'availableCards.length'
            disabled={isShuffling || availableCards.length === 0 || isLoading}
            className="draw-button"
          >
            {isShuffling ? 'Mengocok...' : 'Ambil Kartu!'}
          </button>
        </div>
      </div>

      {/* Popup Modal (diubah sedikit) */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={closePopup}>&times;</button>
            <h2>Kartu Terpilih:</h2>
            {/* Menampilkan 'currentCard' */}
            <p className="drawn-card-text">{currentCard}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;