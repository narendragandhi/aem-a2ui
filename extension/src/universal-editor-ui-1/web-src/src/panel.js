import { attach } from '@adobe/uix-guest'

const EXTENSION_ID = 'aem-a2ui'
const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:10003'

const relay = new BroadcastChannel('aem-a2ui-events')

/**
 *
 */
async function init () {
  const loading = document.getElementById('loading')
  const errorEl = document.getElementById('error')
  const frame = document.getElementById('assistantFrame')

  try {
    const guestConnection = await attach({ id: EXTENSION_ID })

    const token = guestConnection.sharedContext.get('token')
    const locale = guestConnection.sharedContext.get('locale')

    const assistantUrl = `${AI_AGENT_URL}/extension-panel?imsToken=${encodeURIComponent(token || '')}&locale=${locale || 'en'}`
    frame.src = assistantUrl
    frame.style.display = 'block'
    loading.style.display = 'none'

    relay.onmessage = (event) => {
      const { eventName, data } = event.data
      if (!eventName) return
      frame.contentWindow.postMessage({
        type: 'ue-event',
        eventName,
        data,
      }, '*')
    }
  } catch (err) {
    loading.style.display = 'none'
    errorEl.style.display = 'flex'
    errorEl.textContent = `Failed to connect: ${err.message}`
  }
}

init()
