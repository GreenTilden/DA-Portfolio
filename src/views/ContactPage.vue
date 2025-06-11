<template>
  <div class="contact-page">
    <div class="container">
      <header class="page-header">
        <h1>Contact</h1>
        <p class="lead">Get in touch for opportunities or collaboration</p>
      </header>

      <div class="contact-info">
        <div class="contact-method">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <div class="contact-details">
            <h3>Email</h3>
            <a href="mailto:darren.arney@gmail.com">darren.arney@gmail.com</a>
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactView'
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

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
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

</style>