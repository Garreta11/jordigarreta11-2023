"use client"
import { useProgress, Html } from '@react-three/drei'

const Loader = () => {
    const { progress } = useProgress()

    return(
        <Html center style={{backgroundColor: "transparent", color:"white"}}>
            <div style={
                {
                    fontSize: "2em"
                }
            }>
                <p>WORK</p>
            </div>
        </Html>
    )
}

export default Loader;
