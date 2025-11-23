import { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  font-family: 'Inknut Antiqua', serif;
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Inknut Antiqua', serif;
  background-image: url('/b.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: var(--foreground);
  min-height: 100vh; 
`;

const Title = styled.h1`
  font-family: 'Inknut Antiqua', serif;
  text-align: center;
  color: #000000ff;
  margin-bottom: 50px;
`;

const InfoButton = styled.span`
  cursor: pointer;
  font-size: 20px;
  color: #0172e4ff;
  margin-left: 10px;
`;

const CategoryTitle = styled.h2`
  color: #000000;
`;

const Card = styled.div`
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(184, 183, 183, 0.1);
  background: ${(props) => (props.taken ? "linear-gradient(135deg, #ffe6e6c9, #cec4c4a9, #ac8282bd)" : "linear-gradient(135deg, #e43636af, #f7a7a786, #d3424280)")};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: ${(props) => (props.taken ? '5px solid red' : '5px solid #28b43f')};
  opacity: ${(props) => (props.taken ? 0.6 : 1)};
`;

const Button = styled.button`
  padding: 8px 12px;
  background: #28b43f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #f3cacaff;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  text-align: center;
`;

const InfoModalContent = styled(ModalContent)`
  max-width: 500px;

  @media (max-width: 600px) {
    max-width: 90%;
  }

  
  `;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
  color: #000000;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  &:focus {
    background-color: #fff;
    border-color: #0070f3;
    outline: none;
  }
`;

const CloseButton = styled.button`
  padding: 8px 12px;
  background: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
`;

export default function FrontendPage() {
  const [wishes, setWishes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
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
    setName('');
    setQuantity(1);
    setModalOpen(true);
  };

  const submitTakeWish = async () => {
    if (!name.trim()) return;
    await fetch('/api/wishes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedWish._id, taken: true, takenBy: name, quantity }),
    });
    setModalOpen(false);
    loadWishes();
  };

  const handleInfoClick = () => setInfoModalOpen(true);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) setModalOpen(false);
  };

  useEffect(() => {
    loadWishes();
  }, []);

  // Disable scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : 'auto';
  }, [modalOpen]);

  const groupByCategory = (wishes) =>
    wishes.reduce((acc, wish) => {
      const category = wish.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(wish);
      return acc;
    }, {});

  const groupedWishes = groupByCategory(wishes);
  const sortedCategories = Object.keys(groupedWishes).sort((a, b) => a.localeCompare(b));
  const sortedGroupedWishes = sortedCategories.map((category) => ({
    category,
    wishes: groupedWishes[category].sort((a, b) => a.title.localeCompare(b.title)),
  }));

  return (
    <Container>
      <Title>
        Lista de Dorințe 
        <InfoButton onClick={handleInfoClick} title="More Info">
          ℹ️
        </InfoButton>
      </Title>

      {sortedGroupedWishes.length === 0 && <p>Înca nu sunt Dorințe!</p>}

      {sortedGroupedWishes.map(({ category, wishes }) => (
        <div key={category}>
          <CategoryTitle>{category}</CategoryTitle>
          {wishes.map((w) => (
            <Card key={w._id} taken={w.taken}>
              <div>
                <strong>{w.title}</strong>
                <br />
                <small style={{flex: "1 1 auto", minWidth: "80%", wordBreak: "break-word"}}>{w.description}</small>
              </div>
              {w.taken ? (
                <span style={{ color: 'red', fontWeight: 'bold' }}>✔Preluat</span>
              ) : (
                <Button 
                  onClick={() => handleTakeWish(w)}
                  style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #8beba0ff, #cad6cdff, #62ad68d0)",
                  color: "#000000ff",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}>
                  Preia
                </Button>
                      )}
            </Card>
          ))}
        </div>
      ))}

      {modalOpen && (
        <ModalOverlay onClick={handleOverlayClick}>
          <ModalContent>
            <h2 style={{ color: 'black', marginBottom: 20 }}>Preia Dorința - {selectedWish?.title}</h2>

            <Input
              type="text"
              placeholder="Numele Tau"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Input
                placeholder="Cantitate"
                value={quantity}
                min="1"
              />
              <div style={{ display: 'flex', marginLeft: '10px', gap: '5px' }}>
                <Button onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : prev))} style={{ width: '35px', height: '35px' }}>-</Button>
                <Button onClick={() => setQuantity((prev) => (prev < 10 ? prev + 1 : prev))} style={{ width: '35px', height: '35px' }}>+</Button>
              </div>
            </div>

            <div>
              <Button 
              onClick={submitTakeWish} disabled={name.trim() === ''} style={{ marginRight: '10px' }}>Preia</Button>
              <CloseButton onClick={() => setModalOpen(false)}>Anulează</CloseButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {infoModalOpen && (
        <ModalOverlay>
          <InfoModalContent>
            <h2 style={{marginBottom:20}}>Informații despre această listă</h2>
            <h4 style={{marginBottom:10}}>Draga Familie 💕,</h4>
            <p>🌸🍼Aceste dorințe sunt mai mult decât simple lucruri - sunt pași mici pentru a ajuta bebelușul nostru să crească puternic, sănătos și iubit de toți în aceste prime luni prețioase🍼🌸</p>.
             <p> Nu este vorba despre "nu ne permitem" sau altceva...,</p>
             <p>ci mai degrabă despre faptul că dorim ca</p>
             <h2>TU</h2>
             <p> să fii alături de noi împărtășind toate micile bucurii de pe parcurs. 🌙✨</p>
            <CloseButton onClick={() => setInfoModalOpen(false)}>Am înțeles!</CloseButton>
          </InfoModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}