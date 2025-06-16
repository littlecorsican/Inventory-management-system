import { useState, useEffect } from 'react'

function Card({
    image_path,
    name,
    description,
    container
}) {

  return (
    <>
        <div className="flex hover:border-2 rounded cursor-pointer px-6 py-2" >
            <div className="min-h-[100px] min-w-[100px]">
                <img src={image_path} />
            </div>
            <div className="flex flex-col">
                <div className="">
                    Name: {name}
                </div>
                <div className="">
                    Description: {description}
                </div>
                <div className="">
                    Contained in: {container}
                </div>
                <div>
                    <img src={`http://localhost:8081/media/${image_path}`} />
                </div>
            </div>
        </div>
    </>
  );
}

export default Card;

