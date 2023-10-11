"use client"
import { useProgress, Html } from '@react-three/drei'

const Loader = () => {
    const { progress } = useProgress()

    return(
        <Html center style={{backgroundColor: "white", color:"black"}}>
            <div style={
                {
                    fontSize: "150px"
                }
            }>
                <p>{Math.ceil(progress) + "%"}</p>
            </div>
        </Html>
    )
}

export default Loader;
