;(function () {
  // Function to check if the URL meets our conditions
  function shouldAddNewsletter() {
    const url = window.location.pathname
    const parts = url.split('/').filter(Boolean)
    return url.includes('posts/') && parts[parts.length - 1] !== 'posts'
  }

  // Function to add the newsletter form
  function addNewsletterForm() {
    if (!shouldAddNewsletter()) return

    const newsletterHTML = `
        <div id="newsletter-form" style="display: flex; justify-content: center; align-items: center; margin-top: 20px; padding: 0 15px;">
          <form id="subscription-form" style="display: flex; flex-direction: column; width: 80%; max-width: 400px; border: 1px solid #007bff; border-radius: 4px; overflow: hidden;">
            <div style="display: flex; flex-direction: column; width: 100%;">
              <input type="email" name="email" required placeholder="Type your email..." style="padding: 10px; border: none; outline: none; width: 100%; font-size: 1rem;" />
              <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; font-size: 1rem; width: 100%;">
                Subscribe
              </button>
            </div>
            <div id="subscription-message" style="padding: 10px; text-align: center; display: none;"></div>
          </form>
        </div>
      `

    // Create a container for the newsletter form
    const container = document.createElement('div')
    container.innerHTML = newsletterHTML

    // Append the newsletter form to the body or another appropriate element
    document.body.appendChild(container.firstElementChild)

    // Apply responsive styles
    applyStyles()
    
    // Add event listener for form submission
    setupFormSubmission()
  }

  // Function to handle form submission
  function setupFormSubmission() {
    const form = document.getElementById('subscription-form')
    const messageDiv = document.getElementById('subscription-message')
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault()
      
      const emailInput = form.querySelector('input[name="email"]')
      const email = emailInput.value.trim()
      
      if (!email) return
      
      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })
        
        const data = await response.json()
        
        if (response.ok) {
          messageDiv.textContent = 'Thank you for subscribing!'
          messageDiv.style.color = 'green'
          emailInput.value = ''
        } else {
          messageDiv.textContent = data.error || 'Failed to subscribe. Please try again.'
          messageDiv.style.color = 'red'
        }
      } catch (error) {
        messageDiv.textContent = 'An error occurred. Please try again later.'
        messageDiv.style.color = 'red'
      }
      
      messageDiv.style.display = 'block'
      
      // Hide the message after 5 seconds
      setTimeout(() => {
        messageDiv.style.display = 'none'
      }, 5000)
    })
  }

  // Function to apply responsive styles
  function applyStyles() {
    var form = document.querySelector('#newsletter-form form')
    var formDiv = form.querySelector('div')
    var input = form.querySelector('input[type="email"]')
    var button = form.querySelector('button')

    function setStyles() {
      if (window.innerWidth >= 768) {
        form.style.flexDirection = 'row'
        formDiv.style.flexDirection = 'row'
        input.style.borderTopRightRadius = '0'
        input.style.borderBottomRightRadius = '0'
        button.style.width = 'auto'
        button.style.borderTopLeftRadius = '0'
        button.style.borderBottomLeftRadius = '0'
      } else {
        form.style.flexDirection = 'column'
        formDiv.style.flexDirection = 'column'
        input.style.borderRadius = '4px'
        button.style.width = '100%'
        button.style.borderRadius = '4px'
      }
    }

    window.addEventListener('resize', setStyles)
    setStyles()
  }

  // Run the function when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNewsletterForm)
  } else {
    addNewsletterForm()
  }
})()
