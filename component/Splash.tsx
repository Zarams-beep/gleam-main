"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const letters = ['G', 'l', 'e', 'a', 'm']

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([])
  const [showSmile, setShowSmile] = useState(false)
  const [showTagline, setShowTagline] = useState(false)

  useEffect(() => {
    letters.forEach((_, i) => {
      setTimeout(() => {
        setFlippedIndexes(prev => [...prev, i])
      }, i * 500)
    })

    const smileTimer = setTimeout(() => {
      setShowSmile(true)
    }, letters.length * 500 + 300)

    const taglineTimer = setTimeout(() => {
      setShowTagline(true)
    }, letters.length * 500 + 1300)

    const finishTimer = setTimeout(() => {
      onFinish()
    }, letters.length * 500 + 3000)

    return () => {
      clearTimeout(taglineTimer)
      clearTimeout(finishTimer)
      clearTimeout(smileTimer)
    }
  }, [onFinish])

  return (
    <div className="splash-container" onClick={onFinish}>
      <div className="splash-letter-container">
        {letters.map((char, i) => (
          <div key={i} className={`card ${flippedIndexes.includes(i) ? 'flipped' : ''}`}>
            <div className="card-inner">
              <div className="card-front"></div>
              <div className="card-back">{char}</div>
            </div>
          </div>
        ))}
      </div>

      {showSmile && (
        <motion.svg
          className="smile-svg"
          viewBox="0 0 100 50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <path
            d="M10,10 Q50,50 90,10"
            className="smile-path"
            fill="transparent"
          />
        </motion.svg>
      )}

      {showTagline && (
        <motion.p
          className="splash-tagline sparkle-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Brighten Someone&apos;s Day, One Word at a Time.
        </motion.p>
      )}
    </div>
  )
}
