const { Core } = require('@adobe/aio-sdk')

/**
 *
 * @param params
 */
async function main (params) {
  const logger = Core.Logger('generate', { level: params.LOG_LEVEL || 'info' })

  if (!params.prompt) {
    return { statusCode: 400, body: { error: 'prompt is required' } }
  }

  const agentUrl = params.AI_AGENT_URL || 'http://localhost:10003'

  try {
    const response = await fetch(`${agentUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(params.__ow_headers?.authorization
          ? { Authorization: params.__ow_headers.authorization }
          : {}),
      },
      body: JSON.stringify({
        message: {
          parts: [{ text: params.prompt }],
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Agent returned ${response.status}: ${await response.text()}`)
    }

    const result = await response.json()
    return { statusCode: 200, body: result }
  } catch (err) {
    logger.error('Generation failed', err)
    return {
      statusCode: 502,
      body: { error: err.message },
    }
  }
}

exports.main = main
