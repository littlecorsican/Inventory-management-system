import { useRef, useEffect, useState, useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../css/layout.css';

export default function Layout({  }) {

  const navigate = useNavigate();

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
          
          <a href="/login" className="m-auto">
            <div className="nav_item">
              <div className=""><img src="" /></div>
              <div className="">Login</div>
          </div></a>
        </nav>
        <div className="w-full">
          <Outlet />
        </div>
    </div>
  );
};
