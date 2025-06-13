// Project data constants
export interface ProjectMedia {
  type: 'image' | 'video' | 'gif'
  url: string
  caption: string
  thumbnail?: string
}

export interface Project {
  title: string
  subtitle?: string
  description: string
  image: string | null
  media: ProjectMedia[]
  technologies: string[]
  achievements: string[]
  github: string | null
  demo?: string | null
  externalLink?: string
  demoType: 'interactive' | 'video' | 'gallery' | 'workflow'
  categories: string[]
  featured: boolean
  year: number
}

export interface ProjectFilter {
  label: string
  value: string
}

export const PROJECT_FILTERS: ProjectFilter[] = [
  { label: 'All Projects', value: 'all' },
  { label: 'Automation', value: 'automation' },
  { label: 'Software', value: 'software' },
  { label: 'Personal', value: 'personal' }
]

export const PROJECT_DATA: Project[] = [
  {
    title: 'EllaBirdCam',
    subtitle: 'The Great Door Mystery',
    description: 'Motion-controlled camera system to solve how my dog Ella was mysteriously opening a closed door. Used open-source camera software with motion detection to catch the culprit in action.',
    image: null, // Will be video thumbnail
    media: [
      {
        type: 'video',
        url: '/videos/ella-door-mystery.mp4', // Placeholder for your video
        caption: 'Ella caught in the act of opening the door',
        thumbnail: '/images/ella-thumbnail.jpg'
      }
    ],
    technologies: ['Open Source Camera Software', 'Motion Detection', 'Webcam', 'Video Analysis'],
    achievements: [
      'Successfully identified door-opening technique',
      'Implemented automated motion detection',
      'Created entertaining technical documentation'
    ],
    github: null,
    demo: '/demos/ellabirdcam',
    demoType: 'video',
    categories: ['software', 'personal'],
    featured: true,
    year: 2021
  },
  {
    title: 'Automated HPLC Sample Preparation',
    subtitle: 'Laboratory Automation',
    description: 'Complete workflow automation for HPLC sample preparation using liquid handlers. Increased laboratory throughput by 300% while significantly reducing human error and sample contamination.',
    image: null,
    media: [],
    technologies: ['Python', 'Tecan EVOware', 'Hamilton STAR', 'Laboratory Automation'],
    achievements: [
      '300% increase in sample throughput',
      'Reduced human error by 95%',
      'Eliminated sample contamination events',
      'Standardized preparation protocols'
    ],
    github: null,
    demo: '/demos/liquid-handler',
    demoType: 'interactive',
    categories: ['automation'],
    featured: true,
    year: 2023
  },
  {
    title: 'Cell Imaging & Hit Picking Scheduler',
    subtitle: 'High-Throughput Screening',
    description: 'Intelligent scheduling system for cell imaging and hit picking determination in high-throughput screening workflows. Optimizes instrument time and sample processing order.',
    image: null,
    media: [],
    technologies: ['C#', 'XML Workflows', 'JavaScript', 'Vue.js', 'Scheduling Algorithms'],
    achievements: [
      'Optimized instrument utilization',
      'Reduced screening time by 40%',
      'Automated hit determination logic',
      'Streamlined workflow scheduling'
    ],
    github: null,
    demo: '/demos/cell-imaging-scheduler',
    demoType: 'interactive',
    categories: ['automation', 'software'],
    featured: false,
    year: 2022
  },
  {
    title: 'Laboratory Workflow Optimization',
    subtitle: 'Process Improvement',
    description: 'Comprehensive analysis and optimization of laboratory workflows using process mapping and discrete event simulation. Achieved significant improvements in turnaround times for high-priority samples.',
    image: null,
    media: [],
    technologies: ['Process Mapping', 'Discrete Event Simulation', 'Python', 'Data Analysis'],
    achievements: [
      '40% reduction in turnaround time',
      'Identified critical bottlenecks',
      'Implemented process improvements',
      'Created standardized workflows'
    ],
    github: null,
    demo: '/demos/workflow',
    demoType: 'workflow',
    categories: ['automation', 'software'],
    featured: true,
    year: 2023
  }
]