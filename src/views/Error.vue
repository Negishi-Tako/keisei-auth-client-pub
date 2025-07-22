<template>
  <main>
    <p>Error Page</p>
    <p v-if="errorCode">Error Code: {{ errorCode }}</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <button @click="$router.push('/')">Go Home</button>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const errorCode = route.query.code || route.params.code || ''

const errorMessage = computed(() => {
  switch (errorCode) {
    case '400':
      return 'Bad Request'
    case '401':
      return 'UnAuthorized'
    case '403':
      return 'Access Forbidden'
    case '404':
      return 'Not Found'
    case '500':
      return 'Internal Server Error'
    default:
      return 'Unexpected Error'
  }
})
</script>
