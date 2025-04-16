<template>
  <!-- Основной контейнер конструктора форм -->
  <div class="form-builder">
    <h1>Конструктор форм</h1>
    <div class="builder-container">
      <!-- Область предпросмотра формы -->
      <div class="form-preview">
        <h2>Предпросмотр формы</h2>
        <div class="preview-area">
          <form @submit.prevent="handleSubmit">
            <!-- Цикл по полям формы -->
            <div v-for="(field, index) in formFields" :key="index" class="preview-field">
              <!-- Заголовок поля с типом и кнопкой удаления -->
              <div class="field-header">
                <div class="field-title">
                  <label>{{ field.label }}</label>
                  <span class="field-type">{{ getFieldTypeLabel(field.type) }}</span>
                </div>
                <button class="delete-button" :data-index="index" @click="removeField">×</button>
              </div>
              <!-- Описание поля -->
              <div class="field-description">{{ getFieldDescription(field) }}</div>
              <!-- Динамический компонент поля ввода -->
              <component
                :is="getFieldComponent(field.type)"
                v-model="fieldValues[field.id]"
                :type="getInputType(field.type)"
                :options="field.options"
                :placeholder="field.placeholder"
                :required="field.required"
              >
                <template v-if="field.type === 'select'">
                  <option value="" disabled selected>Выберите значение</option>
                  <option v-for="(option, idx) in field.options" :key="idx" :value="option">
                    {{ option }}
                  </option>
                </template>
              </component>
              <!-- Список опций для выпадающего списка -->
              <div class="field-options" v-if="field.type === 'select'">
                <div class="options-list">
                  <div v-for="(option, idx) in field.options" :key="idx" class="option-item">
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <!-- Панель управления формой -->
      <div class="form-controls">
        <h2>Добавить элементы формы</h2>
        <div class="control-buttons">
          <!-- Кнопки добавления различных типов полей -->
          <button class="control-button" data-type="text" @click="addField">
            <span class="button-icon">📝</span>
            <span class="button-text">Текстовое поле</span>
            <span class="button-description">Для ввода короткого текста</span>
          </button>
          <button class="control-button" data-type="textarea" @click="addField">
            <span class="button-icon">📄</span>
            <span class="button-text">Текстовая область</span>
            <span class="button-description">Для ввода длинного текста</span>
          </button>
          <button class="control-button" data-type="number" @click="addField">
            <span class="button-icon">🔢</span>
            <span class="button-text">Числовое поле</span>
            <span class="button-description">Для ввода чисел</span>
          </button>
          <button class="control-button" data-type="checkbox" @click="addField">
            <span class="button-icon">☑️</span>
            <span class="button-text">Флажок</span>
            <span class="button-description">Для выбора опции</span>
          </button>
          <button class="control-button" data-type="select" @click="addField">
            <span class="button-icon">📋</span>
            <span class="button-text">Выпадающий список</span>
            <span class="button-description">Для выбора из списка</span>
          </button>
        </div>
        <!-- Кнопки действий с формой -->
        <div class="form-actions">
          <button class="action-button save" @click="saveForm">Сохранить форму</button>
          <button class="action-button cancel" @click="resetForm">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Импорт необходимых функций из Vue
import { ref, watch } from 'vue'

// Реактивные переменные для хранения полей формы и их значений
const formFields = ref([])
const fieldValues = ref({})

// Добавляем watch для отслеживания изменений значений полей
watch(fieldValues, (newValues) => {
  localStorage.setItem('formFieldValues', JSON.stringify(newValues))
}, { deep: true })

// Функция получения читаемого названия типа поля
const getFieldTypeLabel = (type) => {
  const labels = {
    text: 'Текстовое поле',
    textarea: 'Текстовая область',
    number: 'Числовое поле',
    checkbox: 'Флажок',
    select: 'Выпадающий список'
  }
  return labels[type] || 'Поле'
}

// Функция получения описания для типа поля
const getFieldDescription = (field) => {
  const descriptions = {
    text: 'Введите текст в это поле. Максимальная длина: 255 символов.',
    textarea: 'Введите многострочный текст. Поддерживает форматирование.',
    number: 'Введите числовое значение. Поддерживает десятичные числа.',
    checkbox: 'Отметьте для подтверждения выбора.',
    select: 'Выберите один вариант из списка.'
  }
  return descriptions[field.type] || 'Поле для ввода данных'
}

// Функция добавления нового поля в форму
const addField = (event) => {
  const type = event.target.dataset.type
  const field = {
    id: Date.now(),
    type,
    label: getFieldLabel(type),
    required: false,
    placeholder: getPlaceholder(type)
  }

  if (type === 'select') {
    field.options = ['Список1', 'Список2', 'Список3']
  }

  formFields.value.push(field)
  fieldValues.value[field.id] = type === 'checkbox' ? false : ''
}

// Функция получения метки для поля
const getFieldLabel = (type) => {
  const labels = {
    text: 'Текстовое поле',
    textarea: 'Текстовая область',
    number: 'Числовое поле',
    checkbox: 'Флажок',
    select: 'Выпадающий список'
  }
  return labels[type] || 'Поле'
}

// Функция получения плейсхолдера для поля
const getPlaceholder = (type) => {
  const placeholders = {
    text: 'Введите текст...',
    textarea: 'Введите текст...',
    number: 'Введите число...',
    select: 'Выберите вариант...'
  }
  return placeholders[type] || 'Введите значение...'
}

