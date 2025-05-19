<template>
  <div class="experience-page">
    <div class="container">
      <header class="page-header">
        <h1>Experience</h1>
        <p class="lead">Professional background and expertise</p>
        <div class="resume-download">
          <a href="/resume.pdf" download class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Resume
          </a>
        </div>
      </header>

      <div class="experience-timeline">
        <div class="timeline-item" v-for="(job, index) in experience" :key="index">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="job-header">
              <h3 class="job-title">{{ job.title }}</h3>
              <div class="job-company">{{ job.company }}</div>
              <div class="job-period">{{ job.period }}</div>
            </div>
            <div class="job-description">
              <p v-html="job.description"></p>
              <ul class="job-achievements">
                <li v-for="(achievement, achIndex) in job.achievements" :key="achIndex">
                  {{ achievement }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="education-section">
        <h2>Education</h2>
        <div class="education-item" v-for="(edu, index) in education" :key="index">
          <div class="education-details">
            <h3>{{ edu.degree }}</h3>
            <div class="education-institution">{{ edu.institution }}</div>
            <div class="education-period">{{ edu.period }}</div>
          </div>
          <div class="education-description" v-if="edu.description">
            <p>{{ edu.description }}</p>
          </div>
        </div>
      </div>

      <div class="skills-section">
        <h2>Skills & Technologies</h2>
        <div class="skills-grid">
          <div class="skill-category" v-for="(category, index) in skills" :key="index">
            <h3>{{ category.category }}</h3>
            <ul class="skill-list">
              <li v-for="(skill, skillIndex) in category.skills" :key="skillIndex">
                {{ skill }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="certifications-section" v-if="certifications.length > 0">
        <h2>Certifications & Training</h2>
        <div class="certifications-grid">
          <div class="certification-item" v-for="(cert, index) in certifications" :key="index">
            {{ cert }}
          </div>
        </div>
      </div>
      
      <div class="volunteer-section" v-if="volunteerWork.length > 0">
        <h2>Volunteer Work</h2>
        <div class="volunteer-grid">
          <div class="volunteer-item" v-for="(work, index) in volunteerWork" :key="index">
            {{ work }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExperienceView',
  data() {
    return {
      experience: [
        {
          title: 'Principal Application Scientist',
          company: 'Biosero, Inc. (Remote)',
          period: 'January 2025 - Present',
          description: 'Leading process improvement initiatives and knowledge management strategies to enhance product delivery and team effectiveness.',
          achievements: [
            'Develop standardized frameworks for comprehensive product documentation, reducing generation time by 40%',
            'Implement systems to centralize tribal knowledge and improve cross-team information accessibility',
            'Create streamlined onboarding processes for new team members, accelerating productivity ramp-up',
            'Analyze disparate information sources using genAI and tools built with it to establish context-aware documentation standards and practices'
          ]
        },
        {
          title: 'Field Applications Manager',
          company: 'Biosero, Inc. (Remote)',
          period: 'January 2023 - January 2025',
          description: 'Leading a team focused on designing and delivering customized automation solutions for clients.',
          achievements: [
            'Directed a team in designing and delivering customized automation solutions for clients, boosting laboratory efficiency and reliability',
            'Provided strategic guidance and technical expertise in troubleshooting complex automation systems and optimizing workflows',
            'Partnered with clients to evaluate research needs and implement tailored solutions that align with project goals'
          ]
        },
        {
          title: 'Field Applications Scientist',
          company: 'Biosero, Inc. (Remote)',
          period: 'May 2020 - January 2023',
          description: 'Deployed and refined high-throughput automation platforms across diverse laboratory environments.',
          achievements: [
            'Deployed and refined high-throughput automation platforms across diverse laboratory environments, improving throughput by up to 30%',
            'Conducted extensive training sessions for scientists on advanced automation methods, scripting, and software tools',
            'Collaborated with cross-departmental teams to ensure automation technologies seamlessly integrated with evolving research objectives'
          ]
        },
        {
          title: 'Automation Engineer',
          company: 'Eli Lilly and Company (Indianapolis, IN)',
          period: 'February 2017 - May 2020',
          description: 'Designed and managed laboratory automation workflows supporting drug discovery and research initiatives.',
          achievements: [
            'Designed and managed laboratory automation workflows supporting drug discovery and research initiatives, resulting in faster processing and increased data accuracy',
            'Partnered with IT and research teams to integrate automated systems into existing processes, reducing manual errors and improving turnaround times',
            'Implemented innovative solutions that enhanced precision in protein analysis and cell-based assays, contributing to key research milestones'
          ]
        },
        {
          title: 'Molecular Biology Technician',
          company: 'Dow AgroSciences (Indianapolis, IN)',
          period: 'June 2012 - February 2017',
          description: 'Operated and maintained high-throughput laboratory automation systems for DNA processing.',
          achievements: [
            'Operated and maintained high-throughput laboratory automation systems, processing over 2 million DNA samples annually',
            'Designed and programmed automated workflows for DNA extraction and genotyping, increasing consistency and reducing manual handling',
            'Supervised technical staff and ensured compliance with ISO 17025 standards, streamlining SOPs and training protocols'
          ]
        },
        {
          title: 'Lab Contractor',
          company: 'Dow AgroSciences (via Kelly Services) (Indianapolis, IN)',
          period: 'July 2010 - June 2012',
          description: 'Provided support for automated DNA extraction workflows.',
          achievements: [
            'Provided essential support for automated DNA extraction workflows, maintaining efficiency and data integrity across multiple projects',
            'Managed laboratory information management systems (LIMS) to accurately document and track high-volume sample processing'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Biotechnology',
          institution: 'IUPUI, Indianapolis, IN',
          period: 'Graduated December 2014',
          description: 'Relevant Coursework: Statistics, Immunology, Genetics, Cell Biology'
        },
        {
          degree: 'Associate of Science in Biotechnology',
          institution: 'Ivy Tech Community College, Indianapolis, IN',
          period: 'Graduated July 2011',
          description: 'Relevant Coursework: Analytical Lab Methods, Cell Culture'
        },
        {
          degree: 'Food Science Studies',
          institution: 'Purdue University, West Lafayette, IN',
          period: '2008',
          description: 'Relevant Coursework: Organic Chemistry, Biochemistry, Microbiology'
        }
      ],
      skills: [
        {
          category: 'Automation Platforms',
          skills: ['Green Button Go', 'Tecan', 'Biomek', 'Hamilton', 'Bravo']
        },
        {
          category: 'Programming & Scripting',
          skills: ['C#', 'Python', 'GitHub', 'Automation Documentation']
        },
        {
          category: 'Workflow Development',
          skills: ['Cell Line Development', 'DNA Extraction', 'Genotyping', 'High-throughput Screening']
        },
        {
          category: 'Professional Skills',
          skills: ['Team Leadership', 'Training & Mentoring', 'Process Optimization', 'Troubleshooting']
        }
      ],
      certifications: [
        'Advanced Automation Programming',
        'ISO 17025 Laboratory Standards Compliance',
        'Project Management in Biotechnology'
      ],
      volunteerWork: [
        'FIRST Robotics Mentor: Guide teams in design, engineering, and programming to foster STEM interest',
        'Local Science Outreach Programs: Engage youth in biotechnology and automation through hands-on workshops and demos'
      ]
    }
  }
}
</script>

<style scoped>
.experience-page {
  padding: 2rem 0 4rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.lead {
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 800px;
  margin: 0 auto 1.5rem;
}

.resume-download {
  margin-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.experience-timeline {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 4rem;
}

.experience-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 7px;
  width: 2px;
  background-color: var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 2.5rem;
}

.timeline-marker {
  position: absolute;
  top: 6px;
  left: -2rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--primary-color);
  border: 2px solid white;
  z-index: 1;
}

.timeline-content {
  background-color: var(--bg-light);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.job-header {
  margin-bottom: 1rem;
}

.job-title {
  font-size: 1.25rem;
  color: var(--secondary-color);
  margin-bottom: 0.25rem;
}

.job-company {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.job-period {
  font-size: 0.875rem;
  color: var(--text-light);
}

.job-description p {
  margin-bottom: 1rem;
  color: var(--text-light);
}

.job-achievements {
  padding-left: 1.25rem;
}

.job-achievements li {
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

.education-section,
.skills-section,
.certifications-section,
.volunteer-section {
  margin-bottom: 4rem;
}

.education-section h2,
.skills-section h2,
.certifications-section h2,
.volunteer-section h2 {
  font-size: 1.75rem;
  color: var(--secondary-color);
  margin-bottom: 2rem;
  text-align: center;
}

.education-item {
  background-color: var(--bg-light);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.education-item h3 {
  font-size: 1.25rem;
  color: var(--secondary-color);
  margin-bottom: 0.25rem;
}

.education-institution {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.education-period {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.education-description p {
  color: var(--text-light);
}

.skills-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.skill-category {
  background-color: var(--bg-light);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.skill-category h3 {
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-align: center;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  justify-content: center;
}

.skill-list li {
  background-color: rgba(74, 144, 226, 0.1);
  color: var(--primary-color);
  padding: 0.4rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.certifications-grid, 
.volunteer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.certification-item,
.volunteer-item {
  background-color: var(--bg-light);
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  color: var(--text-light);
}

@media (min-width: 768px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .certifications-grid,
  .volunteer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .skills-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .certifications-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>