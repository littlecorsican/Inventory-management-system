import { useState, useEffect } from 'react'
import { base } from '../constant'

function Items() {

  const [data, setData]=useState([])

  useEffect(()=>{
    fetch(`${base}/api/item`)
    .then((response)=>{
      return response.json()
    }).then((response)=>{
      setData(response?.data)
    })
  }, [])

  return (
    <div className="App">
      <ul>
      {
        data && data.map((value)=>{
          return <li key={value.id}><a  href={`/api/item/${value.id}`}>
              <div>
                {value.name}
              </div>
              <div>
                {value.description}
              </div>
            </a></li>
          })
      }
      </ul>
    </div>
  );
}

export default Items;
