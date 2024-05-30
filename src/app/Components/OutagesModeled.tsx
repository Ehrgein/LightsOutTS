import React, { useEffect, useRef } from "react";
import useGetOutageData from "../Hooks/useGetOutageData";
import { BasicOutageData, OutageDataWithETA } from "../Types/types";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";

type recordedData = {
  [key: string]: { localidad: string; afectados: number }[];
};

function OutagesModeled() {
  const { data, error, isLoading } = useGetOutageData("edesur");

  console.log(data);

  const groupedData = () => {
    if (!data) return null;

    const newOutageData: recordedData = {};

    // Destructuring the data so that we can parse whichever one we prefer here.
    const { programados, bt, mt } = data;

    // Iterating over the data so that we can decide if we need programmed outages, low tension, etc.
    bt.forEach((item: BasicOutageData) => {
      // destructuring the particular item and getting all properties
      const { partido, localidad, afectados } = item;

      if (!newOutageData[partido]) {
        // if there's no key with a 'partido' in the new object, for example 'Avellaneda', it will create it aswell as creating a new array inside it.
        newOutageData[partido] = [];
      }

      // We look for the key this specific iterated 'partido' and push its locality, affected users and eta.
      newOutageData[partido].push({ localidad, afectados });
    });

    return newOutageData;
  };

  const outageData: any | null = groupedData();

  function Model() {
    const gltf = useLoader(GLTFLoader, "MAPAEdesurCapital.glb");
    const modelRef = useRef<THREE.Group>(null);

    useEffect(() => {
      if (modelRef.current && outageData["CAPITAL"]) {
        const scene = modelRef.current;

        // Important: "CAPITAL" is the value for baja tension, but "CAPITAL FEDERAL" is the value for media tension. Perhaps make a type to decide or a condition
        const capitalOutages = outageData["CAPITAL"];

        console.log(capitalOutages);

        scene.children.forEach((child) => {
          if (!(child instanceof THREE.Mesh)) return;

          const childName = child.userData.name.trim().toLowerCase();

          const match = capitalOutages.find(
            (incident: any) =>
              incident.localidad.trim().toLowerCase() === childName
          );

          console.log(match);

          let color: THREE.ColorRepresentation = "#6ef78b"; // default green color if no match

          if (match) {
            if (match.afectados >= 35) {
              color = "#f65555"; // red - plenty affected
            } else if (match.afectados >= 3) {
              color = "#FFFF00"; // yellow - some affected
            }
          }

          const material = child.material.clone();
          material.color.set(color);
          material.needsUpdate = true; // Unsure if this is required, seems to work without it

          child.material = material;
        });
      }
    }, [gltf, outageData]);

    return <primitive ref={modelRef} object={gltf.scene} />;
  }

  return (
    <div className="w-screen h-screen">
      {isLoading && <p>Loading...</p>}

      <div className="w-screen h-screen" id="canvas-container">
        <Canvas>
          {/* Add an ambient light for better illumination */}
          <ambientLight intensity={1} />

          {/* Main point light source */}
          <pointLight position={[10, 10, 10]} intensity={1} />

          {/* Mesh with standard material */}

          {/* <mesh
            scale={[10, 10, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
          >
            <planeGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="darkgreen" side={THREE.DoubleSide} />
          </mesh> */}
          {outageData && <Model />}

          <OrbitControls />
          <Stats />
        </Canvas>
      </div>
    </div>
  );
}

export default OutagesModeled;
