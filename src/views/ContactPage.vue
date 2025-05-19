<template>
  <div class="contact-page">
    <div class="container">
      <header class="page-header">
        <h1>Contact</h1>
        <p class="lead">Get in touch for opportunities or collaboration</p>
      </header>

      <div class="contact-grid">
        <div class="contact-info">
          <div class="contact-method">
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div class="contact-details">
              <h3>Email</h3>
              <a href="mailto:contact@darrenarney.com">darren@darrenarney.com</a>
            </div>
          </div>

          <div class="contact-method">
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </div>
            <div class="contact-details">
              <h3>LinkedIn</h3>
              <a href="https://www.linkedin.com/in/darren-arney" target="_blank" rel="noopener">linkedin.com/in/darren-arney</a>
            </div>
          </div>

          <div class="contact-method">
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </div>
            <div class="contact-details">
              <h3>GitHub</h3>
              <a href="https://github.com/GreenTilden" target="_blank" rel="noopener">github.com/GreenTilden</a>
            </div>
          </div>
        </div>

        <div class="contact-form">
          <h2>Send a Message</h2>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                type="text" 
                id="name"
                v-model="form.name"
                required
              >
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email"
                v-model="form.email"
                required
              >
            </div>

            <div class="form-group">
              <label for="subject">Subject</label>
              <input 
                type="text" 
                id="subject"
                v-model="form.subject"
                required
              >
            </div>

            <div class="form-group">
              <label for="message">Message</label>
              <textarea 
                id="message"
                v-model="form.message"
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>

            <div class="form-status" v-if="formStatus">
              <div :class="['status-message', formStatus.type]">
                {{ formStatus.message }}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactView',
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      isSubmitting: false,
      formStatus: null
    }
  },
  methods: {
    submitForm() {
      // Since this is a portfolio demo, we'll simulate form submission
      this.isSubmitting = true;
      
      // Simulate API call delay
      setTimeout(() => {
        this.isSubmitting = false;
        this.formStatus = {
          type: 'success',
          message: 'Your message has been sent successfully! I will get back to you as soon as possible.'
        };
        
        // Reset form after successful submission
        this.form = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        
        // Clear success message after a delay
        setTimeout(() => {
          this.formStatus = null;
        }, 5000);
      }, 1500);
    }
  }
}
</script>

<style scoped>
.contact-page {
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
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--bg-light);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.icon {
  color: var(--primary-color);
  background-color: rgba(74, 144, 226, 0.1);
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-details h3 {
  font-size: 1.25rem;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.contact-details a {
  color: var(--text-light);
  transition: color 0.3s ease;
}

.contact-details a:hover {
  color: var(--primary-color);
}

.contact-form {
  background-color: var(--bg-light);
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.contact-form h2 {
  font-size: 1.75rem;
  color: var(--secondary-color);
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--secondary-color);
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-family: inherit;
  font-size: inherit;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn {
  display: inline-block;
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

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-status {
  margin-top: 1.5rem;
}

.status-message {
  padding: 1rem;
  border-radius: 0.25rem;
  text-align: center;
}

.status-message.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-message.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

@media (min-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>