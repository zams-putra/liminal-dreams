import * as THREE from 'three';
import { scene } from '../core/sceneSetup.js';
import { baseTree, baseBench, baseLamp, textureTanah } from '../core/loader.js';

export const obstacles = [];

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    //   new THREE.MeshStandardMaterial({ color: 0x303030 })
    new THREE.MeshStandardMaterial({ map: textureTanah })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const hemiLight = new THREE.HemisphereLight(0x8a93a0, 0x4a4a3a, 0.9);
// const hemiLight = new THREE.HemisphereLight(0x1a2440, 0x05050a, 0.3);
scene.add(hemiLight);

// const light = new THREE.DirectionalLight(0xaab4c0 , 0.15);
const light = new THREE.DirectionalLight(0x8fa8c8, 0.2);
light.position.set(5, 10, 5);
light.castShadow = true;
scene.add(light);

// mode garis2 ngedesign tanah
// const grid = new THREE.GridHelper(50, 50, 0x555566, 0x404048);
// scene.add(grid);

for (let i = 0; i < 8; i++) {
    const tree = baseTree.clone();
    tree.position.set((Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30);
    tree.scale.set(0.07, 0.07, 0.07);
    scene.add(tree);
    obstacles.push(tree);

    const bench = baseBench.clone();
    bench.position.set((Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30);
    bench.scale.set(0.01, 0.01, 0.01);
    bench.rotation.y = -(Math.PI / 2);
    scene.add(bench);
    obstacles.push(bench);
}

for (let i = 0; i < 6; i++) {

    // const orb = new THREE.Mesh(
    //     new THREE.SphereGeometry(0.2, 16, 16),
    //     new THREE.MeshStandardMaterial({
    //     emissive: 0xffddaa,
    //     emissiveIntensity: 2,
    //     color: 0xffddaa,
    //     })
    // );
    // orb.position.set((Math.random() - 0.5) * 30, 1.5, (Math.random() - 0.5) * 30);
    // scene.add(orb);
    // orbs.push(orb);
    
    const randomX = (Math.random() - 0.5) * 30;
    const randomZ = (Math.random() - 0.5) * 30;

    const lamp = baseLamp.clone();
    lamp.position.set(randomX, 0, randomZ);
    lamp.scale.set(0.07, 0.07, 0.07);
    scene.add(lamp);
    obstacles.push(lamp);

    const lightColor = 0xffaa55;
    const pointLight = new THREE.PointLight(lightColor, 2, 12);
    const bulbHeight = 3.1;
    pointLight.position.set(randomX, bulbHeight, randomZ);
    scene.add(pointLight);

    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({
            emissive: lightColor,
            emissiveIntensity: 4,
            color: lightColor,
        })
    );
    bulb.position.copy(pointLight.position);
    scene.add(bulb);
}

// partikel
const particleCount = 500;
const particleGeometry = new THREE.BufferGeometry();
const particleMaterial = new THREE.PointsMaterial({
    color: 0x8fa8c8,
    size: 0.05,
    transparent: true,
    opacity: 0.4
});

const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
    particlePositions[i] = (Math.random() - 0.5) * 50;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
export const dustParticles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(dustParticles);

dustParticles.rotation.y += 0.0005;
dustParticles.position.y = Math.sin(0) * 0.5;