// Функция удаления поля из формы
const removeField = (event) => {
  const index = parseInt(event.target.dataset.index)
  const fieldId = formFields.value[index].id
  formFields.value.splice(index, 1)
  delete fieldValues.value[fieldId]
}

// Функция определения компонента для поля
const getFieldComponent = (type) => {
  switch (type) {
    case 'textarea':
      return 'textarea'
    case 'select':
      return 'select'
    default:
      return 'input'
  }
}

// Функция определения типа ввода для поля
const getInputType = (type) => {
  switch (type) {
    case 'number':
      return 'number'
    case 'checkbox':
      return 'checkbox'
    default:
      return 'text'
  }
}

// Функция сохранения формы
const saveForm = async () => {
  try {
    const formData = {
      fields: formFields.value.map(field => ({
        id: field.id,
        type: field.type,
        label: field.label,
        required: field.required,
        placeholder: field.placeholder,
        options: field.options,
        value: fieldValues.value[field.id]
      })),
      values: { ...fieldValues.value }
    }

    await new Promise((resolve) => {
      localStorage.setItem('savedForm', JSON.stringify(formData))
      resolve()
    })
    
    alert('Форма успешно сохранена!')
    formFields.value = []
    fieldValues.value = {}
  } catch (error) {
    console.error('Ошибка при сохранении формы:', error)
    alert('Произошла ошибка при сохранении формы')
  }
}

// Функция сброса формы
const resetForm = () => {
  formFields.value = []
  fieldValues.value = {}
}

// Функция обработки отправки формы
const handleSubmit = async (event) => {
  event.preventDefault()
  try {
    console.log('Form submitted:', fieldValues.value)
  } catch (error) {
    console.error('Ошибка при отправке формы:', error)
  }
}
</script>

<style scoped>
/* Основные стили для конструктора форм */
.form-builder {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Заголовок страницы */
h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.5rem;
}

/* Контейнер с предпросмотром и контролами */
.builder-container {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 2rem;
  max-width: calc(var(--max-width) + 200px);
  margin: 0 auto;
}

/* Область предпросмотра формы */
.form-preview {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  min-height: 600px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-right: 0;
}

/* Заголовок предпросмотра */
.form-preview h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

/* Область с полями формы */
.preview-area {
  margin-top: 1.5rem;
  min-height: 500px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  background-color: white;
}

/* Стили для каждого поля формы */
.preview-field {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preview-field:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Заголовок поля */
.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.field-title {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.field-title label {
  font-size: 1.4rem;
  font-weight: 500;
  color: #2c3e50;
}

.field-type {
  font-size: 1rem;
  color: #666;
  background-color: #f0f0f0;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  display: inline-block;
}

/* Описание поля */
.field-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  border-left: 3px solid #42b983;
  line-height: 1.6;
}

/* Стили для полей ввода */
input, textarea, select {
  width: 100%;
  padding: 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #42b983;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

textarea {
  min-height: 180px;
  resize: vertical;
  line-height: 1.6;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1.2rem center;
  background-size: 1.2em;
  padding-right: 3rem;
}

/* Стили для опций выпадающего списка */
.field-options {
  margin-top: 1.5rem;
  padding: 1.2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.option-item {
  padding: 0.6rem 1.2rem;
  background-color: #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  color: #495057;
  border: 1px solid #dee2e6;
}

/* Кнопка удаления */
.delete-button {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0.6rem;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.delete-button:hover {
  background-color: rgba(220, 53, 69, 0.1);
  transform: scale(1.1);
}

/* Панель управления формой */
.form-controls {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  position: sticky;
  top: 2rem;
  height: fit-content;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-left: 0;
}

.form-controls h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

/* Кнопки управления */
.control-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  margin-top: 1.5rem;
}

.control-button {
  padding: 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;
}

.button-icon {
  font-size: 1.8rem;
}

.button-text {
  font-weight: 500;
  font-size: 1.2rem;
}

.button-description {
  font-size: 1rem;
  opacity: 0.9;
}

.control-button:hover {
  background-color: #3aa876;
  transform: translateY(-2px);
}

/* Кнопки действий */
.form-actions {
  margin-top: 2.5rem;
  display: flex;
  gap: 1.2rem;
}

.action-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  flex: 1;
}

.save {
  background-color: #42b983;
  color: white;
}

.cancel {
  background-color: #dc3545;
  color: white;
}

.action-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Медиа-запросы для адаптивности */
@media (max-width: 1200px) {
  .builder-container {
    grid-template-columns: 2fr 1fr;
    max-width: var(--max-width);
  }
}

@media (max-width: 992px) {
  .builder-container {
    display: flex;
    flex-direction: column;
    max-width: 100%;
  }

  .form-actions{
    display:  flex;
    flex-direction: column;
  }
  .form-controls {
    position: static;
    margin-top: 2rem;
  }

  .form-builder {
    padding: 1.5rem;
  }

  h1 {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .form-builder {
    padding: 1rem;
  }

  .preview-field {
    padding: 1.5rem;
  }

  .field-title label {
    font-size: 1.2rem;
  }

  .field-description {
    font-size: 1rem;
  }

  input, textarea, select {
    padding: 1rem;
    font-size: 1rem;
  }
}
@media (max-width: 476px) {
  h1{
    font-size: 28px;
  }
  .form-preview h2{
    font-size: 18px !important;
  }
  .form-controls h2{
    font-size: 18px !important;
  }
  .control-button{
    padding: 0.7rem;
    gap: 0.6rem;
  }
}
</style> 