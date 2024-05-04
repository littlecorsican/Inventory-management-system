import { useState, useEffect, useRef } from 'react'
import { base } from '../utils/constant'
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

function Record(props) {

    function handleTakePhoto (dataUri) {

        console.log('takePhoto', dataUri);
        props.setImageUri(dataUri);
        props.setCameraOn(false)
    }

  return (
    <>
        <button onClick={handleTakePhoto}>Start Taking Picture</button>
        <Camera
            onTakePhoto = { (dataUri) => { handleTakePhoto(dataUri); } }
            onCameraError={()=>console.log("CAMERA ERROR")}
            isFullscreen={true}
        />
        <img src={props.image} />
    </>
  );
}

export default Record;
