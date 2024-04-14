import { useState, useEffect, useRef } from 'react'
import { base } from '../utils/constant'
import InputText from './form/InputText'
import TextArea from './form/TextArea'
import { types } from '../utils/constant'

function Form({
    handleSubmit,
    type="Create"
}) {

    const typeRef = useRef()
    const nameRef = useRef()
    const descriptionRef = useRef()
    const imagePathRef = useRef()
    const containerRef = useRef()

    const [containers, setContainers] = useState([])

    useEffect(()=>{
        // call url to get containers
    },[])

    const clickSubmit=(e)=>{
        const formData={
            type: typeRef.current.value,
            name: nameRef.current.value,
            description: descriptionRef.current.value,
            imagePathRef: imagePathRef,
            containerRef: containerRef,
        }
        handleSubmit(e, formData)
    }

  return (
    <form onSubmit={clickSubmit}>
        {type == "Create" && <div className="my-2 py-2">
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
            />
        </div>
        <div className="my-2 py-2">
            <TextArea 
                ref={descriptionRef}
                required
                title="Description: "
                rows={4}
                cols={48}
                placeholder="Insert description of item her"
            />
        </div>
        <div className="my-2 py-2">
            <label htmlFor="container-select" className="form-label input-label mt-3 fw-bold">
                Container:
            </label>
            <select id="container-select" className='ml-4' ref={containerRef}>
                {
                    containers && containers.map((value)=>{
                        return <option key={value?.id} value={value}>
                            {value?.name}
                        </option>
                    })
                }
            </select>
        </div>
        {type == "Create" ? <input type="submit" className="submit-btn" value="Create"/> : <input type="submit" className="submit-btn" value="Update" />}
    </form>

  );
}

export default Form;
