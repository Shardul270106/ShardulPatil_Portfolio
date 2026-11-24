import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const makeMaterial = (color, roughness = 0.76) =>
  new THREE.MeshStandardMaterial({ color, roughness })

function addMesh(parent, geometry, material, position, scale = [1, 1, 1]) {
  const item = new THREE.Mesh(geometry, material)
  item.position.set(...position)
  item.scale.set(...scale)
  item.castShadow = true
  item.receiveShadow = true
  parent.add(item)
  return item
}

function addSegment(parent, material, radius, start, end) {
  const geometry = new THREE.CylinderGeometry(radius * 0.84, radius, 1, 10)
  const segment = addMesh(parent, geometry, material, [0, 0, 0])
  const setPoints = (from, to) => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    segment.position.copy(a).add(b).multiplyScalar(0.5)
    segment.scale.y = a.distanceTo(b)
    segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize())
  }
  setPoints(start, end)
  return setPoints
}

function addAvatar(scene) {
  const root = new THREE.Group()
  root.scale.setScalar(1.2)
  scene.add(root)

  const shirt = makeMaterial('#70b99f')
  const shirtLight = makeMaterial('#91d1b6')
  const skin = makeMaterial('#bd805f')
  const skinLight = makeMaterial('#d49a76')
  const hair = makeMaterial('#211a1a')
  const hairLight = makeMaterial('#332625')
  const jeans = makeMaterial('#252d3b')
  const jeansLight = makeMaterial('#344052')
  const dark = makeMaterial('#101418')
  const keyMat = makeMaterial('#59646c', 0.52)
  const cream = makeMaterial('#e9dfce')
  const deskMat = makeMaterial('#6c4e3f')
  const deskEdge = makeMaterial('#9b7255')
  const screenMat = makeMaterial('#111d29', 0.38)
  const screenGlow = new THREE.MeshStandardMaterial({
    color: '#78d6c0',
    emissive: '#2a9d88',
    emissiveIntensity: 0.8,
    roughness: 0.4,
  })
  const accent = new THREE.MeshStandardMaterial({
    color: '#efb77d',
    emissive: '#6d371c',
    emissiveIntensity: 0.2,
  })

  // A quiet chair silhouette gives the little work scene some depth.
  const chair = new THREE.Group()
  chair.position.set(0, 0, -0.3)
  root.add(chair)
  addMesh(chair, new THREE.BoxGeometry(1.12, 1.18, 0.16), dark, [0, 1.48, -0.08], [1, 1, 1])
  addMesh(chair, new THREE.BoxGeometry(1.04, 0.18, 0.88), dark, [0, 0.91, 0.18])

  // Seated legs in dark denim, visible below the desk.
  addMesh(root, new THREE.CapsuleGeometry(0.22, 0.56, 4, 10), jeans, [-0.3, 0.73, 0.37], [1.15, 1, 1.15])
  addMesh(root, new THREE.CapsuleGeometry(0.22, 0.56, 4, 10), jeans, [0.3, 0.73, 0.37], [1.15, 1, 1.15])
  addMesh(root, new THREE.CapsuleGeometry(0.15, 0.36, 4, 10), jeansLight, [-0.31, 0.34, 0.18], [1, 1, 1.1])
  addMesh(root, new THREE.CapsuleGeometry(0.15, 0.36, 4, 10), jeansLight, [0.31, 0.34, 0.18], [1, 1, 1.1])
  addMesh(root, new THREE.CapsuleGeometry(0.13, 0.22, 4, 10), dark, [-0.31, 0.13, 0.39], [1.25, 0.7, 1.7])
  addMesh(root, new THREE.CapsuleGeometry(0.13, 0.22, 4, 10), dark, [0.31, 0.13, 0.39], [1.25, 0.7, 1.7])

  const torso = new THREE.Group()
  torso.position.set(0, 1.93, -0.05)
  root.add(torso)
  addMesh(torso, new THREE.CapsuleGeometry(0.42, 0.48, 5, 12), shirt, [0, 0, 0], [1.2, 1, 0.82])
  addMesh(torso, new THREE.BoxGeometry(0.18, 0.48, 0.035), shirtLight, [0, -0.04, 0.347])
  addMesh(torso, new THREE.CapsuleGeometry(0.09, 0.15, 3, 8), cream, [0, 0.38, 0.03], [1.2, 0.42, 0.8])
  for (let index = 0; index < 3; index += 1) {
    addMesh(torso, new THREE.SphereGeometry(0.025, 8, 8), accent, [0, 0.12 - index * 0.19, 0.375])
  }
  addMesh(torso, new THREE.SphereGeometry(0.12, 10, 10), shirtLight, [-0.3, -0.12, 0.34], [1, 0.6, 0.12])

  // Neck, face, ears, and a loose swept fringe echo the photo's broad features.
  addMesh(root, new THREE.CylinderGeometry(0.15, 0.17, 0.34, 12), skin, [0, 2.5, -0.015])
  const head = new THREE.Group()
  head.position.set(0, 2.83, 0.02)
  root.add(head)
  addMesh(head, new THREE.SphereGeometry(0.39, 20, 16), skin, [0, 0, 0], [0.91, 1.12, 0.82])
  addMesh(head, new THREE.SphereGeometry(0.1, 12, 10), skinLight, [-0.34, -0.02, 0], [0.72, 1, 0.75])
  addMesh(head, new THREE.SphereGeometry(0.1, 12, 10), skinLight, [0.34, -0.02, 0], [0.72, 1, 0.75])
  addMesh(head, new THREE.SphereGeometry(0.42, 24, 16), hair, [0, 0.18, -0.035], [1, 0.68, 0.86])
  const fringe = addMesh(head, new THREE.SphereGeometry(0.24, 18, 12), hairLight, [-0.12, 0.13, 0.245], [1.18, 0.38, 0.48])
  fringe.rotation.z = -0.26
  const sweptLock = addMesh(head, new THREE.SphereGeometry(0.16, 16, 12), hair, [0.12, 0.15, 0.2], [1.05, 0.42, 0.44])
  sweptLock.rotation.z = 0.18
  for (const side of [-1, 1]) {
    const sideLock = addMesh(head, new THREE.CapsuleGeometry(0.075, 0.1, 4, 8), hairLight, [side * 0.32, -0.015, 0.04], [0.8, 1, 0.78])
    sideLock.rotation.z = side * -0.16
  }
  for (const x of [-0.145, 0.145]) {
    addMesh(head, new THREE.SphereGeometry(0.044, 10, 8), cream, [x, -0.025, 0.302], [1, 0.76, 0.46])
    addMesh(head, new THREE.SphereGeometry(0.022, 10, 8), dark, [x, -0.025, 0.324], [1, 1, 0.52])
    addMesh(head, new THREE.SphereGeometry(0.012, 8, 8), cream, [x - 0.007, -0.014, 0.336])
    addMesh(head, new THREE.CapsuleGeometry(0.015, 0.08, 3, 6), hair, [x, 0.06, 0.3], [1, 0.6, 1])
  }
  addMesh(head, new THREE.SphereGeometry(0.045, 10, 8), skinLight, [0, -0.11, 0.32], [0.68, 0.72, 0.6])
  addMesh(head, new THREE.CapsuleGeometry(0.014, 0.09, 3, 6), hair, [0, -0.235, 0.29], [1.15, 0.28, 0.72])

  const shoulders = [
    [-0.47, 2.28, -0.005],
    [0.47, 2.28, -0.005],
  ]
  const armParts = shoulders.map((shoulder) => {
    const cuff = addMesh(root, new THREE.SphereGeometry(0.14, 12, 10), shirt, shoulder, [1.12, 1, 1])
    const upper = addSegment(root, shirt, 0.12, shoulder, shoulder)
    const elbow = addMesh(root, new THREE.SphereGeometry(0.115, 12, 10), shirt, shoulder)
    const forearm = addSegment(root, shirt, 0.095, shoulder, shoulder)
    const hand = new THREE.Group()
    root.add(hand)
    addMesh(hand, new THREE.SphereGeometry(0.095, 12, 10), skinLight, [0, 0, 0], [1.25, 0.58, 0.82])
    for (const offset of [-0.052, 0, 0.052]) {
      const finger = addMesh(
        hand,
        new THREE.CapsuleGeometry(0.015, 0.06, 3, 6),
        skinLight,
        [offset, -0.012, 0.105],
        [0.78, 0.78, 0.78],
      )
      finger.rotation.x = Math.PI / 2
    }
    return { shoulder, cuff, upper, elbow, forearm, hand }
  })

  // A separate monitor and keyboard keep the hands visibly on the keys.
  addMesh(root, new THREE.BoxGeometry(3.6, 0.16, 1.05), deskMat, [0, 1.35, 0.69])
  addMesh(root, new THREE.BoxGeometry(3.65, 0.07, 1.08), deskEdge, [0, 1.445, 0.69])
  for (const x of [-1.45, 1.45]) {
    addMesh(root, new THREE.BoxGeometry(0.13, 1.28, 0.16), dark, [x, 0.7, 0.55])
  }
  addMesh(root, new THREE.BoxGeometry(0.38, 0.035, 0.28), dark, [0.06, 1.505, 0.88])
  addMesh(root, new THREE.BoxGeometry(0.14, 0.37, 0.085), dark, [0.06, 1.685, 0.88])
  addMesh(root, new THREE.BoxGeometry(1.02, 0.5, 0.07), dark, [0.06, 2.1, 0.88])
  // The glass and UI face back toward Shardul; the viewer sees the monitor's rear shell.
  addMesh(root, new THREE.BoxGeometry(0.92, 0.42, 0.018), screenMat, [0.06, 2.1, 0.839])
  addMesh(root, new THREE.TorusGeometry(0.09, 0.012, 8, 24), screenGlow, [0.06, 2.1, 0.821])
  addMesh(root, new THREE.SphereGeometry(0.025, 10, 8), screenGlow, [0.06, 2.1, 0.82])
  for (let index = 0; index < 4; index += 1) {
    addMesh(root, new THREE.BoxGeometry(0.4, 0.012, 0.008), keyMat, [-0.15, 1.93 + index * 0.06, 0.922])
  }
  for (let index = 0; index < 5; index += 1) {
    addMesh(root, new THREE.BoxGeometry(0.09, 0.014, 0.014), screenGlow, [-0.29 + index * 0.16, 1.93, 0.82])
  }
  addMesh(root, new THREE.BoxGeometry(1.18, 0.05, 0.5), screenMat, [0.06, 1.515, 0.48])
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      const x = -0.42 + column * 0.105
      const z = 0.3 + row * 0.13
      addMesh(root, new THREE.BoxGeometry(0.07, 0.013, 0.052), keyMat, [x, 1.547, z])
    }
  }

  const setArm = (part, elbow, wrist) => {
    const shoulder = part.shoulder
    part.upper(shoulder, elbow)
    part.elbow.position.set(...elbow)
    part.forearm(elbow, wrist)
    part.hand.position.set(...wrist)
  }

  return {
    head,
    setArm,
    armParts,
    shirt,
  }
}

