import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // BARU: Impor library xlsx
import './App.css'; 

function App() {
  // State untuk menyimpan semua kartu (dikosongkan, karena kita akan impor)
  const [cards, setCards] = useState([]); // BARU: Dikosongkan awalnya
  
  const [newCard, setNewCard] = useState('');
  const [drawnCard, setDrawnCard] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Fungsi untuk menambah kartu baru (manual)
  const handleAddCard = (e) => {
    e.preventDefault(); 
    if (newCard.trim() !== '') {
      // BARU: Sekarang kita tambahkan ke daftar yang mungkin sudah diimpor
      setCards(prevCards => [...prevCards, newCard]);
      setNewCard(''); 
    }
  };

  // BARU: Fungsi untuk menangani file upload Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      // Parsing data file
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      // Ambil sheet pertama
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Konversi sheet ke JSON
      const data = XLSX.utils.sheet_to_json(ws);

      // Asumsi data excel punya header di kolom pertama
      // Cek jika data ada
      if (data.length === 0) {
        alert("File Excel kosong atau formatnya salah!");
        return;
      }
      
      // Ambil nama header kolom pertama secara dinamis
      const headerKey = Object.keys(data[0])[0];
      
      // Ekstrak data dari kolom pertama itu
      const importedCards = data.map(row => row[headerKey]);
      
      // Set kartu di state (menggantikan yang lama)
      setCards(importedCards);
      
      alert(`Berhasil mengimpor ${importedCards.length} kartu!`);
    };
    reader.readAsBinaryString(file);
  };

  // Fungsi mengambil kartu (tidak berubah)
  const handleDrawCard = () => {
    if (cards.length === 0) {
      alert('Kartu sudah habis! Impor lagi atau tambah manual.');
      return;
    }
    setIsShuffling(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * cards.length);
      const selectedCard = cards[randomIndex];
      setDrawnCard(selectedCard);
      setCards(cards.filter((_, index) => index !== randomIndex));
      setIsShuffling(false);
      setShowPopup(true);
    }, 2000); 
  };

  // Fungsi menutup popup (tidak berubah)
  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => setDrawnCard(null), 300);
  };

  return (
    <div className="App">
      <div className="container">
        <img src="/logoBem.png" alt="Logogram BEM" className="logo" />
        
        <h1>BONDING SGE 3.0</h1>
        <p className="card-count">Tersisa {cards.length} kartu di dek.</p>
        
        {/* BARU: Form untuk Impor Excel */}
        <div className="import-section">
          <label htmlFor="file-upload">Impor Kartu dari Excel (.xlsx):</label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls" // Menerima file .xlsx atau .xls
            onChange={handleFileUpload}
          />
        </div>

        <p className='atau'>atau tambahkan satu per satu:</p>
        
        {/* Form untuk input kartu baru (manual) */}
        <form onSubmit={handleAddCard} className="input-form">
          <input
            type="text"
            value={newCard}
            onChange={(e) => setNewCard(e.target.value)}
            placeholder="Masukkan keterangan kartu..."
          />
          <button type="submit">Tambah Kartu</button>
        </form>

        {/* Visual Dek Kartu dan Tombol */}
        <div className="deck-container">
          <div className={`deck ${isShuffling ? 'shuffling' : ''} ${cards.length === 0 ? 'empty' : ''}`}>
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
            <div className="card-placeholder"></div>
          </div>

          <button 
            onClick={handleDrawCard} 
            disabled={isShuffling || cards.length === 0} 
            className="draw-button"
          >
            {isShuffling ? 'Mengocok...' : 'Ambil Kartu!'}
          </button>
        </div>
      </div>

      {/* Popup Modal (tidak berubah) */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={closePopup}>&times;</button>
            <h2>Kartu Terpilih:</h2>
            <p className="drawn-card-text">{drawnCard}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;