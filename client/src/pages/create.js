import { useState, useEffect, useRef, useContext } from 'react'
import { base } from '../utils/constant'
import Form from '../components/Form'
import { GlobalContext } from '../App'
import { types } from '../utils/constant'

function CreateNew() {

    const global_context = useContext(GlobalContext)
    const handleSubmit=(e, formData)=>{
        e.preventDefault()
        console.log(e)
        console.log("formData", formData)

        try {
            fetch(`${base}/api/${formData?.type.toLowerCase()}`, { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                //body: JSON.stringify(formData),
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                }),
            })
            .then((response)=>response.json())
            .then((response)=>{
                console.log("response", response)
                global_context.toast("Successfully created")
                setTimeout(()=>{
                    document.location.href = "/"
                }, 3000)
            })
        } catch(err) {
            console.log("err", err)
            global_context.toast("Error")
        }
    }

  return (
    <div className="h-screen px-12 py-8">
      <h2><u>Create New</u></h2>
        <Form handleSubmit={handleSubmit} />
    </div>
  );
}

export default CreateNew;
