import { useRef, useEffect, useState, useContext } from "react";
import { Outlet, Link } from "react-router-dom";


export default function Layout({  }) {


  const navItem = [
    {
      title: "Containers",
      url: "/containers",
      icon: "/images/home.png",
    },
    {
      title: "Items",
      url: "/items",
      icon: "/images/dashboard.png",
    },
    {
      title: "Create New",
      url: "/create",
      icon: "/images/dashboard.png",
    },
  ]

  return (
    <div className="">
        <nav className="nav_bar">
          {
            navItem.map((value)=>{
              return <a href={value.url} key={value.url} className="m-auto">
                <div className="nav_item">
                  <div className=""><img src={value.icon} className="icon" /></div>
                  <div className="">{value.title}</div>
                </div>
              </a>
            })
          }
          
        </nav>
        <div className="w-full">
          <Outlet />
        </div>
    </div>
  );
};
