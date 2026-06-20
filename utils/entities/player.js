import * as THREE from 'three';
import { scene, camera } from '../core/sceneSetup.js';
import { obstacles } from '../world/environment.js';
import { state } from '../core/state.js';

export const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x555570 })
);
player.position.set(0, 0.5, 0);
scene.add(player);

const cameraOffset = new THREE.Vector3(5, 7, 5);
export const moveInput = new THREE.Vector3();

const keys = { top: false, bottom: false, left: false, right: false };

addEventListener('keydown', (e) => {
    if (state.terminalOpen) return;
    switch (e.code) {
        case 'KeyW': keys.top = true; break;
        case 'KeyA': keys.left = true; break;
        case 'KeyS': keys.bottom = true; break;
        case 'KeyD': keys.right = true; break;
    }
});

addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyW': keys.top = false; break;
        case 'KeyA': keys.left = false; break;
        case 'KeyS': keys.bottom = false; break;
        case 'KeyD': keys.right = false; break;
    }
});

const playerRadius = 0.6;
const obstacleRadius = 0.07;

function isCollidingWithObstacles(position) {
    for (const obstacle of obstacles) {
        const dx = position.x - obstacle.position.x;
        const dz = position.z - obstacle.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < playerRadius + obstacleRadius) return true;
    }
    return false;
}

// joystick
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
const maxRadius = 45;

let joystickActive = false;
let joystickPointerId = null;
let startX = 0;
let startZ = 0;

window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    if (e.clientX > window.innerWidth / 2) return;

    joystickActive = true;
    joystickPointerId = e.pointerId;
    joystickBase.style.left = (e.clientX - 45) + 'px';
    joystickBase.style.top = (e.clientY - 45) + 'px';
    joystickBase.style.opacity = '1';
    startX = e.clientX;
    startZ = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!joystickActive || e.pointerId !== joystickPointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startZ;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const clampedDistance = Math.min(distance, maxRadius);

    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDistance;
    const knobY = Math.sin(angle) * clampedDistance;

    joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    moveInput.x = knobX / maxRadius;
    moveInput.z = knobY / maxRadius;
});

window.addEventListener('pointerup', (e) => {
    if (e.pointerId !== joystickPointerId) return;
    joystickActive = false;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
    moveInput.set(0, 0, 0);
    joystickBase.style.opacity = '0';
});

export function updatePlayer(delta, elapsedTime) {
    if (!joystickActive) {
        moveInput.x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
        moveInput.z = (keys.bottom ? 1 : 0) - (keys.top ? 1 : 0);
        if (moveInput.lengthSq() > 0) moveInput.normalize();
    }

    const speed = 5;
    const moveDirection = moveInput.clone().multiplyScalar(speed * delta);
    const candidatePosition = player.position.clone().add(moveDirection);

    const boundLimit = 24;
    candidatePosition.x = THREE.MathUtils.clamp(candidatePosition.x, -boundLimit, boundLimit);
    candidatePosition.z = THREE.MathUtils.clamp(candidatePosition.z, -boundLimit, boundLimit);

    if (!isCollidingWithObstacles(candidatePosition)) {
        player.position.copy(candidatePosition);
    }

    camera.position.copy(player.position).add(cameraOffset);
    camera.lookAt(player.position);

    if (moveInput.lengthSq() > 0) {
        camera.position.y += Math.sin(elapsedTime * 8) * 0.05;
    }
}