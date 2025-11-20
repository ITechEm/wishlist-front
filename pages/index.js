import { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Inknut Antiqua', serif;

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: var(--foreground);
  min-height: 100vh; 
`;

const Title = styled.h1`
  text-align: center;
  color: #000000ff;
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
  background: ${(props) => (props.taken ? '#f0979765' : '#e29fb3ff')};
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

const InfoModalContent = styled.div`
  background: #f3cacaff;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  text-align: center;
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

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
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
    setName('');  // Clear the name field when opening the modal
    setModalOpen(true);
    setQuantity(1);
  };

  const submitTakeWish = async () => {
    if (!name.trim()) return; // Do not submit if name is empty or whitespace
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

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
    }
  };

  // Disable body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [modalOpen]);

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
  const sortedCategories = Object.keys(groupedWishes).sort((a, b) => a.localeCompare(b));

  // Sort wishes within each category alphabetically
  const sortedGroupedWishes = sortedCategories.map(category => ({
    category,
    wishes: groupedWishes[category].sort((a, b) => a.title.localeCompare(b.title)),
  }));

  return (
    <Container>
      <Title>
        Wishlist
        {/* Info Icon next to the title */}
        <InfoButton onClick={handleInfoClick} title="More Info">
          ℹ️
        </InfoButton>
      </Title>

      {sortedGroupedWishes.length === 0 && <p>No wishes yet!</p>}

      {sortedGroupedWishes.map(({ category, wishes }) => (
        <div key={category}>
          <CategoryTitle>{category}</CategoryTitle>
          {wishes.map((w) => (
            <Card key={w._id} taken={w.taken}>
              <div>
                <strong>{w.title}</strong>
                <br />
                <small>{w.description}</small>
              </div>
              {w.taken ? (
                <span style={{ color: 'red', fontWeight: 'bold' }}>✔ Taken</span>
              ) : (
                <Button onClick={() => handleTakeWish(w)}>Take</Button>
              )}
            </Card>
          ))}
        </div>
      ))}

      {/* Modal for taking a wish */}
      {modalOpen && (
        <ModalOverlay onClick={handleOverlayClick}>
          <ModalContent>
            <h2 style={{ color: 'black', marginBottom: 20 }}>Take Wish</h2>

            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />

              {/* Quantity Buttons */}
              <div style={{ display: 'flex', marginLeft: '10px', gap: '5px' }}>
                <Button
                  onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : prev))}
                  style={{ marginBottom: '10px', width: '35px', height: '35px' }}
                >
                  -
                </Button>
                <Button
                  onClick={() => setQuantity((prev) => (prev < 10 ? prev + 1 : prev))}
                  style={{ marginBottom: '10px', width: '35px', height: '35px' }}
                >
                  +
                </Button>
              </div>
            </div>

            <div>
              <Button onClick={submitTakeWish} disabled={name.trim() === ''} style={{ marginRight: '10px' }}>
                Submit
              </Button>
              <CloseButton onClick={handleCloseModal}>Cancel</CloseButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal for showing info about the wishlist */}
      {infoModalOpen && (
        <ModalOverlay>
          <InfoModalContent>
            <h2>Wish List Information</h2>
            <p>This is my wish list. Feel free to choose a gift!</p>
            <CloseButton onClick={() => setInfoModalOpen(false)}>Close</CloseButton>
          </InfoModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}



// import { useState, useEffect } from 'react';
// import styled from 'styled-components';

// // Styled components
// const Container = styled.div`
//   max-width: 700px;
//   margin: 40px auto;
//   padding: 20px;
//   font-family: 'Arial', sans-serif;
//   background-image: url('/b.jpg');
//   background-size: cover;
//   background-position: center;
//   background-repeat: no-repeat;
//   color: var(--foreground);
//   min-height: 100vh;
// `;

// const Title = styled.h1`
//   text-align: center;
//   color: #000000ff;
// `;

// const InfoButton = styled.span`
//   cursor: pointer;
//   font-size: 20px;
//   color: #0172e4ff;
//   margin-left: 10px;
// `;

// const CategoryTitle = styled.h2`
//   color: #000000;
// `;

// const Card = styled.div`
//   padding: 15px;
//   margin: 10px 0;
//   border-radius: 8px;
//   box-shadow: 0 2px 6px rgba(184, 183, 183, 0.1);
//   background: ${(props) => (props.taken ? '#f0979765' : '#e29fb3ff')};
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   border-left: ${(props) => (props.taken ? '5px solid red' : '5px solid #28b43f')};
//   opacity: ${(props) => (props.taken ? 0.6 : 1)};
// `;

// const Button = styled.button`
//   padding: 8px 12px;
//   background: #28b43f;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   opacity: ${(props) => (props.disabled ? 0.5 : 1)};
// `;

// const ModalOverlay = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(112, 73, 73, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background: #f3cacaff;
//   padding: 20px;
//   border-radius: 8px;
//   min-width: 300px;
//   text-align: center;
  
// `;

// const InfoModalContent = styled.div`
//   background: #f3cacaff;
//   padding: 20px;
//   border-radius: 8px;
//   min-width: 300px;
//   text-align: center;
// `;

// const Input = styled.input`
//   padding: 10px;
//   margin-bottom: 10px;
//   width: 100%;
//   color: #000000;
//   background-color: #ffffff;
//   border: 1px solid #ccc;
//   border-radius: 5px;
//   font-size: 16px;
//   &:focus {
//     background-color: #fff;
//     border-color: #0070f3;
//     outline: none;
//   }
// `;


// const CloseButton = styled.button`
//   padding: 8px 12px;
//   background: red;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   margin-top: 20px;
// `;

// const ErrorMessage = styled.p`
//   color: red;
//   font-size: 14px;
// `;

// export default function FrontendPage() {
//   const [wishes, setWishes] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [infoModalOpen, setInfoModalOpen] = useState(false);
//   const [selectedWish, setSelectedWish] = useState(null);
//   const [name, setName] = useState('');
//   const [quantity, setQuantity] = useState(1);

//   const loadWishes = async () => {
//     const res = await fetch('/api/wishes');
//     const data = await res.json();
//     setWishes(data);
//   };

//   const handleTakeWish = (wish) => {
//     setSelectedWish(wish);
//     setName('');  // Clear the name field when opening the modal
//     setModalOpen(true);
//   };

//   const submitTakeWish = async () => {
//     if (!name.trim()) return; // Do not submit if name is empty or whitespace
//     await fetch('/api/wishes', {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ id: selectedWish._id, taken: true, takenBy: name, quantity }),
//     });
//     setModalOpen(false);
//     loadWishes();
//   };

//   const handleInfoClick = () => {
//     setInfoModalOpen(true); // Open info modal
//   };

//   useEffect(() => {
//     loadWishes();
//   }, []);

//   // Group wishes by category
//   const groupByCategory = (wishes) => {
//     return wishes.reduce((acc, wish) => {
//       const category = wish.category || 'Uncategorized';
//       if (!acc[category]) {
//         acc[category] = [];
//       }
//       acc[category].push(wish);
//       return acc;
//     }, {});
//   };

//   // Get grouped wishes and sort categories and wishes
//   const groupedWishes = groupByCategory(wishes);
//   const sortedCategories = Object.keys(groupedWishes).sort((a, b) => a.localeCompare(b));

//   // Sort wishes within each category alphabetically
//   const sortedGroupedWishes = sortedCategories.map(category => ({
//     category,
//     wishes: groupedWishes[category].sort((a, b) => a.title.localeCompare(b.title)),
//   }));

//   return (
//     <Container>
//       <Title>
//         Wishlist
//         {/* Info Icon next to the title */}
//         <InfoButton onClick={handleInfoClick} title="More Info">
//           ℹ️
//         </InfoButton>
//       </Title>

//       {sortedGroupedWishes.length === 0 && <p>No wishes yet.</p>}

//       {sortedGroupedWishes.map(({ category, wishes }) => (
//         <div key={category}>
//           <CategoryTitle>{category}</CategoryTitle>
//           {wishes.map((w) => (
//             <Card key={w._id} taken={w.taken}>
//               <div>
//                 <strong>{w.title}</strong>
//                 <br />
//                 <small>{w.description}</small>
//               </div>
//               {w.taken ? (
//                 <span style={{ color: 'red', fontWeight: 'bold' }}>✔ Taken</span>
//               ) : (
//                 <Button onClick={() => handleTakeWish(w)}>Take</Button>
//               )}
//             </Card>
//           ))}
//         </div>
//       ))}

//       {/* Modal for taking a wish */}
// {modalOpen && (
//   <ModalOverlay>
//     <ModalContent>
//       <h2 style={{ color: 'black', marginBottom: 20 }}>Take Wish</h2> {/* Set title text color to black */}
      
//       <Input
//         type="text"
//         placeholder="Your Name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
        
//       />

//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <Input
//           type="number"
//           placeholder="Quantity"
//           value={quantity}
   
//           min="1"
         
//         />

//         {/* Quantity Buttons */}
//         <div style={{ display: 'flex', marginLeft: '10px', gap: '5px' }}>
//           <Button 
//             onClick={() => setQuantity(prev => prev > 1 ? parseInt(prev) - 1 : prev)} 
//             style={{ marginBottom: '10px',width: '35px', height: '35px' }}
//           >
//             -
//           </Button>
//           <Button 
//             onClick={() => setQuantity(prev => prev < 10 ? parseInt(prev) + 1 : prev)} 
//             style={{ marginBottom: '10px', width: '35px', height: '35px' }}
//           >
//             +
//           </Button>
          
//         </div>
//       </div>

//       <div>
//         <Button onClick={submitTakeWish} disabled={name.trim() === ''} style={{ marginRight: '10px' }}>
//           Submit
//         </Button>
//         <CloseButton onClick={() => setModalOpen(false)}>Cancel</CloseButton>
//       </div>
//     </ModalContent>
//   </ModalOverlay>
// )}


//       {/* Modal for showing info about the wishlist */}
//       {infoModalOpen && (
//         <ModalOverlay>
//           <InfoModalContent>
//             <h2>Wish List Information</h2>
//             <p>This is my wish list. Feel free to choose a gift!</p>
//             <CloseButton onClick={() => setInfoModalOpen(false)}>Close</CloseButton>
//           </InfoModalContent>
//         </ModalOverlay>
//       )}
//     </Container>
//   );
// }


