import * as THREE from 'three';
import { initLoadingScreen } from './utils/ui/loading.js';
import { composer } from './utils/core/sceneSetup.js';
import './utils/world/environment.js';
import { updatePlayer } from './utils/entities/player.js';
import { updateCat } from './utils/entities/cat.js';
import './utils/entities/pc.js';
import { updateInteractTarget } from './utils/ui/interactionSystem.js';

initLoadingScreen();

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    updateInteractTarget();
    updatePlayer(delta, elapsedTime);
    updateCat();

    composer.render();
}
animate();