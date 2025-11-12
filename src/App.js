// BARU: Impor useCallback, useMemo, dan kembalikan XLSX
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx'; // DIKEMBALIKAN: Impor library xlsx
import './App.css'; 

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfF9o5t1rOT0NQWce79OryRc9rOwhqHLmiCN0ASFxL5c-EY1JvJeT6LWeAV7TgcZ0/exec";

function App() {
  // --- STATE ---
  // masterList adalah satu-satunya sumber kartu
  const [masterList, setMasterList] = useState([]);
  
  // Kita hanya melacak kartu yang SUDAH DITARIK
  const [drawnCards, setDrawnCards] = useState([]);
  
  // BARU: State untuk input manual
  const [newCard, setNewCard] = useState(''); 

  const [currentCard, setCurrentCard] = useState(null); 
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- DERIVED STATE ---
  // Dek yang tersedia (kartu di masterList TAPI TIDAK ADA di drawnCards)
  const availableCards = useMemo(() => {
    return masterList.filter(card => !drawnCards.includes(card));
  }, [masterList, drawnCards]);

  // --- FUNGSI ---

  // FUNGSI 1: Fetch dari Google Sheet (Hard Reset)
  const fetchCards = useCallback(() => {
    setIsLoading(true);
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setMasterList(data.cards); // Set master list
          setDrawnCards([]); // Reset kartu yang ditarik
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
  }, []); 

  // EFEK: Jalankan fetchCards() sekali saat load
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // FUNGSI 2: Tambah manual (DIKEMBALIKAN & DIUBAH)
  const handleAddCard = (e) => {
    e.preventDefault(); 
    if (newCard.trim() !== '') {
      // Tambahkan kartu baru ke MASTER LIST
      setMasterList(prevMaster => [...prevMaster, newCard]);
      setNewCard(''); 
    }
  };

  // FUNGSI 3: Upload Excel (DIKEMBALIKAN & DIUBAH)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (data.length === 0) { 
        alert("File Excel kosong atau formatnya salah!");
        return; 
      }
      
      const headerKey = Object.keys(data[0])[0];
      const importedCards = data.map(row => row[headerKey]);
      
      // Upload Excel adalah Hard Reset
      setMasterList(importedCards); // Ganti master list
      setDrawnCards([]); // Kosongkan kartu yang sudah ditarik
      
      alert(`Berhasil mengimpor ${importedCards.length} kartu!`);
    };
    reader.readAsBinaryString(file);
  };

  // FUNGSI 4: Ambil Kartu (Logika dari Kode B, sudah benar)
  const handleDrawCard = () => {
    if (availableCards.length === 0) {
      alert('Kartu sudah habis!');
      return;
    }
    setIsShuffling(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const selectedCard = availableCards[randomIndex];
      
      setCurrentCard(selectedCard); // Set kartu untuk popup
      
      // Tambahkan kartu ini ke daftar yang sudah ditarik
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

  // --- TAMPILAN JSX (Gabungan) ---
  return (
    <div className="App">
      <div className="container">
        <img src="/logoBem.png" alt="Logogram BEM" className="logo" />
        
        <h1>BONDING SGE 3.0</h1>

        {isLoading ? (
          <p className="loading-text">Memuat kartu dari GSheet...</p>
        ) : (
          <>
            <p className="card-count">Tersisa {availableCards.length} kartu di dek.</p>
            <button onClick={fetchCards} className="refresh-button">
              Reset Kartu (dari GSheet)
            </button>
          </>
        )}
        
        {/* DIKEMBALIKAN: Bagian Excel */}
        <div className="import-section">
          <label htmlFor="file-upload">Ganti dek dengan Excel (.xlsx):</label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>

        <p className='atau'>atau tambahkan satu per satu ke dek:</p>
        
        {/* DIKEMBALIKAN: Bagian Manual */}
        <form onSubmit={handleAddCard} className="input-form">
          <input
            type="text"
            value={newCard}
            onChange={(e) => setNewCard(e.target.value)}
            placeholder="Masukkan keterangan kartu..."
          />
          <button type="submit">Tambah Kartu</button>
        </form>

        {/* Dek dan Tombol (Logika dari Kode B) */}
        <div className="deck-container">
          <div className={`deck ${isShuffling ? 'shuffling' : ''} ${availableCards.length === 0 ? 'empty' : ''}`}>
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
          </div>
          
          <button 
            onClick={handleDrawCard} 
            disabled={isShuffling || availableCards.length === 0 || isLoading}
            className="draw-button"
          >
            {isShuffling ? 'Mengocok...' : 'Ambil Kartu!'}
          </button>
        </div>
      </div>

      {/* Popup Modal (Logika dari Kode B) */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={closePopup}>&times;</button>
            <h2>Kartu Terpilih:</h2>
            <p className="drawn-card-text">{currentCard}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;