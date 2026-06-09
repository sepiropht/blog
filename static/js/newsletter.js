;(function () {
  var form = document.getElementById('newsletter-form')
  if (!form) return

  var message = document.getElementById('newsletter-message')
  var button = form.querySelector('.newsletter-button')

  function show(text, kind) {
    message.textContent = text
    message.className = 'newsletter-message ' + kind
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault()

    var input = form.querySelector('input[name="email"]')
    var email = input.value.trim()
    if (!email) return

    button.disabled = true
    show('', '')

    try {
      var res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
      var data = await res.json().catch(function () {
        return {}
      })

      if (res.ok) {
        show(form.dataset.success, 'ok')
        input.value = ''
      } else {
        show(data.error || form.dataset.error, 'error')
      }
    } catch (err) {
      show(form.dataset.error, 'error')
    } finally {
      button.disabled = false
    }
  })
})()
