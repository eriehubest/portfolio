import 'public/src/style.scss'
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js";

const canvas = document.querySelector("#experience-canvas")
const sizes = {
    height: window.innerHeight,
    width: window.innerWidth
}

const textureLoader = new THREE.TextureLoader()

const loader = new GLTFLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
loader.setDRACOLoader( dracoLoader )

const textureMap = {
    Walls: {
        day:"/textures/Walls.webp-n"
    },
    Table: {
        day:"/textures/Table.webp-n"
    },
    Piano: {
        day:"public/textures/Piano-specific.webp"
    },
    PC: {
        day:"/textures/PC.webp-n"
    },
    Mis: {
        day:"/textures/Miscellaneous.webp-n"
    },
    Chair: {
        day:"public/textures/Chair.webp"
    },
    Button: {
        day:"/textures/Buttons.webp-n"
    }
}

const loadedTextures = {
    day:{}
}
Object.entries(textureMap).forEach(([key, paths]) => {
    const dayTexture = textureLoader.load(paths.day)
    dayTexture.flipY = false
    loadedTextures.day[key] = dayTexture
})

loader.load("public/models/room-v3.glb", (glb)=>{
    glb.scene.traverse(child=>{
        if(child.isMesh){
            Object.keys(textureMap).forEach(key=>{
                if(child.name.includes(key)){
                    const material = new THREE.MeshBasicMaterial({
                        map:loadedTextures.day[key]
                    })

                    child.material = material
                }
            })
        }

        scene.add(glb.scene)
    })
})


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true
controls.dampingFactor = 0.05

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function render() {
    controls.update();
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();
