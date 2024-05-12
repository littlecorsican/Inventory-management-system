import { useState, useEffect } from 'react'
import { base } from '../utils/constant'
import Card from '../components/Card'

function Containers() {

  const [data, setData]=useState([
    {
      id: 1,
      name: "name",
      description: "description"
    },
    {
      id: 2,
      name: "name1",
      description: "description1"
    },
    {
      id: 3,
      name: "name2",
      description: "description2"
    },
  ])
  const [offset, setOffset]=useState(0)

  const limit = 10
  let sortBy = "name ASC"
  let contains = ''
  useEffect(()=>{
    fetch(`${base}/api/container?limit=${limit}&offset=${offset}&sortBy=${sortBy}contains=${contains}`)
    .then((response)=>{
      return response.json()
    }).then((response)=>{
      setData(response?.data)
    })
  }, [])

  const next=()=>{
    setOffset((offset)=>offset + 1)
  }

  const prev=()=>{
    if (offset > 0) {
      setOffset((offset)=>offset - 1)
    }
  }


  return (
    <div className="h-screen px-12 py-8">
      <h2><u>Containers</u></h2>
      {
        data.map((value)=>{
          return <a href={`/container/${value?.id}`} key={value?.id}>
            <Card
              {...value}
            />
          </a>
        })
      }
      <div className="flex flex-row justify-around py-2 px-4">
        <button onClick={prev}> Prev </button>
        <div> Page: {offset+1} </div>
        <div> {offset*limit+1}-{offset*limit+limit} </div>
        <button onClick={next}> Next </button>
      </div>
    </div>
  );
}

export default Containers;
