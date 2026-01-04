import styled from 'styled-components';

export const BodyContainer = styled.body`
  background-color: #007bff;
  height: 100vh;

  background-size: contain cover;
  background-position: center;
  background-repeat: repeat-y no-repeat;

  animation: bgChange 15s infinite;

  display: flex;
  justify-content: center;
  align-items: center;
  color: white;

  @media (max-width: 768px) {
    background-size: cover;
  }

  @keyframes bgChange {
    0% {
      background-image: url('https://i.pinimg.com/736x/2b/d7/d4/2bd7d4fc335d3c6c4218697e40208dfb.jpg');
    }
    33% {
      background-image: url('https://i.pinimg.com/736x/b7/f3/70/b7f370db818ba8d5c95d379013c5a0af.jpg');
    }
    66% {
      background-image: url('https://i.pinimg.com/736x/37/dc/3c/37dc3c6d753bbd9566ef0b859b0ce09f.jpg');
    }
    100% {
      background-image: url('https://i.pinimg.com/736x/18/10/66/181066d7458ba3d8b08a70ab6828804f.jpg');
    }
  }
`;
export const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;
  font-family: 'Arial', sans-serif; /* Substitua pela sua fonte desejada */
`;


export const Container = styled.div`
  display: flex;
  border: 2px solid #ffffff;
  padding: 40px;
  border-radius: 10px;
  background-color: rgba(2, 2, 2, 0.66);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

export const StyledButton = styled.button`
  background-color: #ffffff;
  color: #007bff;
  border: none;
  padding: 10px 20px;
  font-size: 18px;
  border-radius: 20px; 
  transition: all 0.3s ease-in-out; 
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
    color: #ffffff;
    transform: scale(1.05); 
  }
`;