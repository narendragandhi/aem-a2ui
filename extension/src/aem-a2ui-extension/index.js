import { register, getEditor } from '@adobe/universal-edror-service';

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:10003';

let ue;
let assistantFrame;

async function init() {
  try {
    ue = await register({
      id: 'aem-a2ui',
      title: 'AI Content Assistant',
      icon: 'Copy',
    });

    const editor = getEditor();
    const root = document.getElementById('root');

    if (editor) {
      const assistantUrl = `${AI_AGENT_URL}/extension-panel?imsToken=${editor.imsToken}&locale=${editor.locale}`;

      assistantFrame = document.createElement('iframe');
      assistantFrame.src = assistantUrl;
      assistantFrame.title = 'AI Content Assistant';
      root.appendChild(assistantFrame);

      document.getElementById('loading').style.display = 'none';

      ue.on('aem.sites.editor.component.selection', async (event) => {
        const { componentPath, componentType } = event.payload;
        assistantFrame.contentWindow.postMessage({
          type: 'component-selected',
          componentPath,
          componentType,
        }, '*');
      });

      ue.on('aem.sites.editor.component.modified', async (event) => {
        const { componentPath, properties } = event.payload;
        assistantFrame.contentWindow.postMessage({
          type: 'component-modified',
          componentPath,
          properties,
        }, '*');
      });
    }
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.style.display = 'flex';
    errorEl.textContent = `Failed to initialize: ${err.message}`;
  }
}

init();
