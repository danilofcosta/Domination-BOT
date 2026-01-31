import { useEffect, useState } from 'react'
import './home.css'
import api from '../services/api'
import Card from './widgets/card/card'

function Home() {
  const [cont, setCont] = useState(null);

  async function getcont() {
    const response = await api.get('/users/cont');
    console.log(response.data);
    setCont(response.data); // ✔ Correct
  }

  useEffect(() => {
    getcont();
  }, []);

  return (
    <div>
      <h1>Dominations</h1>
      <Card info={cont} />
    </div>
  );
}

export default Home;
