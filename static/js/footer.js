;(function () {
  // Function to check if the URL meets our conditions
  function shouldAddNewsletter() {
    const url = window.location.pathname
    const parts = url.split('/').filter(Boolean)
    return url.includes('post') && parts[parts.length - 1] !== 'post'
  }

  // Function to add the newsletter form
  function addNewsletterForm() {
    if (!shouldAddNewsletter()) return

    const newsletterHTML = `
        <div id="newsletter-form" style="display: flex; justify-content: center; align-items: center; margin-top: 20px; padding: 0 15px;">
          <form method="post" action="https://listmonk.sepiropht.me/subscription/form" class="listmonk-form" style="display: flex; flex-direction: column; width: 80%; max-width: 400px; border: 1px solid #007bff; border-radius: 4px; overflow: hidden;">
            <div style="display: flex; flex-direction: column; width: 100%;">
              <input type="hidden" name="nonce" />
              <input type="email" name="email" required placeholder="Type your email..." style="padding: 10px; border: none; outline: none; width: 100%; font-size: 1rem;" />
              <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; font-size: 1rem; width: 100%;">
                Subscribe
              </button>
            </div>
            <p style="display: none;">
              <input id="d0765" type="checkbox" name="l" checked value="d076588b-cabe-4c89-9b38-900aeac54f5b" />
            </p>
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
