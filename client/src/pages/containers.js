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



  return (
    <div className="h-screen px-12 py-8">
      <h2><u>Containers</u></h2>
      {
        data.map((value)=>{
          return <a href={`/container/${value?.id}`} key={value?.id}>
            <Card
              {...value}
            />
            {/* <div key={value} className="flex hover:border-2 rounded cursor-pointer px-4 py-6" >
              <div className="min-h-[100px] min-w-[100px] mx-2 my-2">
                <img src={value?.image_path} />
              </div>
              <div className="flex flex-col mx-2 my-2">
                <div className="">
                  Name: {value?.name}
                </div>
                <div className="">
                  Description: {value?.description}
                </div>
                <div className="">
                  Contained in: {value?.container}
                </div>
              </div>
            </div> */}
          </a>
        })
      }
    </div>
  );
}

export default Containers;
