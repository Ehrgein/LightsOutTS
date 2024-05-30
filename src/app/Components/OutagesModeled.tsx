import React, { useEffect, useRef } from "react";
import useGetOutageData from "../Hooks/useGetOutageData";
import { BasicOutageData, OutageDataWithETA } from "../Types/types";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";

type recordedData = {
  [key: string]: { localidad: string; afectados: number }[];
};

function OutagesModeled() {
  const { data, error, isLoading } = useGetOutageData("edenor");

  console.log();

  const groupedData = () => {
    if (!data) return null;

    const newOutageData: recordedData = {};

    // Destructuring the data so that we can parse whichever one we prefer here.
    const { programados, bt, mt } = data;

    // Iterating over the data so that we can decide if we need programmed outages, low tension, etc.
    bt.forEach((item: BasicOutageData) => {
      // destructuring the particular item and getting all values
      const { partido, localidad, afectados } = item;

      if (!newOutageData[partido]) {
        // if there's no key with a 'partido' in the new object, for example 'Avellaneda', it will create it aswell as creating a new array inside it.
        newOutageData[partido] = [];
      }

      // We look for the key this specific iterated 'partido' and push its locality, affected users and eta.
      newOutageData[partido].push({ localidad, afectados });
    });

    console.log(newOutageData, "this is the data we are sendnig");

    return newOutageData;
  };

  const outageData: any | null = groupedData();

  function Model() {
    const gltf = useLoader(GLTFLoader, "MAPAEdesurCapital.glb");
    const modelRef = useRef<THREE.Group>(null);

    let matchedCount = 0;

    useEffect(() => {
      if (modelRef.current && outageData["CAPITAL"]) {
        const scene = modelRef.current;

        console.log(outageData);

        scene.children.forEach((child) => {
          const childName = child.userData.name.trim().toLowerCase();

          const match = outageData["CAPITAL"].find(
            (incident: any) =>
              incident.localidad.trim().toLowerCase() === childName
          );

          let color: THREE.ColorRepresentation | undefined;

          if (match) {
            console.log(
              `Match found for ${childName}: ${match.afectados} afectados`
            );
            matchedCount++;

            if (match.afectados >= 35) {
              color = "red";
            } else if (match.afectados >= 6) {
              color = "yellow";
            } else if (match.afectados <= 5) {
              color = "green";
            }

            if (child instanceof THREE.Mesh) {
              const material = child.material.clone();

              material.color.set(color);
              material.needsUpdate = true; // Ensure the material updates

              child.material = material;
            }
          }
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

          <mesh
            scale={[10, 10, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
          >
            <planeGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="darkgreen" side={THREE.DoubleSide} />
          </mesh>
          {outageData && <Model />}

          <OrbitControls />
          <Stats />
        </Canvas>
      </div>
    </div>
  );
}

export default OutagesModeled;
