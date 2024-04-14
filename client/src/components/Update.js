import { useState, useEffect, useRef, useContext } from 'react'
import { base } from '../utils/constant'
import Form from '../components/Form'
import { GlobalContext } from '../App'

function Update({ id }) {
    
    const global_context = useContext(GlobalContext)

    const handleSubmit=(e, formData)=>{
        e.preventDefault()
        console.log(e)
        console.log("formData", formData)
        try {
            fetch(`${base}api/item/${id}`, { 
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                //body: JSON.stringify(formData),
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                }),
            })
            .then((response)=>response.json)
            .then((response)=>{
                console.log("response", response)
                global_context.toast("Successfully updated")
            })
        } catch(err) {
            console.log("err", err)
            global_context.toast("Error")
        }
    }

  return (
    <div className="px-12 py-8">
      <h2><u></u></h2>
        <Form type="Update" handleSubmit={handleSubmit} />
    </div>
  );
}

export default Update;
