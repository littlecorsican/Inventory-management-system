
import {useState, useEffect, forwardRef} from 'react'
// eslint-disable-next-line react/display-name
const DropDownMenu = forwardRef(function ( props, ref ) {

  /*
    props 
      -title: string
      -data: array
      -onChange: fn
      -className: string
      -defaultValue : number
      textKey: textkey
      valueKey: value of select to get its value from ? 
  */

  return (
    <div className="w-100">
      <label htmlFor="exampleInput" className="form-label input-label mt-3 fw-bold">{props.title}</label>
      <select 
        className="form-select" 
        aria-label="Default select example" 
        id={props.id} 
        style={{backgroundColor: '#f5f5f5'}} 
        onChange={props.onChange}
        ref={ref}
        defaultValue={props.defaultValue ? props.defaultValue : -1}
      >
        {props.defaultValue == 0 ? null : <option value={-1} key={-1}>Please Select</option>}
        {/* 
          for data like this
          const salutation = {
            0 : "Mr",
            1 : "Mrs",
            2 : "Ms"
        } */}
        {
          !Array.isArray(props.data) && Object.keys(props.data).map(function(key) {
            return <option value={parseInt(key)} key={props.defaultValue == 0 ? key : parseInt(key)+1}>{props.data[key]}</option>
          })
        }
        {/* 
          for data like this
          const salutation = [
            {text: "Mr", code:"MR"},
            {text: "Mrs", code:"MRS"},
            {text: "Ms", code:"MS"},
        ] */}
        {
          Array.isArray(props.data) && props.data.map((value,index)=> {
            return <option 
              value={props.valueKey? value[props.valueKey] : index} 
              key={props.defaultValue == 0 ? index : index+1}>
                {value[props.textKey]}
              </option>
          })
        }
      </select>
    </div>
  )
})


export default DropDownMenu