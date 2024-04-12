import { useState, useEffect } from 'react'
import { base } from '../constant'

function CreateNew() {

    const types = ["Item", "Container"]



  return (
    <div className="h-screen px-12 py-8">
      <h2><u>Create New</u></h2>
        <form>
            <div className="my-2 py-2">
                <select>
                    {
                        types && types.map((value)=>{
                            return <option key={value} value={value}>
                                {value}
                            </option>
                        })
                    }
                </select>
            </div>
        </form>
    </div>
  );
}

export default CreateNew;
