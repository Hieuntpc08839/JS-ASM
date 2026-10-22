// app/views/BaseView.js
export default class BaseView {
    constructor() {}

    setHTML(html) {
        const app = document.getElementById('app') || document.querySelector('main');
        if (app) app.innerHTML = html;
    }

    $(selector) {
        return document.querySelector(selector);
    }

    $$(selector) { return document.querySelectorAll(selector); }      getFormData(form) { const formData = new FormData(form); const data = {}; for (let [key, value] of formData.entries()) { data[key] = value.trim(); } return data; }      showFieldErrors(errors) { // Xóa thông báo lỗi cũ this.$$
('.error').forEach(el => el.textContent = '');
        // Hiển thị thông báo lỗi mới
        for (let key in errors) {
            const errorEl = this.$(`[data-error="${key}"]`);
            if (errorEl) {
                errorEl.textContent = errors[key];
            }
        }
    }
}