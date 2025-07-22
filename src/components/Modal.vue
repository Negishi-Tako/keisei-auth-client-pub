<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  width: 80%;
  max-width: 1200px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

button {
  margin-top: 15px;
  padding: 10px 20px;
  border: none;
  background-color: #F62938;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #f62937ad;
}
</style>
