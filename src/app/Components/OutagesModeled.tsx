import React, { useEffect, useRef } from "react";
import useGetOutageData from "../Hooks/useGetOutageData";
import { BasicOutageData, OutageDataWithETA } from "../Types/types";
import {
  Canvas,
  useLoader,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { useSpring, animated, useSprings } from "@react-spring/three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";
import { useSearchParams } from "next/navigation";
import { compare } from "swr/_internal";

type recordedData = {
  [key: string]: { localidad: string; afectados: number }[];
};

function OutagesModeled() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");

  const { data, error, isLoading } = useGetOutageData("edesur");

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
    const gltf = useLoader(GLTFLoader, "testingmap4.glb");
    const modelRef = useRef<THREE.Group>(null);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const prevActiveIndexRef = useRef<number | null>(null);

    const { camera, gl } = useThree();

    const [springs, api] = useSprings(
      modelRef.current?.children.length || 0,
      () => ({
        scaleY: 1,
        config: { tension: 170, friction: 26 },
      }),
      []
    );

    const handleScaleonClick = (event: ThreeEvent<MouseEvent>) => {
      const clickedElement = event.object.userData.name;
      let comparedIndex;

      comparedIndex = modelRef.current.children.findIndex((child) => {
        return child.userData.name === clickedElement;
      });

      setActiveIndex((prevIndex) => {
        if (prevIndex !== null) {
          // Reset the scale of the previously active element
          api.start((i) => (i === prevIndex ? { scaleY: 1 } : {}));
        }

        if (comparedIndex === prevIndex) {
          // If the same element is clicked, check the current scale and then set either 15 or 1
          api.start((i) =>
            i === comparedIndex
              ? { scaleY: springs[comparedIndex].scaleY.get() === 1 ? 4 : 1 }
              : {}
          );
          return null;
        } else {
          // Scale up the newly clicked element
          api.start((i) => (i === comparedIndex ? { scaleY: 4 } : {}));

          return comparedIndex;
        }
      });
    };

    useFrame(() => {
      if (modelRef.current) {
        springs.forEach((spring, index) => {
          //@ts-ignore
          if (modelRef.current.children[index]) {
            //@ts-ignore
            modelRef.current.children[index].scale.y = spring.scaleY.get();
          }
        });
      }
    });

    const handlePointerOver = () => {
      gl.domElement.style.cursor = "pointer";
    };

    const handlePointerOut = () => {
      gl.domElement.style.cursor = "default";
    };

    useEffect(() => {
      if (modelRef.current && outageData["CAPITAL"]) {
        const scene = modelRef.current;

        // Important: "CAPITAL" is the value for baja tension, but "CAPITAL FEDERAL" is the value for media tension. Perhaps make a type to decide or a condition
        const capitalOutages = outageData["CAPITAL"];

        scene.children.forEach((child) => {
          if (!(child instanceof THREE.Mesh)) return;

          const childName = child.userData.name.trim().toLowerCase();

          const match = capitalOutages.find(
            (incident: any) =>
              incident.localidad.trim().toLowerCase() === childName
          );

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

    return (
      <primitive
        ref={modelRef}
        object={gltf.scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleScaleonClick}
      />
    );
  }

  return (
    <div className="w-screen h-screen">
      {isLoading && <p>Loading...</p>}

      <div className="w-screen h-screen" id="canvas-container">
        <Canvas camera={{ fov: 60, position: [0, 0, 10] }}>
          {/* Add an ambient light for better illumination */}
          <ambientLight intensity={1} />
          {/* Main point light source */}
          <pointLight position={[10, 10, 10]} intensity={1} />

          {/* Mesh with standard material */}
          {outageData && <Model />}

          <OrbitControls />
          <Stats />
        </Canvas>
      </div>
    </div>
  );
}

export default OutagesModeled;
