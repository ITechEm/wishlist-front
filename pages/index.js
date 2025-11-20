import { useState, useEffect } from 'react';

export default function FrontendPage() {
  const [wishes, setWishes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false); // For info modal
  const [selectedWish, setSelectedWish] = useState(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const loadWishes = async () => {
    const res = await fetch('/api/wishes');
    const data = await res.json();
    setWishes(data);
  };

  const handleTakeWish = (wish) => {
    setSelectedWish(wish);
    setModalOpen(true);
  };

  const submitTakeWish = async () => {
    await fetch('/api/wishes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedWish._id, taken: true, takenBy: name, quantity }),
    });
    setModalOpen(false);
    loadWishes();
  };

  const handleInfoClick = () => {
    setInfoModalOpen(true); // Open info modal
  };

  useEffect(() => {
    loadWishes();
  }, []);

  // Group wishes by category
  const groupByCategory = (wishes) => {
    return wishes.reduce((acc, wish) => {
      const category = wish.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(wish);
      return acc;
    }, {});
  };

  // Get grouped wishes and sort categories and wishes
  const groupedWishes = groupByCategory(wishes);
  const sortedCategories = Object.keys(groupedWishes).sort((a, b) => a.localeCompare(b)); // Sort categories alphabetically

  // Sort wishes within each category alphabetically
  const sortedGroupedWishes = sortedCategories.map(category => ({
    category,
    wishes: groupedWishes[category].sort((a, b) => a.title.localeCompare(b.title))
  }));

  // Styles
  const container = { 
    maxWidth: 700, 
    margin: '40px auto', 
    fontFamily: 'Arial, sans-serif', 
    padding: 20, 
    backgroundImage: 'url(/b.jpg)', // Image from public folder
    backgroundSize: 'cover', // Ensures the image fully covers the page
    backgroundPosition: 'center', // Centers the background image
    backgroundRepeat: 'no-repeat', // Prevents repeating the image
    color: 'var(--foreground)', // Text color (using the CSS variable)
    minHeight: '100vh', // Full height of the viewport
  };

  const card = (taken) => ({
    padding: 15,
    margin: '10px 0',
    borderRadius: 8,
    boxShadow: '0 2px 6px rgba(184, 183, 183, 0.1)',
    background: taken ? '#f09797ff' : '#e29fb3ff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: taken ? '5px solid red' : '5px solid #0070f3',
    opacity: taken ? 0.6 : 1,
  });

  const button = { padding: '8px 12px', background: '#28b43fff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' };
  const infoButton = { cursor: 'pointer', fontSize: '20px', color: '#b8c1caff', marginLeft: '10px' }; // Info icon style

  return (
    <div style={container}>
      <h1 style={{ textAlign: 'center', color: '#acaeafff' }}>
        Wishlist
        {/* Info Icon next to the title */}
        <span 
          style={infoButton} 
          onClick={handleInfoClick} 
          title="More Info"
        >
          ℹ️
        </span>
      </h1>

      {sortedGroupedWishes.length === 0 && <p>No wishes yet.</p>}

      {sortedGroupedWishes.map(({ category, wishes }) => (
        <div key={category}>
          <h2 style={{ color: '#000000ff' }}>{category}</h2>
          {wishes.map(w => (
            <div key={w._id} style={card(w.taken)}>
              <div>
                <strong>{w.title}</strong><br />
                <small>{w.description}</small>
              </div>
              {w.taken ? (
                <span style={{ color: 'red', fontWeight: 'bold' }}>✔ Taken</span>
              ) : (
                <button style={button} onClick={() => handleTakeWish(w)}>Take</button>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Modal for taking a wish */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#ffffffff', padding: 20, borderRadius: 8, minWidth: 300, textAlign: 'center'
          }}>
            <h2>Take Wish</h2>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: 10, marginBottom: 10, width: '100%' }}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ padding: 10, marginBottom: 10, width: '100%' }}
              min="1"
            />
            <div>
              <button style={{ ...button, background: '#00f320ff' }} onClick={submitTakeWish}>Submit</button>
              <button style={{ ...button, background: 'red' }} onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for showing info about the wishlist */}
      {infoModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(161, 160, 160, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' 
        }}>
          <div style={{
            background: '#f3cacaff', padding: 20, borderRadius: 8, minWidth: 300, textAlign: 'center', 
          }}>
            <h2>Wish List Information</h2>
            <p style={{marginTop:5}}>This is my wish list. Feel free to choose a gift!</p>
            <button style={{ ...button, background: 'red', marginTop:20 }} onClick={() => setInfoModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