function AvatarFallback() {
  return (
    <svg className="avatar-scene__fallback" viewBox="0 0 760 420" aria-hidden="true">
      <ellipse cx="380" cy="365" rx="240" ry="24" fill="currentColor" opacity=".08" />
      <path d="M177 342v-86q0-20 20-20h366q20 0 20 20v86" fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="14" />
      <path d="M169 278h422l-22 20H191z" fill="#9b7255" />
      <path d="M198 297v66m364-66v66" stroke="#252b32" strokeWidth="14" />
      <path d="M278 350q-18-76 30-118h143q48 42 30 118" fill="#70b99f" />
      <path d="M322 353h44l-11 54h-40zm77 0h44l7 54h-42z" fill="#252d3b" />
      <ellipse cx="377" cy="150" rx="62" ry="72" fill="#bd805f" />
      <path d="M318 155q-6-91 65-88 68 4 59 93-15-36-28-50-42 35-96 31z" fill="#211a1a" />
      <circle cx="355" cy="154" r="5" fill="#101418" /><circle cx="399" cy="154" r="5" fill="#101418" />
      <path d="M370 183q9 7 18 0" fill="none" stroke="#653e35" strokeWidth="4" strokeLinecap="round" />
      <path d="M309 225 348 273m97-48-30 48" fill="none" stroke="#70b99f" strokeWidth="25" strokeLinecap="round" />
      <rect x="422" y="176" width="115" height="82" rx="7" fill="#101418" />
      <rect x="429" y="183" width="101" height="67" rx="3" fill="#17242d" />
      <circle cx="480" cy="216" r="13" fill="none" stroke="#78d6c0" strokeWidth="3" />
    </svg>
  )
}

