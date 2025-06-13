<template>
  <div class="ellabirdcam-demo">
    <!-- Streamlined Header -->
    <header class="optimizer-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">EllaBirdCam: The Great Door Mystery</h1>
          <p class="page-description">Motion-controlled camera investigation revealing how my dog Ella was mysteriously opening doors</p>
        </div>
        <div class="header-controls">
          <div class="header-actions">
            <el-button class="control-btn help-btn" type="info" size="default" circle @click="showHelp = true">
              <i class="fas fa-question-circle"></i>
            </el-button>
            <el-button class="control-btn config-btn" type="info" size="default" circle @click="showConfig = true">
              <i class="fas fa-cog"></i>
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="demo-content">
      <div class="content-container">
        <!-- Video Player Section -->
        <div class="video-section">
          <div class="video-container">
            <div class="video-placeholder">
              <i class="fas fa-video" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
              <h3>Demo Video Coming Soon</h3>
              <p>The mystery-solving footage will be available here once uploaded</p>
              <el-button type="primary" @click="playVideo" :disabled="!videoAvailable">
                <i class="fas fa-play"></i>
                Watch Investigation
              </el-button>
            </div>
          </div>
        </div>

        <!-- Story Timeline -->
        <div class="story-section">
          <el-card class="story-card" shadow="hover">
            <template #header>
              <div class="story-header">
                <i class="fas fa-search"></i>
                <span>The Investigation Timeline</span>
              </div>
            </template>
            
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-icon mystery">
                  <i class="fas fa-question-circle"></i>
                </div>
                <div class="timeline-content">
                  <h4>The Mystery</h4>
                  <p>Ella, my clever dog, was somehow escaping from a room with a securely closed door. No obvious signs of how she was getting out.</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon tech">
                  <i class="fas fa-camera"></i>
                </div>
                <div class="timeline-content">
                  <h4>Technical Solution</h4>
                  <p>Set up motion-controlled camera system using open-source software to monitor the door area and capture any movement.</p>
                </div>
              </div>
              
              <div class="timeline-item">
                <div class="timeline-icon discovery">
                  <i class="fas fa-lightbulb"></i>
                </div>
                <div class="timeline-content">
                  <h4>The Discovery</h4>
                  <p>Camera revealed Ella's technique: she was systematically testing the door handle and using her weight to open it!</p>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Technical Details -->
        <div class="tech-details">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-card class="tech-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <i class="fas fa-cogs"></i>
                    <span>Technical Implementation</span>
                  </div>
                </template>
                <ul class="tech-list">
                  <li><i class="fas fa-check"></i> Motion detection algorithms</li>
                  <li><i class="fas fa-check"></i> Automated recording triggers</li>
                  <li><i class="fas fa-check"></i> Time-stamped event logging</li>
                  <li><i class="fas fa-check"></i> Remote monitoring capabilities</li>
                </ul>
              </el-card>
            </el-col>
            
            <el-col :xs="24" :md="12">
              <el-card class="tech-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <i class="fas fa-trophy"></i>
                    <span>Results & Impact</span>
                  </div>
                </template>
                <ul class="results-list">
                  <li><i class="fas fa-star"></i> Mystery successfully solved</li>
                  <li><i class="fas fa-star"></i> Documented dog problem-solving behavior</li>
                  <li><i class="fas fa-star"></i> Improved home security awareness</li>
                  <li><i class="fas fa-star"></i> Created entertaining documentation</li>
                </ul>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- Navigation -->
        <div class="demo-navigation">
          <el-button type="default" @click="$router.push('/projects')">
            <i class="fas fa-arrow-left"></i>
            Back to Projects
          </el-button>
          <el-button type="primary" @click="$router.push('/demos')">
            <i class="fas fa-th-large"></i>
            View All Demos
          </el-button>
        </div>
      </div>
    </div>

    <!-- Help Dialog -->
    <el-dialog v-model="showHelp" title="About EllaBirdCam" width="90%" max-width="600px">
      <div class="help-content">
        <p><strong>EllaBirdCam</strong> was a fun personal project that combined problem-solving with technology.</p>
        <h4>The Challenge:</h4>
        <p>My dog Ella kept mysteriously escaping from a room, and I couldn't figure out how she was doing it.</p>
        <h4>The Solution:</h4>
        <p>Used motion detection software and a webcam to monitor the door area and capture exactly how she was escaping.</p>
        <h4>The Discovery:</h4>
        <p>Ella had learned to manipulate the door handle systematically, showing remarkable problem-solving skills!</p>
      </div>
    </el-dialog>

    <!-- Config Dialog -->
    <el-dialog v-model="showConfig" title="Demo Configuration" width="90%" max-width="500px">
      <div class="config-content">
        <el-form label-position="top">
          <el-form-item label="Video Quality">
            <el-select v-model="videoQuality" placeholder="Select quality">
              <el-option label="HD (720p)" value="hd"></el-option>
              <el-option label="Full HD (1080p)" value="fullhd"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Playback Speed">
            <el-slider v-model="playbackSpeed" :min="0.5" :max="2" :step="0.1" show-stops></el-slider>
          </el-form-item>
          <el-form-item label="Show Timestamps">
            <el-switch v-model="showTimestamps"></el-switch>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'

