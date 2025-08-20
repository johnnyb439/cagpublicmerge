'use client'

import { motion } from 'framer-motion'
import { Quote, TrendingUp, Shield, Star } from 'lucide-react'

const stories = [
  {
    name: "Marcus Johnson",
    role: "Army National Guard → Network Administrator",
    story: "CAG helped me land a $95K position while maintaining my Guard commitment. The mock interviews were a game-changer.",
    increase: "+45%",
    clearance: "SECRET",
    rating: 5
  },
  {
    name: "Sarah Chen",
    role: "Air Force Reserve → Systems Administrator",
    story: "From help desk to sys admin in 6 months. Their guidance on translating military experience was invaluable.",
    increase: "+60%",
    clearance: "TS/SCI",
    rating: 5
  },
  {
    name: "James Rodriguez",
    role: "Navy Veteran → Cloud Engineer",
    story: "The AI interview prep helped me overcome my nervousness. Landed my dream job at a major contractor!",
    increase: "+80%",
    clearance: "SECRET",
    rating: 5
  }
]

export default function SuccessStories() {
  return (
    <section className="py-20 bg-white dark:bg-command-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-4 dark:text-white">
            Success <span className="gradient-text">Stories</span>
          </h2>
          <p className="text-xl text-intel-gray dark:text-gray-300 max-w-3xl mx-auto">
            Real cleared professionals who transformed their careers with our guidance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-dynamic-green/20" />
              
              <div className="mb-6">
                <h3 className="text-xl font-montserrat font-semibold mb-1">{story.name}</h3>
                <p className="text-sm text-intel-gray mb-3">{story.role}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-dynamic-green mr-1" />
                    <span className="text-sm font-medium">{story.clearance}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-green mr-1" />
                    <span className="text-sm font-medium text-emerald-green">{story.increase} salary</span>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-opportunity-orange fill-current" />
                  ))}
                </div>
              </div>
              
              <p className="text-intel-gray italic">"{story.story}"</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-2xl font-montserrat font-semibold mb-2">
            Join <span className="gradient-text">500+</span> Cleared Professionals
          </p>
          <p className="text-intel-gray">who've successfully transitioned to lucrative IT careers</p>
        </motion.div>
      </div>
    </section>
  )
}