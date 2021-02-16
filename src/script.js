import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Debug
const gui = new dat.GUI({closed:true})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//TEXTO
const fontLoader = new THREE.FontLoader();
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new THREE.TextGeometry(
            'GRID', {
                font: font,
                size:3,
                height:0.2,
                curveSegment: 5,
                bevelEnabled : true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        );
        textGeometry.center();

        const material = new THREE.MeshStandardMaterial();
        //material.matcap = matcapTexture;
        //material.wireframe = true;
        const text = new THREE.Mesh(textGeometry,material);
        scene.add(text);
    }
);

//Gui GALAXY
const parameters = {}
parameters.count = 5000   
parameters.size = 0.01     
parameters.radius = 6
parameters.branches = 4
parameters.spin = 0.8
parameters.randomness = 0.5
parameters.randomnessPower = 3
parameters.insideColor = '#ff0000'
parameters.outsideColor = '#0000ff'
parameters.numberOfGalaxies = 1000

/*gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxies)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxies)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxies)
gui.add(parameters, 'branches').min(2).max(10).step(1).onFinishChange(generateGalaxies)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxies)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxies)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxies)
gui.add(parameters, 'numberOfGalaxies').min(1).max(100).step(1).onFinishChange(generateGalaxies)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxies)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxies)*/


//GALAXY

let geometry = null
let material = null
let points = []
let numberOfGalaxies = parameters.numberOfGalaxies

function generateGalaxies() {

    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++){
        const i3 = i*3
        //position
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * (parameters.randomness * Math.random() + 0.1 * 2) * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * (parameters.randomness * Math.random() + 0.1 * 2) * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * (parameters.randomness * Math.random() + 0.1 * 2) * radius

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX//x
        positions[i3 + 1] = randomY//y
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ//z
        
        //colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r * Math.random()
        colors[i3 + 1] = mixedColor.g * Math.random()
        colors[i3 + 2] = mixedColor.b * Math.random()
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions,3)
    )
    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors,3)
    )
        /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    for (let i = 0; i < numberOfGalaxies; i++) {
        const velocity = Math.random() * 2000
        points.push(new THREE.Points(geometry,material))
        scene.add(points[i])
        points[i].position.z += (Math.random() - 0.5)  * 300
        points[i].position.x += (Math.random() - 0.5)  * 300        
        points[i].position.y += (Math.random() - 0.5)  * 300        
        points[i].rotation.y = Math.random() * Math.PI
        points[i].rotation.z = Math.random() * Math.PI
        points[i].rotation.y = velocity * Math.PI
    }

    
}

generateGalaxies()

//LIGTHS
const hemisphereLight = new THREE.HemisphereLight('purple','cyan');
hemisphereLight.intensity = 0.8
scene.add(hemisphereLight); 

const rectAreaLight = new THREE.RectAreaLight('cyan',10);
scene.add(rectAreaLight);

/*const frontPointLight = new THREE.PointLight('white')
const backPointLight = new THREE.PointLight('white')
frontPointLight.distance = 8
backPointLight.distance = 8
frontPointLight.position.set(0,0,4)
backPointLight.position.set(0,0,-4)
scene.add(frontPointLight,backPointLight)*/

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//FULL SCREEN
window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.y = 3
camera.position.z = 7   
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //update Galaxies
    for (let i = 0; i < points.length; i++) {
        points[i].rotation.y += 0.008
    }
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()