<template>
  <div class="user-view">
    <iframe
      ref="iframeRef"
      src="/user.html"
      class="user-iframe"
      title="비더라이브 커뮤니티"
      @load="onIframeLoad"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const iframeRef = ref(null)

function getAuth() {
  try {
    const raw = sessionStorage.getItem('bidderlive-auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function handleMessage(e) {
  if (e.data?.type !== 'REQUEST_USER_AUTH' || !iframeRef.value?.contentWindow) return
  const auth = getAuth()
  if (!auth) return
  iframeRef.value.contentWindow.postMessage(
    {
      type: 'USER_AUTH',
      user: {
        nickname: auth.nickname || '닉네임',
        role: auth.role || 'buyer'
      }
    },
    '*'
  )
}

function onIframeLoad() {
  const iframe = iframeRef.value
  const auth = getAuth()
  if (!iframe?.contentWindow || !auth) return
  iframe.contentWindow.postMessage(
    {
      type: 'USER_AUTH',
      user: {
        nickname: auth.nickname || '닉네임',
        role: auth.role || 'buyer'
      }
    },
    '*'
  )
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.user-view {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #020308;
}

.user-iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
