/**
 * AEM Component Dialog Generator
 * Generate Touch UI dialog definitions for components
 */

import { AEM_COMPONENTS, AemProperty } from './aem-components.js';

export interface DialogField {
  name: string;
  fieldLabel: string;
  fieldDescription?: string;
  resourceType: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: Array<{ text: string; value: string }>;
  validation?: DialogValidation;
}

export interface DialogValidation {
  type?: 'email' | 'url' | 'number';
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface DialogTab {
  id: string;
  title: string;
  fields: DialogField[];
}

export interface ComponentDialog {
  componentId: string;
  title: string;
  tabs: DialogTab[];
}

/**
 * Map property types to Granite UI field types
 */
const PROPERTY_TYPE_MAP: Record<string, string> = {
  string: 'granite/ui/components/coral/foundation/form/textfield',
  text: 'granite/ui/components/coral/foundation/form/textarea',
  richtext: 'cq/gui/components/authoring/dialog/richtext',
  pathfield: 'granite/ui/components/coral/foundation/form/pathfield',
  image: 'cq/gui/components/authoring/dialog/fileupload',
  checkbox: 'granite/ui/components/coral/foundation/form/checkbox',
  select: 'granite/ui/components/coral/foundation/form/select',
  numberfield: 'granite/ui/components/coral/foundation/form/numberfield',
  datepicker: 'granite/ui/components/coral/foundation/form/datepicker',
  colorfield: 'granite/ui/components/coral/foundation/form/colorfield',
  hidden: 'granite/ui/components/coral/foundation/form/hidden',
};

/**
 * Generate dialog field from property definition
 */
function propertyToDialogField(property: AemProperty): DialogField {
  const field: DialogField = {
    name: `./${property.name}`,
    fieldLabel: property.label || property.name,
    fieldDescription: property.description,
    resourceType: PROPERTY_TYPE_MAP[property.type] || PROPERTY_TYPE_MAP['string'],
    required: property.required,
  };

  if (property.defaultValue !== undefined) {
    field.defaultValue = property.defaultValue;
  }

  // Handle select/dropdown options
  if (property.type === 'select' && property.options) {
    field.options = property.options;
  }

  return field;
}

/**
 * Generate dialog definition for a component
 */
export function generateComponentDialog(componentId: string): ComponentDialog | null {
  const component = AEM_COMPONENTS.find((c) => c.id === componentId);
  if (!component) return null;

  // Group properties into tabs
  const contentFields: DialogField[] = [];
  const mediaFields: DialogField[] = [];
  const linkFields: DialogField[] = [];

  for (const prop of component.properties) {
    const field = propertyToDialogField(prop);

    // Categorize fields
    if (prop.name.includes('image') || prop.name.includes('asset') || prop.type === 'image') {
      mediaFields.push(field);
    } else if (prop.name.includes('link') || prop.name.includes('url') || prop.name.includes('cta')) {
      linkFields.push(field);
    } else {
      contentFields.push(field);
    }
  }

  const tabs: DialogTab[] = [];

  if (contentFields.length > 0) {
    tabs.push({ id: 'content', title: 'Content', fields: contentFields });
  }
  if (mediaFields.length > 0) {
    tabs.push({ id: 'media', title: 'Media', fields: mediaFields });
  }
  if (linkFields.length > 0) {
    tabs.push({ id: 'links', title: 'Links', fields: linkFields });
  }

  return {
    componentId,
    title: `${component.name} Settings`,
    tabs,
  };
}

/**
 * Convert dialog to Granite UI XML structure
 */
export function dialogToXml(dialog: ComponentDialog): string {
  const tabItems = dialog.tabs
    .map((tab) => {
      const fieldItems = tab.fields
        .map((field) => {
          let fieldXml = `                        <${field.name.replace('./', '').replace(/[^a-zA-Z0-9]/g, '_')}
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="${field.resourceType}"
                            fieldLabel="${field.fieldLabel}"
                            name="${field.name}"`;

          if (field.required) {
            fieldXml += `\n                            required="{Boolean}true"`;
          }
          if (field.fieldDescription) {
            fieldXml += `\n                            fieldDescription="${escapeXml(field.fieldDescription)}"`;
          }
          if (field.defaultValue !== undefined) {
            fieldXml += `\n                            value="${field.defaultValue}"`;
          }

          // Handle select options
          if (field.options && field.options.length > 0) {
            const optionItems = field.options
              .map(
                (opt, i) =>
                  `                                <option${i}
                                    jcr:primaryType="nt:unstructured"
                                    text="${opt.text}"
                                    value="${opt.value}"/>`,
              )
              .join('\n');

            fieldXml += `>
                            <items jcr:primaryType="nt:unstructured">
${optionItems}
                            </items>
                        </${field.name.replace('./', '').replace(/[^a-zA-Z0-9]/g, '_')}>`;
          } else {
            fieldXml += '/>';
          }

          return fieldXml;
        })
        .join('\n');

      return `                <${tab.id}
                    jcr:primaryType="nt:unstructured"
                    jcr:title="${tab.title}"
                    sling:resourceType="granite/ui/components/coral/foundation/container">
                    <items jcr:primaryType="nt:unstructured">
${fieldItems}
                    </items>
                </${tab.id}>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="${dialog.title}"
    sling:resourceType="cq/gui/components/authoring/dialog">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <tabs
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/tabs"
                maximized="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
${tabItems}
                </items>
            </tabs>
        </items>
    </content>
</jcr:root>`;
}

/**
 * Convert dialog to JSON structure (for API-based creation)
 */
export function dialogToJson(dialog: ComponentDialog): Record<string, unknown> {
  const content: Record<string, unknown> = {
    'jcr:primaryType': 'nt:unstructured',
    'sling:resourceType': 'granite/ui/components/coral/foundation/container',
    items: {
      'jcr:primaryType': 'nt:unstructured',
      tabs: {
        'jcr:primaryType': 'nt:unstructured',
        'sling:resourceType': 'granite/ui/components/coral/foundation/tabs',
        maximized: true,
        items: {} as Record<string, unknown>,
      },
    },
  };

  const tabItems = (content['items'] as Record<string, unknown>)['tabs'] as Record<string, unknown>;
  const items = tabItems['items'] as Record<string, unknown>;

  for (const tab of dialog.tabs) {
    const tabContent: Record<string, unknown> = {
      'jcr:primaryType': 'nt:unstructured',
      'jcr:title': tab.title,
      'sling:resourceType': 'granite/ui/components/coral/foundation/container',
      items: {} as Record<string, unknown>,
    };

    const fieldItems = tabContent['items'] as Record<string, unknown>;

    for (const field of tab.fields) {
      const fieldName = field.name.replace('./', '').replace(/[^a-zA-Z0-9]/g, '_');
      const fieldContent: Record<string, unknown> = {
        'jcr:primaryType': 'nt:unstructured',
        'sling:resourceType': field.resourceType,
        fieldLabel: field.fieldLabel,
        name: field.name,
      };

      if (field.required) fieldContent['required'] = true;
      if (field.fieldDescription) fieldContent['fieldDescription'] = field.fieldDescription;
      if (field.defaultValue !== undefined) fieldContent['value'] = field.defaultValue;

      if (field.options) {
        fieldContent['items'] = field.options.reduce(
          (acc, opt, i) => {
            acc[`option${i}`] = {
              'jcr:primaryType': 'nt:unstructured',
              text: opt.text,
              value: opt.value,
            };
            return acc;
          },
          {} as Record<string, unknown>,
        );
      }

      fieldItems[fieldName] = fieldContent;
    }

    items[tab.id] = tabContent;
  }

  return {
    'jcr:primaryType': 'nt:unstructured',
    'jcr:title': dialog.title,
    'sling:resourceType': 'cq/gui/components/authoring/dialog',
    content: content,
  };
}

/**
 * Generate edit config for component
 */
export function generateEditConfig(componentId: string): Record<string, unknown> {
  const component = AEM_COMPONENTS.find((c) => c.id === componentId);
  if (!component) return {};

  return {
    'jcr:primaryType': 'cq:EditConfig',
    'cq:actions': ['edit', 'copymove', 'delete', 'insert'],
    'cq:dialogMode': 'floating',
    'cq:layout': 'editbar',
    'cq:emptyText': `Click to configure ${component.name}`,
    'cq:inplaceEditing': {
      'jcr:primaryType': 'cq:InplaceEditingConfig',
      active: true,
      editorType: 'text',
    },
  };
}

/**
 * Generate design dialog for component
 */
export function generateDesignDialog(componentId: string): string {
  const component = AEM_COMPONENTS.find((c) => c.id === componentId);
  if (!component) return '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
          xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="${component.name} Design"
    sling:resourceType="cq/gui/components/authoring/dialog">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <styletab
                jcr:primaryType="nt:unstructured"
                jcr:title="Styles"
                sling:resourceType="granite/ui/components/coral/foundation/container">
                <items jcr:primaryType="nt:unstructured">
                    <styles
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
                        fieldLabel="CSS Classes">
                        <field
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                            name="./cq:styleClasses"/>
                    </styles>
                </items>
            </styletab>
        </items>
    </content>
</jcr:root>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get all available dialogs
 */
export function getAvailableDialogs(): Array<{ componentId: string; name: string }> {
  return AEM_COMPONENTS.map((c) => ({
    componentId: c.id,
    name: c.name,
  }));
}
