import { useRef, useEffect, useState, createContext, useContext  } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./pages/layout";
import NoPage from "./pages/nopage";
import Items from "./pages/items";
import Item from "./pages/item";
import Containers from "./pages/containers";
import Container from "./pages/container";
import { Oval } from "react-loader-spinner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const GlobalContext = createContext({
  loading: false,
  setLoading: () => {},
  toast: (text)=> {},
});

export default function App() {

  const [loading, setLoading] = useState(false)

  return (
    <BrowserRouter>
      <Oval
        height={80}
        width={80}
        color="#4fa94d"
        wrapperStyle={{}}
        wrapperClass="justify-center z-50 m-auto fixed w-full h-full items-center"
        visible={loading}
        ariaLabel="oval-loading"
        secondaryColor="#4fa94d"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
      <GlobalContext.Provider value={{
        loading,
        setLoading,
        toast,
      }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="containers" element={<Containers />} />
              <Route path="container/:id" element={<Container />} />
              <Route path="items" element={<Items />} />
              <Route path="item/:id" element={<Item />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
          <ToastContainer />
      </GlobalContext.Provider>
    </BrowserRouter>
    
  );
};
