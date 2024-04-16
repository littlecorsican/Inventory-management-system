import { useState, useEffect, useRef, useContext } from 'react'
import { base } from '../utils/constant'
import Update from '../components/Update';
import Card from '../components/Card'
import { BrowserRouter as Router, Route, Link, Switch, useParams } from 'react-router-dom';
import { GlobalContext } from '../App'

function Item() {

  const _mode = {
    view: "View",
    update: "Update"
  }
  const global_context = useContext(GlobalContext)
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

  const deleteItem=()=>{
    try {
      fetch(`${base}/api/item/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response)=>response.json())
      .then((response)=>{
        console.log("response", response)
        if (response?.success) {
          global_context.toast("Successfully Deleted")
          setTimeout(()=>{
              document.location.href = `/items`
          }, 5000)
        } else {
            global_context.toast("Error")
        }
      })
    } catch(err) {
      console.log("err", err)
      global_context.toast("Error")
    }
  }

  return (
    <div className="h-screen px-12 py-8">
      <h2><u></u></h2>
        {mode == _mode.view && <>
          <Card
            {...data}
          />
          <button className="submit-btn" onClick={()=>setMode(_mode.update)}>Update</button>
          <button className="submit-btn" onClick={deleteItem}>Delete</button>
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