export default function AvatarScene() {
  const mountRef = useRef(null)
  const actionRef = useRef({ kind: 'idle', startedAt: 0 })
  const [action, setAction] = useState('idle')

  const perform = (kind) => {
    actionRef.current = { kind, startedAt: performance.now() }
    setAction(kind)
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    const stage = mount.closest('.avatar-scene__stage')

    let renderer
    let visible = true
    let disposed = false
    let motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
    camera.position.set(0, 3.65, 7.7)
    camera.lookAt(0, 1.78, 0.15)

    scene.add(new THREE.HemisphereLight('#fff4e7', '#25262d', 2.0))
    const keyLight = new THREE.DirectionalLight('#ffe8ce', 3.1)
    keyLight.position.set(-3.6, 6, 5)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight('#9bded2', 1.1)
    fillLight.position.set(4, 3.4, -3)
    scene.add(fillLight)

    let avatar
    try {
      avatar = addAvatar(scene)
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      stage?.classList.add('has-fallback')
      return () => stage?.classList.remove('has-fallback')
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const resize = () => {
      if (disposed) return
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.position.z = width / height < 1 ? 10.5 : 7.7
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderer.render(scene, camera)
    }

    const animate = (time) => {
      if (disposed || !visible || document.hidden) return
      const seconds = time * 0.001
      const currentAction = actionRef.current
      const actionElapsed = (time - currentAction.startedAt) / 1000
      let wave = 0
      let stretch = 0
      if (motionAllowed && currentAction.kind === 'wave' && actionElapsed < 1.9) {
        wave = Math.sin(Math.min(actionElapsed / 0.32, 1) * Math.PI / 2) * (1 - Math.max(0, actionElapsed - 1.2) / 0.7)
      } else if (motionAllowed && currentAction.kind === 'stretch' && actionElapsed < 2.1) {
        stretch = Math.sin(Math.min(actionElapsed / 0.38, 1) * Math.PI / 2) * (1 - Math.max(0, actionElapsed - 1.35) / 0.75)
      } else if (currentAction.kind !== 'idle') {
        actionRef.current = { kind: 'idle', startedAt: time }
        setAction('idle')
      }

      if (motionAllowed) {
        avatar.head.rotation.z = Math.sin(seconds * 1.1) * 0.018 + wave * Math.sin(actionElapsed * 9) * 0.04
        avatar.head.rotation.x = Math.sin(seconds * 1.4) * 0.012
        avatar.armParts.forEach((part, index) => {
          const sign = index === 0 ? -1 : 1
          const typing = Math.sin(seconds * 8 + index * Math.PI) * 0.025
          const shoulder = part.shoulder
          let elbow = [sign * 0.55, 1.82 + typing, 0.23]
          let wrist = [sign * 0.22, 1.6 + typing, 0.48]

          if (index === 1 && wave > 0) {
            elbow = [0.82 + wave * 0.1, 2.36 + wave * 0.28, 0.11]
            wrist = [0.93 + wave * 0.12 + Math.sin(actionElapsed * 12) * 0.12 * wave, 2.82 + wave * 0.15, 0.12]
          } else if (stretch > 0) {
            const lift = stretch * (index === 0 ? 0.82 : 0.95)
            elbow = [sign * (0.84 + lift * 0.2), 2.13 + lift * 0.6, -0.02]
            wrist = [sign * (1.1 + lift * 0.24), 2.3 + lift * 0.9, -0.02]
          }
          avatar.setArm(part, elbow, wrist)
          part.cuff.position.set(...shoulder)
          part.hand.rotation.z = index === 1 && wave > 0 ? Math.sin(actionElapsed * 12) * 0.36 * wave : 0
        })
      }

      renderer.render(scene, camera)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) renderer.setAnimationLoop(animate)
      else renderer.setAnimationLoop(null)
    }, { threshold: 0.02 })
    visibilityObserver.observe(mount)

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = (event) => {
      motionAllowed = !event.matches
      if (!motionAllowed) {
        actionRef.current = { kind: 'idle', startedAt: performance.now() }
        setAction('idle')
      }
    }
    const onVisibilityChange = () => {
      if (document.hidden) renderer.setAnimationLoop(null)
      else if (visible) renderer.setAnimationLoop(animate)
    }
    motionQuery.addEventListener('change', onMotionChange)
    document.addEventListener('visibilitychange', onVisibilityChange)
    renderer.setAnimationLoop(animate)
    resize()

    return () => {
      disposed = true
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      motionQuery.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      scene.traverse((item) => {
        if (item.geometry) item.geometry.dispose()
        if (item.material) {
          const materials = Array.isArray(item.material) ? item.material : [item.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="avatar-scene">
      <button
        className="avatar-scene__stage"
        type="button"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          const x = (event.clientX - bounds.left) / bounds.width
          const y = (event.clientY - bounds.top) / bounds.height
          if (x > 0.34 && x < 0.66 && y > 0.12 && y < 0.78 && actionRef.current.kind === 'idle') {
            perform('wave')
          }
        }}
        onClick={() => perform('stretch')}
        aria-label="Shardul working at a computer. Hover over the character to wave, or activate to take a stretch break."
      >
        <AvatarFallback />
        <div className="avatar-scene__canvas" ref={mountRef} />
      </button>
      <span className="avatar-scene__announcement" aria-live="polite">
        {action === 'wave' ? 'Waving hello.' : action === 'stretch' ? 'Taking a stretch break.' : 'Working at the computer.'}
      </span>
    </div>
  )
}