// State
const showHelp = ref(false)
const showConfig = ref(false)
const videoAvailable = ref(false) // Set to true when video is uploaded
const videoQuality = ref('hd')
const playbackSpeed = ref(1)
const showTimestamps = ref(true)

// Methods
const playVideo = () => {
  if (!videoAvailable.value) {
    ElNotification({
      title: 'Video Coming Soon',
      message: 'The investigation footage will be available once uploaded',
      type: 'info',
      duration: 3000
    })
    return
  }
  // Video playback logic would go here
}
</script>

<style scoped>
.ellabirdcam-demo {
  min-height: 100vh;
  background: var(--bg-color);
}

/* Header styling (following demo layout standards) */
.optimizer-header {
  background: linear-gradient(135deg, var(--section-bg) 0%, var(--background-alt) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-light);
  line-height: 1.2;
}

.page-description {
  margin: 0;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 500px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--section-bg);
  color: var(--text-color);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-btn:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

/* Main content */
.demo-content {
  padding: 0 2rem 2rem;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Video section */
.video-section {
  margin-top: 2rem;
}

.video-container {
  background: var(--card-bg);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.video-placeholder {
  padding: 4rem 2rem;
  text-align: center;
  background: var(--section-bg);
  color: var(--text-muted);
}

.video-placeholder h3 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.video-placeholder p {
  margin: 0 0 2rem 0;
  font-size: 0.9rem;
}

/* Story section */
.story-section {
  margin: 2rem 0;
}

.story-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

.story-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.story-header i {
  color: var(--primary-color);
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: -32px;
  width: 2px;
  background: var(--border-color);
}

.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.timeline-icon.mystery {
  background: var(--warning-color);
  color: white;
}

.timeline-icon.tech {
  background: var(--info-color);
  color: white;
}

.timeline-icon.discovery {
  background: var(--success-color);
  color: white;
}

.timeline-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-weight: 600;
}

.timeline-content p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Tech details */
.tech-details {
  margin: 2rem 0;
}

.tech-card {
  background: var(--card-bg);
  border-color: var(--border-color);
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.card-header i {
  color: var(--primary-color);
}

.tech-list,
.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tech-list li,
.results-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-muted);
}

.tech-list i {
  color: var(--success-color);
}

.results-list i {
  color: var(--warning-color);
}

/* Navigation */
.demo-navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

/* Help and config content */
.help-content h4 {
  color: var(--text-color);
  margin: 1rem 0 0.5rem 0;
}

.help-content p {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.config-content {
  padding: 1rem 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .optimizer-header {
    padding: 1.5rem 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .demo-content {
    padding: 0 1rem 2rem;
  }
  
  .video-placeholder {
    padding: 2rem 1rem;
  }
  
  .video-placeholder i {
    font-size: 3rem !important;
  }
  
  .timeline-item {
    gap: 0.75rem;
  }
  
  .timeline-icon {
    width: 32px;
    height: 32px;
  }
  
  .timeline-item:not(:last-child)::after {
    left: 16px;
    top: 32px;
    bottom: -24px;
  }
  
  .demo-navigation {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Theme compatibility */
.ellabirdcam-demo,
.ellabirdcam-demo * {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>