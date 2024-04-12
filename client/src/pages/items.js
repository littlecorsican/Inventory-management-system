import { useState, useEffect } from 'react'
import { base } from '../constant'

function Items() {

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


  // useEffect(()=>{
  //   fetch(`${base}/api/item`)
  //   .then((response)=>{
  //     return response.json()
  //   }).then((response)=>{
  //     setData(response?.data)
  //   })
  // }, [])

  return (
    <div className="h-screen px-12 py-8">
      <h2><u>Items</u></h2>
      {
        data.map((value)=>{
          return <a href={`/item/${value?.id}`} key={value?.id}>
            <div className="flex hover:border-2 rounded cursor-pointer px-6 py-2" >
              <div className="min-h-[100px] min-w-[100px]">
                <img src={value?.image_path} />
              </div>
              <div className="flex flex-col">
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
            </div>
          </a>
        })
      }
    </div>
  );
}

export default Items;
