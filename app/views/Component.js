export default class Component {
    constructor(renderHookId) {
        this.hookId = renderHookId;
    }

    createRootElement(tag, cssClasses, attributes) {
        const rootElement = document.createElement(tag);
        if (cssClasses) rootElement.className = cssClasses;
        if (attributes && attributes.length > 0) {
            for (const attr of attributes) {
                rootElement.setAttribute(attr.name, attr.value);
            }
        }
        const hook = document.querySelector(this.hookId) || document.getElementById(this.hookId);
        if (hook) hook.append(rootElement);
        return rootElement;
    }
}