import * as THREE from 'three';

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x202025, 1, 35);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(scene.fog.color);
document.body.appendChild(renderer.domElement);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x303030 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

scene.add(new THREE.AmbientLight(0x404050, 1));
const light = new THREE.DirectionalLight(0x8899aa, 0.6);
light.position.set(5, 10, 5);
scene.add(light);

const grid = new THREE.GridHelper(50, 50, 0x555566, 0x404048);
scene.add(grid);

for (let i = 0; i < 8; i++) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x555570 })
  );
  box.position.set((Math.random() - 0.5) * 30, 1, (Math.random() - 0.5) * 30);
  scene.add(box);
}



const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x555570})
)
player.position.set(0, 0.5, 0)
scene.add(player)



const cameraOffset = new THREE.Vector3(8, 10, 8)

const keys = {
    top: false,
    bottom: false,
    left: false,
    right: false,
}


addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'KeyW':
            keys.top = true
            break
        case 'KeyA':
            keys.left = true
            break
        case 'KeyS':
            keys.bottom = true
            break
        case 'KeyD':
            keys.right = true
            break
    }
})

addEventListener('keyup', (e) => {
        switch(e.code) {
        case 'KeyW':
            keys.top = false
            break
        case 'KeyA':
            keys.left = false
            break
        case 'KeyS':
            keys.bottom = false
            break
        case 'KeyD':
            keys.right = false
            break
    }
})

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const speed = 0.1;

    const moveDirection = new THREE.Vector3()
    moveDirection.x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
    moveDirection.z = (keys.bottom ? 1 : 0) - (keys.top ? 1 : 0)

    moveDirection.normalize(speed * delta)
    player.position.add(moveDirection)

    camera.position.copy(player.position).add(cameraOffset)
    camera.lookAt(player.position)


    renderer.render(scene, camera);
}
animate();