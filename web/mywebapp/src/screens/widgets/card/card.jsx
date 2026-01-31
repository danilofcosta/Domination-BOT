import './card.css'

function Card({ info }) {
  return (
    <div className="card-info">
      <h1>Contador: {info?.cont}</h1>
    </div>
  );
}

export default Card;
