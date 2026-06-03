import React from "react";
import { motion } from "framer-motion";
import {
  Link2,
  BarChart3,
  QrCode,
  Globe,
  Send
} from "lucide-react";

export default function AuthHeroV2() {
  return (
    <div className="hero-v2">

      {/* Background Glow */}
      <div className="hero-v2-bg" />

      {/* Orbit Ring 1 */}
      <motion.div
        className="orbit orbit-1"
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Orbit Ring 2 */}
      <motion.div
        className="orbit orbit-2"
        animate={{ rotate: -360 }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Main Content */}
      <div className="hero-v2-content">

        {/* Left Text */}
        <div className="hero-v2-text">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-v2-title"
          >
            <span>Shorten.</span>
            <span className="green">Share.</span>
            <span>Track.</span>
            <span className="green">Grow.</span>
          </motion.h1>

          <motion.p
            className="hero-v2-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Powerful links, beautiful analytics,
            and smarter growth from one platform.
          </motion.p>
        </div>

        {/* Center Scene */}
        <div className="hero-scene">

          {/* Platform */}
          <div className="energy-platform" />

          {/* Chain */}
          <motion.div
            className="chain-wrapper"
            animate={{
              y: [0, -18, 0],
              rotate: [0, 3, 0, -3, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity
            }}
          >
            <Link2
              size={240}
              strokeWidth={1.3}
              className="hero-chain-icon"
            />
          </motion.div>

          {/* Analytics Card */}
          <motion.div
            className="floating-card analytics-card"
            animate={{
              y: [0, -12, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity
            }}
          >
            <BarChart3 size={18} />
            <h4>18.7K Clicks</h4>

            <div className="mini-bars">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </motion.div>

          {/* QR Card */}
          <motion.div
            className="floating-card qr-card"
            animate={{
              y: [0, 12, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity
            }}
          >
            <QrCode size={70} />
          </motion.div>

          {/* Country Card */}
          <motion.div
            className="floating-card country-card"
            animate={{
              y: [0, -8, 0]
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity
            }}
          >
            <Globe size={18} />
            <div>
              <strong>India</strong>
              <p>48% Traffic</p>
            </div>
          </motion.div>

          {/* Share Card */}
          <motion.div
            className="floating-card share-card"
            animate={{
              y: [0, 10, 0]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity
            }}
          >
            <Send size={18} />
          </motion.div>

          {/* URL Card */}
          <motion.div
            className="floating-card url-card"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity
            }}
          >
            <div className="url-long">
              https://my-blog.com/article
            </div>

            <div className="url-arrow">
              ↓
            </div>

            <div className="url-short">
              linkreft.in/x7KdP
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}