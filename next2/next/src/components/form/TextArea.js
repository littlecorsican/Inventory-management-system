import {useState, forwardRef} from 'react'

const TextArea = forwardRef(function ( {
  title="",
  required=true,
  id="text_area",
  rows=3,
  cols=12,
  onChange=()=>{},
  defaultValue="",
  placeholder=""
}, ref ) {

  /*
    props 
      -title: string
      -placeholder: string
      -onChange: fn
      -id: string
      -required:boolean
      -row: integer
      -cols: integer
  */

  return (
    <div className="mb-3">
        <label htmlFor={id} className="form-label input-label mt-3 fw-bold">
          {title}
          {required? <span className="text-red-600"><sup>*</sup></span> : null}
        </label>
        <textarea 
          className="form-control w-100 text-area border-2 ml-4"
          id={id}
          rows={rows}
          cols={cols}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          ref={ref}
        />
    </div>
  )
})

export default TextArea