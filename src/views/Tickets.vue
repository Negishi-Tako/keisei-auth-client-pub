<template>
  <div id="container">
      <div class="box ticket">
        <h1>入場チケット</h1>
        <div class="qrcode">
            <qrcode-vue :value="tickets.ticket_id" :size="180" :level="'H'" :margin="3"></qrcode-vue>
        </div>
        <div class="info">
          <p>管理ID: {{tickets.ticket_manage}}</p>
          <p v-if="tickets.ticket_class == 0">発行区分: 入場券 {{ tickets.ticket_num }}名</p>
          <p v-if="tickets.ticket_class == 1">発行区分: {{tickets.ticket_class === 1 ? '招待券 ' : 'エラー' }}</p>
          <p>利用情報: {{ tickets.ticket_status === 0 ? '有効' : tickets.ticket_status === 1 ? '使用済み' : 'エラー'}}</p>
        </div>
        <a v-bind:href="tickets.ticket_wallet"><img src="../assets/google-wallet.svg" alt="Add Google-Wallet" class="google-wallet-button"/></a>
      </div>
  </div>
  <div class="end">
    <button
      @click="router.push({ path: '/projects', query: { id: (() => {
        if (Array.isArray(tickets.ticket_project)) {
          return tickets.ticket_project.join(',');
        }
        if (typeof tickets.ticket_project === 'string') {
          try {
            const v = JSON.parse(tickets.ticket_project);
            return Array.isArray(v) ? v.join(',') : v;
          } catch {
            return tickets.ticket_project;
          }
        }
        return tickets.ticket_project;
      })() } })"
      class="project-button"
    >
      生徒の企画をみる
    </button>
    <button type="button" class="destroy" @click="destroy();" :disabled="loading">別チケットの発券・ログアウト</button>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { useRouter } from 'vue-router'
import Modal from '../components/Modal.vue'
import API_URL from '../api'

const tickets = ref([])
const qr = ref([])
const router = useRouter();
const loading = ref(true);
const showModal = ref(false)
const modalMessage = ref('')

onMounted(async () => {
  try {
    const tickets_res = await fetch(`${API_URL}/tickets/me`,{
      method: 'DELETE',
      credentials: 'include',
    }) 
    if (!tickets_res.ok) {
      router.push('/error/401')
    }
    loading.value = false
    tickets.value = await tickets_res.json()
  } catch (error) {
    router.push('/error/500')
  }
})

function destroy() {
  loading.value = true
  fetch(`${API_URL}/sessions/me`,{
    credentials: 'include',
  })
  .then(response => {
    loading.value = false
    if (response.ok) {
      router.push('/')
    } else {
      modalMessage.value = 'ログアウト失敗'
      showModal.value = true
    }
  })
  .catch(error => {
    loading.value = false
    modalMessage.value = '予期せぬエラーが発生しました。'
    showModal.value = true
    console.error('Error:', error)
  })
}
</script>
