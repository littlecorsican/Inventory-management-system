import {useState, forwardRef} from 'react'
import InputText from './InputText'

const TextArea = forwardRef(function ( {
  title="",
  id="camera-image",
  onChange=()=>{},
  defaultValue="",
}, ref ) {

  /*
    props 
      -title: string
      -onChange: fn
      -id: string
  */

    const openCamera=()=>{
    
    }

  return (
    <div className="mb-3">
        <label htmlFor={id} className="form-label input-label mt-3 fw-bold">
          {title}
        </label>
        <img />
        <InputText
            //ref={nameRef}
            id={id}
        />
        <button onClick={openCamera}>Camera</button>
    </div>
  )
})

export default TextArea