import { useEffect, useRef, useState } from 'react'

export default function AvatarSceneEntry() {
  const entryRef = useRef(null)
  const [Scene, setScene] = useState(null)

  useEffect(() => {
    const entry = entryRef.current
    if (!entry) return undefined
    let active = true
    const observer = new IntersectionObserver(([intersection]) => {
      if (!intersection.isIntersecting) return
      observer.disconnect()
      import('./AvatarScene')
        .then((module) => {
          if (active) setScene(() => module.default)
        })
        .catch(() => {})
    }, { rootMargin: '120px' })
    observer.observe(entry)

    return () => {
      active = false
      observer.disconnect()
    }
  }, [])

  return Scene ? (
    <Scene />
  ) : (
    <div className="avatar-scene-entry" ref={entryRef} aria-hidden="true">
      <div className="avatar-scene__stage avatar-scene__stage--placeholder" />
    </div>
  )
}
