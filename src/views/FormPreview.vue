<template>
  <div class="form-preview">
    <h1>Предпросмотр формы</h1>
    <div class="preview-container">
      <div class="form-container">
        <h2>{{ formTitle }}</h2>
        <form @submit.prevent="handleSubmit">
          <div v-for="(field, index) in formFields" :key="index" class="form-field">
            <slot :name="`field-${field.id}`" :field="field" :value="fieldValues[field.id]">
              <label :for="field.id">{{ field.label }}</label>
              <template v-if="field.type === 'select'">
                <select
                  :id="field.id"
                  v-model="fieldValues[field.id]"
                  class="form-control"
                >
                  <option value="" disabled selected>Выберите значение</option>
                  <option v-for="(option, idx) in field.options" :key="idx" :value="option">
                    {{ option }}
                  </option>
                </select>
              </template>
              <template v-else-if="field.type === 'checkbox'">
                <input
                  :id="field.id"
                  type="checkbox"
                  v-model="fieldValues[field.id]"
                  class="form-control"
                />
              </template>
              <template v-else-if="field.type === 'textarea'">
                <textarea
                  :id="field.id"
                  v-model="fieldValues[field.id]"
                  :placeholder="field.placeholder"
                  class="form-control"
                ></textarea>
              </template>
              <template v-else>
                <input
                  :id="field.id"
                  :type="getInputType(field.type)"
                  v-model="fieldValues[field.id]"
                  :placeholder="field.placeholder"
                  class="form-control"
                />
              </template>
            </slot>
          </div>
          <div class="form-actions">
            <slot name="submit-button">
              <button type="submit" class="submit-button">Отправить форму</button>
            </slot>
            <slot name="cancel-button">
              <button type="button" class="cancel-button" @click="handleCancel">Отмена</button>
            </slot>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  formTitle: {
    type: String,
    default: 'Моя форма'
  },
  initialFields: {
    type: Array,
    default: () => []
  },
  initialValues: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])
const formFields = ref([])
const fieldValues = ref({})

// Загружаем сохраненные значения при монтировании компонента
onMounted(() => {
  const savedValues = localStorage.getItem('formFieldValues')
  if (savedValues) {
    fieldValues.value = JSON.parse(savedValues)
  }
})

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

const loadFormData = async () => {
  try {
    const savedData = await new Promise((resolve) => {
      const data = localStorage.getItem('savedForm')
      resolve(data)
    })

    if (savedData) {
      const parsedData = JSON.parse(savedData)
      console.log('Загруженные данные:', parsedData)
      
      formFields.value = parsedData.fields || []
      fieldValues.value = parsedData.values || {}
      
      // Устанавливаем начальные значения для новых полей
      formFields.value.forEach(field => {
        if (!(field.id in fieldValues.value)) {
          fieldValues.value[field.id] = field.type === 'checkbox' ? false : ''
        }
      })
      
      console.log('Текущие значения полей:', fieldValues.value)
    }
  } catch (error) {
    console.error('Ошибка при загрузке формы:', error)
    formFields.value = []
    fieldValues.value = {}
  }
}

const handleSubmit = async (event) => {
  event.preventDefault()
  try {
    const formData = {
      fields: formFields.value,
      values: { ...fieldValues.value }
    }
    
    await new Promise((resolve) => {
      emit('submit', formData)
      resolve()
    })
    
    console.log('Форма отправлена:', formData)
    alert('Форма успешно отправлена!')
    await clearForm()
  } catch (error) {
    console.error('Ошибка при отправке формы:', error)
  }
}

const handleCancel = async (event) => {
  event.preventDefault()
  try {
    await clearForm()
    await new Promise((resolve) => {
      emit('cancel')
      resolve()
    })
  } catch (error) {
    console.error('Ошибка при отмене формы:', error)
  }
}

const clearForm = async () => {
  try {
    await new Promise((resolve) => {
      Object.keys(fieldValues.value).forEach(key => {
        fieldValues.value[key] = ''
      })
      formFields.value = []
      localStorage.removeItem('savedForm')
      resolve()
    })
  } catch (error) {
    console.error('Ошибка при очистке формы:', error)
  }
}

onMounted(async () => {
  await loadFormData()
})

watch(fieldValues, (newValues) => {
  console.log('Значения полей изменены:', newValues)
  // Сохраняем текущие значения в localStorage
  localStorage.setItem('formFieldValues', JSON.stringify(newValues))
}, { deep: true })
</script>

<style scoped>
.form-preview {
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.preview-container {
  background-color: #f8f9fa;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-field {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  margin-bottom: 0.75rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.1rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  padding-right: 2.5rem;
  cursor: pointer;
}

select.form-control:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

select.form-control option {
  padding: 0.5rem;
}

select.form-control option:disabled {
  color: #999;
  background-color: #f5f5f5;
}

input[type="checkbox"].form-control {
  width: auto;
  margin-right: 0.5rem;
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.submit-button, .cancel-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.submit-button {
  background-color: #42b983;
  color: white;
}

.cancel-button {
  background-color: #dc3545;
  color: white;
}

.submit-button:hover, .cancel-button:hover {
  opacity: 0.9;
}
@media(max-width: 700px){
  .form-actions{
    display: flex;
    flex-direction: column;
  }
}
@media(max-width: 470px){
  .cancel-button {
    font-size: 12px;
  }
  .submit-button{
    font-size: 12px;
  }
  .form-preview{
    padding: 0;
  }
}
</style> 