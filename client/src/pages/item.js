import { useState, useEffect, useRef } from 'react'
import { base } from '../utils/constant'
import Update from '../components/Update';
import Card from '../components/Card'
import { BrowserRouter as Router, Route, Link, Switch, useParams } from 'react-router-dom';

function Item() {

  const _mode = {
    view: "View",
    update: "Update"
  }

  const { id } = useParams();
  console.log("id", id)
  const [data, setData]=useState([])
  const [mode, setMode]=useState(_mode.view)

  useEffect(()=>{
    fetch(`${base}/api/item/${id}`)
    .then((response)=>response.json())
    .then((response)=>{
      console.log("data", response, response?.data)
      setData(response?.data)
    })
  },[])

  return (
    <div className="h-screen px-12 py-8">
      <h2><u></u></h2>
        {mode == _mode.view && <>
          <Card
            {...data}
          />
          <button className="submit-btn" onClick={()=>setMode(_mode.update)}>Update</button>
        </>}
        {mode == _mode.update && <Update id={id} name={data?.name} type="item" />}
        {/* <button className="submit-btn" onClick={
          ()=> setMode((mode)=> mode==_mode.view ? _mode.update : _mode.view)
        }>
          {
            mode
          }
        </button> */}
    </div>
  );
}

export default Item;
