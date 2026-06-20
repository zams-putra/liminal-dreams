import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const loader = new GLTFLoader();
const treeGLTF = await loader.loadAsync('models/tree/scene.gltf');
const baseTree = treeGLTF.scene; 
const lampGLTF = await loader.loadAsync('models/lamp/scene.gltf');
const baseLamp = lampGLTF.scene; 
const catGLTF = await loader.loadAsync('models/cat/scene.gltf');
const baseCat = catGLTF.scene; 
const benchGLTF = await loader.loadAsync('models/bench/scene.gltf');
const baseBench = benchGLTF.scene; 
const pcGLTF = await loader.loadAsync('models/pc/scene.gltf');
const basePc = pcGLTF.scene; 



const textureLoader = new THREE.TextureLoader();
const textureTanah = await textureLoader.loadAsync( 'texture/tanah.png' );
textureTanah.wrapS = THREE.RepeatWrapping;
textureTanah.wrapT = THREE.RepeatWrapping;
textureTanah.repeat.set(10, 10); 
textureTanah.minFilter = THREE.LinearFilter;
textureTanah.magFilter = THREE.LinearFilter;


export {textureTanah, baseTree, baseLamp, baseCat, baseBench, basePc}