import { register } from '@adobe/uix-guest'
import metadata from '../../../app-metadata.json'

const EXTENSION_ID = 'aem-a2ui'

const relay = new BroadcastChannel('aem-a2ui-events')

/**
 *
 */
async function init () {
  try {
    await register({
      id: EXTENSION_ID,
      metadata,
      methods: {
        rightPanel: {
          addRails () {
            return [
              {
                id: 'aem-a2ui-assistant',
                header: 'AI Content Assistant',
                url: '/panel.html',
                icon: 'Copy',
              },
            ]
          },
        },
        events: {
          listen (eventName, data) {
            relay.postMessage({ eventName, data })
          },
        },
      },
    })

    document.getElementById('loading').style.display = 'none'
  } catch (err) {
    document.getElementById('loading').style.display = 'none'
    const errorEl = document.getElementById('error')
    errorEl.style.display = 'flex'
    errorEl.textContent = `Failed to initialize: ${err.message}`
  }
}

init()
