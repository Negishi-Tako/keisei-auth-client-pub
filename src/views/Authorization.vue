<template>
  <div id="container">
    <form @submit.prevent="submitForm">
      <div class="box">
        <h1>{{ eventName }}チケット発券</h1>
        <input v-model="studentid" type="number" placeholder="ID" required/>
        <input v-model="pin" placeholder="PIN" type="password" required/>
        <button type="submit">発券</button>
      </div>
    </form>
    <div class="end">
      <button type="button" class="detail" @click="detail();" :disabled="loading">発券・入場についてくわしく知る</button>
    </div>
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    <Modal v-if="showModal" @close="showModal = false">
      <template #default>
        <div class="modal-content">
          <p>{{ modalMessage }}</p>
          <button @click="showModal = false">閉じる</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '../components/Modal.vue'
import API_URL from '../api'

const studentid = ref('')
const pin = ref('')
const router = useRouter()
const loading = ref(false)
const showModal = ref(false)

const modalMessage = ref('')
const eventName = import.meta.env.VITE_EVENT_NAME || 'イベント'

const submitForm = async () => {
  loading.value = true
  const res = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ studentid: studentid.value, pin: pin.value }),
  })

  if (res.ok) {
    const data = await res.json()
    loading.value = false
    router.push('/tickets')
  } else {
    loading.value = false
    if (res.status === 401) {
      modalMessage.value = 'IDまたはPINが正しくありません。'
      showModal.value = true
    } else if (res.status === 429) {
      modalMessage.value = '不正なリクエストが多すぎます。しばらく待ってから再試行してください。'
      showModal.value = true
    } else if(res.status === 500) {
      router.push('/error/500')
    } else {
      modalMessage.value = '予期せぬエラーが発生しました。'
      showModal.value = true
    }

  }
}

function detail() {
    window.open(import.meta.env.VITE_HOW_TO_TICKETING_URL)
}
</script>
