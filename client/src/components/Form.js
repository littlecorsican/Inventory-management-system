import { useState, useEffect, useRef } from 'react'
import { base } from '../utils/constant'
import InputText from './form/InputText'
import TextArea from './form/TextArea'
import { types } from '../utils/constant'
import Record from './Record'

function Form({
    handleSubmit,
    action="Create",
    type="item",
    defaultValue={
        "name": "",
        "description": "",
        "container" : null,
        "image_path": null
    }
}) {

    const typeRef = useRef()
    const nameRef = useRef()
    const descriptionRef = useRef()
    const containerRef = useRef()

    const [containers, setContainers] = useState([])
    const [imageUri, setImageUri] = useState(null)
    const [cameraOn, setCameraOn] = useState(false)

    useEffect(()=>{
        // call url to get containers
        try {
            fetch(`${base}/api/container/all`)
            .then((response)=>response.json())
            .then((response)=>{
                console.log("response", response)
                setContainers(response?.data)
            })
        } catch(err) {
            console.log("err", err)
        }
    },[])

    const clickSubmit=(e)=>{
        const formData={
            type: action === "Create" ? typeRef.current.value : type,
            name: nameRef.current.value,
            description: descriptionRef.current.value,
            containerRef: containerRef,
            imageUri
        }
        handleSubmit(e, formData)
    }

  return (
    <form onSubmit={clickSubmit}>
        <div className={`${cameraOn ? "hidden" : "block"}`}>
            {action == "Create" && <div className="my-2 py-2">
                <label htmlFor="type-select" className="form-label input-label mt-3 fw-bold">
                    Type:
                </label>
                <select id="type-select" className='ml-4' ref={typeRef}>
                    {
                        types && types.map((value)=>{
                            return <option key={value} value={value}>
                                {value}
                            </option>
                        })
                    }
                </select>
            </div>}
            <div className="my-2 py-2">
                <InputText
                    ref={nameRef}
                    required
                    title="Name: "
                    id="name"
                    defaultValue={defaultValue.name}
                />
            </div>
            <div className="my-2 py-2">
                <TextArea 
                    ref={descriptionRef}
                    required
                    title="Description: "
                    rows={4}
                    cols={48}
                    placeholder="Insert description of item here"
                    defaultValue={defaultValue.description}
                />
            </div>
            <div className="my-2 py-2">
                <label htmlFor="container-select" className="form-label input-label mt-3 fw-bold">
                    Container:
                </label>
                <select id="container-select" className='ml-4' ref={containerRef} defaultValue={defaultValue.container}>
                    {
                        containers && containers.map((value)=>{
                            return <option key={value?.id} value={value?.id}>
                                {value?.name}
                            </option>
                        })
                    }
                </select>
            </div>
        </div>
        {defaultValue.image_path && <div>
            <h2>Current Image</h2>
            <img src={`http://localhost:8081/media/${defaultValue.image_path}`} />
        </div>}
        <div>
            <h2>Image from camera</h2>
            <img src={imageUri} />
        </div>
        {cameraOn && <div>
            <Record setCameraOn={setCameraOn} setImageUri={setImageUri} />
        </div>}
        <button onClick={(e)=>{
            e.preventDefault()
            setCameraOn((cameraOn)=>!cameraOn)
        }}>Toggle Camera</button>
        {action == "Create" ? 
            <input type="submit" className="submit-btn" value="Create"/> :
            <input type="submit" className="submit-btn" value="Update" />
        }
    </form>

  );
}

export default Form;
