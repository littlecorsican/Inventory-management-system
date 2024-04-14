import {useState, useEffect, forwardRef} from 'react'

const InputText = forwardRef(function ( props, ref ) {

  /*
    props 
      -title: string
      -placeholder: string
      -onChange: fn
      -id: string
      -ref: ref
      -required:booleon
      -tooltipText: string
  */

  const [showTooltipText, setShowTooltipText] = useState(false)

  return (
    <div className="w-100 input-box-2">
        <label htmlFor={props.id} className="form-label input-label fw-bold mt-3">
          {props.title}
          {props.required || props.required == undefined ? 
            <span data-tooltip-target="tooltip-default" className="text-red-600">
              <sup>
                *
              </sup>
            </span> 
          : 
            null
          }
        </label>
        <input 
          type="text" 
          className="form-control input-box border-2 ml-4"
          {...props}
          ref={ref}
          onFocus={()=>{
            setShowTooltipText(true)
          }}
          onBlur={()=>{
            setShowTooltipText(false)
          }}
        />
        {showTooltipText && <div className="text-red-600 text-xs">
          {props?.tooltipText}
        </div>}
        {!showTooltipText && <p></p>}
    </div>
  )
})


export default InputText