import {Controller} from "../Controller.js";

/** @private */
class PropertiesInspector extends Controller {

    constructor(parent, cfg = {}) {

        super(parent);

        if (!cfg.propertiesTabElement) {
            throw "Missing config: propertiesTabElement";
        }

        if (!cfg.propertiesElement) {
            throw "Missing config: propertiesElement";
        }

        this._metaObject = null;

        this._propertiesTabElement = cfg.propertiesTabElement;
        this._propertiesElement = cfg.propertiesElement;
        this._propertiesTabButtonElement = this._propertiesTabElement.querySelector(".xeokit-tab-btn");

        if (!this._propertiesTabButtonElement) {
            throw "Missing DOM element: ,xeokit-tab-btn";
        }

        this._onModelUnloaded = this.viewer.scene.on("modelUnloaded", (modelId) => {
            if (this._metaObject && this._metaObject.metaModel.id === modelId) {
                this.clear();
            }
        });

        this.bimViewer.on("reset", () => {
            this.clear();
        });

        document.addEventListener('click', this._clickListener = (e) => {
            if (!e.target.matches('.xeokit-accordion .xeokit-accordion-button')) {
                return;
            } else {
                if (!e.target.parentElement.classList.contains('active')) {
                    e.target.parentElement.classList.add('active');
                } else {
                    e.target.parentElement.classList.remove('active');
                }
            }
        });

        this.clear();
    }

    showObjectPropertySets(objectId) {
        const metaObject = this.viewer.metaScene.metaObjects[objectId];
        if (!metaObject) {
            return;
        }
        const propertySets = metaObject.propertySets;
        if (propertySets && propertySets.length > 0) {
            this._setPropertySets(metaObject, propertySets);
        } else {
            this._setPropertySets(metaObject);
        }
        this._metaObject = metaObject;
    }

    clear() {
        const html = [];
        html.push(`<div class="element-attributes">`);
        html.push(`<p class="subsubtitle no-object-selected-warning">No object inspected. Right-click or long-tab an object and select \'Inspect Properties\' to view its properties here.</p>`);
        html.push(`</div>`);
        const htmlStr = html.join("");
       this._propertiesElement.innerHTML = htmlStr;
    }

    _setPropertySets(metaObject, propertySets) {
        const html = [];
        html.push(`<div class="element-attributes">`);
        if (!metaObject) {
            html.push(`<p class="subsubtitle">No object selected</p>`);
        } else {
            html.push('<table class="xeokit-table">');
            html.push(`<tr><td class="td1">Name:</td><td class="td2">${metaObject.name}</td></tr>`);
            if (metaObject.type) {
                html.push(`<tr><td class="td1">Class:</td><td class="td2">${metaObject.type}</td></tr>`);
            }
            html.push(`<tr><td class="td1">UUID:</td><td class="td2">${metaObject.id}</td></tr>`);
            html.push('</table>');
            if (!propertySets || propertySets.length === 0) {
                html.push(`<p class="subtitle xeokit-no-prop-set-warning">No properties sets found for this object.</p>`);
                html.push(`</div>`);
            } else {
                html.push(`</div>`);
                html.push(`<div class="xeokit-accordion">`);
                for (let i = 0, len = propertySets.length; i < len; i++) {
                    const propertySet = propertySets[i];
                    const properties = propertySet.properties || [];
                    if (properties.length > 0) {
                        html.push(`<div class="xeokit-accordion-container">
                                        <p class="xeokit-accordion-button"><span></span>${propertySet.name}</p>                                       
                                        <div class="xeokit-accordion-panel">                                           
                                            <table class="xeokit-table"><tbody>`);
                        for (let i = 0, len = properties.length; i < len; i++) {
                            const property = properties[i];
                            html.push(`<tr><td class="td1">${property.name || property.label}:</td><td class="td2">${property.value}</td></tr>`);
                        }
                        html.push(`</tbody></table>
                        </div>
                        </div>`);
                    } else {
                        //  html.push(`<p class="subtitle">No properties sets found.</p>`);
                    }
                }
                html.push(`</div>`);
            }
        }
        this._propertiesElement.innerHTML = html.join("");
    }

    setEnabled(enabled) {
        if (!enabled) {
            this._propertiesTabButtonElement.classList.add("disabled");
        } else {
            this._propertiesTabButtonElement.classList.remove("disabled");
        }
    }

    destroy() {
        super.destroy();
        this.viewer.scene.off(this._onModelLoaded);
        this.viewer.scene.off(this._onModelUnloaded);
        document.removeEventListener('click', this._clickListener);
    }
}

export {PropertiesInspector};