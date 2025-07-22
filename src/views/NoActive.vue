<template>
  <div class="no-active-container">
    <div class="content">
      <h1>
        発券準備中
        <span class="english-title">Ticket Issuance in Preparation</span>
      </h1>
      <div class="icon">
        <i class="fas fa-ticket-alt"></i>
      </div>
      <p class="message">
        現在、チケットの発券は開始されていません。<br>
        発券開始までしばらくお待ちください。
      </p>
      <p class="message-en">
        Ticket issuance has not started yet.<br>
        Please wait until the ticket issuance begins.
      </p>
      <div class="start-time">
        <p class="time-label">発券開始までしばらくお待ちください</p>
        <p class="time-en">Please wait until the ticket issuance begins.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
.no-active-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.content {
  text-align: center;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

h1 {
  color: #333333;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.english-title {
  display: block;
  font-size: 1.4rem;
  color: #666666;
  margin-top: 0.5rem;
}

.icon {
  font-size: 4rem;
  color: #666666;
  margin: 1.5rem 0;
}

.message {
  color: #666666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 1rem 0;
}

.message-en {
  color: #888888;
  font-size: 1rem;
  line-height: 1.6;
  margin: 1rem 0;
  font-style: italic;
}

.start-time {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.time-label {
  color: #666666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.time {
  color: #333333;
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.time-en {
  color: #666666;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}
</style>
